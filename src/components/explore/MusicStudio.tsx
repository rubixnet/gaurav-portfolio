'use client';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, type RefObject } from 'react';
import * as THREE from 'three';
import { Box } from './ScenePrimitives';
import { ProjectFrame } from './ProjectFrame';
import { isInterior, type WorldState } from './world-config';

function StudioPrint(){
 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d')!;x.fillStyle='#ead5b4';x.fillRect(0,0,1024,512);x.fillStyle='#354e57';x.font='26px sans-serif';x.fillText('GAURAV’S LISTENING ROOM / 01',65,85);x.font='104px Georgia';x.fillText('Good things',65,232);x.font='italic 104px Georgia';x.fillText('start with a feeling.',65,350);x.fillStyle='#ba7868';x.fillRect(65,430,890,3);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;},[]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 return <group position={[-3.16,2,-8.6]} rotation={[0,-Math.PI/2,0]}><Box position={[0,0,0]} size={[2.7,1.42,.07]} color="#aa855f"/><mesh position={[0,0,.045]}><planeGeometry args={[2.57,1.29]}/><meshStandardMaterial map={texture}/></mesh></group>;
}

export function MusicStudio({state}:{state:RefObject<WorldState>}){
 const {scene}=useGLTF('/models/echo-studio.glb');
 const poster=useMemo(()=>{const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d')!;x.fillStyle='#152e3d';x.fillRect(0,0,1024,512);x.fillStyle='#e3b7a0';x.font='20px sans-serif';x.fillText('A LITTLE LOUDER. A LITTLE CLOSER.',60,70);x.fillStyle='#f5e4c9';x.font='140px Georgia';x.fillText('ECHO',55,270);x.font='22px sans-serif';x.fillText('MUSIC • A PROJECT BY GAURAV',60,345);x.fillStyle='#72999d';x.fillRect(60,407,890,2);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;},[]);
 const screen=useMemo(()=>new THREE.ShaderMaterial({uniforms:{uTime:{value:0},uPoster:{value:poster}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`uniform float uTime;uniform sampler2D uPoster;varying vec2 vUv;void main(){vec3 c=texture2D(uPoster,vUv).rgb;float bars=0.;for(int i=0;i<16;i++){float n=float(i);float x=.60+n*.019;float h=.08+.17*pow(sin(n*.63+uTime*1.2),2.);bars+=step(abs(vUv.x-x),.005)*step(abs(vUv.y-.53),h);}c=mix(c,vec3(.90,.53,.42),clamp(bars,0.,1.));gl_FragColor=vec4(c*1.18,1.);
 #include <tonemapping_fragment>
 #include <colorspace_fragment>
 }`}),[poster]);
 const model=useMemo(()=>{const copy=scene.clone(true);copy.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;if(o.name==='ScreenSurface')o.material=screen;}});return copy;},[scene,screen]);
 useEffect(()=>()=>{poster.dispose();screen.dispose();},[poster,screen]);
 useFrame(({clock})=>{if(state.current.floor===0&&isInterior(state.current)&&!state.current.reducedMotion&&!state.current.paused)screen.uniforms.uTime.value=clock.elapsedTime;});
 return <group>
  <primitive object={model} position={[-6,0,-11.5]}/>
  <group name="camera-occluders">
   <Box position={[-6,1.9,-13.78]} size={[5.65,3.35,.06]} color="#3f5a61"/>
   {Array.from({length:19},(_,i)=><Box key={i} position={[-8.6+i*.29,2,-13.71]} size={[.045,3.05,.06]} color="#b68e68"/>)}
   <Box position={[-8.79,2,-11.6]} size={[.06,2.6,3.4]} color="#a67e66"/>
   {Array.from({length:10},(_,i)=><Box key={i} position={[-8.74,2,-13+i*.3]} size={[.04,2.5,.08]} color="#3e555a"/>)}
  </group>
  <Box position={[-6,.067,-8.1]} size={[4.8,.035,6.7]} color="#6f8f91" castShadow={false}/>
  {[-8.2,-3.8].map(x=><Box key={x} position={[x,.089,-8.1]} size={[.035,.008,6.3]} color="#d7bca0" castShadow={false}/>)}
  {[-11,-5.2].map(z=><Box key={z} position={[-6,.089,z]} size={[4.4,.008,.035]} color="#d7bca0" castShadow={false}/>)}
  <StudioPrint/>
  {[1.5,2.25,3].flatMap((y,row)=>Array.from({length:6},(_,i)=><Box key={`${row}-${i}`} position={[-8.39,y+.22,-11.4+i*.22]} size={[.2,.37+(i%2)*.07,.15]} color={['#c59479','#ded0ac','#425e68','#93a190'][(i+row)%4]}/>))}
  <ProjectFrame position={[-6,2.15,-13.6]} title="Echo Music" subtitle="THE LISTENING ROOM / SELECTED WORK"/>
  {/* A keyboard nook adds a second musical activity along the left wall. */}
  <group position={[-8.16,0,-6.1]} rotation={[0,Math.PI/2,0]}>
   <Box position={[0,.84,0]} size={[2.15,.13,.5]} color="#30444d"/>
   {Array.from({length:28},(_,i)=><Box key={i} position={[-1+i*.074,.925,.06]} size={[.067,.045,.32]} color="#e9ddc7"/>)}
   {Array.from({length:20},(_,i)=>i%7!==2&&i%7!==6?<Box key={i} position={[-.96+i*.095,.96,-.04]} size={[.035,.035,.17]} color="#26353e"/>:null)}
   {[-.75,.75].map(x=><Box key={x} position={[x,.41,0]} size={[.06,.82,.35]} color="#b5916c"/>)}
  </group>
  <group position={[-4.05,0,-12.9]}>
   <mesh position={[0,.28,0]}><cylinderGeometry args={[.3,.24,.55,16]}/><meshStandardMaterial color="#bd8a71"/></mesh>
   {[0,1,2,3,4,5].map(i=><mesh key={i} position={[Math.sin(i*2.4)*.18,.9+(i%2)*.3,Math.cos(i*2.4)*.18]} rotation={[.2,i*2.4,.35]} scale={[.16,.65,.07]}><sphereGeometry args={[1,8,6]}/><meshStandardMaterial color={i%2?'#63847a':'#8ca58b'}/></mesh>)}
  </group>
  <pointLight position={[-6,2.8,-10.2]} color="#ffd5b0" intensity={6} distance={7}/>
  <pointLight position={[-7.7,1.6,-11.1]} color="#ffc18b" intensity={1.5} distance={3}/>
 </group>;
}
