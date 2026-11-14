import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { walkable } from '../src/components/explore/world-config.ts';

const requirements={
 'flowering-tree':['Crown','BranchNetwork','Leaves_0','Leaves_1','Leaves_2'],
 'copper-tree':['Crown','BranchNetwork'],
 'echo-studio':['ScreenSurface','Headphones','Chair','Keyboard','RoundedDesk','StudioSpeaker','LampBulb'],
 'gaurav-sunset':['Face','Overshirt','LegL','LegR','KneeL','KneeR','CanvasBackpack'],
 'house-exterior':[],
};
for(const [asset,names] of Object.entries(requirements)){
 const bytes=await readFile(`public/models/${asset}.glb`);
 assert.equal(bytes.readUInt32LE(0),0x46546c67);assert.equal(bytes.readUInt32LE(4),2);
 assert(bytes.length<1_500_000,`${asset} exceeded its web delivery budget`);
 const gltf=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
 for(const name of names)assert(gltf.nodes.some(n=>n.name===name),`${asset}: missing ${name}`);
 if(asset==='house-exterior')assert.equal(gltf.meshes.length,3,'Facade should stay merged to three materials');
 for(const accessor of gltf.accessors||[])for(const value of [...(accessor.min||[]),...(accessor.max||[])])assert(Number.isFinite(value),'Invalid model bounds');
 console.log(`${asset}: ${Math.round(bytes.length/1024)} KB; named parts and bounds verified`);
}
for(const [x,z] of [[3.7,22],[-4.2,11],[10.7,6],[-9.6,18],[-8.16,-6.1],[-4.05,-12.9],[-4.5,5.4]])assert(!walkable(x,z),`New prop at ${x},${z} lacks collision`);
assert(walkable(-6,-8),'Studio viewpoint must remain clear');
assert(walkable(0,26),'Respawn must remain clear');
console.log('Passed: new prop collisions, studio viewpoint, and shoreline respawn.');
