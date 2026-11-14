'use client';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Box } from './ScenePrimitives';

export function LoftPurposefulDetails(){
 const board=useMemo(()=>{const c=document.createElement('canvas');c.width=1024;c.height=640;const x=c.getContext('2d')!;x.fillStyle='#e4d8ba';x.fillRect(0,0,1024,640);x.fillStyle='#344e59';x.font='44px Georgia';x.fillText('A little room for ideas.',50,75);['MAKE','LEARN','PLAY'].forEach((t,i)=>{x.fillStyle=['#cf9b82','#96b0a1','#d9c58b'][i];x.fillRect(45+i*325,125,290,440);x.fillStyle='#344e59';x.font='28px sans-serif';x.fillText(t,65+i*325,175);x.font='23px sans-serif';['Echo Music','Badminton','Next idea…'].forEach((v,j)=>x.fillText(i===0?v:i===1?['Experiment','Sketch','Build'][j]:['Badminton','Music','Travel'][j],65+i*325,260+j*90));});const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;},[]);
 return <group position={[0,3.8,0]}>
  <group position={[8.73,1.95,-10]} rotation={[0,-Math.PI/2,0]}><Box position={[0,0,0]} size={[3.2,2.05,.09]} color="#9d7f59"/><mesh position={[0,0,.055]}><planeGeometry args={[3.04,1.9]}/><meshStandardMaterial map={board}/></mesh></group>
  <group position={[-4,0,1.1]}><Box position={[0,.55,0]} size={[2,1.1,.65]} color="#749085"/>{[.23,.56,.89].map(y=><group key={y}><Box position={[0,y,-.34]} size={[1.8,.025,.035]} color="#3c5a5e"/><Box position={[0,y,-.37]} size={[.45,.035,.04]} color="#d8bb84"/></group>)}<Box position={[-.35,1.15,0]} size={[.7,.07,.4]} color="#b67f6d"/><Box position={[-.3,1.22,0]} size={[.62,.07,.38]} color="#e1cda9"/><mesh position={[.55,1.28,0]}><cylinderGeometry args={[.12,.1,.25,16]}/><meshStandardMaterial color="#d7ba91"/></mesh></group>
  {/* Electronics study board on the cabinet. */}
  <group position={[-3.45,1.14,1.1]}>
   <Box position={[0,0,0]} size={[.55,.025,.34]} color="#38695d"/>
   <Box position={[0,.045,0]} size={[.15,.06,.15]} color="#253d43"/>
   {[-1,1].flatMap(side=>[0,1,2,3].map(i=><Box key={side+'-'+i} position={[side*.12,.025,-.1+i*.065]} size={[.12,.012,.018]} color="#d1b777"/>))}
  </group>
  {/* Travel keepsake globe, placed on the existing cabinet. */}
  <group position={[-4.55,5.35-3.8,1.1]}>
   <mesh><sphereGeometry args={[.2,24,16]}/><meshStandardMaterial color="#6b9aa0" roughness={.55}/></mesh>
   <mesh rotation={[0,0,.35]}><torusGeometry args={[.24,.012,8,32]}/><meshStandardMaterial color="#c9ac73" metalness={.5} roughness={.35}/></mesh>
   <Box position={[0,-.23,0]} size={[.025,.14,.025]} color="#c9ac73"/>
   <Box position={[0,-.31,0]} size={[.3,.04,.2]} color="#435e60"/>
  </group>
  {/* Personal travel study above the existing cabinet; no floor-space obstruction. */}
  <group position={[-4,2.1,1.72]} rotation={[0,Math.PI,0]}>
   <Box position={[0,0,0]} size={[2.2,1.25,.06]} color="#b69a70"/>
   <Box position={[0,0,.04]} size={[2.05,1.1,.015]} color="#d8d8bb"/>
   {[-.65,-.2,.35,.7].map((x,i)=><group key={i} position={[x,0,.06]}><Box position={[0,-.1,0]} size={[.18,.3+i*.09,.015]} color={i%2?'#6b8b82':'#ac8265'}/><mesh position={[0,.15+i*.045,0]}><coneGeometry args={[.17,.24,3]}/><meshStandardMaterial color="#536e70"/></mesh></group>)}
  </group>
 </group>;
}
