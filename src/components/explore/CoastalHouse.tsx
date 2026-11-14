'use client';

import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { Box } from './ScenePrimitives';
import { WALLS, isInterior, type WorldState } from './world-config';
import { ProjectFrame, StairAndGallery } from './InteriorDetails';
import { RoomFinishes, SoftBox } from './RoomFinishes';
import { BalconyDoors, MainEntrance } from './HouseDoors';
import { BalconyDeck } from './CreativeLoft';
import { MusicStudio } from './MusicStudio';
import { BadmintonDisplay } from './BadmintonDisplay';
import { HouseExterior } from './HouseExterior';

function Window({x,y,z,side=false}:{x:number;y:number;z:number;side?:boolean}) {
  return <group position={[x,y,z]} rotation={[0,side?Math.PI/2:0,0]}>
    <Box position={[0,0,0]} size={[2.1,1.65,.13]} color="#eee0b8"/>
    <mesh name="night-window" position={[0,0,.075]}><planeGeometry args={[1.85,1.4]}/><meshStandardMaterial color="#8aab9e" emissive="#bd8b41" emissiveIntensity={.3} roughness={.25}/></mesh>
    <Box position={[0,0,.12]} size={[.055,1.45,.04]} color="#eee0b8"/>
    <Box position={[0,0,.12]} size={[1.9,.055,.04]} color="#eee0b8"/>
    <Box position={[0,-.86,.12]} size={[2.3,.13,.3]} color="#e5d3a7"/>
  </group>;
}

function Roof({y=5.9,width=19,depth=18,z=-6}:{y?:number;width?:number;depth?:number;z?:number}) {
  const half=width/2, rise=2.9, angle=Math.atan2(rise,half), slope=Math.hypot(half,rise);
  return <group>
    {[-1,1].map(side=><group key={side} position={[side*half/2,y+rise/2,z]} rotation={[0,0,-side*angle]}>
      <Box position={[0,0,0]} size={[slope,.2,depth]} color={side===1?'#aa6346':'#94513d'}/>
      {Array.from({length:22},(_,i)=><Box key={i} position={[0,.12,-depth/2+i*depth/21]} size={[slope,.06,.08]} color="#b77350" castShadow={false}/>)}
      {[-1,1].map(s=><Box key={s} position={[0,-.08,s*depth/2]} size={[slope,.26,.15]} color="#674a34"/>)}
    </group>)}
    <Box position={[0,y+rise,z]} size={[.3,.22,depth+.1]} color="#a45c42"/>
  </group>;
}

function Plant({position,scale=1}:{position:[number,number,number];scale?:number}) {
  return <group position={position} scale={scale}>
    <mesh position={[0,.28,0]} castShadow><cylinderGeometry args={[.32,.22,.55,12]}/><meshStandardMaterial color="#bd8c64" roughness={1}/></mesh>
    {Array.from({length:7},(_,i)=><mesh key={i} position={[Math.sin(i*2.4)*.23,.75+(i%3)*.15,Math.cos(i*2.4)*.23]} rotation={[.3,i*2.4,.4]} scale={[.15,.6,.08]} castShadow><sphereGeometry args={[1,7,6]}/><meshStandardMaterial color={i%2?'#5e7847':'#7d8f4f'} roughness={1}/></mesh>)}
  </group>;
}

function Rug({position,size,color}:{position:[number,number,number];size:[number,number];color:string}) {
 return <group><Box position={position} size={[size[0],.025,size[1]]} color={color} castShadow={false}/>{[-1,1].map(side=><Box key={side} position={[position[0]+side*(size[0]/2-.13),position[1]+.015,position[2]]} size={[.04,.01,size[1]-.2]} color="#cbbb95" castShadow={false}/>)}</group>;
}

function Racket({position,rotation=0}:{position:[number,number,number];rotation?:number}) {
 return <group position={position} rotation={[0,0,rotation]}>
   <mesh scale={[.7,1,1]}><torusGeometry args={[.43,.035,7,28]}/><meshStandardMaterial color="#c18c58" metalness={.35} roughness={.4}/></mesh>
   {[-.2,-.1,0,.1,.2].map(x=><Box key={x} position={[x,0,0]} size={[.007,.66,.007]} color="#d5d3b9" castShadow={false}/>)}
   {[-.3,-.15,0,.15,.3].map(y=><Box key={y} position={[0,y,0]} size={[.49,.007,.007]} color="#d5d3b9" castShadow={false}/>)}
   <Box position={[0,-.65,0]} size={[.045,.5,.04]} color="#ccc7a6"/>
   <Box position={[0,-1,0]} size={[.09,.3,.08]} color="#415d50"/>
 </group>;
}

function Sports() {
 return <group position={[6,0,-6]}>
   <Rug position={[0,.07,1]} size={[4.8,5.8]} color="#a18c57"/>
   <Box position={[0,1,-5.5]} size={[4,.12,.9]} color="#9b774f"/>
   <Racket position={[-.9,2.7,-5.7]} rotation={-.22}/><Racket position={[.65,2.7,-5.7]} rotation={.22}/>
   <Box position={[2.3,1.2,-5.5]} size={[.32,1.7,.13]} color="#d5bd85" rotation={[0,0,-.17]}/>
   <Box position={[2.47,2.3,-5.5]} size={[.1,.55,.1]} color="#5b6753" rotation={[0,0,-.17]}/>
   {[0,1,2].map(i=><group key={i} position={[-1.2+i*.65,1.2,-5.35]}><mesh><sphereGeometry args={[.075,10,8]}/><meshStandardMaterial color="#eee6ca"/></mesh><mesh position={[0,.15,0]}><coneGeometry args={[.14,.27,10,1,true]}/><meshStandardMaterial color="#f0e9ce" side={THREE.DoubleSide}/></mesh></group>)}
   <Box position={[-2.1,.5,-1.5]} size={[1.1,.15,3]} color="#b68d5f"/>
   {[-2.5,-.5].map(z=><Box key={z} position={[-2.1,.25,z]} size={[.85,.5,.12]} color="#6c5740"/>)}
   <mesh position={[1.7,.3,-2]}><sphereGeometry args={[.29,16,12]}/><meshStandardMaterial color="#9a4d34" roughness={1}/></mesh>
 </group>;
}

function Bedroom() {
 const board=useMemo(()=>{
   const canvas=document.createElement('canvas');canvas.width=768;canvas.height=480;
   const ctx=canvas.getContext('2d')!;
   ctx.fillStyle='#e0d1a7';ctx.fillRect(0,0,768,480);ctx.fillStyle='#5c644b';
   ctx.font='18px sans-serif';ctx.fillText('A LITTLE ABOUT ME',65,72);
   ctx.font='48px Georgia';ctx.fillText('Gaurav Bhaturkar',65,155);
   ctx.fillStyle='#8c8769';ctx.fillRect(65,190,630,2);
   ctx.font='23px sans-serif';ctx.fillText('Web developer. Game developer.',65,245);
   ctx.font='19px sans-serif';ctx.fillText('Travel, music, badminton, and cricket.',65,330);
   const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
 },[]);
 return <group position={[0,0,-11]}>
   <Rug position={[0,.07,0]} size={[5.2,4.5]} color="#b0a17c"/>
   <Box position={[-1.8,.35,.4]} size={[1.3,.5,2.7]} color="#805d43"/>
   <SoftBox position={[-1.8,.65,.4]} size={[1.28,.28,2.6]} color="#e6dcc0"/>
   <SoftBox position={[-1.8,.83,.8]} size={[1.34,.12,1.7]} color="#a56858"/>
   <SoftBox position={[-1.8,.87,-.5]} size={[.95,.18,.5]} color="#f1e4c9"/>
   <Box position={[1.9,.5,-1.5]} size={[.8,1,.7]} color="#a07c54"/>
   <mesh position={[1.9,1.5,-1.5]}><coneGeometry args={[.35,.4,16]}/><meshStandardMaterial color="#e7cc96" emissive="#c58f42" emissiveIntensity={.3}/></mesh>
   <Box position={[1.9,1.2,-1.5]} size={[.055,.5,.055]} color="#7a6442"/>
   <Box position={[0,2.1,-2.8]} size={[2.5,1.65,.13]} color="#745b41"/>
   <Box position={[0,2.1,-2.7]} size={[2.3,1.45,.03]} color="#e0d1a7"/>
   <mesh position={[0,2.1,-2.68]}><planeGeometry args={[2.3,1.45]}/><meshBasicMaterial map={board}/></mesh>
   <Plant position={[2.15,.1,1.6]}/>
   <ProjectFrame position={[-2.1,2.2,-2.65]} title="Echo Music" subtitle="SELECTED PROJECT / 01"/>
   <ProjectFrame position={[2.1,2.2,-2.65]} title="Game. Set. Create." subtitle="BADMINTON / OFF THE SCREEN" kind="badminton"/>
   <ProjectFrame position={[2.85,2.2,.3]} rotation={-Math.PI/2} title="Badminton" subtitle="SELECTED PROJECT / 02"/>
   <SoftBox position={[-1.8,1.1,-.9]} size={[1.45,1.4,.16]} color="#5f7066"/>
   <Box position={[-1.8,.94,.9]} size={[1.35,.06,1.3]} color="#627c72"/>
 </group>;
}

export function CoastalHouse({state}:{state:RefObject<WorldState>}) {
 const woodMap=useTexture('/textures/wood.png');
 const wood=useMemo(()=>{const texture=woodMap.clone();texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(9,6);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;return texture;},[woodMap]);
 const upper=useRef<THREE.Group>(null),walls=useRef<THREE.Group>(null),roof=useRef<THREE.Group>(null);
 useFrame(()=>{
   const inside=isInterior(state.current);
   if(upper.current)upper.current.visible=!inside;
   if(roof.current)roof.current.visible=!inside;
   if(walls.current)walls.current.scale.y=1;
 });
 return <group>
   <mesh position={[0,-.05,-6]} receiveShadow><boxGeometry args={[18.3,.15,16.2]}/><meshStandardMaterial map={wood} roughness={.85}/></mesh>
   {Array.from({length:37},(_,i)=><Box key={i} position={[-8.9+i*.49,.035,-6]} size={[.025,.015,15.9]} color="#bba078" castShadow={false}/>)}
   <group ref={walls} name="camera-occluders">
    {WALLS.map((w,i)=><group key={i}><Box position={[w.x,1.85,w.z]} size={[w.w,3.7,w.d]} color={i<5?'#cfb995':'#c5cfbc'}/><Box position={[w.x,.14,w.z]} size={[w.w+.03,.18,w.d+.03]} color="#87704e"/></group>)}
    {[-6,6].map(x=><Window key={x} x={x} y={2.1} z={2.18}/>)}
    {[-9.17,9.17].flatMap(x=>[-4,-10].map(z=><Window key={`${x}${z}`} x={x} y={2.1} z={z} side/>))}
   </group>
   <MainEntrance state={state}/>
   <group name="camera-occluders"><BalconyDoors state={state}/></group>
   <Box position={[0,-.02,3.9]} size={[19,.14,3.8]} color="#b29c76"/>
   <HouseExterior state={state}/>
   <Plant position={[-2.6,.1,3.2]} scale={1.3}/><Plant position={[2.6,.1,3.2]} scale={1.3}/>
   <group ref={upper}>
    <Box position={[0,3.65,-5.8]} size={[18.7,.24,16.6]} color="#6e5339"/>
    {[-9,9].map(x=><Box key={x} position={[x,5.55,-6]} size={[.18,3.5,16]} color="#bc8865"/>)}
    <Box position={[0,5.55,-13.9]} size={[17.6,3.5,.18]} color="#bc8865"/>
    {[-5.2,5.2].map(x=><Box key={x} position={[x,5.55,1.9]} size={[7.4,3.5,.18]} color="#bc8865"/>)}
    <Box position={[0,7.05,1.9]} size={[3,.5,.18]} color="#bc8865"/>
    {[-5.6,5.6].map(x=><Window key={x} x={x} y={5.5} z={2.02}/>)}
   </group>
   <group ref={roof}><Roof y={7.3}/><mesh position={[0,7.3,2.03]}><bufferGeometry><bufferAttribute attach="attributes-position" args={[new Float32Array([-9,0,0,9,0,0,0,2.8,0]),3]}/></bufferGeometry><meshStandardMaterial color="#bf8b67" side={THREE.DoubleSide}/></mesh></group>
   <MusicStudio state={state}/><Sports/><BadmintonDisplay/><Bedroom/>
   <StairAndGallery state={state}/>
   <BalconyDeck/>
   <RoomFinishes state={state}/>
   <Rug position={[0,.07,-3]} size={[4.8,6]} color="#bda375"/>
   <SoftBox position={[-1.9,.5,-1.6]} size={[.85,.7,2.8]} color="#777e5c"/>
   <Box position={[-2.35,.95,-1.6]} size={[.18,1,2.8]} color="#6d7655"/>
   {[-2.4,-.8].map(z=><SoftBox key={z} position={[-1.9,.9,z]} size={[.9,.18,.7]} color="#b2ac83"/>)}
   <group position={[2.45,0,-7]} rotation={[0,-Math.PI/2,0]}>
     <Box position={[0,.55,0]} size={[2.5,1.1,.6]} color="#8d704d"/>
     <Box position={[0,1.55,0]} size={[1.9,1,.46]} color="#6d5940"/>
     <mesh position={[0,1.55,.25]}><planeGeometry args={[1.6,.75]}/><meshBasicMaterial color="#9bad97"/></mesh>
   </group>
   <pointLight position={[-6,2.8,-8]} intensity={6} distance={8} color="#ffe1a0"/>
   <pointLight position={[6,2.8,-8]} intensity={5} distance={8} color="#ffd49b"/>
   <pointLight position={[0,2.8,-11]} intensity={5} distance={7} color="#ffdcaa"/>
 </group>;
}
