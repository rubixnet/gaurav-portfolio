'use client';
import {HorrorGame} from './HorrorGame';
import {Html} from '@react-three/drei';
import {createPortal} from 'react-dom';
import {useFrame,useThree} from '@react-three/fiber';
import {useEffect,useMemo,useRef,useState,type ReactNode,type RefObject} from 'react';
import * as THREE from 'three';
import type {WorldState} from './world-config';
function MobileComputer({children}:{children:ReactNode}){return createPortal(<div className="mobile-computer" role="dialog" aria-modal="true" aria-label="Creative computer">{children}</div>,document.body);}
export function InstagramScreen({state}:{state:RefObject<WorldState>}){
 const [active,setActive]=useState(false),[tab,setTab]=useState<'web'|'games'|'connect'>('web');
 const {size}=useThree();const mobile=size.width<=700;const lastActive=useRef(false);
 useFrame(()=>{const next=!!state.current.deskSeated;if(next!==lastActive.current){lastActive.current=next;setActive(next);}});

 const texture=useMemo(()=>{const c=document.createElement('canvas');c.width=1024;c.height=576;const x=c.getContext('2d')!;x.fillStyle='#112731';x.fillRect(0,0,1024,576);x.fillStyle='#83c4ac';x.font='28px monospace';x.fillText('GAURAV OS / CREATIVE STUDIO',60,70);x.fillStyle='#f4dec0';x.font='bold 70px sans-serif';x.fillText('Build. Play. Explore.',60,220);x.font='30px sans-serif';x.fillText('Web development × Game development',60,300);x.fillStyle='#83c4ac';x.font='26px monospace';x.fillText('Sit down to open my digital workspace →',60,460);const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;return map;},[]);
 useEffect(()=>()=>texture.dispose(),[texture]);
 const screen=(<section className="monitor-os" aria-label="Gaurav creative computer" onKeyDown={e=>e.stopPropagation()}>
 <header><span><i/> GAURAV OS <small>/ CREATIVE STUDIO</small></span><button onClick={()=>window.dispatchEvent(new Event('portfolio-desk-exit'))}>Stand up ↗</button></header>
 <nav aria-label="Computer apps">{(['web','games','connect'] as const).map(t=><button key={t} aria-pressed={tab===t} onClick={()=>setTab(t)}>{t==='web'?'〈/〉 Web lab':t==='games'?'✦ Game lab':'↗ Connect'}</button>)}</nav>
 {tab==='web'?<div className="os-web"><div><p className="os-kicker">01 / WEB DEVELOPER</p><h2>Ideas into<br/><em>interfaces.</em></h2><p>I build interactive experiences for the web.</p><code>const idea = createSomething();</code></div><div className="os-projects"><a href="https://echomusicapp.vercel.app" target="_blank" rel="noreferrer"><img src="/project-previews/echo.jpg" alt="Echo Music homepage"/><span>Echo Music ↗</span></a><a href="https://bdmtn.vercel.app/" target="_blank" rel="noreferrer"><img src="/project-previews/bdmtn.jpg" alt="Badminton homepage"/><span>Badminton ↗</span></a></div></div>:tab==='games'?<HorrorGame/>:<div className="os-connect"><p className="os-kicker">03 / BEYOND THE KEYBOARD</p><h2>Let's make<br/><em>something interesting.</em></h2><p>Web developer · Game developer · Traveler</p><div><a href="https://www.instagram.com/i.am.gaurav18/" target="_blank" rel="noreferrer">Instagram <b>@i.am.gaurav18 ↗</b></a><a href="https://github.com/rubixnet/" target="_blank" rel="noreferrer">GitHub <b>rubixnet ↗</b></a><a href="https://x.com/grubix_net" target="_blank" rel="noreferrer">X / Twitter <b>@grubix_net ↗</b></a></div></div>}
 <footer><span>GAURAV BHATURKAR</span><span>BUILD / PLAY / EXPLORE</span></footer></section>);
 return <group position={[2.6,1.6,-11.325]}><mesh><planeGeometry args={[1.36,.77]}/><meshBasicMaterial map={texture}/></mesh>
 {active&&(mobile?<Html><MobileComputer>{screen}</MobileComputer></Html>:<Html transform distanceFactor={.53} position={[0,0,.008]} zIndexRange={[8,7]}>{screen}</Html>)}
 </group>;
}
