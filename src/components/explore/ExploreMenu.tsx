'use client';
import { PORTFOLIO_SECTIONS,type PortfolioSection } from './PortfolioPanels';
export type TimeMode='auto'|'day'|'sunset'|'night';
type Props={onSelect:(section:PortfolioSection|'help')=>void;sound:boolean;onSound:(enabled:boolean)=>void;quality:'high'|'balanced';onQuality:(quality:'high'|'balanced')=>void;time:TimeMode;onTime:(time:TimeMode)=>void};
export function ExploreMenu({onSelect,sound,onSound,quality,onQuality,time,onTime}:Props){
 return <div className="explore-menu-content">
  <nav className="explore-menu-links" aria-label="Portfolio sections">{PORTFOLIO_SECTIONS.map(section=><button key={section.id} onClick={()=>onSelect(section.id)}><span>{section.label}</span><span aria-hidden="true">↗</span></button>)}</nav>
  <button className="explore-controls-link" onClick={()=>onSelect('help')}><span>Controls &amp; keyboard shortcuts</span><span aria-hidden="true">→</span></button>
  <fieldset className="explore-settings"><legend>Experience settings</legend>
   <div className="explore-setting"><div><label htmlFor="menu-sound">Sound</label><small>Ocean ambience and footsteps</small></div><button id="menu-sound" className="explore-sound-toggle" role="switch" aria-checked={sound} aria-label="Ambient sound" onClick={()=>onSound(!sound)}>{sound?'On':'Off'}<span aria-hidden="true"/></button></div>
   <div className="explore-setting"><div><label htmlFor="menu-quality">Graphics quality</label><small>Choose what suits your device</small></div><select id="menu-quality" value={quality} onChange={e=>onQuality(e.target.value as Props['quality'])}><option value="balanced">Balanced</option><option value="high">High</option></select></div>
   <div className="explore-setting"><div><label htmlFor="menu-time">Time of day</label><small>Set the island lighting</small></div><select id="menu-time" value={time} onChange={e=>onTime(e.target.value as TimeMode)}><option value="auto">Automatic</option><option value="day">Day</option><option value="sunset">Sunset</option><option value="night">Night</option></select></div>
  </fieldset>
 </div>;
}
