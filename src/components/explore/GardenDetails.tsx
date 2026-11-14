'use client';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box } from './ScenePrimitives';
import { isInterior, type WorldState } from './world-config';

function GardenSign({position,title,subtitle,rotation=0}:{position:[number,number,number];title:string;subtitle:string;rotation?:number}){
 const map=useMemo(()=>{const c=document.createElement('canvas');c.width=768;c.height=384;const x=c.getContext('2d')!;x.fillStyle='#f2dbc0';x.fillRect(0,0,768,384);x.fillStyle='#3f555a';x.font='20px sans-serif';x.fillText(subtitle,48,70);x.font='62px Georgia';title.split('|').forEach((line,i)=>x.fillText(line,48,160+i*78));x.fillRect(48,323,650,2);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;},[title,subtitle]);
 useEffect(()=>()=>map.dispose(),[map]);
 return <group position={position} rotation={[0,rotation,0]}>
  {[-.78,.78].map(x=><Box key={x} position={[x,.75,0]} size={[.09,1.5,.09]} color="#685352"/>)}
  <Box position={[0,1.47,0]} size={[2.15,1.1,.12]} color="#aa7b60"/>
  <mesh position={[0,1.47,.065]}><planeGeometry args={[2.02,.99]}/><meshStandardMaterial map={map} roughness={.8}/></mesh>
 </group>;
}

function Flowers(){
 const ref=useRef<THREE.InstancedMesh>(null);
 const poses=useMemo(()=>Array.from({length:240},(_,i)=>{const a=i*2.39996,r=1.1+Math.sqrt((i*.618)%1)*2.5;const side=i%2?1:-1;return [side*10+Math.cos(a)*r,.12+(i%4)*.055,12+Math.sin(a)*r,i*.77];}),[]);
 useEffect(()=>{if(!ref.current)return;const dummy=new THREE.Object3D(),color=new THREE.Color();poses.forEach(([x,y,z,a],i)=>{dummy.position.set(x,y,z);dummy.rotation.set(Math.PI/2,a,a*.1);dummy.scale.setScalar(.07+(i%4)*.015);dummy.updateMatrix();ref.current!.setMatrixAt(i,dummy.matrix);ref.current!.setColorAt(i,color.set(['#eacbb6','#d78c92','#c1bc7e'][i%3]));});ref.current.instanceMatrix.needsUpdate=true;if(ref.current.instanceColor)ref.current.instanceColor.needsUpdate=true;ref.current.computeBoundingSphere();},[poses]);
 return <instancedMesh ref={ref} args={[undefined,undefined,poses.length]}><icosahedronGeometry args={[1,0]}/><meshStandardMaterial roughness={1}/></instancedMesh>;
}

function Petals({state}:{state:RefObject<WorldState>}){
 const ref=useRef<THREE.InstancedMesh>(null),dummy=useMemo(()=>new THREE.Object3D(),[]);
 useFrame(({clock})=>{if(!ref.current||isInterior(state.current))return;const t=state.current.reducedMotion?0:clock.elapsedTime;for(let i=0;i<42;i++){dummy.position.set(11+Math.sin(i*2.4)*9+Math.sin(t*.22+i)*.8,1+((i*.713-t*.22)%4+4)%4,8+Math.cos(i*2.4)*14);dummy.rotation.set(t*.4+i,i*2.4,t*.3);dummy.scale.set(.055,.075,.055);dummy.updateMatrix();ref.current.setMatrixAt(i,dummy.matrix);}ref.current.instanceMatrix.needsUpdate=true;});
 return <instancedMesh ref={ref} args={[undefined,undefined,42]} frustumCulled={false}><planeGeometry args={[1,1]}/><meshStandardMaterial color="#eeb8b3" side={THREE.DoubleSide}/></instancedMesh>;
}

export function GardenDetails({state}:{state:RefObject<WorldState>}){
 return <group>
  <GardenSign position={[3.7,0,22]} title="Gaurav’s|little world." subtitle="WELCOME / FOLLOW YOUR CURIOSITY" rotation={-.15}/>
  <GardenSign position={[-4.2,0,11]} title="One more game?" subtitle="← BADMINTON / Badminton" rotation={.15}/>
  <GardenSign position={[10.7,0,6]} title="Make yourself|at home." subtitle="MUSIC • PROJECTS • A LITTLE ABOUT ME" rotation={-.15}/>
  <Flowers/><Petals state={state}/>
  {/* Garden bench beside the court; the approach to the house stays clear. */}
  <group position={[-9.6,0,18]} rotation={[0,.35,0]}>
   {[0,1,2,3].map(i=><Box key={i} position={[0,.55,-.3+i*.2]} size={[2.7,.1,.16]} color="#af8268"/>)}
   {[-1.05,1.05].map(x=><group key={x}><Box position={[x,.28,0]} size={[.09,.55,.75]} color="#536169"/><Box position={[x,1,-.4]} size={[.08,1,.08]} color="#536169"/></group>)}
   {[.85,1.1,1.35].map(y=><Box key={y} position={[0,y,-.42]} size={[2.7,.17,.08]} color="#bd9175"/>)}
  </group>
  {/* A small stone terrace ties the entrance to the garden. */}
  {[-1,0,1].flatMap(x=>[-1,0,1].map(z=><Box key={`${x}${z}`} position={[x*1.4,.045,6.6+z*.85]} size={[1.35,.07,.8]} color={(x+z)%2?'#c6b299':'#dcc5a6'} castShadow={false}/>))}
 </group>;
}
