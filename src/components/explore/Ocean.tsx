'use client';
import { useMemo, useRef, type RefObject } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { isInterior, type WorldState } from './world-config';

export function Ocean({state}:{state:RefObject<WorldState>}) {
 const material=useRef<THREE.ShaderMaterial>(null);
 const uniforms=useMemo(()=>({uTime:{value:0},uNight:{value:0}}),[]);
 useFrame(({clock})=>{if(material.current)material.current.uniforms.uNight.value=state.current.nightAmount??0;if(material.current&&!state.current.reducedMotion&&!isInterior(state.current))material.current.uniforms.uTime.value=clock.elapsedTime;});
 return <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.36,0]}>
  <planeGeometry args={[420,420,96,96]}/>
  <shaderMaterial ref={material} uniforms={uniforms} vertexShader={`
   uniform float uTime; varying vec2 vWorld; varying float vHeight;
   void main(){vec3 p=position;float t=uTime*.35;
   p.z+=sin(p.x*.38+t)*.055+sin(p.y*.31-t*.8)*.065;
   vHeight=p.z;vWorld=(modelMatrix*vec4(p,1.)).xz;
   gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`}
   fragmentShader={`uniform float uNight;uniform float uTime;varying vec2 vWorld;varying float vHeight;
   void main(){vec2 p=vWorld;float t=uTime*.55;float a=atan(p.y,p.x);
   float radius=length(p);float shore=29.*(1.+sin(a*3.)*.019+cos(a*5.)*.012);
   float depth=smoothstep(shore-1.,shore+20.,radius);
   vec3 color=mix(vec3(.22,.68,.65),vec3(.055,.27,.38),depth);
   float ripple=sin(p.x*.55+p.y*.27+sin(p.y*.32-t)*1.4+t);
   float crosswave=sin(p.y*.37-p.x*.2+sin(p.x*.19+t)*.8-t*.45);
   float glint=pow(max(0.,ripple*.6+crosswave*.4),24.);
   color+=glint*mix(vec3(.20,.28,.24),vec3(.32,.19,.18),depth);
   float foam=1.-smoothstep(.12,.55,abs(radius-shore-.35-sin(t+a*2.)*.22));
   float outer=1.-smoothstep(.03,.16,abs(radius-shore-1.1-sin(t*.7)*.13));
   color=mix(color,vec3(.92,.88,.75),foam*.65+outer*.16);
   color+=vHeight*.25;
   float haze=smoothstep(65.,170.,radius);color=mix(color,vec3(.65,.62,.63),haze);
   color=mix(color,color*.015+vec3(.002,.005,.014),uNight);gl_FragColor=vec4(color,1.);
   #include <tonemapping_fragment>
   #include <colorspace_fragment>
   }
  `}/>
 </mesh>;
}
