'use client';
import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { Box } from './ScenePrimitives';

export function ProjectFrame({position,title,subtitle,kind='project',rotation=0}:{position:[number,number,number];title:string;subtitle:string;kind?:'project'|'badminton'|'profile';rotation?:number}){
 const map=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=960;const c=canvas.getContext('2d')!;
  c.fillStyle=kind==='badminton'?'#465e51':'#eee9da';c.fillRect(0,0,768,960);
  const ink=kind==='badminton'?'#eee2bc':'#34483e';c.strokeStyle=ink;c.fillStyle=ink;
  c.font='20px sans-serif';c.fillText('GAURAV BHATURKAR / SELECTED WORK',55,75);
  if(kind==='badminton'){
   c.lineWidth=9;c.beginPath();c.ellipse(384,380,128,178,-.3,0,Math.PI*2);c.stroke();c.beginPath();c.moveTo(430,550);c.lineTo(484,720);c.stroke();
   c.lineWidth=1;for(let i=-4;i<=4;i++){c.beginPath();c.moveTo(280+i*25,230);c.lineTo(370+i*25,520);c.stroke();}
  }else{
   c.fillStyle='#cbb98d';c.fillRect(70,170,628,400);c.fillStyle=ink;
   const display=kind==='profile'?'G.':title==='Echo Music'?'ECHO':title;
   let headingSize=kind==='profile'?180:140;
   c.font=`${kind==='profile'?'italic ':''}${headingSize}px Georgia`;
   while(c.measureText(display).width>548&&headingSize>40){headingSize-=2;c.font=`${kind==='profile'?'italic ':''}${headingSize}px Georgia`;}
   c.textAlign='center';c.fillText(display,384,425);c.textAlign='left';
   c.strokeStyle='#77917a';c.lineWidth=5;c.beginPath();for(let x=90;x<680;x+=8){const y=470+Math.sin(x*.03)*35;x===90?c.moveTo(x,y):c.lineTo(x,y);}c.stroke();
  }
  c.fillStyle=ink;let titleSize=46;c.font=`${titleSize}px Georgia`;while(c.measureText(title).width>658&&titleSize>24){titleSize--;c.font=`${titleSize}px Georgia`;}c.fillText(title,55,820);
  let subtitleSize=21;c.font=`${subtitleSize}px sans-serif`;while(c.measureText(subtitle).width>658&&subtitleSize>12){subtitleSize--;c.font=`${subtitleSize}px sans-serif`;}c.fillText(subtitle,55,875);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
 },[title,subtitle,kind]);
 useEffect(()=>()=>map.dispose(),[map]);
 return <group position={position} rotation={[0,rotation,0]}>
  <Box position={[0,0,0]} size={[1.44,1.84,.1]} color="#474b3f" metalness={.2} roughness={.45}/>
  <mesh position={[0,0,.06]}><planeGeometry args={[1.31,1.7]}/><meshStandardMaterial map={map} roughness={.7}/></mesh>
  <Box position={[0,1.03,.17]} size={[.7,.045,.22]} color="#bb9b65" metalness={.55}/>
 </group>;
}

