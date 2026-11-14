import * as T from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { createCharacter } from './character-model.mjs';

// Original models. No Bruno Simon code, meshes, textures, or sounds are copied.
globalThis.FileReader=class{readAsArrayBuffer(b){b.arrayBuffer().then(v=>{this.result=v;this.onloadend?.();});}readAsDataURL(b){b.arrayBuffer().then(v=>{this.result=`data:${b.type};base64,${Buffer.from(v).toString('base64')}`;this.onloadend?.();});}};
let seed=2851;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646;};
const material=(color,metalness=0)=>new T.MeshStandardMaterial({color,roughness:metalness?.4:.78,metalness});
function add(root,name,geometry,mat,p=[0,0,0],scale=[1,1,1]){const m=new T.Mesh(geometry,mat);m.name=name;m.position.set(...p);m.scale.set(...scale);root.add(m);return m;}
function box(root,name,size,mat,p){return add(root,name,new T.BoxGeometry(...size),mat,p);}
function rounded(width,depth,height,r=.08){const s=new T.Shape(),x=-width/2,y=-depth/2;s.moveTo(x+r,y);s.lineTo(-x-r,y);s.quadraticCurveTo(-x,y,-x,y+r);s.lineTo(-x,-y-r);s.quadraticCurveTo(-x,-y,-x-r,-y);s.lineTo(x+r,-y);s.quadraticCurveTo(x,-y,x,-y-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);const g=new T.ExtrudeGeometry(s,{depth:height,bevelEnabled:true,bevelSize:.018,bevelThickness:.018,bevelSegments:2,curveSegments:6});g.rotateX(-Math.PI/2);return g;}
function floweringTree(autumn=false){
 const root=new T.Group();root.name=autumn?'CopperTree':'FloweringTree';const branches=[],leaves=[[],[],[]],bark=material('#73524f');
 const branch=(a,b,r)=>{const curve=new T.QuadraticBezierCurve3(new T.Vector3(...a),new T.Vector3((a[0]+b[0])*.35,b[1]*.75,(a[2]+b[2])*.35),new T.Vector3(...b));return new T.TubeGeometry(curve,7,r,6,false).toNonIndexed();};
 branches.push(branch([0,0,0],[.2,4.5,0],.23));
 for(let i=0;i<13;i++){
  const angle=i*2.4,r=1.1+(i%3)*.5,y=3.1+random()*1.8,end=[Math.cos(angle)*r,y,Math.sin(angle)*r];branches.push(branch([.1,2.2+(i%4)*.28,0],end,.07));
  for(let j=0;j<130;j++){
   const a=random()*Math.PI*2,z=random()*2-1,radius=Math.sqrt(1-z*z),spread=Math.cbrt(random());
   const g=new T.PlaneGeometry(.18+random()*.17,.11+random()*.13).toNonIndexed();g.rotateX(random()*Math.PI);g.rotateY(random()*Math.PI);g.rotateZ(random()*Math.PI);g.translate(end[0]+Math.cos(a)*radius*spread*1.35,end[1]+z*spread*.72,end[2]+Math.sin(a)*radius*spread*1.2);leaves[j%3].push(g);
  }
 }
 add(root,'BranchNetwork',mergeGeometries(branches),bark);
 const crown=new T.Group();crown.name='Crown';root.add(crown);
 const colors=autumn?['#d68252','#e9b36e','#ae644e']:['#d68b9d','#efa8aa','#b96886'];
 leaves.forEach((parts,i)=>{const m=material(colors[i]);m.side=T.DoubleSide;add(crown,`Leaves_${i}`,mergeGeometries(parts),m);});
 return root;
}
function studio(){
 const root=new T.Group();root.name='EchoStudio';
 const oak=material('#be926c'),dark=material('#283b45'),cream=material('#e9d7b9'),coral=material('#cf856f'),brass=material('#c2a66b',.55),felt=material('#38565b');
 add(root,'RoundedDesk',rounded(4.6,1.35,.12),oak,[0,.86,0]);
 for(const x of [-1.9,1.9]){box(root,'DeskFrame',[.08,.85,1.05],dark,[x,.425,0]);box(root,'DeskFeet',[.65,.06,1.2],dark,[x,.04,0]);}
 box(root,'DrawerCabinet',[.65,.64,1.05],coral,[1.38,.46,0]);for(const y of [.25,.48,.68])box(root,'DrawerPull',[.34,.025,.04],brass,[1.38,y,.54]);
 box(root,'UltrawideMonitor',[2.15,1.04,.13],dark,[-.18,1.62,-.18]);
 box(root,'ScreenSurface',[2.02,.9,.015],material('#275e67'),[-.18,1.62,-.106]);
 box(root,'MonitorStand',[.1,.24,.1],dark,[-.18,1.02,-.18]);add(root,'MonitorBase',rounded(.6,.35,.025),dark,[-.18,.94,-.1]);
 add(root,'Keyboard',rounded(1.13,.35,.035,.035),dark,[-.28,.96,.3]);
 for(let row=0;row<4;row++)for(let col=0;col<13;col++)box(root,'Key',[.058,.012,.048],col%5===0?coral:cream,[-.77+col*.079,.998,.18+row*.072]);
 add(root,'MousePad',rounded(.45,.45,.012,.035),felt,[.7,.95,.3]);add(root,'Mouse',new T.SphereGeometry(1,12,8),cream,[.7,1,.3],[.065,.045,.1]);
 for(const x of [-1.65,1.25]){box(root,'StudioSpeaker',[.42,.66,.37],dark,[x,1.27,-.18]);for(const [y,r] of [[1.18,.13],[1.45,.06]]){const m=add(root,'SpeakerCone',new T.CylinderGeometry(r,r,.025,20),cream,[x,y,.016]);m.rotation.x=Math.PI/2;}}
 const headphones=new T.Group();headphones.name='Headphones';headphones.position.set(1.93,1.25,.15);root.add(headphones);add(headphones,'Headband',new T.TorusGeometry(.19,.025,8,24,Math.PI),brass);for(const side of [-1,1])add(headphones,'EarCup',new T.SphereGeometry(1,12,8),dark,[side*.19,-.04,0],[.06,.11,.08]);box(root,'HeadphoneStand',[.035,.32,.035],brass,[1.93,1.08,.15]);
 const chair=new T.Group();chair.name='Chair';chair.position.set(0,0,1.8);root.add(chair);
 add(chair,'UpholsteredSeat',rounded(.8,.8,.12,.12),coral,[0,.48,0]);box(chair,'Backrest',[.8,.68,.12],felt,[0,.88,-.3]);box(chair,'ChairStem',[.08,.45,.08],dark,[0,.24,0]);for(let i=0;i<5;i++){const foot=box(chair,'ChairFoot',[.58,.035,.06],dark,[Math.cos(i*1.257)*.15,.06,Math.sin(i*1.257)*.15]);foot.rotation.y=-i*1.257;}
 // Warm desk lamp: the bulb remains separate for emissive rendering.
 box(root,'LampStem',[.028,.68,.028],brass,[-2,1.27,0]);add(root,'LampShade',new T.ConeGeometry(.2,.23,20),cream,[-2,1.64,0]);add(root,'LampBulb',new T.SphereGeometry(.07,10,8),new T.MeshStandardMaterial({color:'#ffe7bb',emissive:'#ffce83',emissiveIntensity:2}),[-2,1.52,0]);
 return root;
}
function exterior(){
 const root=new T.Group();root.name='CoastalHouseExterior';const timber=material('#926c58'),ivory=material('#e3c4a0'),ink=material('#3e5660');
 box(root,'PorchSupportBeam',[18.2,.24,.3],timber,[0,3.49,5.4]);
 for(const x of [-8.7,-4.5,4.5,8.7]){box(root,'PorchColumn',[.23,3.6,.23],timber,[x,1.8,5.4]);box(root,'ColumnFooting',[.5,.2,.5],ivory,[x,.1,5.4]);box(root,'ColumnCapital',[.38,.16,.38],ivory,[x,3.32,5.4]);}
 for(const x of [-8.93,8.93])box(root,'CornerTrim',[.14,7.25,.16],ivory,[x,3.625,2.1]);
 box(root,'FloorFascia',[18.4,.2,.18],timber,[0,3.7,2.16]);
 for(const y of [.55,.95,1.35,1.75,2.15,2.55,2.95])for(const side of [-1,1])box(root,'CladdingLine',[7.45,.018,.025],ivory,[side*5.2,y,2.165]);
 for(let i=0;i<37;i++){const x=-8.7+i*.483;if(Math.abs(x)>1.6)box(root,'UpperBoardBatten',[.025,3.1,.027],ivory,[x,5.55,2.01]);}
 add(root,'AtticVent',new T.CircleGeometry(.4,32),ink,[0,8.22,2.08]);add(root,'VentSurround',new T.TorusGeometry(.44,.045,8,32),ivory,[0,8.22,2.09]);
 for(let i=-3;i<=3;i++)box(root,'VentLouver',[Math.sqrt(.16-(i*.1)**2)*2,.035,.025],ivory,[0,8.22+i*.1,2.1]);
 // Bake static details by material to keep the facade to three draw calls.
 root.updateMatrixWorld(true);const parts=new Map();root.traverse(o=>{if(o.isMesh){const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);if(!parts.has(o.material))parts.set(o.material,[]);parts.get(o.material).push(g);}});
 const merged=new T.Group();merged.name=root.name;for(const [m,geos] of parts)add(merged,`Facade_${m.color.getHexString()}`,mergeGeometries(geos),m);return merged;
}
const character=createCharacter();character.name='Gaurav_SunsetCharacter';
character.traverse(o=>{if(o.isMesh&&o.name==='Overshirt')o.material.color.set('#d49373');});
const backpack=material('#47636b');add(character,'CanvasBackpack',rounded(.27,.12,.34,.04),backpack,[0,1.17,.15]);
await mkdir('public/models',{recursive:true});
for(const [name,model] of [['flowering-tree',floweringTree()],['copper-tree',floweringTree(true)],['echo-studio',studio()],['gaurav-sunset',character],['house-exterior',exterior()]]){
 const buffer=await new GLTFExporter().parseAsync(model,{binary:true});await writeFile(`public/models/${name}.glb`,Buffer.from(buffer));console.log(`${name}: ${Math.round(buffer.byteLength/1024)} KB`);
}
