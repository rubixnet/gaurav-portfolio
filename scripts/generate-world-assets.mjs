import { createCharacter } from './character-model.mjs';
import * as T from 'three';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { mkdir, writeFile } from 'node:fs/promises';

// Original web-sized models; no external asset licenses or runtime downloads.
globalThis.FileReader = class {
  readAsArrayBuffer(blob) { blob.arrayBuffer().then(v=>{this.result=v;this.onloadend?.();}); }
  readAsDataURL(blob) { blob.arrayBuffer().then(v=>{this.result=`data:${blob.type};base64,${Buffer.from(v).toString('base64')}`;this.onloadend?.();}); }
};
let seed=37;
const rand=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646;};
const mat=(color,roughness=0.88)=>new T.MeshStandardMaterial({color,roughness});
const wood=mat('#72513a'), skin=mat('#ba8763'), shirt=mat('#ece3cb'), pants=mat('#394544'), hair=mat('#292824');
function mesh(root,name,geo,material,p=[0,0,0],s=[1,1,1]) {const m=new T.Mesh(geo,material);m.name=name;m.position.set(...p);m.scale.set(...s);root.add(m);return m;}
function branch(a,b,r1,r2){const av=new T.Vector3(...a),bv=new T.Vector3(...b);const d=bv.clone().sub(av);const g=new T.CylinderGeometry(r2,r1,d.length(),9);g.applyQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),d.normalize()));g.translate(...av.add(bv).multiplyScalar(.5).toArray());return g;}
function tree(palm=false){const root=new T.Group();root.name=palm?'CoastalPalm':'CoastalOak';const trunk=[];const leaves=[];
  if(!palm){trunk.push(branch([0,0,0],[.25,4.4,0],.38,.16));for(let i=0;i<10;i++){const a=i*2.4,r=1.2+rand()*1.7,y=3.2+rand()*2.2;const end=[Math.cos(a)*r,y,Math.sin(a)*r];trunk.push(branch([.1,2.4+i*.14,0],end,.13,.025));for(let j=0;j<7;j++){const g=new T.IcosahedronGeometry(.7+rand()*.4,1);g.scale(1.25,.66,1);g.translate(end[0]+(rand()-.5)*1.7,end[1]+(rand()-.2)*.8,end[2]+(rand()-.5)*1.7);leaves.push(g);}}}
  else {for(let i=0;i<8;i++)trunk.push(branch([i*i*.006,i*.72,0],[(i+1)**2*.006,(i+1)*.72,0],.23-i*.012,.22-i*.012));
    for(let i=0;i<11;i++){
      const a=i*Math.PI*2/11,vertices=[],indices=[],length=2.8+(i%3)*.35;
      for(let j=0;j<=22;j++){
        const t=j/22,r=t*length;
        const width=Math.sin(t*Math.PI)*(.35+(j%2)*.15);
        const y=5.8+Math.sin(t*Math.PI)*.55-t*t*(1.35+(i%2)*.4);
        for(const side of [-1,1])vertices.push(.38+Math.sin(a)*r+Math.cos(a)*width*side,y-Math.abs(width)*.12,Math.cos(a)*r-Math.sin(a)*width*side);
        if(j<22){const k=j*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}
      }
      const leaf=new T.BufferGeometry();leaf.setAttribute('position',new T.Float32BufferAttribute(vertices,3));leaf.setIndex(indices);leaf.computeVertexNormals();leaves.push(leaf.toNonIndexed());
    }}
  mesh(root,'Trunk',mergeGeometries(trunk),wood);
  const crown=new T.Group();crown.name='Crown';root.add(crown);
  const foliageMaterial=mat(palm?'#60834b':'#647b40');foliageMaterial.side=T.DoubleSide;
  mesh(crown,'Foliage',mergeGeometries(leaves),foliageMaterial);
  return root;
}
function avatar(){ return createCharacter(); }
await mkdir('public/models',{recursive:true});
const models=process.argv.includes('--avatar-only')?[['gaurav-v3',avatar()]]:[['coastal-oak',tree()],['coastal-palm',tree(true)],['gaurav-v3',avatar()]];
for(const [name,model] of models) {
 const output=await new GLTFExporter().parseAsync(model,{binary:true});
 await writeFile(`public/models/${name}.glb`,Buffer.from(output));console.log(`${name}.glb: ${Math.round(output.byteLength/1024)} KB`);
}
