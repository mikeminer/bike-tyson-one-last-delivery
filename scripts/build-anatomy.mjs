import * as T from 'three';
import {MarchingCubes} from 'three/addons/objects/MarchingCubes.js';
import {mergeVertices} from 'three/addons/utils/BufferGeometryUtils.js';
import {mkdir,writeFile} from 'node:fs/promises';
import {sculptParts} from '../src/anatomy.mjs';
const parts=sculptParts().map(p=>{const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),new T.Vector3(...p.axis)).invert();const m=new T.Matrix4().makeRotationFromQuaternion(q).elements;return {...p,m};});
function distance(x,y,z,p){x-=p.center[0];y-=p.center[1];z-=p.center[2];const m=p.m,px=(m[0]*x+m[4]*y+m[8]*z)/p.radii[0],py=(m[1]*x+m[5]*y+m[9]*z)/p.radii[1],pz=(m[2]*x+m[6]*y+m[10]*z)/p.radii[2];const k0=Math.sqrt(px*px+py*py+pz*pz),k1=Math.hypot(px/p.radii[0],py/p.radii[1],pz/p.radii[2]);return k1>0?k0*(k0-1)/k1:-Math.min(...p.radii);}
const size=88,min=[-1.05,.36,-1.72],span=[2.1,2.58,3.25];
const mc=new MarchingCubes(size,new T.MeshStandardMaterial(),false,false,80000);mc.isolation=0;
const blend=.075;
for(let z=0;z<size;z++)for(let y=0;y<size;y++)for(let x=0;x<size;x++){
 const px=min[0]+x/size*span[0],py=min[1]+y/size*span[1],pz=min[2]+z/size*span[2];let sdf=99;
 for(const part of parts){const d=distance(px,py,pz,part),h=Math.max(blend-Math.abs(sdf-d),0)/blend;sdf=Math.min(sdf,d)-h*h*blend*.25;}
 mc.field[x+y*size+z*size*size]=-sdf;
}
mc.update();const raw=new T.BufferGeometry(),array=mc.geometry.getAttribute('position').array.slice(0,mc.count*3);
for(let i=0;i<array.length;i+=3)for(let j=0;j<3;j++)array[i+j]=min[j]+(array[i+j]+1)*.5*span[j];
raw.setAttribute('position',new T.BufferAttribute(array,3));const geo=mergeVertices(raw,1e-5);geo.computeVertexNormals();
const positions=geo.getAttribute('position'),weights=[],joints=[],uv=[];
for(let i=0;i<positions.count;i++){
 const x=positions.getX(i),y=positions.getY(i),z=positions.getZ(i),ds=parts.map(p=>distance(x,y,z,p)),closest=Math.min(...ds),sums=new Array(13).fill(0);
 ds.forEach((d,j)=>sums[parts[j].bone]+=Math.exp(-(d-closest)*43));
 const top=sums.map((w,id)=>({w,id})).sort((a,b)=>b.w-a.w).slice(0,4),sum=top.reduce((s,p)=>s+p.w,0);
 for(const p of top){weights.push(p.w/sum);joints.push(p.id);}uv.push(z*.7,y*.7);
}
const indices=new Uint32Array(geo.index.array),header=new Uint32Array([0x42545932,positions.count,indices.length,13]);
const arrays=[header,positions.array,geo.getAttribute('normal').array,new Float32Array(uv),new Uint16Array(joints),new Float32Array(weights),indices];
const binary=Buffer.concat(arrays.map(a=>Buffer.from(a.buffer,a.byteOffset,a.byteLength)));
await mkdir('public/character',{recursive:true});await writeFile('public/character/anatomy-v2.bin',binary);
console.log(JSON.stringify({vertices:positions.count,triangles:indices.length/3,bytes:binary.length}));mc.geometry.dispose();mc.material.dispose();
