export type TimeMode='auto'|'day'|'sunset'|'night';
export function daySample(phase:number){
 const p=((phase%1)+1)%1;
 const sun=Math.sin(p*Math.PI*2);
 const daylight=Math.max(0,Math.min(1,(sun+.15)/.75));
 const night=1-daylight;
 const twilight=Math.max(0,1-Math.abs(sun)/.42);
 return {phase:p,sun,daylight,night,twilight};
}
