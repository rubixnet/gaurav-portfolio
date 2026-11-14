'use client';
import { useTexture } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { Box } from './ScenePrimitives';
import { type WorldState } from './world-config';

export function CloudGallery({state}:{state:RefObject<WorldState>}){
 const {size}=useThree();
 const mobile=size.width<700;
 const maps=useTexture(['/project-previews/echo.jpg','/project-previews/bdmtn.jpg']);
 const portrait=useMemo(()=>{const c=document.createElement('canvas');c.width=768;c.height=440;const x=c.getContext('2d')!;x.fillStyle='#355966';x.fillRect(0,0,768,440);x.fillStyle='#f3dbc0';x.font='italic 180px Georgia';x.fillText('G.',295,250);x.font='30px sans-serif';x.fillText('GAURAV BHATURKAR',210,335);x.font='17px sans-serif';x.fillText('MUSIC / SPORT / CODE',270,385);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;},[]);
 const labels=useMemo(()=>['ECHO MUSIC  /  WEB PROJECT','Badminton  /  BADMINTON TRACKER','GAURAV  /  DEVELOPER & EXPLORER'].map(text=>{const c=document.createElement('canvas');c.width=1024;c.height=128;const ctx=c.getContext('2d')!;ctx.fillStyle='#263f49';ctx.fillRect(0,0,1024,128);ctx.fillStyle='#f4ddbb';ctx.font='bold 34px sans-serif';ctx.textAlign='center';ctx.fillText(text,512,78);const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;return texture;}),[]);
 useEffect(()=>()=>{portrait.dispose();labels.forEach(texture=>texture.dispose());},[portrait,labels]);
 const group=useRef<THREE.Group>(null);const reveal=useRef(0);
 useFrame(({clock},delta)=>{if(!group.current)return;const active=state.current.floor===1&&!!state.current.seated;
 reveal.current=state.current.reducedMotion?(active?1:0):THREE.MathUtils.damp(reveal.current,active?1:0,8,Math.min(delta,.05));group.current.visible=reveal.current>.01;
 group.current.children.forEach((card,i)=>{const p=THREE.MathUtils.smoothstep(reveal.current,i*.06,.85+i*.06);card.scale.setScalar((mobile?.83:1)*(.96+.04*p));card.position.y=(mobile?10.2-i*2.5:6.6)-(1-p)*.45+(state.current.reducedMotion?0:Math.sin(clock.elapsedTime*.5+i)*.035);});
});
 return <group ref={group} visible={false}>
  {[...maps,portrait].map((map,i)=><group key={i} position={mobile?[-6.9,10.2-i*2.5,13]:[-1.6-i*5.3,6.6,14]} rotation={[0,Math.PI,0]} scale={mobile?.83:1}>
   <Box position={[0,0,0]} size={[3.8,2.35,.12]} color="#263f49"/>
   <mesh position={[0,0,.07]} onClick={()=>{if(i<2&&state.current.seated)window.open(i===0?'https://echomusicapp.vercel.app':'https://bdmtn.vercel.app/','_blank','noopener,noreferrer');}}><planeGeometry args={[3.55,2.05]}/><meshBasicMaterial map={map}/></mesh>
   <mesh position={[0,-1.12,.08]}><planeGeometry args={[3.55,.44]}/><meshBasicMaterial map={labels[i]}/></mesh>
   {[-1,0,1].map(n=><mesh key={n} position={[n*.8,-1.72,-.08]} scale={[1,.35,.6]}><sphereGeometry args={[.85,12,8]}/><meshStandardMaterial color="#e8dfe1" roughness={1}/></mesh>)}
  </group>)}
 </group>;
}
