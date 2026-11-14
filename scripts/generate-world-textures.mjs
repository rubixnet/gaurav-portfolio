import sharp from 'sharp';
import {mkdir} from 'node:fs/promises';
await mkdir('public/textures',{recursive:true});
const size=256;
for(const kind of ['grass','wood','sand']){
 const bytes=Buffer.alloc(size*size*3);
 let seed=17;
 const rand=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const n=(rand()-.5)*18;
   const broad=Math.sin(x*Math.PI*8/size)*Math.cos(y*Math.PI*6/size)*7;
   const grain=kind==='wood'?Math.sin(x*.62+Math.sin(y*.08)*2)*11:0;
   const base=kind==='grass'?[116,135,74]:kind==='wood'?[161,124,79]:[205,184,139];
   const variation=n+broad+grain;
   for(let c=0;c<3;c++)bytes[(y*size+x)*3+c]=Math.max(0,Math.min(255,base[c]+variation));
 }
 await sharp(bytes,{raw:{width:size,height:size,channels:3}}).png().toFile(`public/textures/${kind}.png`);
 console.log(`${kind}.png created`);
}
