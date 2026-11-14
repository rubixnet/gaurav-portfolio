'use client';
import { useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { Box } from './ScenePrimitives';
import { findPath, isInterior, WALLS, type WorldState } from './world-config';

export function SoftBox({position,size,color}:{position:[number,number,number];size:[number,number,number];color:string}){
 return <RoundedBox args={size} radius={Math.min(.1,Math.min(...size)*.2)} smoothness={3} position={position} castShadow receiveShadow><meshStandardMaterial color={color} roughness={.86}/></RoundedBox>;
}

function Books({position}:{position:[number,number,number]}){
 return <group position={position}>{['#7f8a71','#a27058','#d0c29a','#4e6662','#b8a47c'].map((color,i)=><Box key={color} position={[i*.13,0,0]} size={[.1,.3+(i%2)*.08,.22]} color={color}/>)}</group>;
}
function Pendant({position}:{position:[number,number,number]}){
 return <group position={position}>
  <Box position={[0,.25,0]} size={[.025,.5,.025]} color="#706449"/>
  <mesh position={[0,-.05,0]}><coneGeometry args={[.38,.3,24,1,true]}/><meshStandardMaterial color="#e1ceaa" side={THREE.DoubleSide}/></mesh>
  <mesh position={[0,-.13,0]}><sphereGeometry args={[.12,12,8]}/><meshBasicMaterial color="#ffe5ae" toneMapped={false}/></mesh>
 </group>;
}

export function RoomFinishes({state}:{state:RefObject<WorldState>}){
 const indoor=useRef<THREE.Group>(null);
 useFrame(()=>{if(indoor.current)indoor.current.visible=state.current.started&&isInterior(state.current);});
 return <group ref={indoor} name="camera-occluders">
  {/* Closed ceilings leave the real stair opening clear. */}
  <Box position={[-1.6,3.68,-6]} size={[14.8,.12,16]} color="#e6ddc9"/>
  <Box position={[8.6,3.68,-6]} size={[.8,.12,16]} color="#e6ddc9"/>
  <Box position={[7,3.68,-10.5]} size={[2.4,.12,7]} color="#e6ddc9"/>
  <Box position={[7,3.68,1]} size={[2.4,.12,2]} color="#e6ddc9"/>
  {WALLS.map((w,i)=><group key={i}>
   <Box position={[w.x,.19,w.z]} size={[w.w+.05,.26,w.d+.05]} color="#526459"/>
   <Box position={[w.x,3.5,w.z]} size={[w.w+.08,.16,w.d+.08]} color="#e3d5b4"/>
  </group>)}
  {/* Door jambs and lintels make the openings read as actual rooms. */}
  {[-3,3].map(x=><group key={x}>
   {[-2.72,-6.68].map(z=><Box key={z} position={[x,1.7,z]} size={[.27,3.4,.15]} color="#7f7761"/>)}
   <Box position={[x,3.45,-4.7]} size={[.26,.3,4.1]} color="#d4c6a7"/>
  </group>)}
  {[-1.12,1.12].map(x=><Box key={x} position={[x,1.6,-8.5]} size={[.14,3.2,.24]} color="#8c846b"/>)}
  <Box position={[0,3.3,-8.5]} size={[2.4,.3,.24]} color="#d4c6a7"/>
  <mesh rotation={[-Math.PI/2,0,0]} position={[0,.09,-6]} onPointerUp={e=>{e.stopPropagation();if(!state.current.paused&&state.current.floor===0)state.current.path=findPath(state.current.position,[e.point.x,e.point.z]);}}><planeGeometry args={[18,16]}/><meshBasicMaterial transparent opacity={0} depthWrite={false}/></mesh>
  <Pendant position={[-6,3.3,-7]}/><Pendant position={[0,3.3,-4]}/><Pendant position={[4.6,3.3,-9]}/>
  {/* Frosted window panels give the rooms daylight without revealing the island. */}
  {[-8.82,8.82].map(x=><group key={x} position={[x,2.1,-5]}>
   <Box position={[0,0,0]} size={[.06,1.65,2.3]} color="#dcd6bc"/>
   <Box position={[x<0?.04:-.04,0,0]} size={[.025,1.4,2.05]} color="#b9c7bd"/>
   <Box position={[x<0?.065:-.065,0,0]} size={[.04,1.45,.055]} color="#efe7cf"/>
   <Box position={[x<0?.065:-.065,0,0]} size={[.04,.055,2.1]} color="#efe7cf"/>
  </group>)}
  <pointLight position={[0,2.9,-4]} intensity={10} distance={12} color="#ffe4ba"/>
  <pointLight position={[0,2.8,-11]} intensity={8} distance={7} color="#ffe8c1"/>
  {/* Bedroom: a desk nook, books, wardrobe and softer wall treatment. */}
  <Box position={[1.92,.82,-9.65]} size={[1.05,.1,.7]} color="#b29b73"/>
  {[-.35,.35].map(x=><Box key={x} position={[1.92+x,.39,-9.65]} size={[.06,.78,.55]} color="#5b675b"/>)}
  <Books position={[1.58,1.04,-9.8]}/>
  <SoftBox position={[-2.55,1.35,-8.98]} size={[.7,2.7,.5]} color="#a9ad96"/>
  <Box position={[-2.17,1.35,-8.98]} size={[.035,2.45,.035]} color="#d0bd91"/>
  <Box position={[0,.65,-13.78]} size={[5.7,1.15,.055]} color="#8d9b89"/>
  {/* Studio shelves and accessories. */}
  {[1.5,2.25,3].map(y=><Box key={y} position={[-8.68,y,-10.5]} size={[.48,.07,2.8]} color="#8d7756"/>)}
  <group position={[-8.55,1.73,-11.4]} rotation={[0,Math.PI/2,0]}><Books position={[0,0,0]}/></group>
  <Box position={[-4.35,.15,-10.4]} size={[.5,.25,.5]} color="#414b43"/>
  <mesh position={[-6.95,.99,-11.1]}><cylinderGeometry args={[.085,.075,.15,16]}/><meshStandardMaterial color="#e4d5b4"/></mesh>
  {/* Lounge coffee table, books, ceramic bowl and wall console. */}
  <Box position={[.25,.43,-2]} size={[1.3,.1,.8]} color="#ae946f"/>
  {[-1,1].map(x=><Box key={x} position={[.25+x*.48,.21,-2]} size={[.07,.42,.6]} color="#5f6b5c"/>)}
  <Box position={[.05,.52,-2]} size={[.45,.06,.3]} color="#7d8e7b"/>
  <mesh position={[.55,.56,-2]}><sphereGeometry args={[.14,12,8,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#d8c7a2" side={THREE.DoubleSide}/></mesh>
  {/* Sports storage stays outside the stair corridor. */}
  <Box position={[4.02,.75,-12.7]} size={[1,1.5,.7]} color="#778c7d"/>
  {[.35,.8,1.25].map(y=><Box key={y} position={[4.02,y,-12.29]} size={[.7,.025,.04]} color="#c2b48b"/>)}
 </group>;
}
