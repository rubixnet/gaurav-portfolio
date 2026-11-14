'use client';

import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Coast } from './Coast';
import { CoastalHouse } from './CoastalHouse';
import { canStep, doorAllowsStep, elevation, findPath, isInterior, onStairs, placeFloor, PLACES, type PlaceId, type Point, type WorldState } from './world-config';
import { followCamera } from './follow-camera';
import { CameraOcclusion } from './CameraOcclusion';
import { SunsetEffects } from './SunsetEffects';
import { DayCycle } from './DayCycle';
import { SunsetSky } from './SunsetSky';

class SceneBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}> {
  state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  componentDidCatch(){this.props.onFailure();}
  render(){return this.state.failed?null:this.props.children;}
}

function Character({state}:{state:RefObject<WorldState>}) {
 const {scene}=useGLTF('/models/gaurav-sunset.glb');
 const model=useMemo(()=>{const clone=scene.clone(true);clone.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;}});return clone;},[scene]);
 const limbs=useMemo(()=>['LegL','LegR','ArmL','ArmR'].map(n=>model.getObjectByName(n)),[model]);
 const knees=useMemo(()=>['KneeL','KneeR'].map(n=>model.getObjectByName(n)),[model]);
 const elbows=useMemo(()=>['ElbowL','ElbowR'].map(n=>model.getObjectByName(n)),[model]);
 const previous=useRef<Point>([...state.current.position]);
 const phase=useRef(0);
 useFrame(({clock},delta)=>{
   model.visible=!state.current.seated&&!state.current.deskSeated;
   const [x,z]=state.current.position;
   const dx=x-previous.current[0],dz=z-previous.current[1],moving=Math.hypot(dx,dz)>.0005&&Math.hypot(dx,dz)<1;
   const idle=!state.current.seated&&!state.current.reducedMotion&&!moving?Math.sin(clock.elapsedTime*1.8)*.004:0;
   if(Math.hypot(dx,dz)>1)model.rotation.y=0;
   if(moving)phase.current+=Math.min(.3,Math.hypot(dx,dz))*7;
   model.position.set(x,elevation(x,z,state.current.floor)+(state.current.floor===1?-.017:.008)+(state.current.seated?-.42:0)+idle+(!state.current.reducedMotion&&moving?Math.abs(Math.sin(phase.current))*.018:0),z);
   if(state.current.seated)model.rotation.y=Math.PI;
   if(moving&&!state.current.seated){const angle=Math.atan2(-dx,-dz);model.rotation.y+=Math.atan2(Math.sin(angle-model.rotation.y),Math.cos(angle-model.rotation.y))*(1-Math.exp(-Math.min(delta,.05)*12));}
   limbs.forEach((limb,i)=>{if(limb)limb.rotation.x=THREE.MathUtils.damp(limb.rotation.x,state.current.seated?(i<2?Math.PI/2:0):moving&&!state.current.reducedMotion?Math.sin(phase.current+(i%2)*Math.PI+(i>=2?Math.PI:0))*(i>=2?.3:.42):0,15,delta);});
   knees.forEach((joint,i)=>{if(joint)joint.rotation.x=THREE.MathUtils.damp(joint.rotation.x,state.current.seated?-Math.PI/2:moving&&!state.current.reducedMotion?-Math.max(0,-Math.sin(phase.current+i*Math.PI))*.5:0,14,delta);});
   elbows.forEach((joint,i)=>{if(joint)joint.rotation.x=THREE.MathUtils.damp(joint.rotation.x,.1+(moving&&!state.current.reducedMotion?Math.max(0,Math.sin(phase.current+i*Math.PI))*.13:0),12,delta);});
   previous.current=[x,z];
 });
 return <primitive object={model}/>;
}

function Movement({state,onPlace,onDiscover}:{state:RefObject<WorldState>;onPlace:(id:PlaceId)=>void;onDiscover:(id:PlaceId)=>void}) {
 const {camera,size}=useThree();
 const lastPlace=useRef<PlaceId>('arrival');
 const discoveries=useRef(new Set<PlaceId>());
 const look=useRef(new THREE.Vector3(0,2,0));
 const initialized=useRef(false);
 const desired=useMemo(()=>new THREE.Vector3(),[]);
 const lookTarget=useMemo(()=>new THREE.Vector3(),[]);

 const indoorBlend=useRef(0);
 const lastCut=useRef(-1);

 useFrame((_,rawDelta)=>{
   const s=state.current,delta=Math.min(rawDelta,.04);
   let [x,z]=s.position;
   if(s.started&&!s.paused){
     let dx=(s.keys.has('d')||s.keys.has('arrowright')?1:0)-(s.keys.has('a')||s.keys.has('arrowleft')?1:0)+s.joystick[0];
     let dz=(s.keys.has('s')||s.keys.has('arrowdown')?1:0)-(s.keys.has('w')||s.keys.has('arrowup')?1:0)+s.joystick[1];
     const manual=Math.hypot(dx,dz)>.05;
     if(manual){s.path=[];const length=Math.max(1,Math.hypot(dx,dz));dx/=length;dz/=length;}
     else if(s.path.length){const next=s.path[0];dx=next[0]-x;dz=next[1]-z;const length=Math.hypot(dx,dz);if(length<.12){s.path.shift();dx=0;dz=0;}else{dx/=length;dz/=length;}}
     const speed=onStairs(x,z)?2.6:s.keys.has('shift')?6:3.8;
     const remaining=!manual&&s.path.length?Math.hypot(s.path[0][0]-x,s.path[0][1]-z):Infinity;
     const step=Math.min(speed*delta,remaining);
     const nx=x+dx*step,nz=z+dz*step;
     const clear=(nx:number,nz:number)=>canStep([x,z],[nx,nz],s.floor)&&doorAllowsStep([x,z],[nx,nz],s.floor,s.mainDoorOpen,s.balconyDoorOpen);
     if(clear(nx,z))x=nx;
     if(clear(x,nz))z=nz;
     if(onStairs(...s.position)&&Math.abs(x-7)<1.05){if(z<=-7)s.floor=1;else if(z>=0)s.floor=0;}
     s.position=[x,z];
   }
   let nearest:PlaceId='arrival',distance=Infinity;
   for(const place of PLACES){if(placeFloor(place.id)!==s.floor)continue;const d=Math.hypot(x-place.point[0],z-place.point[1]);if(d<distance){distance=d;nearest=place.id;}}
   if(s.seated||(s.floor===1&&z>1.85))nearest='balcony';
   if(lastPlace.current!==nearest){lastPlace.current=nearest;onPlace(nearest);}
   if(s.started&&distance<2.5&&!discoveries.current.has(nearest)){discoveries.current.add(nearest);onDiscover(nearest);}
   const inside=isInterior(s),mobile=size.width<700;
   if(!s.started){desired.set(mobile?27:24,mobile?30:25,mobile?60:46);const introTarget=lookTarget.set(mobile?0:-5,1,0);if(!initialized.current){camera.position.copy(desired);look.current.copy(introTarget);initialized.current=true;}camera.position.lerp(desired,1-Math.exp(-delta*3));look.current.lerp(introTarget,1-Math.exp(-delta*3));}
   else {
    const closeFraming=s.floor===1||(Math.abs(x)<11&&z<9&&z>-16);
    indoorBlend.current=THREE.MathUtils.damp(indoorBlend.current,closeFraming?1:0,3,delta);
    const shot=followCamera(s,indoorBlend.current,mobile);desired.set(...shot.position);
    const damping=s.reducedMotion?1:1-Math.exp(-delta*7);
    if(lastCut.current!==(s.cameraCut??0)){lastCut.current=s.cameraCut??0;indoorBlend.current=closeFraming?1:0;const snap=followCamera(s,indoorBlend.current,mobile);camera.position.set(...snap.position);look.current.set(...snap.lookAt);}else{camera.position.lerp(desired,damping);look.current.lerp(lookTarget.set(...shot.lookAt),damping);}
    if(camera instanceof THREE.PerspectiveCamera){camera.fov=THREE.MathUtils.damp(camera.fov,shot.fov,7,delta);camera.updateProjectionMatrix();}
   }
   if(!s.started&&camera instanceof THREE.PerspectiveCamera){camera.fov=THREE.MathUtils.damp(camera.fov,mobile?62:49,7,delta);camera.updateProjectionMatrix();}
   camera.lookAt(look.current);
 });
 return null;
}

function DestinationMarker({state}:{state:RefObject<WorldState>}) {
 const ref=useRef<THREE.Mesh>(null);
 useFrame(({clock})=>{const point=state.current.path.at(-1);if(!ref.current)return;ref.current.visible=!!point;if(point){ref.current.position.set(point[0],elevation(...point,state.current.floor)+.12,point[1]);ref.current.scale.setScalar(state.current.reducedMotion?1:1+Math.sin(clock.elapsedTime*4)*.12);}});
 return <mesh ref={ref} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.32,.39,32]}/><meshBasicMaterial color="#f9df98" transparent opacity={.9} depthWrite={false}/></mesh>;
}

function Ready({onReady}:{onReady:()=>void}) {useEffect(onReady,[onReady]);return null;}

function ContextGuard({onFailure}:{onFailure:()=>void}) {
 const {gl}=useThree();
 useEffect(()=>{
   const canvas=gl.domElement;
   const lost=(event:Event)=>{event.preventDefault();onFailure();};
   canvas.addEventListener('webglcontextlost',lost);
   return()=>canvas.removeEventListener('webglcontextlost',lost);
 },[gl,onFailure]);
 return null;
}

function Exterior({state}:{state:RefObject<WorldState>}){
 const group=useRef<THREE.Group>(null);
 const {scene}=useThree();
 useFrame(()=>{const inside=state.current.started&&isInterior(state.current);if(group.current)group.current.visible=!inside;if(scene.background instanceof THREE.Color)scene.background.set(inside?'#3b4a4e':'#182738');});
 return <group ref={group}><SunsetSky state={state}/><Coast state={state} onWalk={point=>{if(state.current.started&&!state.current.paused)state.current.path=findPath(state.current.position,point,state.current.floor);}}/></group>;
}

export default function ExplorerScene({state,onPlace,onDiscover,onReady,onOpen,onFailure,quality}:{state:RefObject<WorldState>;onPlace:(id:PlaceId)=>void;onDiscover:(id:PlaceId)=>void;onReady:()=>void;onOpen:(id:PlaceId)=>void;onFailure:()=>void;quality:'high'|'balanced'}) {
 return <SceneBoundary onFailure={onFailure}><Canvas shadows={{type:THREE.PCFShadowMap}} dpr={quality==='high'?[1,1.5]:[1,1]} camera={{position:[24,25,46],fov:49,near:.1,far:300}} gl={{antialias:true,powerPreference:'high-performance'}} onCreated={({gl})=>{gl.toneMapping=THREE.ACESFilmicToneMapping;gl.toneMappingExposure=1.04;gl.domElement.setAttribute('aria-hidden','true');}} fallback={<div className="render-fallback">3D isn’t available in this browser. Your projects are in the menu.</div>}>
  <ContextGuard onFailure={onFailure}/>
  <color attach="background" args={['#d5b9b2']}/><fog attach="fog" args={['#b6a2ad',110,240]}/>
  <DayCycle state={state} quality={quality}/>
  {quality==='high'&&<SunsetEffects/>}
  <Movement state={state} onPlace={onPlace} onDiscover={onDiscover}/>
  <Suspense fallback={null}>
    <Exterior state={state}/>
    <CoastalHouse state={state}/><Character state={state}/><DestinationMarker state={state}/><CameraOcclusion state={state}/><Ready onReady={onReady}/>
  </Suspense>
 </Canvas></SceneBoundary>;
}
