'use client';
import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box } from './ScenePrimitives';
import type { WorldState } from './world-config';

export function IslandAtmosphere({state}:{state:RefObject<WorldState>}){
 const beacon=useRef<THREE.Group>(null),birds=useRef<THREE.Group>(null);
 useFrame(({clock})=>{if(state.current.reducedMotion)return;if(beacon.current)beacon.current.rotation.y=clock.elapsedTime*.4;if(birds.current){birds.current.rotation.y=clock.elapsedTime*.055;birds.current.position.y=Math.sin(clock.elapsedTime*.4)*.4;}});
 return <group>
  <group position={[20,0,-17]}>
   <mesh position={[0,3.5,0]} castShadow receiveShadow><cylinderGeometry args={[.9,1.65,7,18]}/><meshStandardMaterial color="#e4d8b8" roughness={.85}/></mesh>
   {[1,3,5].map(y=><mesh key={y} position={[0,y,0]}><cylinderGeometry args={[1.55-y*.1,1.61-y*.1,.7,18]}/><meshStandardMaterial color="#a65b48" roughness={.8}/></mesh>)}
   <mesh position={[0,7.1,0]}><cylinderGeometry args={[1.25,1.25,.18,18]}/><meshStandardMaterial color="#535f52"/></mesh>
   <mesh position={[0,7.8,0]}><cylinderGeometry args={[.82,.82,1.3,12]}/><meshStandardMaterial color="#d4c690" transparent opacity={.5} metalness={.1} roughness={.2}/></mesh>
   <mesh position={[0,8.65,0]}><coneGeometry args={[1.3,.7,18]}/><meshStandardMaterial color="#795746"/></mesh>
   <group ref={beacon} position={[0,7.8,0]}><mesh rotation={[0,0,Math.PI/2]} position={[.9,0,0]}><coneGeometry args={[.4,2,18,1,true]}/><meshBasicMaterial color="#fbe6a9" transparent opacity={.08} depthWrite={false} side={THREE.DoubleSide}/></mesh></group>
   <Box position={[0,.8,1.52]} size={[.7,1.6,.1]} color="#596b5d"/>
  </group>
  <group ref={birds}>
   {[0,1,2,3,4].map(i=><group key={i} position={[Math.sin(i*1.3)*22,12+i*.6,Math.cos(i*1.3)*22]} rotation={[0,i,0]}>
    {[-1,1].map(side=><Box key={side} position={[side*.28,0,0]} size={[.65,.035,.14]} color="#d7d9c6" rotation={[0,side*.1,side*.15]} castShadow={false}/>)}
   </group>)}
  </group>
  {Array.from({length:16},(_,i)=>{const a=i*2.4;return <group key={i} position={[Math.cos(a)*23,.1,Math.sin(a)*23]}>
   <mesh scale={[.8,.45,.8]}><icosahedronGeometry args={[.8,1]}/><meshStandardMaterial color="#587a4c" roughness={1}/></mesh>
   {[0,1,2].map(j=><mesh key={j} position={[Math.sin(j*2.4)*.5,.4,Math.cos(j*2.4)*.5]}><icosahedronGeometry args={[.12,1]}/><meshStandardMaterial color={i%2?'#d4b077':'#c78e77'}/></mesh>)}
  </group>;})}
 </group>;
}
