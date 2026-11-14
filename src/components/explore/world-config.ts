export type Point = [number, number];
export type PlaceId = 'arrival' | 'house' | 'music' | 'sports' | 'bedroom' | 'court' | 'contact' | 'gallery' | 'balcony';
export const PLACES: { id: PlaceId; name: string; hint: string; point: Point; icon: string }[] = [
  { id: 'arrival', name: 'The shoreline', hint: 'Your own little corner of the world.', point: [0, 26], icon: '01' },
  { id: 'house', name: 'Welcome home', hint: 'Walk through the front door. Make yourself at home.', point: [0, 5], icon: '02' },
  { id: 'music', name: 'The listening room', hint: 'A little louder. A little closer. Discover Echo Music.', point: [-6, -8], icon: '03' },
  { id: 'sports', name: 'The sports room', hint: 'Rackets, a cricket bat, and the Badminton project.', point: [4.9, -8], icon: '04' },
  { id: 'bedroom', name: 'A little about me', hint: 'Meet Gaurav, beyond the screen.', point: [0, -11], icon: '05' },
  { id: 'court', name: 'One more game?', hint: 'A badminton court by the sea.', point: [-16, 11], icon: '06' },
  { id: 'contact', name: 'Keep in touch', hint: 'Find me on GitHub and X.', point: [0, -5.5], icon: '07' },
  { id: 'gallery', name: 'The creative loft', hint: 'A working studio, a project gallery, and a little room to imagine.', point: [-1, -6], icon: '08' },
  { id: 'balcony', name: 'The ocean balcony', hint: 'Step through the doors to the garden and ocean lookout.', point: [11.2,3.7], icon: '09' },
];
export function placeFloor(id:PlaceId){return id==='gallery'||id==='balcony'?1:0;}
export function isInterior(state:Pick<WorldState,'position'|'floor'>){return insideHouse(...state.position)&&!(state.floor===1&&state.position[1]>1.85);}
export const UPPER_FURNITURE=[
 {x:-4,z:1.1,w:2,d:.65},
 {x:-5.5,z:-6.8,w:1.5,d:.8},{x:-8.35,z:-6,w:.38,d:2.5},{x:-7.3,z:-8,w:.6,d:.6},
 {x:-5.5,z:-10.5,w:3,d:.8},{x:-5.5,z:-8.8,w:1.8,d:.8},
 {x:2,z:-11.6,w:3.2,d:1.25},{x:2,z:-10.2,w:.8,d:.8},
 {x:1.5,z:-6,w:1.15,d:1.15},
 {x:-7.7,z:-12.4,w:.8,d:.8},{x:7.7,z:-12.4,w:.8,d:.8},
 {x:-5.8,z:3.9,w:1.1,d:1.1},{x:-6.9,z:3,w:.8,d:.8},{x:-4.7,z:4.6,w:.8,d:.8},
 {x:-7.8,z:2.25,w:1,d:1},{x:7.8,z:5,w:1,d:1},
  {x:12.2,z:5,w:.8,d:.8},
];

export const ROCKS = Array.from({length:32},(_,i)=>{
  const angle=i*2.4,radius=27.5+(i%3)*.6;
  return {x:Math.cos(angle)*radius,z:Math.sin(angle)*radius,sx:1.2+(i%3)*.5,sy:.7+(i%4)*.3,sz:.9+(i%3)*.4,index:i};
}).filter(rock=>!(Math.abs(rock.x)<5&&rock.z>22));
export const STAIR={x:7,width:2.1,top:-7,bottom:0,height:3.8};
export function onStairs(x:number,z:number){return Math.abs(x-STAIR.x)<STAIR.width/2&&z<=STAIR.bottom&&z>=STAIR.top;}
export function elevation(x:number,z:number,floor:number){return onStairs(x,z)?Math.max(0,Math.min(1,-z/7))*STAIR.height:floor===1?STAIR.height:0;}

export type Obstacle = { x: number; z: number; w: number; d: number };
// The same dimensions are used by navigation and the house meshes.
export const WALLS: Obstacle[] = [
  { x: -9, z: -6, w: 0.3, d: 16 }, { x: 9, z: -6, w: 0.3, d: 16 },
  { x: 0, z: -14, w: 18, d: 0.3 },
  { x: -5.15, z: 2, w: 7.7, d: 0.3 }, { x: 5.15, z: 2, w: 7.7, d: 0.3 },
  ...[-3, 3].flatMap(x => [{ x, z: -0.35, w: 0.18, d: 4.7 }, { x, z: -10.35, w: 0.18, d: 7.3 }]),
  { x: -2.05, z: -8.5, w: 1.9, d: 0.18 }, { x: 2.05, z: -8.5, w: 1.9, d: 0.18 },
];
export const FURNITURE: Obstacle[] = [
  {x:-6,z:-11.5,w:4.65,d:1.4}, {x:6,z:-11.5,w:3.8,d:1.1},
  {x:-8.16,z:-6.1,w:.55,d:2.2},{x:-4.05,z:-12.9,w:.65,d:.65},
  {x:3.7,z:22,w:2.25,d:.35},{x:-4.2,z:11,w:2.25,d:.35},{x:10.7,z:6,w:2.25,d:.35},
  {x:-9.6,z:18,w:2.9,d:1.3},
  {x:1.9,z:-12.5,w:.8,d:.7}, {x:-1.8,z:-10.6,w:1.45,d:2.7},
  {x:-6,z:-9.8,w:.8,d:.8}, {x:3.9,z:-7.5,w:1.1,d:3},
  {x:1.92,z:-9.65,w:1.05,d:.7}, {x:-2.55,z:-8.98,w:.7,d:.5},
  {x:.25,z:-2,w:1.3,d:.8}, {x:4.02,z:-12.7,w:1,d:.7},
  {x:-1.75,z:-1.6,w:1,d:2.8}, {x:2.45,z:-7,w:.6,d:2.5},
  {x:-16,z:8,w:7,d:.12},
  {x:5.82,z:-3.5,w:.1,d:6.3}, {x:8.18,z:-3.5,w:.1,d:6.3},
  {x:-1.2,z:1.4,w:.4,d:1.5},{x:1.2,z:1.4,w:.4,d:1.5},
  {x:20,z:-17,w:3.9,d:3.9},
  {x:12.5,z:5.4,w:.24,d:.24},
  ...[-8.7,-4.5,4.5,8.7].map(x=>({x,z:5.4,w:.5,d:.5})),
  ...[[-22,-8],[-15,-17],[15,-15],[21,-5],[22,16],[-23,15],[19,21],[-19,21],[15.5,9.5],[-11,-9],[14,-21],[23,7]].map(([x,z])=>({x,z,w:1.3,d:1.3})),
];
export function insideHouse(x: number, z: number) { return Math.abs(x) < 9.3 && z < 2.6 && z > -14.5; }
export function walkable(x: number, z: number, padding = 0.33) {
  const island = (x / 27.8) ** 2 + (z / 27.8) ** 2 < 1;
  const dock = Math.abs(x) < 1.65 && z >= 24 && z <= 38;
  if (!island && !dock) return false;
  if(ROCKS.some(r=>Math.hypot(x-r.x,z-r.z)<Math.max(r.sx,r.sz)+padding))return false;
  return ![...WALLS, ...FURNITURE].some(o => Math.abs(x-o.x) < o.w/2+padding && Math.abs(z-o.z) < o.d/2+padding);
}

// Grid search keeps click-to-walk routes inside doors and away from furniture.
export function upperWalkable(x:number,z:number,padding=.33){
 if(x< -8.5+padding||z< -13.5+padding||z>5.35-padding)return false;
 if(x>8.5-padding&&(x>12.5-padding||z<2.3))return false;
 if(z> -6.7&&z< -.35&&(Math.abs(x-5.82)<padding+.05||Math.abs(x-8.18)<padding+.05))return false;
 if(Math.abs(z-1.9)<.12+padding&&Math.abs(x)>1.4-padding)return false;
 if(UPPER_FURNITURE.some(o=>Math.abs(x-o.x)<o.w/2+padding&&Math.abs(z-o.z)<o.d/2+padding))return false;
 return true;
}
export function canStep(from:Point,to:Point,floor:number){
 if(!onStairs(...from)&&onStairs(...to)){
  if(floor===0&&from[1]<-7)return false;
  if(floor===1&&from[1]>0)return false;
 }
 return (floor===1?upperWalkable:walkable)(...to);
}
export function findPath(from: Point, destination: Point, floor=0): Point[] {
  const clear=(x:number,z:number,padding=.3)=>(floor===1?upperWalkable(x,z,padding):walkable(x,z,padding))&&!onStairs(x,z);
  const step = 0.65, min = -30, width = 108;
  const cell = (p: Point): Point => [Math.round((p[0]-min)/step), Math.round((p[1]-min)/step)];
  const world = (x: number, z: number): Point => [min+x*step, min+z*step];
  const key = (x: number, z: number) => z*width+x;
  const start = cell(from), end = cell(destination);
  if (!clear(...destination)) return [];
  const queue: Point[] = [start], parent = new Map<number, number>();
  parent.set(key(...start), -1);
  let reached = -1;
  for(let head=0; head<queue.length && head<12000; head++) {
    const [x,z] = queue[head];
    if(x===end[0] && z===end[1]) { reached=key(x,z); break; }
    for(const [dx,dz] of [[0,-1],[1,0],[0,1],[-1,0]]) {
      const nx=x+dx, nz=z+dz, id=key(nx,nz);
      if(nx<0||nz<0||nx>=width||nz>=width||parent.has(id)||!clear(...world(nx,nz),0.36)) continue;
      parent.set(id,key(x,z)); queue.push([nx,nz]);
    }
  }
  if(reached<0) return [];
  const path: Point[]=[];
  while(reached!==key(...start)) {
    path.push(world(reached%width,Math.floor(reached/width)));
    reached=parent.get(reached)!;
  }
  path.reverse(); path.push(destination);
  return path;
}

export type WorldState = {
  cameraCut?:number; timeMode?:'auto'|'day'|'sunset'|'night'; dayPhase?:number; nightAmount?:number;
  seated?: boolean; deskSeated?: boolean;
  position: Point; path: Point[]; keys: Set<string>; joystick: Point;
  started: boolean; paused: boolean; reducedMotion: boolean;
  floor: number;
  mainDoorOpen:number;
  balconyDoorOpen:number;
};

export function doorAllowsStep(from:Point,to:Point,floor:number,main:number,balcony:number){
 const threshold=floor===1?1.9:2;
 if((from[1]-threshold)*(to[1]-threshold)<=0&&Math.abs(to[0])<1.4){return floor===1?balcony>.82:main>.94;}
 return true;
}

export function routeTo(state:Pick<WorldState,'position'|'floor'>,destination:Point,floor=0):Point[]{
 const bottom:Point=[7,.7],top:Point=[7,-7.7];
 if(onStairs(...state.position)){const edge=floor===1?top:bottom;return [edge,...findPath(edge,destination,floor)];}
 if(state.floor===floor)return findPath(state.position,destination,floor);
 const ascending:Point[]=Array.from({length:17},(_,i)=>[7,.7-i*.525]);
 if(floor===1)return [...findPath(state.position,bottom),...ascending,...findPath(top,destination,1)];
 return [...findPath(state.position,top,1),...ascending.slice().reverse(),...findPath(bottom,destination)];
}
