import assert from 'node:assert/strict';
import {daySample} from '../src/components/explore/day-cycle.ts';
assert.equal(daySample(.25).daylight,1);
assert.equal(daySample(.75).night,1);
let previous=daySample(0);
for(let i=1;i<=10000;i++){
 const current=daySample(i/10000);
 for(const key of ['daylight','night','twilight']){assert(current[key]>=0&&current[key]<=1);assert(Math.abs(current[key]-previous[key])<.003,`Discontinuous ${key}`);}
 assert(Math.abs(current.daylight+current.night-1)<1e-10);previous=current;
}
assert.deepEqual(daySample(0),daySample(1));
assert.deepEqual(daySample(.25),daySample(2.25));
console.log('Passed: 10,000 day-cycle samples, wraparound, daylight/night balance, and continuous dawn/dusk.');
