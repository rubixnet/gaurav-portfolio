import assert from 'node:assert/strict';
import { canStep, doorAllowsStep, isInterior, placeFloor, PLACES, ROCKS, routeTo, walkable, upperWalkable, onStairs, elevation } from '../src/components/explore/world-config.ts';
assert(walkable(0,31), 'Spawn must be on the dock');
assert(!walkable(40,40), 'Ocean must not be walkable');
assert(!walkable(9,-6), 'House wall must block movement');
assert(!walkable(-16,8), 'Court net must block movement');
let count=0;
for(const from of PLACES)for(const to of PLACES){
 if(from.id===to.id)continue;
 const floor=placeFloor(from.id),targetFloor=placeFloor(to.id);
 const path=routeTo({position:from.point,floor},to.point,targetFloor);
 assert(path.length, `Missing route: ${from.id} → ${to.id}`);
 let current=[...from.point],level=floor;
 for(const next of path){
   const length=Math.hypot(next[0]-current[0],next[1]-current[1]),steps=Math.max(1,Math.ceil(length/.06)),start=[...current];
   for(let i=1;i<=steps;i++){
    const p=[start[0]+(next[0]-start[0])*i/steps,start[1]+(next[1]-start[1])*i/steps];
    assert((level===1?upperWalkable:walkable)(...p),`Blocked segment ${from.id} → ${to.id} at ${p}`);
    if(onStairs(...current)&&Math.abs(p[0]-7)<1.05){if(p[1]<=-7)level=1;else if(p[1]>=0)level=0;}
    current=p;
   }
 }
 assert.equal(level,targetFloor,`Wrong floor: ${from.id} → ${to.id}`);
 assert.deepEqual(path.at(-1),to.point);
 count++;
}
for(const rock of ROCKS)assert(!walkable(rock.x,rock.z),'Rock center must block movement');
for(let z=24;z<=38;z+=.2)assert(walkable(0,z),'Bridge center must remain clear');
assert.equal(elevation(7,0,0),0);assert.equal(elevation(7,-7,1),3.8);
assert(!canStep([7,-7.1],[7,-6.9],0),'Ground floor cannot enter stairs through the upper landing');
assert(!canStep([7,.1],[7,-.1],1),'Upper floor cannot enter stairs through the ground landing');
assert(canStep([7,.1],[7,-.1],0),'Stairs must accept ground entry');
assert(canStep([7,-7.1],[7,-6.9],1),'Stairs must accept upper entry');
assert(!doorAllowsStep([0,2.1],[0,1.9],0,0,0),'Closed main door must block crossing');
assert(doorAllowsStep([0,2.1],[0,1.9],0,1,0),'Open main door must allow crossing');
assert(!doorAllowsStep([0,2.1],[0,1.9],0,.9,0),'Main door must wait for full shoulder clearance');
assert(!doorAllowsStep([0,1.8],[0,2],1,0,0),'Closed balcony door must block crossing');
assert(doorAllowsStep([0,1.8],[0,2],1,0,1),'Open balcony door must allow crossing');
assert(upperWalkable(0,4.2),'Balcony center must be reachable');
assert(upperWalkable(11.2,3.7),'Ocean lookout must be reachable');
assert(!upperWalkable(11.2,0),'Player cannot leave the side of the house before reaching the deck');
assert(!upperWalkable(4,1.9),'Upper front wall must block walking beside the doorway');
assert(!upperWalkable(0,5.6),'Balcony railing must prevent leaving the deck');
assert(!isInterior({position:[0,4.2],floor:1}),'Balcony must reveal the ocean environment');
console.log(`Passed: ${count} routes with floor transitions, rock collisions, clear bridge, stairs, spawn, walls, and net.`);
