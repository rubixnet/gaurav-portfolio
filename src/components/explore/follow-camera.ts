import { elevation, type WorldState } from './world-config';

// A single azimuth and lens. Only follow distance blends at the entrance.
export function followCamera(state:Pick<WorldState,'position'|'floor'>,indoorAmount=1,mobile=false){
 if((state as WorldState).deskSeated)return {position:[1.8,5.4,-10.65] as [number,number,number],lookAt:[1.8,5.4,-11.9] as [number,number,number],fov:68,angle:0};
 const [x,z]=state.position,height=elevation(x,z,state.floor);
 if((state as WorldState).seated)return {position:[-6.9,5.25,3] as [number,number,number],lookAt:[-6.9,5.0,35] as [number,number,number],fov:mobile?74:68,angle:0};
 const inside=Math.max(0,Math.min(1,indoorAmount));
 const distance=7+(3.35-7)*inside;
 return {
  position:[x,height+5+(2.7-5)*inside,z+distance] as [number,number,number],
  lookAt:[x,height+1.28,z] as [number,number,number],
  fov:mobile?74:68,
  angle:0,
 };
}
