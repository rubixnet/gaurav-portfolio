import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire,stripTypeScriptTypes} from 'node:module';
const require=createRequire(import.meta.url);
const config=require('../src/components/explore/world-config.ts');
const source=await readFile('src/components/explore/follow-camera.ts','utf8');
const compiled=stripTypeScriptTypes(source).replace(/^import .+from '.\/world-config';/m,'const { elevation, onStairs } = config;').replace(/^export /gm,'');
const cameraModule=new Function('config',`${compiled}; return {followCamera};`)(config);
let checks=0;
for(const from of config.PLACES)for(const to of config.PLACES){
 if(from.id===to.id)continue;
 let floor=config.placeFloor(from.id),previous=from.point;
 let previousShot=cameraModule.followCamera({position:previous,floor});
 for(const position of config.routeTo({position:previous,floor},to.point,config.placeFloor(to.id))){
  if(config.onStairs(...previous)&&Math.abs(position[0]-7)<1.05){if(position[1]<=-7)floor=1;else if(position[1]>=0)floor=0;}
  const shot=cameraModule.followCamera({position,floor});
  assert.equal(shot.angle,0,'Camera must remain centered');
  assert.equal(shot.fov,68,'Camera lens changed between rooms');
  const movement=Math.hypot(position[0]-previous[0],position[1]-previous[1]);
  const cameraStep=Math.hypot(...shot.position.map((value,i)=>value-previousShot.position[i]));
  assert(cameraStep<=movement*1.2+.001,'Camera jumped at a room or floor boundary');
  assert(shot.position.every(Number.isFinite));
  previous=position;previousShot=shot;checks++;
 }
}
for(const blend of [0,.25,.5,.75,1])for(const mobile of [false,true]){
 const shot=cameraModule.followCamera({position:[0,2.6],floor:0},blend,mobile);
 assert.equal(shot.position[0],0,'Entrance must stay centered');
}
const model=await readFile('public/models/gaurav-sunset.glb');
assert.equal(model.readUInt32LE(0),0x46546c67,'Invalid GLB header');
const gltf=JSON.parse(model.subarray(20,20+model.readUInt32LE(12)).toString());
for(const name of ['Face','SweptQuiff','Nose','Smile','EyeWhite_1','Iris_-1','LegL','LegR','ArmL','ArmR','KneeL','KneeR','ElbowL','ElbowR','Overshirt','InnerKnitShirt'])assert(gltf.nodes.some(node=>node.name===name),`Missing character feature ${name}`);
console.log(`Passed: ${checks} continuous camera steps across 72 routes, entrance blending, and articulated character model structure.`);
