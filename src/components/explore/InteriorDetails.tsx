'use client';
import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box } from './ScenePrimitives';
import { findPath, onStairs, STAIR, type WorldState } from './world-config';
import { CreativeLoft } from './CreativeLoft';

export { ProjectFrame } from './ProjectFrame';

export function StairAndGallery({state}:{state:RefObject<WorldState>}){
 const gallery=useRef<THREE.Group>(null);
 useFrame(()=>{if(gallery.current)gallery.current.visible=state.current.floor===1||onStairs(...state.current.position);});
 return <group>
  <group position={[STAIR.x,0,0]}>
   {Array.from({length:22},(_,i)=>{const h=(i+1)/22*STAIR.height,z=-(i+.5)*7/22;return <group key={i}>
    <Box position={[0,h-.08,z]} size={[2.1,.16,7/22+.035]} color={i%2?'#a18159':'#b5956c'}/>
    <Box position={[0,h+.006,z+.145]} size={[2.04,.018,.035]} color="#e8d6af" castShadow={false}/><Box position={[0,h-.18,z-.13]} size={[2.05,.25,.055]} color="#6b6553"/>
    {i%3===0&&[-1.15,1.15].map(x=><Box key={x} position={[x,h+.46,z]} size={[.045,.95,.045]} color="#46534b" metalness={.45}/>)}
   </group>;})}
   {[-1.15,1.15].map(x=><Box key={x} position={[x,2.38,-3.5]} size={[.065,.065,8]} color="#5f5b48" rotation={[Math.atan2(3.8,7),0,0]}/>)}
   <Box position={[0,3.72,-7.6]} size={[2.4,.16,1.2]} color="#a18159"/>
  </group>
  <group ref={gallery} name="camera-occluders">
   <mesh position={[2,3.82,-4]} rotation={[-Math.PI/2,0,0]} onPointerUp={e=>{e.stopPropagation();if(!state.current.paused&&state.current.floor===1)state.current.path=findPath(state.current.position,[e.point.x,e.point.z],1);}}><planeGeometry args={[22,20]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
   <Box position={[-1.6,3.7,-6]} size={[14.8,.2,16]} color="#b49d77"/>
   <Box position={[8.6,3.7,-6]} size={[.8,.2,16]} color="#b49d77"/>
   <Box position={[7,3.7,-10.5]} size={[2.4,.2,7]} color="#b49d77"/>
   <Box position={[7,3.7,1]} size={[2.4,.2,2]} color="#b49d77"/>
   {[-8.9,8.9].map(x=><Box key={x} position={[x,5.55,-6]} size={[.16,3.5,16]} color="#c9c9b4"/>)}
   <Box position={[0,5.55,-13.9]} size={[18,3.5,.16]} color="#c9c9b4"/>
   {[-5.2,5.2].map(x=><Box key={x} position={[x,5.55,1.9]} size={[7.4,3.5,.16]} color="#c9c9b4"/>)}
   <Box position={[0,7.05,1.9]} size={[3,.5,.16]} color="#c9c9b4"/>
   <Box position={[0,7.35,-6]} size={[18,.15,16]} color="#e5dcc4"/>
   <CreativeLoft state={state}/>
  </group>
 </group>;
}
