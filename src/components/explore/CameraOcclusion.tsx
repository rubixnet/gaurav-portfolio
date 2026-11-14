'use client';
import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { elevation, isInterior, STAIR, type WorldState } from './world-config';

type Entry={mesh:THREE.Mesh;original:THREE.Material;material:THREE.Material;shadow:boolean;lastHit:number};
export function CameraOcclusion({state}:{state:RefObject<WorldState>}){
 const {scene,camera}=useThree();
 const entries=useRef<Entry[]>([]);
 const ray=useMemo(()=>new THREE.Raycaster(),[]),target=useMemo(()=>new THREE.Vector3(),[]),direction=useMemo(()=>new THREE.Vector3(),[]);
 const bounds=useMemo(()=>new THREE.Box3(),[]);
 const nextCheck=useRef(0);
 const hits=useMemo(()=>new Set<THREE.Object3D>(),[]);
 const sample=useMemo(()=>new THREE.Vector3(),[]);
 useEffect(()=>()=>{entries.current.forEach(e=>{e.mesh.material=e.original;e.mesh.castShadow=e.shadow;e.material.dispose();});},[]);
 useFrame(({clock},delta)=>{
  if(!entries.current.length)scene.traverse(group=>{
   if(group.name!=='camera-occluders')return;
   group.traverse(object=>{
    if(!(object instanceof THREE.Mesh)||Array.isArray(object.material)||object.material.opacity<.99||entries.current.some(e=>e.mesh===object))return;
    // Horizontal floors and ceilings already have a modeled stair opening.
    // Fading these large slabs causes the landing to appear and disappear.
    if(!object.geometry.boundingBox)object.geometry.computeBoundingBox();
    const box=object.geometry.boundingBox;
    if(box&&box.max.y-box.min.y<.28&&box.max.x-box.min.x>.6&&box.max.z-box.min.z>.6)return;
    const material=object.material.clone();material.transparent=true;entries.current.push({mesh:object,original:object.material,material,shadow:object.castShadow,lastHit:-10});object.material=material;
   });
  });
  const s=state.current,inside=s.started&&isInterior(s)&&Math.abs(s.position[0]-STAIR.x)<2.3&&s.position[1]>-9&&s.position[1]<2;
  const check=clock.elapsedTime>=nextCheck.current;
  if(check){nextCheck.current=clock.elapsedTime+.08;hits.clear();}
  if(inside&&check){
   target.set(s.position[0],elevation(...s.position,s.floor)+1.05,s.position[1]);
   const visible=entries.current.filter(({mesh})=>{let node:THREE.Object3D|null=mesh;while(node){if(!node.visible)return false;node=node.parent;}return true;});
   const meshes=visible.map(e=>e.mesh);
   for(const [ox,oy] of [[0,0],[-.3,0],[.3,0],[0,.65],[0,-.65]]){
    sample.copy(target);sample.x+=ox;sample.y+=oy;direction.copy(sample).sub(camera.position);const length=direction.length();
    ray.set(camera.position,direction.normalize());ray.near=.04;ray.far=Math.max(.1,length-.25);
    for(const hit of ray.intersectObjects(meshes,false))hits.add(hit.object);
   }
      // Keep the whole stair route readable, not just the avatar silhouette.
   if(Math.abs(s.position[0]-STAIR.x)<2.3&&s.position[1]>-9&&s.position[1]<2){
    for(const z of [0,-1.75,-3.5,-5.25,-7]){
     sample.set(STAIR.x,elevation(STAIR.x,z,0)+.18,z);direction.copy(sample).sub(camera.position);const distance=direction.length();
     ray.set(camera.position,direction.normalize());ray.near=.04;ray.far=Math.max(.1,distance-.1);
     for(const hit of ray.intersectObjects(meshes,false))hits.add(hit.object);
    }
   }
   for(const {mesh} of visible){
    if(!mesh.geometry.boundingBox)mesh.geometry.computeBoundingBox();
    if(mesh.geometry.boundingBox&&bounds.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld).expandByScalar(.04).containsPoint(camera.position))hits.add(mesh);
   }
  }
  for(const entry of entries.current){
   if(hits.has(entry.mesh))entry.lastHit=clock.elapsedTime;
   const fade=inside&&clock.elapsedTime-entry.lastHit<.18;
   entry.material.opacity=THREE.MathUtils.damp(entry.material.opacity,fade?.03:1,12,Math.min(delta,.05));
   const transparent=entry.material.opacity<.995;
   entry.material.depthWrite=!transparent;entry.mesh.castShadow=entry.shadow&&!transparent;
  }
 });
 return null;
}
