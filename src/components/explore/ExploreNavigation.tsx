'use client';

export function ExploreNavigation({active,onMenu,onMap}:{active:string|null;onMenu:()=>void;onMap:()=>void}){
 return <nav className="explore-navigation" aria-label="Main navigation">
  <button className="explore-nav-button" onClick={onMenu} aria-label="Open menu" aria-haspopup="dialog" aria-expanded={active==='menu'} title="Menu: portfolio, controls and settings">
   <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg><span className="explore-nav-tooltip">Menu</span>
  </button>
  <button className="explore-nav-button" onClick={onMap} aria-label="Open map" aria-haspopup="dialog" aria-expanded={active==='map'} title="Map: choose a destination (M)">
   <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m5 14-3 7h20l-3-7M9 14H5m14 0h-4"/><path d="M17 7c0 3.5-5 8-5 8S7 10.5 7 7a5 5 0 1 1 10 0Z"/><circle cx="12" cy="7" r="1.5"/></svg><span className="explore-nav-tooltip">Map</span>
  </button>
 </nav>;
}
