'use client';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import { isInterior, type WorldState } from './world-config';

export function HouseExterior({state}:{state:RefObject<WorldState>}){
 const {scene}=useGLTF('/models/house-exterior.glb');
 const ref=useRef<THREE.Group>(null);
 const model=useMemo(()=>{const m=scene.clone(true);m.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;}});return m;},[scene]);
 useFrame(()=>{if(ref.current)ref.current.visible=!isInterior(state.current);});
 return <group ref={ref}><primitive object={model}/></group>;
}
