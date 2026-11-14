'use client';
import { useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { daySample } from './day-cycle';
import { type WorldState } from './world-config';

export function DayCycle({state,quality}:{state:RefObject<WorldState>;quality:'high'|'balanced'}){
 const sun=useRef<THREE.DirectionalLight>(null),sky=useRef<THREE.HemisphereLight>(null),ambient=useRef<THREE.AmbientLight>(null);
 const lamps=useRef<THREE.Group>(null);
 const {scene,gl}=useThree();
 const colors=useMemo(()=>({day:new THREE.Color('#fff0d5'),dusk:new THREE.Color('#ffae86'),moon:new THREE.Color('#8cacf5'),fogDay:new THREE.Color('#b5c9d4'),fogNight:new THREE.Color('#172638')}),[]);
 const materials=useRef<THREE.Mesh[]>([]),elapsed=useRef(0);
 useFrame((_,dt)=>{
  const s=state.current;elapsed.current+=Math.min(dt,.05);
  const mode=s.timeMode||'auto';
  if(mode==='auto'&&!s.reducedMotion&&!document.hidden)s.dayPhase=((s.dayPhase??.22)+Math.min(dt,.05)/240)%1;
  else if(mode!=='auto'){const target=mode==='day'?.25:mode==='sunset'?.48:.75;const current=s.dayPhase??.22;const difference=((target-current+1.5)%1)-.5;s.dayPhase=s.reducedMotion?target:(current+difference*(1-Math.exp(-Math.min(dt,.05)*2))+1)%1;}
  const d=daySample(s.dayPhase??.22);s.nightAmount=d.night;
  if(sun.current){sun.current.intensity=.3+d.daylight*2.8;sun.current.color.copy(colors.moon).lerp(colors.day,d.daylight).lerp(colors.dusk,d.twilight*.65);sun.current.position.set(Math.cos(d.phase*Math.PI*2)*30,12+Math.abs(d.sun)*28,18);}
  if(sky.current)sky.current.intensity=.32+d.daylight*1.1;
  if(ambient.current)ambient.current.intensity=.16+d.daylight*.12;
  if(scene.fog instanceof THREE.Fog)scene.fog.color.copy(colors.fogNight).lerp(colors.fogDay,d.daylight);
  gl.toneMappingExposure=1.02+d.night*.15;
  if(lamps.current)lamps.current.children.forEach(o=>{if(o instanceof THREE.PointLight)o.intensity=d.night*o.userData.power;});
  if(!materials.current.length&&elapsed.current>1)scene.traverse(o=>{if(o instanceof THREE.Mesh&&(o.name==='night-window'||o.name==='night-lamp')){const m=o.material as THREE.Material;if(!Array.isArray(m))materials.current.push(o);}});
  materials.current.forEach(object=>{const m=object.material;if(m instanceof THREE.MeshStandardMaterial)m.emissiveIntensity=.1+d.night*1.8;else if(m instanceof THREE.MeshBasicMaterial)m.color.set('#ffd297').multiplyScalar(.55+d.night*1.4);});
 },-2);
 return <>
  <hemisphereLight ref={sky} args={['#d2d8ec','#74595a',1.4]}/><ambientLight ref={ambient} intensity={.28}/>
  <directionalLight ref={sun} position={[-24,28,18]} castShadow shadow-mapSize={quality==='high'?[2048,2048]:[1024,1024]} shadow-camera-left={-33} shadow-camera-right={33} shadow-camera-top={33} shadow-camera-bottom={-33} shadow-camera-far={110} shadow-normalBias={.035} shadow-bias={-.0001}/>
  <group ref={lamps}>
   {[[0,2.3,8,14],[0,2.3,18,14],[-5.8,5.8,3.9,8],[0,3,2.8,10]].map(([x,y,z,p],i)=><pointLight key={i} position={[x,y,z]} color="#ffc887" intensity={0} distance={i<2?9:7} decay={2} userData={{power:p}}/>)}
  </group>
 </>;
}
