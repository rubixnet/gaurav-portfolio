'use client';
import * as THREE from 'three';
import { useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import { daySample } from './day-cycle';
import type { WorldState } from './world-config';

export function SunsetSky({state}:{state:RefObject<WorldState>}){
 const stars=useRef<THREE.PointsMaterial>(null);
 const starGeometry=useMemo(()=>{const a=[];for(let i=0;i<180;i++){const y=.12+(i%29)/35,r=Math.sqrt(1-y*y),t=i*2.39996;a.push(Math.cos(t)*r*190,y*190,Math.sin(t)*r*190);}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(a,3));return g;},[]);
 const sun=useRef<THREE.Mesh>(null),moon=useRef<THREE.Mesh>(null);
 const uniforms=useMemo(()=>({uTop:{value:new THREE.Color('#567eaf')},uHorizon:{value:new THREE.Color('#c6d9dd')}}),[]);
 const palette=useMemo(()=>({day:new THREE.Color('#567eaf'),horizon:new THREE.Color('#c6d9dd'),night:new THREE.Color('#070e25'),nightHorizon:new THREE.Color('#182e4a'),dusk:new THREE.Color('#b97878')}),[]);
 useFrame(()=>{const d=daySample(state.current.dayPhase??.22);if(stars.current)stars.current.opacity=d.night*.85;uniforms.uTop.value.copy(palette.night).lerp(palette.day,d.daylight);uniforms.uHorizon.value.copy(palette.nightHorizon).lerp(palette.horizon,d.daylight).lerp(palette.dusk,d.twilight*.8);if(sun.current){sun.current.visible=d.sun>-.12;sun.current.position.set(Math.cos(d.phase*Math.PI*2)*105,Math.max(-8,d.sun*85),-110);}if(moon.current)moon.current.visible=d.night>.6;});
 return <group>
  <mesh renderOrder={-100}>
   <sphereGeometry args={[220,24,16]}/>
   <shaderMaterial uniforms={uniforms} side={THREE.BackSide} depthWrite={false} vertexShader="varying vec3 vDirection;void main(){vDirection=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}" fragmentShader={`uniform vec3 uTop;uniform vec3 uHorizon;varying vec3 vDirection;void main(){float h=smoothstep(-.08,.65,vDirection.y);vec3 c=mix(uHorizon,uTop,h);gl_FragColor=vec4(c,1.);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`}/>
  </mesh>
  <mesh ref={sun} position={[-75,24,-110]}><sphereGeometry args={[6,24,16]}/><meshBasicMaterial color="#ffd2ac" toneMapped={false}/></mesh>
  <points geometry={starGeometry}><pointsMaterial ref={stars} color="#dce9ff" size={1.4} sizeAttenuation={false} transparent opacity={0} depthWrite={false} toneMapped={false}/></points>
  <mesh ref={moon} position={[-35,45,110]}><sphereGeometry args={[4,20,12]}/><meshBasicMaterial color="#c6d9f9" toneMapped={false}/></mesh>
 </group>;
}
