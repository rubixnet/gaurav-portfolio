'use client';
import dynamic from 'next/dynamic';
// The walkable world depends on browser input, WebGL, and local preferences.
// Keep its initial HTML stable and load the interactive UI only on the client.
const IslandExperience=dynamic(()=>import('./IslandExperience'),{ssr:false,loading:()=> <main className="island-app"><div className="boot-message" role="status">Preparing Gaurav’s World…</div></main>});
export default function PortfolioClient(){return <IslandExperience/>;}
