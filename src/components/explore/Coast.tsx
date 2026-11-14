'use client';

import { useGLTF, useTexture } from '@react-three/drei';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { Box } from './ScenePrimitives';
import { isInterior, ROCKS, type Point, type WorldState } from './world-config';
import { IslandAtmosphere } from './IslandAtmosphere';
import { Ocean } from './Ocean';
import { GardenDetails } from './GardenDetails';
import { GardenPath } from './GardenPath';

export function CoastalTree({ position, scale=1, palm=false, state }: {position:[number,number,number];scale?:number;palm?:boolean;state:RefObject<WorldState>}) {
  const {scene}=useGLTF(`/models/${palm?'coastal-palm':position[0]>0?'flowering-tree':'copper-tree'}.glb`);
  const model=useMemo(()=>{const clone=scene.clone(true);clone.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;}});return clone;},[scene]);
  const crown=useMemo(()=>model.getObjectByName('Crown'),[model]);
  useFrame(({clock})=>{if(isInterior(state.current))return;if(crown){const t=state.current.reducedMotion?0:clock.elapsedTime;crown.rotation.z=Math.sin(t*.65+position[0])*.025;crown.rotation.x=Math.cos(t*.43+position[2])*.015;}});
  return <primitive object={model} position={position} scale={scale}/>;
}

function Grass({state}:{state:RefObject<WorldState>}) {
  const ref=useRef<THREE.InstancedMesh>(null);
  const wind=useMemo(()=>({value:0}),[]);
  const material=useMemo(()=>{const m=new THREE.MeshStandardMaterial({color:'#a3ae7c',roughness:1});m.onBeforeCompile=shader=>{shader.uniforms.uWind=wind;shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nuniform float uWind;').replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.x += sin(uWind + instanceMatrix[3].x*.45 + instanceMatrix[3].z*.25)*.12*max(0.,position.y+.35);');};return m;},[wind]);
  const data=useMemo(()=>Array.from({length:1000},(_,i)=>{const a=i*2.39996,r=10+Math.sqrt((i*.618)%1)*17;return [Math.cos(a)*r,Math.sin(a)*r,.25+((i*31)%10)/30];}).filter(([x,z])=>!(Math.abs(x)<10&&z<5&&z>-16)&&!(x<-10&&x>-23&&z>-1&&z<17)&&!(Math.abs(x)<3&&z>0)),[]);
  useEffect(()=>{if(!ref.current)return;const dummy=new THREE.Object3D();data.forEach(([x,z,s],i)=>{dummy.position.set(x,.04+s*.35,z);dummy.rotation.set(0,i,0);dummy.scale.setScalar(s);dummy.updateMatrix();ref.current!.setMatrixAt(i,dummy.matrix);});ref.current.instanceMatrix.needsUpdate=true;ref.current.computeBoundingSphere();return()=>material.dispose();},[data,material]);
  useFrame(({clock})=>{if(!isInterior(state.current)&&!state.current.reducedMotion)wind.value=clock.elapsedTime*1.2;});
  return <instancedMesh ref={ref} args={[undefined,material,data.length]}><coneGeometry args={[.18,.7,4]}/></instancedMesh>;
}

export function Court() {
  return <group position={[-16,.05,8]}>
    <Box position={[0,0,0]} size={[7,.08,14]} color="#617b68"/>
    {[-3.15,3.15].map(x=><Box key={x} position={[x,.05,0]} size={[.045,.015,13.4]} color="#e8e1bd"/>)}
    {[-6.7,6.7,-2,2].map(z=><Box key={z} position={[0,.05,z]} size={[6.3,.015,.045]} color="#e8e1bd"/>)}
    {[-4.3,4.3].map(z=><Box key={z} position={[0,.05,z]} size={[.045,.015,4.6]} color="#e8e1bd"/>)}
    {[-3.45,3.45].map(x=><Box key={x} position={[x,.8,0]} size={[.07,1.65,.07]} color="#b66b40"/>)}
    <Box position={[0,1.62,0]} size={[6.9,.055,.045]} color="#e7dac0"/>
    {Array.from({length:39},(_,i)=><Box key={`v${i}`} position={[-3.3+i*.174,1.31,0]} size={[.008,.59,.008]} color="#c4c3aa" castShadow={false}/>)}
    {Array.from({length:7},(_,i)=><Box key={`h${i}`} position={[0,1.02+i*.09,0]} size={[6.6,.008,.008]} color="#c4c3aa" castShadow={false}/>)}
    <Box position={[-4.5,.52,3]} size={[.8,.14,2.8]} color="#966949"/>
    {[-1,1].map(n=><Box key={n} position={[-4.5,.25,3+n]} size={[.1,.5,.1]} color="#514c3c"/>)}
  </group>;
}

export function Coast({state,onWalk}:{state:RefObject<WorldState>;onWalk:(point:Point)=>void}) {
  const land=useMemo(()=>{
    const geo=new THREE.CylinderGeometry(29,26,1.25,96);
    const positions=geo.attributes.position;
    for(let i=0;i<positions.count;i++){const x=positions.getX(i),z=positions.getZ(i),a=Math.atan2(z,x);const distortion=1+Math.sin(a*3)*.019+Math.cos(a*5)*.012;positions.setX(i,x*distortion);positions.setZ(i,z*distortion);}
    geo.computeVertexNormals();return geo;
  },[]);
  const maps=useTexture(['/textures/grass.png','/textures/sand.png']);
  const [grass,sand]=useMemo(()=>maps.map((map,i)=>{const copy=map.clone();copy.wrapS=copy.wrapT=THREE.RepeatWrapping;copy.repeat.set(i?18:38,i?18:38);copy.colorSpace=THREE.SRGBColorSpace;copy.needsUpdate=true;return copy;}),[maps]);
  const down=useRef<Point>([0,0]);
  function click(e:ThreeEvent<PointerEvent>) { if(Math.hypot(e.clientX-down.current[0],e.clientY-down.current[1])<8)onWalk([e.point.x,e.point.z]); }
  return <group>
    <Ocean state={state}/>
    <mesh position={[0,-.62,0]} geometry={land} receiveShadow><meshStandardMaterial map={sand} roughness={1}/></mesh>
    <mesh position={[0,.015,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><circleGeometry args={[27.5,96]}/><meshStandardMaterial color="#8d9f7a" roughness={1}/></mesh>
    <Grass state={state}/>
    <Court/><GardenDetails state={state}/>
    <IslandAtmosphere state={state}/>
    {/* Click surface stays independent of small plants and furniture. */}
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,.025,0]} onPointerDown={e=>{down.current=[e.clientX,e.clientY];}} onPointerUp={click}>
      <planeGeometry args={[58,80]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/>
    </mesh>
    <GardenPath/>
    <group position={[0,-.12,31]}>
      {Array.from({length:30},(_,i)=><Box key={i} position={[0,.1,-7+i*.47]} size={[4,.17,.44]} color={i%3?'#95704d':'#a57a50'}/>)}
      {[-2,2].flatMap(x=>Array.from({length:6},(_,i)=><group key={`${x}-${i}`} position={[x,0,-6+i*2.7]}>
        <Box position={[0,.32,0]} size={[.17,1.1,.17]} color="#74553d"/>
        {i<5&&<Box position={[0,.75,1.35]} size={[.045,.045,2.7]} color="#b5a17b"/>}
      </group>))}
    </group>
    {[[-22,0,-8,1.6],[-15,0,-17,1.4],[15,0,-15,1.55],[21,0,-5,1.5],[22,0,16,1.2],[-23,0,15,1.25],[19,0,21,.9],[-19,0,21,1.15]].map(([x,y,z,s],i)=><CoastalTree key={i} position={[x,y,z]} scale={s} state={state} palm={i%3===0}/>)}
    {[[15.5,0,9.5,1.1],[-11,0,-9,.95],[14,0,-21,1.1],[23,0,7,1.1]].map(([x,y,z,s],i)=><CoastalTree key={`p${i}`} position={[x,y,z]} scale={s} state={state} palm/>)}
    {ROCKS.map(r=><mesh key={`rock${r.index}`} position={[r.x,-.15,r.z]} rotation={[r.index*.2,r.index,.2]} scale={[r.sx,r.sy,r.sz]} castShadow receiveShadow><dodecahedronGeometry args={[1,1]}/><meshStandardMaterial color={r.index%2?'#8c8b73':'#a09a7e'} roughness={1}/></mesh>)}
    {[-1,1].flatMap(side=>[6,12,18].map(z=><group key={`${side}${z}`} position={[side*2.1,0,z]}>
      <Box position={[0,.55,0]} size={[.15,1.1,.15]} color="#5e5340"/>
      <Box position={[0,1.1,0]} size={[.25,.35,.25]} color="#f1d28b"/>
      <mesh name="night-lamp" position={[0,1.1,.13]}><planeGeometry args={[.15,.24]}/><meshBasicMaterial color="#ffe1a1" toneMapped={false}/></mesh>
    </group>))}
    {/* Distant land provides depth without expensive foliage. */}
    {[-1,1].map(side=><mesh key={side} position={[side*85,-4,-85]} scale={[22,9,16]}><icosahedronGeometry args={[1,1]}/><meshStandardMaterial color="#718c86" roughness={1}/></mesh>)}
  </group>;
}
