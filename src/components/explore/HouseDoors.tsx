'use client';
import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box } from './ScenePrimitives';
import type { WorldState } from './world-config';

export function MainEntrance({state}:{state:RefObject<WorldState>}){
 const left=useRef<THREE.Group>(null),right=useRef<THREE.Group>(null);
 useFrame((_,delta)=>{
  const s=state.current,[x,z]=s.position;
  const near=s.floor===0&&Math.hypot(x,z-2)<5.5;
  s.mainDoorOpen=THREE.MathUtils.damp(s.mainDoorOpen,near?1:0,9,Math.min(delta,.05));
  if(left.current)left.current.rotation.y=s.mainDoorOpen*1.48;
  if(right.current)right.current.rotation.y=-s.mainDoorOpen*1.48;
 });
 return <group position={[0,0,2.02]} name="camera-occluders">
  {[-1,1].map(side=><group key={side} position={[side*1.2,0,0]} ref={side<0?left:right}>
   <Box position={[-side*.59,1.55,0]} size={[1.18,3.1,.13]} color="#66503b"/>
   <Box position={[-side*.59,1.95,.075]} size={[.9,1.75,.03]} color="#c5cebb"/>
   <Box position={[-side*.59,.62,.08]} size={[.9,.76,.04]} color="#8b6b48"/>
   <Box position={[-side*1.04,1.23,.13]} size={[.045,.35,.065]} color="#d4ba7f" metalness={.65} roughness={.3}/>
   {[-.28,.28].map(offset=><Box key={offset} position={[-side*.59+offset,1.95,.1]} size={[.035,1.75,.035]} color="#887454"/>)}
  </group>)}
  {[-1.3,1.3].map(x=><Box key={x} position={[x,1.65,0]} size={[.15,3.3,.25]} color="#e5d3ad"/>)}
  <Box position={[0,3.26,0]} size={[2.75,.17,.25]} color="#e5d3ad"/>
  <Box position={[0,.03,.2]} size={[2.55,.06,.55]} color="#9f9477"/>
  <Box position={[0,.055,1.15]} size={[2.55,.025,.8]} color="#657462" castShadow={false}/>
 </group>;
}

export function BalconyDoors({state}:{state:RefObject<WorldState>}){
 const left=useRef<THREE.Group>(null),right=useRef<THREE.Group>(null);
 useFrame((_,delta)=>{
  const s=state.current,[x,z]=s.position;
  const near=s.floor===1&&Math.hypot(x,z-1.9)<4.5;
  s.balconyDoorOpen=THREE.MathUtils.damp(s.balconyDoorOpen,near?1:0,9,Math.min(delta,.05));
  if(left.current)left.current.position.x=-.7-s.balconyDoorOpen*1.22;
  if(right.current)right.current.position.x=.7+s.balconyDoorOpen*1.22;
 });
 return <group position={[0,3.8,1.9]}>
  <Box position={[0,.035,0]} size={[2.95,.07,.3]} color="#aaa48c"/>
  {[-1.46,1.46].map(x=><Box key={x} position={[x,1.5,0]} size={[.1,3,.2]} color="#48594f"/>)}
  <Box position={[0,3,0]} size={[3,.12,.2]} color="#48594f"/>
  {[-1,1].map(side=><group key={side} ref={side<0?left:right} position={[side*.7,0,0]}>
   {[-.66,.66].map(x=><Box key={x} position={[x,1.48,0]} size={[.055,2.9,.09]} color="#536558"/>)}
   {[.04,2.92].map(y=><Box key={y} position={[0,y,0]} size={[1.37,.055,.09]} color="#536558"/>)}
   <mesh position={[0,1.48,0]}><boxGeometry args={[1.27,2.8,.025]}/><meshStandardMaterial color="#becfc0" transparent opacity={.22} roughness={.15} metalness={.08} depthWrite={false}/></mesh>
   <Box position={[-side*.5,1.4,-.09]} size={[.035,.3,.05]} color="#d1bd8a" metalness={.65}/>
  </group>)}
 </group>;
}
