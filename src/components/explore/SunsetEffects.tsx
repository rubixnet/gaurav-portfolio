'use client';
import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Vector2, WebGLRenderTarget, HalfFloatType } from 'three';

export function SunsetEffects(){
 const {gl,scene,camera,size}=useThree();
 const composer=useRef<EffectComposer|null>(null);
 useEffect(()=>{
  const pipeline=new EffectComposer(gl,new WebGLRenderTarget(1,1,{type:HalfFloatType,samples:2}));
  const render=new RenderPass(scene,camera),bloom=new UnrealBloomPass(new Vector2(512,512),.22,.5,1.15),output=new OutputPass();
  pipeline.addPass(render);pipeline.addPass(bloom);pipeline.addPass(output);composer.current=pipeline;
  return()=>{composer.current=null;render.dispose();bloom.dispose();output.dispose();pipeline.dispose();};
 },[gl,scene,camera]);
 useEffect(()=>{composer.current?.setPixelRatio(Math.min(gl.getPixelRatio(),1.35));composer.current?.setSize(size.width,size.height);},[gl,size]);
 useFrame((_,delta)=>{if(composer.current)composer.current.render(delta);else gl.render(scene,camera);},1);
 return null;
}
