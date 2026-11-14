'use client';
import { useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box } from './ScenePrimitives';
import { SoftBox } from './RoomFinishes';
import { ProjectFrame } from './ProjectFrame';
import { LoftPurposefulDetails } from './LoftPurposefulDetails';
import { InstagramScreen } from './InstagramScreen';
import { CloudGallery } from './CloudGallery';
import type { WorldState } from './world-config';

function LoftPlant({position}:{position:[number,number,number]}){
 return <group position={position}>
  <mesh position={[0,.3,0]}><cylinderGeometry args={[.33,.24,.6,18]}/><meshStandardMaterial color="#bc9a74" roughness={.9}/></mesh>
  {[0,1,2,3,4].map(i=><mesh key={i} position={[Math.sin(i*2.4)*.2,.95+(i%2)*.25,Math.cos(i*2.4)*.2]} rotation={[.2,i*2.4,.25]} scale={[.18,.75,.1]} castShadow><sphereGeometry args={[1,10,8]}/><meshStandardMaterial color={i%2?'#62866d':'#809478'} roughness={.9}/></mesh>)}
 </group>;
}
function TextPrint({text,subtitle,position}:{text:string;subtitle:string;position:[number,number,number]}){
 const texture=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const c=canvas.getContext('2d')!;c.fillStyle='#e8dfc7';c.fillRect(0,0,1024,512);c.fillStyle='#465c4d';c.font='22px sans-serif';c.fillText(subtitle,60,80);c.font='72px Georgia';text.split('|').forEach((line,i)=>c.fillText(line,60,200+i*95));const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;return map;},[text,subtitle]);
 return <group position={position}><Box position={[0,0,0]} size={[3.7,1.85,.1]} color="#786d51"/><mesh position={[0,0,.06]}><planeGeometry args={[3.5,1.7]}/><meshStandardMaterial map={texture} roughness={.8}/></mesh></group>;
}

export function CreativeLoft({state}:{state:RefObject<WorldState>}){
 const sculpture=useRef<THREE.Group>(null),bars=useRef<THREE.Group>(null);
 useFrame(({clock})=>{
  if(state.current.floor!==1)return;
  const t=state.current.reducedMotion?0:clock.elapsedTime;
  if(sculpture.current){sculpture.current.rotation.y=t*.23;sculpture.current.rotation.z=0;}
  bars.current?.children.forEach((bar,i)=>bar.scale.y=.5+Math.sin(t*1.8+i*.65)**2*.5);
 });
 return <>
 <CloudGallery state={state}/><LoftPurposefulDetails/>
  <group position={[0,3.8,0]}>
   <TextPrint position={[4.5,1.8,-13.63]} text="Make something|worth exploring." subtitle="THE ATELIER / GAURAV’S WORLD"/>
   <ProjectFrame position={[-5.5,1.8,-13.65]} title="Echo Music" subtitle="01 / WEB EXPERIENCE"/>
   <ProjectFrame position={[-2.7,1.8,-13.65]} title="Badminton" subtitle="02 / SPORT & DIGITAL"/>
   <ProjectFrame position={[.1,1.8,-13.65]} title="Always learning" subtitle="EDUCATION & ACHIEVEMENTS" kind="profile"/>
   {/* Reading corner */}
   <SoftBox position={[-5.5,.45,-10.5]} size={[3,.8,.8]} color="#758e7c"/>
   <SoftBox position={[-5.5,.95,-10.86]} size={[3,.85,.17]} color="#657b6b"/>
   {[-6.4,-4.6].map(x=><SoftBox key={x} position={[x,.88,-10.5]} size={[.55,.16,.6]} color="#d6c4a1"/>)}
   <SoftBox position={[-5.5,.4,-8.8]} size={[1.8,.12,.8]} color="#ad8b61"/>
   {[-6.15,-4.85].map(x=><Box key={x} position={[x,.2,-8.8]} size={[.07,.4,.5]} color="#56685b"/>)}
   <Box position={[-5.85,.5,-8.8]} size={[.55,.07,.34]} color="#a45f4c"/>
   <mesh position={[-5.05,.54,-8.8]}><cylinderGeometry args={[.1,.085,.16,16]}/><meshStandardMaterial color="#d9c7a2"/></mesh>
   {/* Reading objects sit on the existing table and keep the walking route clear. */}
   <Box position={[-5.55,.57,-8.8]} size={[.48,.045,.32]} color="#eadbc2"/>
   <Box position={[-5.55,.596,-8.8]} size={[.02,.012,.28]} color="#617f78"/>
   <Box position={[-5.2,.6,-8.8]} size={[.025,.025,.28]} color="#b28c52" rotation={[0,.3,0]}/>
   <group position={[-.8,0,-.5]}>
   {/* A game controller represents Gaurav's game-development work. */}
   <group position={[1.8,1,-10.75]} rotation={[-.18,0,0]}>
    <SoftBox position={[0,0,0]} size={[.52,.12,.27]} color="#354f59"/>
    {[-.2,.2].map(x=><mesh key={x} position={[x,-.02,.12]} scale={[.1,.07,.15]}><sphereGeometry args={[1,12,8]}/><meshStandardMaterial color="#354f59"/></mesh>)}
    <Box position={[-.14,.07,0]} size={[.13,.025,.035]} color="#dac69f"/><Box position={[-.14,.07,0]} size={[.035,.025,.13]} color="#dac69f"/>
    {[[-.035,0],[.035,0],[0,-.035],[0,.035]].map(([x,z],i)=><mesh key={i} position={[.14+x,.075,z]}><sphereGeometry args={[.018,8,6]}/><meshStandardMaterial color={['#bd896d','#c5b67d','#839c88','#94aabb'][i]}/></mesh>)}
   </group>
   {/* Work desk */}
   <Box position={[2.8,.85,-11.1]} size={[3.2,.12,1.25]} color="#b4966c"/>
   {[1.55,4.05].map(x=><Box key={x} position={[x,.4,-11.1]} size={[.09,.8,1]} color="#4a5a50"/>)}
   <Box position={[2.6,1.6,-11.4]} size={[1.55,.95,.1]} color="#344a43"/>
   <InstagramScreen state={state}/>
   
   <Box position={[2.6,1.08,-11.4]} size={[.08,.3,.08]} color="#344a43"/>
   <Box position={[2.6,.95,-10.85]} size={[.85,.04,.28]} color="#647365"/>
   <SoftBox position={[2.8,.5,-9.7]} size={[.75,.15,.75]} color="#bc8d6a"/>
   <SoftBox position={[2.8,.88,-10]} size={[.75,.8,.12]} color="#829380"/>
   <Box position={[2.8,.23,-9.7]} size={[.08,.46,.08]} color="#586554"/>
   <Box position={[3.8,.96,-10.95]} size={[.45,.04,.5]} color="#ece0bf"/>
   {/* Compact studio speakers, a sketchbook and a pencil cup. */}
   {[1.5,3.7].map(x=><group key={x} position={[x,1.15,-11.4]}>
    <SoftBox position={[0,0,0]} size={[.34,.48,.27]} color="#334e51"/>
    <mesh position={[0,-.04,.145]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.105,.105,.015,20]}/><meshStandardMaterial color="#bba87c" metalness={.25} roughness={.6}/></mesh>
   </group>)}
   <mesh position={[4,.99,-11.3]}><cylinderGeometry args={[.09,.075,.2,16]}/><meshStandardMaterial color="#b98163"/></mesh>
   {[-.035,0,.035].map((x,i)=><Box key={i} position={[4+x,1.17,-11.3]} size={[.015,.24,.015]} color={['#d9c8a2','#607d72','#ad6b53'][i]}/>)}
   <Box position={[3.7,.99,-10.8]} size={[.42,.045,.34]} color="#cfb991"/>
   </group>
   {/* Reading ottoman, side library and warm task lighting. */}
   <SoftBox position={[-5.5,.28,-6.8]} size={[1.5,.55,.8]} color="#bc8a72"/>
   <group position={[-8.35,0,-6]}>
    {[.3,1,1.7,2.4].map(y=><Box key={y} position={[0,y,0]} size={[.38,.06,2.5]} color="#b89a70"/>)}
    {[-1.1,1.1].map(z=><Box key={z} position={[0,1.3,z]} size={[.36,2.6,.07]} color="#546c67"/>)}
    {[0,1,2].flatMap(row=>Array.from({length:6},(_,i)=><Box key={row+'-'+i} position={[0,.53+row*.7,-.8+i*.25]} size={[.23,.4+(i%2)*.08,.15]} color={['#ae7968','#ded1af','#718f8a'][i%3]}/>))}
   </group>
   <group position={[-7.3,0,-8]}><Box position={[0,1.1,0]} size={[.035,2.2,.035]} color="#b69d72"/><mesh position={[0,.06,0]}><cylinderGeometry args={[.28,.3,.08,16]}/><meshStandardMaterial color="#536a67"/></mesh><mesh position={[0,2.2,0]}><coneGeometry args={[.4,.35,20]}/><meshStandardMaterial color="#e5d1a9" emissive="#b88853" emissiveIntensity={.2}/></mesh></group>
   {/* Supported gyroscope: stable plinth, central axle, nested rings. */}
   <SoftBox position={[1.5,.55,-6]} size={[1.1,1.1,1.1]} color="#cfbea0"/>
   <Box position={[1.5,.055,-6]} size={[1.16,.11,1.16]} color="#596d68"/>
   <mesh position={[1.5,1.13,-6]} castShadow><cylinderGeometry args={[.23,.27,.06,24]}/><meshStandardMaterial color="#536b67" metalness={.45} roughness={.38}/></mesh>
   <mesh position={[1.5,1.43,-6]} castShadow><cylinderGeometry args={[.035,.045,.6,16]}/><meshStandardMaterial color="#b79b64" metalness={.6} roughness={.32}/></mesh>
   <group ref={sculpture} position={[1.5,1.7,-6]}>
    {[0,1,2].map(i=><mesh key={i} rotation={[i*.65,i*.8,0]} castShadow><torusGeometry args={[.44-i*.095,.032,10,40]}/><meshStandardMaterial color={i%2?'#bd9e66':'#788f7a'} metalness={.5} roughness={.35}/></mesh>)}
    <mesh castShadow><sphereGeometry args={[.075,16,12]}/><meshStandardMaterial color="#d3b778" metalness={.6} roughness={.3}/></mesh>
   </group>   <Box position={[-2.5,.025,-6]} size={[7,.035,5]} color="#6e8981" castShadow={false}/>
   {[-8.68].flatMap(x=>Array.from({length:15},(_,i)=><Box key={i} position={[x,1.5,-10.5+i*.45]} size={[.08,2.8,.065]} color="#8e7956"/>))}
   <LoftPlant position={[-7.7,0,-12.4]}/><LoftPlant position={[7.7,0,-12.4]}/>
   {[[-4,-8],[3,-9]].map(([x,z],i)=><group key={i} position={[x,3.2,z]}><Box position={[0,.18,0]} size={[.025,.36,.025]} color="#68654e"/><mesh><coneGeometry args={[.4,.25,24]}/><meshStandardMaterial color="#d5b982"/></mesh><mesh position={[0,-.08,0]}><sphereGeometry args={[.11,12,8]}/><meshBasicMaterial color="#ffe6b2"/></mesh></group>)}
   <pointLight position={[-4,2.7,-8]} intensity={9} distance={10} color="#ffe3ad"/>
   <pointLight position={[3,2.7,-9]} intensity={8} distance={9} color="#ffe8bf"/>
  </group>
 </>;
}

export function BalconyDeck(){return (
  <group position={[0,3.8,0]}>
   <Box position={[2,-.1,3.7]} size={[22,.2,3.6]} color="#aa8a62"/>
   {Array.from({length:44},(_,i)=><Box key={i} position={[-8.75+i*.5,.015,3.7]} size={[.018,.015,3.5]} color="#d0b18a" castShadow={false}/>)}
   <Box position={[2,1.1,5.55]} size={[22,.08,.09]} color="#445d50"/>
   {Array.from({length:39},(_,i)=><Box key={i} position={[-8.8+i*.568,.55,5.55]} size={[.04,1.1,.04]} color="#536b5c"/>)}
   {[-8.9,12.9].map(x=><group key={x}><Box position={[x,1.1,3.7]} size={[.08,.08,3.6]} color="#445d50"/>{[2.1,3,3.9,4.8,5.5].map(z=><Box key={z} position={[x,.55,z]} size={[.04,1.1,.04]} color="#536b5c"/>)}</group>)}
   <Box position={[11,-.1,1.9]} size={[4,.08,.09]} color="#445d50"/>
   <Box position={[11,1.1,1.9]} size={[4,.08,.09]} color="#445d50"/>
   {[9.2,10,10.8,11.6,12.4].map(x=><Box key={x} position={[x,.55,1.9]} size={[.04,1.1,.04]} color="#536b5c"/>)}
   <Box position={[12.5,-1.9,5.4]} size={[.24,3.8,.24]} color="#7e6c4d"/>
   <mesh position={[-5.8,.7,3.9]}><cylinderGeometry args={[.55,.55,.08,28]}/><meshStandardMaterial color="#e0c99e"/></mesh>
   <mesh position={[-5.8,.93,3.9]}><cylinderGeometry args={[.09,.09,.25,12]}/><meshStandardMaterial color="#f0d1a3" emissive="#ffb56f" emissiveIntensity={.6}/></mesh>
   <Box position={[-5.8,.35,3.9]} size={[.08,.7,.08]} color="#566b59"/>
   {[[-6.9,3],[-4.7,4.6]].map(([x,z],i)=><group key={i}><SoftBox position={[x,.45,z]} size={[.7,.13,.7]} color="#a2ad8e"/><Box position={[x,.8,z-.31]} size={[.7,.7,.08]} color="#7c927d"/><Box position={[x,.2,z]} size={[.08,.4,.08]} color="#586954"/></group>)}
   <LoftPlant position={[-7.8,0,2.25]}/><LoftPlant position={[7.8,0,5]}/>
   <LoftPlant position={[12.2,0,5]}/>
  </group>
 
);}
