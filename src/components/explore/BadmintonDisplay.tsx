'use client';
import { useTexture } from '@react-three/drei';
import { Box } from './ScenePrimitives';
import { ProjectFrame } from './ProjectFrame';

export function BadmintonDisplay(){
 const image=useTexture('/project-previews/bdmtn.jpg');
 return <group>
  <Box position={[6,1.95,-13.7]} size={[5.4,3.3,.08]} color="#345d58"/>
  <Box position={[6,1.85,-13.57]} size={[3.9,2.3,.13]} color="#d3ae7c"/>
  <mesh position={[6,1.85,-13.49]}><planeGeometry args={[3.65,2.05]}/><meshBasicMaterial map={image}/></mesh>
  <ProjectFrame position={[8.8,2,-9.5]} rotation={-Math.PI/2} title="Badminton" subtitle="SCORES • CLUBS • PLAYER STATS" kind="badminton"/>
  {[0,1,2,3,4].map(i=><Box key={i} position={[3.5+i*.25,.12,-6]} size={[.025,.015,4]} color="#eee4bd" castShadow={false}/>)}
  <Box position={[5, .1,-6]} size={[3.4,.015,.035]} color="#f3e7bf" castShadow={false}/>
 </group>;
}
