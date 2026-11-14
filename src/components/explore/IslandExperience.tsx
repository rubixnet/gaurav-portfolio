'use client';

import dynamic from 'next/dynamic';
import { ActionPrompt } from './ActionPrompt';
import { useCallback, useEffect, useRef, useState } from 'react';
import { portfolioLinks, portfolioProjects } from '../portfolio-data';
import { findPath, onStairs, placeFloor, PLACES, routeTo, type PlaceId, type Point, type WorldState } from './world-config';
import { WorldAudio } from './WorldAudio';
import { PORTFOLIO_SECTIONS, PortfolioPanel, SECTION_TITLES, type PortfolioSection } from './PortfolioPanels';

const ExplorerScene=dynamic(()=>import('./ExplorerScene'),{ssr:false,loading:()=> <div className="boot-message">Drawing the shoreline…</div>});
const DEFAULT_INTRO='I am Gaurav Bhaturkar, a web developer and game developer. I am a first-year Electronics and Telecommunication Engineering student at Shri Sant Gajanan Maharaj College of Engineering, Shegaon. I enjoy creating interactive experiences, traveling, music, badminton, and cricket.';

export default function IslandExperience() {
 const state=useRef<WorldState>({position:[0,31],floor:0,path:[],keys:new Set(),joystick:[0,0],started:false,paused:false,reducedMotion:false,mainDoorOpen:0,balconyDoorOpen:0});
 const [started,setStarted]=useState(false),[ready,setReady]=useState(false),[failed,setFailed]=useState(false);
 const [place,setPlace]=useState<PlaceId>('arrival'),[panel,setPanel]=useState<PlaceId|PortfolioSection|'map'|'help'|null>(null);
 const [quality,setQuality]=useState<'high'|'balanced'>('balanced'),[sound,setSound]=useState(false),[reduced,setReduced]=useState(false);
 const profile=({college:'Shri Sant Gajanan Maharaj College of Engineering, Shegaon',branch:'Electronics and Telecommunication Engineering',intro:DEFAULT_INTRO});
 const [changing,setChanging]=useState(false);
 const [timeMode,setTimeMode]=useState<'auto'|'day'|'sunset'|'night'>('auto');
 const timers=useRef<ReturnType<typeof setTimeout>[]>([]);
 const [seated,setSeated]=useState(false);
 const [visited,setVisited]=useState<PlaceId[]>([]);
 const dialog=useRef<HTMLDivElement>(null),previousFocus=useRef<HTMLElement|null>(null),interact=useRef<HTMLButtonElement>(null);
 const joystick=useRef<HTMLDivElement>(null),stickThumb=useRef<HTMLSpanElement>(null);
 function setStick([x,y]:Point){if(stickThumb.current)stickThumb.current.style.transform=`translate(${x}px,${y}px)`;}
 const [deskSeated,setDeskSeated]=useState(false),[nearDesk,setNearDesk]=useState(false);
 const [stairActive,setStairActive]=useState(false);
 useEffect(()=>{const timer=setInterval(()=>{setStairActive(onStairs(...state.current.position));setNearDesk(state.current.floor===1&&Math.hypot(state.current.position[0]-2,state.current.position[1]+9)<2.1);},120);return()=>clearInterval(timer);},[]);
 const current=PLACES.find(p=>p.id===place)!;
 const onReady=useCallback(()=>setReady(true),[]),onFailure=useCallback(()=>{setFailed(true);setReady(true);},[]);
 const open=useCallback((id:PlaceId)=>setPanel(id),[]);
 const discover=useCallback((id:PlaceId)=>setVisited(old=>{if(old.includes(id))return old;const next=[...old,id];try{localStorage.setItem('gaurav-explored-v1',JSON.stringify(next));}catch{}return next;}),[]);

 useEffect(()=>{
   const media=matchMedia('(prefers-reduced-motion: reduce)');
   const sync=()=>{state.current.reducedMotion=media.matches;setReduced(media.matches);};sync();media.addEventListener('change',sync);
   if(matchMedia('(max-width: 700px)').matches)setQuality('balanced');
   try{const known=JSON.parse(localStorage.getItem('gaurav-explored-v1')||'[]');if(Array.isArray(known))setVisited([...new Set(known.filter((id):id is PlaceId=>PLACES.some(p=>p.id===id)))]);}catch{}
   return()=>media.removeEventListener('change',sync);
 },[]);
 useEffect(()=>()=>timers.current.forEach(clearTimeout),[]);
 useEffect(()=>{state.current.timeMode=timeMode;},[timeMode]);
 useEffect(()=>{
   state.current.started=started&&ready;state.current.paused=!!panel||!ready||seated||deskSeated||changing;
   state.current.keys.clear();state.current.joystick=[0,0];
 },[started,panel,ready,seated,deskSeated,changing]);
 useEffect(()=>{
   const down=(e:KeyboardEvent)=>{
     if(changing)return;
     if(e.key==='Escape'){setPanel(null);state.current.path=[];state.current.keys.clear();state.current.joystick=[0,0];setStick([0,0]);return;}
     const interactive=(e.target as HTMLElement)?.closest('button,a,input,textarea,select');
     if((e.target as HTMLElement)?.closest('input,textarea,select,[contenteditable=true]'))return;
     if(interactive&&(e.key==='Enter'||e.key===' '))return;
     if(started&&!panel&&!e.repeat&&(nearDesk||deskSeated)&&(e.key==='Enter'||e.key.toLowerCase()==='e')){e.preventDefault();toggleDesk();return;}
     if(place==='balcony'&&started&&!panel&&!e.repeat&&(e.key==='Enter'||e.key.toLowerCase()==='e')){e.preventDefault();toggleSeat();return;}
     if(e.key==='Enter'&&!interactive&&!panel&&!e.repeat&&!state.current.seated){e.preventDefault();if(!started&&ready)setStarted(true);else if(started&&!onStairs(...state.current.position))setPanel(place);return;}
     if(panel||!started)return;
     if(state.current.seated){if(e.key==='Enter'||e.key.toLowerCase()==='e'){viewChange(()=>{state.current.deskSeated=false;setDeskSeated(false);state.current.seated=false;setSeated(false);state.current.position=[-5.7,3];});}return;}
     const key=e.key.toLowerCase();
     if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(key))e.preventDefault();
     if(key==='e'&&!e.repeat&&!onStairs(...state.current.position)){setPanel(place);return;}
     if(key==='m'&&!e.repeat){setPanel('map');return;}
     if(key==='p'&&!e.repeat){setPanel('projects');return;}
     if(key==='r'&&!e.repeat){respawn();return;}
     if(/^[1-9]$/.test(key)&&!e.repeat){travel(PLACES[Number(key)-1].id);return;}
     state.current.keys.add(key);
   };
   const up=(e:KeyboardEvent)=>state.current.keys.delete(e.key.toLowerCase());
   const clear=()=>{state.current.keys.clear();state.current.joystick=[0,0];setStick([0,0]);};
   window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',clear);document.addEventListener('visibilitychange',clear);
   return()=>{window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',clear);document.removeEventListener('visibilitychange',clear);};
 },[panel,started,place,ready,changing,nearDesk,deskSeated]);
 useEffect(()=>{
   if(!panel)return;
   previousFocus.current=document.activeElement as HTMLElement;
   const frame=requestAnimationFrame(()=>dialog.current?.querySelector<HTMLButtonElement>('button')?.focus());
   const trap=(e:KeyboardEvent)=>{
     if(e.key!=='Tab'||!dialog.current)return;
     const items=Array.from(dialog.current.querySelectorAll<HTMLElement>('a[href],button,input,textarea,[tabindex="0"]')).filter(el=>!el.hasAttribute('disabled'));
     const first=items[0],last=items.at(-1);
     if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
   };
   document.addEventListener('keydown',trap);
   return()=>{cancelAnimationFrame(frame);document.removeEventListener('keydown',trap);previousFocus.current?.focus();};
 },[panel]);

 function viewChange(action:()=>void){
   if(changing)return;
   const run=()=>{state.current.keys.clear();state.current.joystick=[0,0];action();state.current.cameraCut=(state.current.cameraCut??0)+1;};
   if(state.current.reducedMotion){run();return;}
   setChanging(true);timers.current.push(setTimeout(()=>{run();timers.current.push(setTimeout(()=>setChanging(false),160));},150));
 }
 function travel(id:PlaceId){
   viewChange(()=>{
   const destination=PLACES.find(p=>p.id===id)!;
   setStarted(true);setPanel(null);state.current.started=true;state.current.paused=false;
   state.current.deskSeated=false;setDeskSeated(false);state.current.seated=false;setSeated(false);state.current.position=[...destination.point];state.current.floor=placeFloor(id);state.current.path=[];state.current.keys.clear();state.current.joystick=[0,0];setPlace(id);discover(id);
   (document.activeElement as HTMLElement)?.blur();
   });
 }
 useEffect(()=>{const exit=()=>{if(state.current.deskSeated)toggleDesk();};window.addEventListener('portfolio-desk-exit',exit);return()=>window.removeEventListener('portfolio-desk-exit',exit);},[changing]);
 function toggleDesk(){viewChange(()=>{const next=!state.current.deskSeated;state.current.deskSeated=next;setDeskSeated(next);state.current.position=next?[2,-10.2]:[2,-8.8];state.current.path=[];});}
 function toggleSeat(){viewChange(()=>{const next=!state.current.seated;state.current.seated=next;setSeated(next);state.current.path=[];state.current.position=next?[-6.9,3]:[-5.7,3];});}
 function respawn(){if(!ready)return;viewChange(()=>{state.current.deskSeated=false;setDeskSeated(false);state.current.seated=false;setSeated(false);state.current.position=[0,26];state.current.floor=0;state.current.path=[];state.current.keys.clear();state.current.joystick=[0,0];setStarted(true);setPanel(null);setStick([0,0]);});}
 function moveStick(e:React.PointerEvent<HTMLDivElement>){
   if(e.buttons===0&&e.pointerType==='mouse')return;
   const bounds=e.currentTarget.getBoundingClientRect();
   let x=(e.clientX-bounds.left-bounds.width/2)/35,z=(e.clientY-bounds.top-bounds.height/2)/35;
   const n=Math.max(1,Math.hypot(x,z));x/=n;z/=n;
   state.current.joystick=[x,z];setStick([x*26,z*26]);
 }

 return <main className={`island-app ${seated?"is-seated":""}`}>
   <div className="world-viewport" aria-label="Interactive 3D island. Use WASD or arrow keys to walk; E to interact.">
     {!failed&&<ExplorerScene state={state} onPlace={setPlace} onDiscover={discover} onReady={onReady} onOpen={open} onFailure={onFailure} quality={quality}/>}
   </div>
   <div className={`view-veil ${changing?'is-changing':''}`} aria-hidden="true"/>
   <div className="cinema-wash" aria-hidden="true"/>
   <WorldAudio enabled={sound} state={state}/>
   <header className="island-header">
     <a className="island-brand" href="#" onClick={e=>{e.preventDefault();setStarted(false);setSeated(false);setDeskSeated(false);setPanel(null);state.current.seated=false;state.current.deskSeated=false;state.current.keys.clear();state.current.joystick=[0,0];state.current.path=[];state.current.position=[0,31];state.current.floor=0;}} aria-label="Return to island welcome"><span className="brand-seal">G.</span><span>GAURAV’S WORLD<small>A PLACE TO EXPLORE</small></span></a>
     <nav aria-label="Main navigation"><button className="map-trigger" title="Open the map and teleport to a location (M)" onClick={()=>setPanel('map')}>Map <span>⌖</span></button><a href={portfolioLinks.github} target="_blank" rel="noreferrer">GitHub ↗</a><button className="controls-trigger" onClick={()=>setPanel('help')} aria-label="Open controls" title="View movement controls and keyboard shortcuts">?</button></nav>
   </header>

   {!started&&!failed&&<section className="welcome-copy">
     <p className="eyebrow"><span/> GAURAV BHATURKAR</p>
     <h1>Gaurav’s<br/><em>little world.</em></h1>
     <p className="welcome-description">Web developer and game developer.<br/>Inspired by travel, music, and play.</p>
     <button className="primary-button" disabled={!ready} onClick={()=>viewChange(()=>{setStarted(true);state.current.path=findPath(state.current.position,[0,20]);})}>{ready?'Explore on foot':'Preparing your island…'} <span>↗</span></button>
     <button className="text-button" disabled={!ready} onClick={()=>travel('music')}>Visit the listening room <span>→</span></button>
   </section>}

   {!ready&&!failed&&<div className="loading-island" role="status"><i/> Setting the scene…</div>}
   {failed&&<section className="welcome-copy render-error"><p className="eyebrow">YOUR CONNECTION TO THE ISLAND</p><h1>The projects<br/>are still here.</h1><p>This browser couldn’t start the 3D world. Explore the projects and profile from the menu.</p><button className="primary-button" onClick={()=>setPanel('map')}>Open portfolio ↗</button></section>}

   {started&&!failed&&<>
     {place==='balcony'&&<ActionPrompt className="seat-button" onClick={toggleSeat} label={seated?'Stand up':'Enjoy the balcony'}/>}
     {!seated&&!deskSeated&&<section className="place-caption" aria-live="polite"><p className="eyebrow">{stairActive?"↟":current.icon} / YOU ARE HERE</p><h2>{stairActive?"The staircase":current.name}</h2><p>{stairActive?"Use W or S to climb or descend. The walls fade to reveal your path.":current.hint}</p></section>}
     {!stairActive&&!nearDesk&&!deskSeated&&['music','sports','bedroom','contact','gallery'].includes(place)&&<ActionPrompt buttonRef={interact} className="interaction-button" onClick={()=>setPanel(place)} label={place==='music'?'Explore Echo Music':place==='sports'?'Explore Badminton':place==='bedroom'?'About Gaurav':place==='gallery'?'View projects':'Get in touch'}/>}
     {!seated&&!deskSeated&&!panel&&<div ref={joystick} className="joystick" aria-label="Touch movement control" onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);moveStick(e);}} onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))moveStick(e);}} onPointerUp={()=>{state.current.joystick=[0,0];setStick([0,0]);}} onLostPointerCapture={()=>{state.current.joystick=[0,0];setStick([0,0]);}} onPointerCancel={()=>{state.current.joystick=[0,0];setStick([0,0]);}}><span ref={stickThumb}/></div>}
   </>}

   {started&&nearDesk&&!deskSeated&&!panel&&<ActionPrompt className="seat-button" onClick={toggleDesk} label="Use computer"/>}

   {seated&&<nav className="balcony-project-links" aria-label="Balcony projects"><a href={portfolioProjects[0].href} target="_blank" rel="noreferrer">Echo Music ↗</a><a href={portfolioProjects[1].href} target="_blank" rel="noreferrer">Badminton ↗</a></nav>}
   <footer className="island-footer" aria-label="World settings"><div><button className="sound-button" title="Turn ambient ocean sounds and footsteps on or off" onClick={()=>setSound(!sound)} aria-pressed={sound}>{sound?'◖))':'◖×'} <span>SOUND {sound?'ON':'OFF'}</span></button><button title="Switch between balanced performance and higher-quality shadows and effects" onClick={()=>setQuality(quality==='high'?'balanced':'high')} aria-label={`Graphics quality ${quality}. Click to change.`}>{quality==='high'?'HIGH':'BALANCED'}</button><button title="Cycle through automatic time, day, sunset, and night" onClick={()=>setTimeMode(mode=>({auto:'day',day:'sunset',sunset:'night',night:'auto'} as const)[mode])} aria-label={`Time of day: ${timeMode}. Change time`}>TIME: {timeMode.toUpperCase()}</button></div></footer>
   {started&&!seated&&!deskSeated&&!panel&&<div className="desktop-hint" aria-label="Movement guide"><div className="movement-keys" aria-hidden="true"><kbd className="key-up">W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></div><p><strong>Move around</strong><br/><small>WASD or arrow keys</small><br/><small>Enter / E to interact</small></p></div>}
   {reduced&&<span className="motion-note">Reduced motion enabled</span>}

   {panel&&<div className="modal-scrim" onClick={e=>{if(e.target===e.currentTarget)setPanel(null);}}>
     <div className="island-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title" ref={dialog}>
       <button className="dialog-close round-button" onClick={()=>setPanel(null)} aria-label="Close panel">×</button>
       <p className="eyebrow">GAURAV’S WORLD / {panel==='map'?'ISLAND DIRECTORY':panel==='help'?'A FEW DIRECTIONS':'A LITTLE DISCOVERY'}</p>
       <h2 id="dialog-title">{panel==='map'?'Where to next?':panel==='help'?'Go at your own pace.':panel==='gallery'?SECTION_TITLES.projects:SECTION_TITLES[panel as PortfolioSection]??PLACES.find(p=>p.id===panel)?.name}</h2>
       {panel==='balcony'?<><p>A quiet spot above the garden, with the ocean around the island. The sliding doors open as you approach.</p><button className="primary-button" onClick={()=>travel('gallery')}>Back to the creative loft ↗</button></>:['about','skills','projects','education','achievements','gallery'].includes(panel)?<PortfolioPanel section={panel==='gallery'?'projects':panel as PortfolioSection} profile={profile}/>:panel==='map'?<>
         <p>Choose a location to teleport there instantly.</p><div className="map-sections">{PORTFOLIO_SECTIONS.map(section=><button key={section.id} onClick={()=>setPanel(section.id)}>{section.label}</button>)}</div>
         <div className="destination-list">{PLACES.map(p=><button key={p.id} onClick={()=>failed?setPanel(p.id):travel(p.id)}><span>{p.icon}</span><b>{p.name}</b><span>↗</span></button>)}</div>
         <div className="direct-links">{portfolioProjects.map(p=><a key={p.id} href={p.href} target="_blank" rel="noreferrer">{p.title} ↗</a>)}<a href={portfolioLinks.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={portfolioLinks.x} target="_blank" rel="noreferrer">X ↗</a></div>
       </>:panel==='help'?<>
         <div className="help-grid"><p><b>Walk freely</b>Use WASD or arrow keys. Hold Shift to run. On a phone, drag the circular touch control.</p><p><b>Pick a destination</b>Click the ground, press 1–9, or choose a place on the map. The creative loft and balcony are reached by the staircase. Doors open automatically before you pass through.</p><p><b>One steady view</b>The camera follows at a fixed angle. Walls around the staircase fade as you approach, revealing the steps. Escape cancels click-to-walk movement. R returns you to the island entrance. Sound toggles ambience; graphics switches quality; Time changes the lighting.</p><p><b>Discover things</b>Enter starts the tour and opens the current room. E also interacts. On the balcony, Enter or E sits down or stands up. M opens the map, P opens projects, R returns you to the shoreline, and Escape closes a panel. Your discovered places are saved in this browser. Tab and Enter work on all buttons.</p></div>
         <button className="primary-button" onClick={()=>setPanel(null)}>Got it. Let’s explore ↗</button>
       </>:panel==='music'?<>
         <div className="project-art music-art" aria-hidden="true">{Array.from({length:23},(_,i)=><i key={i} style={{height:`${18+Math.sin(i*.7)**2*65}%`,animationDelay:`${i*.08}s`}}/>)}<span>ECHO</span></div>
         <h3>Echo Music</h3><p>A place for music in my world. Find the headphones, take a seat at the computer, and open the live project.</p><a className="primary-button" href={portfolioProjects[0].href} target="_blank" rel="noreferrer">Open Echo Music <span>↗</span></a>
       </>:panel==='sports'||panel==='court'?<>
         <div className="project-art court-art" aria-hidden="true"><span>Badminton</span><i/></div><h3>Badminton Tracker — Badminton</h3><img className="website-preview" src="/project-previews/bdmtn.jpg" alt="Badminton badminton tracker website homepage"/><p>A workspace for friendly rivalries: create a club, log match scores, review player profiles, compare win rates, and track head-to-head results.</p><ul><li>Fast scoring between sets</li><li>Match checkpoints and comebacks</li><li>Club invitations and player statistics</li></ul><a className="primary-button" href={portfolioProjects[1].href} target="_blank" rel="noreferrer">Open Badminton <span>↗</span></a>
       </>:panel==='bedroom'?<>
         <p className="profile-intro">{profile.intro}</p><dl className="profile-details"><div><dt>NAME</dt><dd>Gaurav Bhaturkar</dd></div><div><dt>COLLEGE</dt><dd>{profile.college}</dd></div><div><dt>BRANCH</dt><dd>{profile.branch}</dd></div><div><dt>YEAR</dt><dd>First year</dd></div><div><dt>OFF THE SCREEN</dt><dd>Travel · Music · Badminton · Cricket</dd></div></dl>
       </>:panel==='contact'?<>
         <div className="contact-monogram" aria-hidden="true">G.</div><p>Follow what I’m building and find the code behind my projects.</p><div className="contact-links"><a href="https://www.instagram.com/i.am.gaurav18/" target="_blank" rel="noreferrer">Instagram / @i.am.gaurav18 <span>↗</span></a><a href={portfolioLinks.github} target="_blank" rel="noreferrer">GitHub <span>↗</span></a><a href={portfolioLinks.x} target="_blank" rel="noreferrer">X / @grubix_net <span>↗</span></a></div>
       </>:<><p>I’m Gaurav. This island brings together my projects, my love of music, and a few things I enjoy away from the keyboard.</p><p>Follow the path into the house, visit the studio, or head over to the badminton court.</p><button className="primary-button" onClick={()=>setPanel('map')}>Choose somewhere to explore ↗</button></>}
     </div>
   </div>}
 </main>;
}
