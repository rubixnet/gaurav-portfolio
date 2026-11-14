import * as T from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export function createCharacter(){
 const root=new T.Group();root.name='Gaurav_Character_V3';
 const material=color=>new T.MeshStandardMaterial({color,roughness:.82});
 const skin=material('#c68e6b'),navy=material('#365762'),seam=material('#43636a'),cream=material('#e7dfcc'),chino=material('#4a514b'),hair=material('#302a23'),iris=material('#382d23'),white=material('#eee8d9');
 const add=(parent,name,geometry,mat,position=[0,0,0],scale=[1,1,1])=>{const mesh=new T.Mesh(geometry,mat);mesh.name=name;mesh.position.set(...position);mesh.scale.set(...scale);parent.add(mesh);return mesh;};
 const oval=(p,n,m,pos,scale)=>add(p,n,new T.SphereGeometry(1,22,16),m,pos,scale);
 const capsule=(r,l)=>new T.CapsuleGeometry(r,l,7,16);
 // Continuous tapered cloth silhouette, from the waist through the shoulders.
 const rings=[[.94,.165,.105],[1.01,.185,.118],[1.2,.205,.135],[1.39,.235,.14],[1.47,.245,.13],[1.53,.185,.105],[1.565,.075,.067]];
 const vertices=[],indices=[],segments=32;
 rings.forEach(([y,rx,rz])=>{for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2;vertices.push(Math.cos(a)*rx,y,Math.sin(a)*rz);}});
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,a+1,b,b+1);}
 const torso=new T.BufferGeometry();torso.setAttribute('position',new T.Float32BufferAttribute(vertices,3));torso.setIndex(indices);torso.computeVertexNormals();
 add(root,'Overshirt',torso,navy);
 const front=[],frontIndices=[];
 [[1.005,.055,.119],[1.2,.072,.136],[1.39,.075,.141],[1.51,.06,.101]].forEach(([y,w,z],i)=>{front.push(-w,y,-z-.003,w,y,-z-.003);if(i<3){const a=i*2;frontIndices.push(a,a+2,a+1,a+1,a+2,a+3);}});
 const panel=new T.BufferGeometry();panel.setAttribute('position',new T.Float32BufferAttribute(front,3));panel.setIndex(frontIndices);panel.computeVertexNormals();const tee=cream.clone();tee.side=T.DoubleSide;add(root,'InnerKnitShirt',panel,tee);
 add(root,'Waist',new T.CylinderGeometry(.166,.165,.08,24),chino,[0,.945,0],[1,1,.72]);
 add(root,'Neck',new T.CylinderGeometry(.061,.069,.15,20),skin,[0,1.61,0]);
 const head=new T.SphereGeometry(1,32,24),p=head.attributes.position;
 for(let i=0;i<p.count;i++){const y=p.getY(i),taper=1-Math.max(0,-y)*.15;p.setXYZ(i,p.getX(i)*.137*taper,y*.165,p.getZ(i)*.13*(1-Math.max(0,-y)*.08));}head.computeVertexNormals();
 add(root,'Face',head,skin,[0,1.79,0]);
 for(const side of [-1,1]){
  oval(root,`Ear_${side}`,skin,[side*.137,1.79,.006],[.022,.036,.021]);
  oval(root,`EyeWhite_${side}`,white,[side*.05,1.812,-.12],[.022,.009,.006]);
  oval(root,`Iris_${side}`,iris,[side*.05,1.812,-.125],[.008,.008,.003]);
  oval(root,`EyeGlint_${side}`,white,[side*.047,1.815,-.128],[.0026,.0026,.0015]);
  const brow=add(root,`Eyebrow_${side}`,capsule(.004,.04),hair,[side*.05,1.838,-.118]);brow.rotation.z=Math.PI/2+side*.07;
  const collar=add(root,`FoldedCollar_${side}`,new T.BoxGeometry(.057,.085,.018),seam,[side*.067,1.51,-.101]);collar.rotation.z=side*.32;
  add(root,`ChestPocket_${side}`,new T.BoxGeometry(.064,.065,.008),seam,[side*.13,1.365,-.116]);
 }
 oval(root,'Nose',skin,[0,1.785,-.139],[.018,.027,.023]);
 const smile=new T.QuadraticBezierCurve3(new T.Vector3(-.03,1.721,-.112),new T.Vector3(0,1.711,-.129),new T.Vector3(.03,1.722,-.112));
 add(root,'Smile',new T.TubeGeometry(smile,14,.0028,6,false),material('#91604e'));
 // One joined hair mesh, with a low swept fringe and soft side taper.
 const hairParts=[];
 const cap=new T.SphereGeometry(.145,28,18,0,Math.PI*2,0,Math.PI*.5);cap.scale(1,1.02,.96);cap.translate(0,1.843,.006);hairParts.push(cap.toNonIndexed());
 for(const [x,y,z,sx,sy,sz,tilt] of [[-.018,1.96,-.013,.125,.043,.093,-.08],[-.025,1.918,-.096,.108,.035,.045,.09],[0,1.84,.077,.127,.104,.073,0],[-.126,1.839,.015,.024,.06,.072,0],[.126,1.839,.015,.024,.06,.072,0]]){
  const g=new T.SphereGeometry(1,20,14);g.scale(sx,sy,sz);g.rotateZ(tilt);g.translate(x,y,z);hairParts.push(g.toNonIndexed());
 }
 add(root,'SweptQuiff',mergeGeometries(hairParts),hair);
 for(let i=0;i<3;i++){const curve=new T.QuadraticBezierCurve3(new T.Vector3(-.08+i*.037,1.93,-.096),new T.Vector3(-.035+i*.04,1.993,-.027),new T.Vector3(.045+i*.026,1.951,.052));add(root,`HairStrand_${i}`,new T.TubeGeometry(curve,12,.0018,4,false),material('#49392b'));}
 function sneakerGeometry(width,length,height){
  const r=.045,w=width/2,l=length/2,s=new T.Shape();
  s.moveTo(-w+r,-l);s.lineTo(w-r,-l);s.quadraticCurveTo(w,-l,w,-l+r);s.lineTo(w,l-r);s.quadraticCurveTo(w,l,w-r,l);s.lineTo(-w+r,l);s.quadraticCurveTo(-w,l,-w,l-r);s.lineTo(-w,-l+r);s.quadraticCurveTo(-w,-l,-w+r,-l);
  const g=new T.ExtrudeGeometry(s,{depth:height,bevelEnabled:true,bevelThickness:.008,bevelSize:.008,bevelSegments:3,steps:1,curveSegments:8});g.rotateX(-Math.PI/2);return g;
 }
 for(const side of [-1,1]){
  const leg=new T.Group();leg.name=side<0?'LegL':'LegR';leg.position.set(side*.101,.94,0);root.add(leg);
  add(leg,'UpperChino',capsule(.083,.23),chino,[0,-.175,0],[1,1,.96]);
  const knee=new T.Group();knee.name=side<0?'KneeL':'KneeR';knee.position.y=-.365;leg.add(knee);
  add(knee,'LowerChino',new T.CylinderGeometry(.077,.06,.43,18),chino,[0,-.21,0],[1,1,.96]);
  add(knee,'TrouserHem',new T.CylinderGeometry(.062,.062,.035,18),chino,[0,-.425,0]);
  add(knee,'SneakerSole',sneakerGeometry(.15,.29,.035),material('#c9bfa9'),[0,-.55,-.035]);
  add(knee,'SneakerUpper',sneakerGeometry(.14,.265,.075),white,[0,-.515,-.033]);
  for(let i=0;i<3;i++)add(knee,`Lace_${i}`,new T.BoxGeometry(.078,.006,.008),cream,[0,-.435,-.025-i*.035]);
  const arm=new T.Group();arm.name=side<0?'ArmL':'ArmR';arm.position.set(side*.248,1.49,0);root.add(arm);
  add(arm,'TailoredSleeve',capsule(.069,.18),navy,[side*.008,-.11,0]);
  add(arm,'RolledCuff',new T.CylinderGeometry(.073,.073,.05,18),seam,[side*.009,-.25,0]);
  const elbow=new T.Group();elbow.name=side<0?'ElbowL':'ElbowR';elbow.position.set(side*.009,-.27,0);arm.add(elbow);
  add(elbow,'Forearm',capsule(.047,.18),skin,[0,-.11,0]);
  oval(elbow,'Hand',skin,[0,-.285,-.009],[.044,.058,.033]);
  const thumb=add(elbow,'Thumb',capsule(.015,.028),skin,[-side*.039,-.275,-.014]);thumb.rotation.z=-side*.32;
  for(let i=0;i<4;i++)add(elbow,`Finger_${i}`,capsule(.0105,.029),skin,[-.028+i*.018,-.337,-.012+(i%2)*.005]);
  if(side<0){add(elbow,'WatchStrap',new T.CylinderGeometry(.052,.052,.029,18),chino,[0,-.226,0]);add(elbow,'WatchFace',new T.BoxGeometry(.04,.038,.014),material('#c0bba9'),[0,-.226,-.047]);}
 }
 return root;
}
