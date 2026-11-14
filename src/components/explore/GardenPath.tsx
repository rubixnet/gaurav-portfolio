'use client';
import { useMemo } from 'react';
import * as THREE from 'three';

export function GardenPath(){
 const geometry=useMemo(()=>{
  const vertices:number[]=[],indices:number[]=[];
  for(let i=0;i<=30;i++){const z=4+i*(19.75/30),center=Math.sin(i*.18)*.5,width=1.17+Math.sin(i*1.7)*.08;vertices.push(center-width,.065,z,center+width,.065,z);if(i<30){const n=i*2;indices.push(n,n+2,n+1,n+1,n+2,n+3);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
 },[]);
 return <mesh geometry={geometry} receiveShadow><meshStandardMaterial color="#d6b991" roughness={1}/></mesh>;
}
