'use client';
import { useEffect, type RefObject } from 'react';
import { isInterior, type WorldState } from './world-config';

export function WorldAudio({enabled,state}:{enabled:boolean;state:RefObject<WorldState>}){
 useEffect(()=>{
  if(!enabled)return;
  const context=new AudioContext(),sea=context.createBuffer(1,context.sampleRate*4,context.sampleRate),samples=sea.getChannelData(0);let last=0;
  for(let i=0;i<samples.length;i++){last=(last+Math.random()*.04-.02)/1.02;samples[i]=last*3;}
  // Blend the noise endpoints so each ocean loop joins without a click.
  const seam=Math.floor(context.sampleRate*.12),tail=samples[samples.length-1];
  for(let i=0;i<seam;i++){const t=i/seam;samples[i]=tail*(1-t)+samples[i]*t;}
  const source=context.createBufferSource();source.buffer=sea;source.loop=true;
  const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=550;
  const volume=context.createGain();volume.gain.value=0;source.connect(filter);filter.connect(volume);volume.connect(context.destination);source.start();void context.resume().catch(()=>{});
  const stepBuffer=context.createBuffer(1,Math.floor(context.sampleRate*.09),context.sampleRate),stepData=stepBuffer.getChannelData(0);
  for(let i=0;i<stepData.length;i++)stepData[i]=(Math.random()*2-1)*(1-i/stepData.length)**2;
  let previous=[...state.current.position],distance=0;
  const interval=setInterval(()=>{
   const s=state.current,inside=isInterior(s),now=context.currentTime;
   volume.gain.setTargetAtTime(document.hidden?0:inside?.006:.035*(.85+Math.sin(now*.35)*.15),now,.25);
   const travelled=Math.hypot(s.position[0]-previous[0],s.position[1]-previous[1]);previous=[...s.position]; if(!s.started||s.paused||s.seated||document.hidden||travelled>1){distance=0;return;} distance+=travelled;
   if(!s.started||s.paused||document.hidden||distance<.72)return;
   distance=0;
   const step=context.createBufferSource(),low=context.createBiquadFilter(),gain=context.createGain();step.buffer=stepBuffer;low.type='lowpass';low.frequency.value=inside?480:950;gain.gain.setValueAtTime(inside?.045:.025,now);gain.gain.exponentialRampToValueAtTime(.001,now+.09);step.connect(low);low.connect(gain);gain.connect(context.destination);step.onended=()=>{step.disconnect();low.disconnect();gain.disconnect();};step.start();
  },90);
  return()=>{clearInterval(interval);source.stop();void context.close();};
 },[enabled,state]);
 return null;
}
