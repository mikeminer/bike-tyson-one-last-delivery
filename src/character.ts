import * as T from 'three';
import { skinMaterial, grainTexture, loadAnatomy } from './skin-material';
import { leatherGrain, treadTexture } from './surface-textures';
import { limbs } from './anatomy.mjs';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

type V = [number, number, number];
const v = (a: V) => new T.Vector3(...a);
const metal = new T.MeshStandardMaterial({ color: 0x3c4141, roughness: .28, metalness: .88 });
const chrome = new T.MeshStandardMaterial({ color: 0xb4b9b8, roughness: .24, metalness: .9 });
const rubber = new T.MeshStandardMaterial({ color: 0x141617, roughness: .91 });
const leather = new T.MeshPhysicalMaterial({ color: 0x181919, roughness: .55, clearcoat: .18 });

function mesh(parent: T.Object3D, geo: T.BufferGeometry, mat: T.Material, p: V = [0, 0, 0]) {
  const m = new T.Mesh(geo, mat); m.position.set(...p); m.castShadow = m.receiveShadow = true; parent.add(m); return m;
}
function ellipsoid(parent: T.Object3D, p: V, scale: V, mat: T.Material) {
  const tiny=Math.max(...scale)<.1;const m = mesh(parent, new T.SphereGeometry(1,tiny?8:28,tiny?6:20), mat, p); m.scale.set(...scale); return m;
}
function rod(parent: T.Object3D, a: V, b: V, radius: number, mat = metal) {
  const delta = v(b).sub(v(a)); const m = mesh(parent, new T.CylinderGeometry(radius, radius, delta.length(), 10), mat);
  m.position.copy(v(a).add(v(b)).multiplyScalar(.5)); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), delta.normalize()); return m;
}
function curvedRod(parent: T.Object3D, points: V[], radius: number, mat = metal) {
  return mesh(parent, new T.TubeGeometry(new T.CatmullRomCurve3(points.map(v)), 24, radius, 10, false), mat);
}
export function makeReferenceBike() {
  const root=new T.Group(),wheels:T.Group[]=[],bodySkin=skinMaterial(),headSkin=skinMaterial(true),skin=bodySkin.material;root.name='Sculpted muscle bicycle';
  const pores=grainTexture(7);skin.bumpMap=pores;skin.bumpScale=.0025;headSkin.material.bumpMap=pores;headSkin.material.bumpScale=.001;
  rubber.bumpMap=grainTexture(12);rubber.bumpScale=.002;leather.bumpMap=leatherGrain();leather.bumpScale=.004;leather.roughness=.64;
  metal.roughnessMap=grainTexture(3);metal.roughness=.48;
  const tireRubber=rubber.clone();tireRubber.bumpMap=treadTexture();tireRubber.bumpScale=.004;tireRubber.roughness=.86;
  const bones:T.Bone[]=Array.from({length:13},()=>new T.Bone());
  const rig=limbs.map((l,i)=>{const a=v(l.start as V),b=v(l.middle as V),c=v(l.end as V),upper=bones[1+i*3],lower=bones[2+i*3],tip=bones[3+i*3];
    upper.position.copy(a);lower.position.copy(b);tip.position.copy(c);bones[0].add(upper,lower,tip);
    return {...l,a,b,c,upper,lower,tip,length1:a.distanceTo(b),length2:b.distanceTo(c)};
  });
  for(const z of [-1.35,1.35]){
    const wheel=new T.Group();wheel.position.set(0,.88,z);root.add(wheel);
    for(const [radius,tube,mat] of [[.815,.062,tireRubber],[.754,.028,metal],[.73,.012,chrome]] as const){const tyre=mesh(wheel,new T.TorusGeometry(radius,tube,12,80),mat);tyre.rotation.y=Math.PI/2;}
    rod(wheel,[-.15,0,0],[.15,0,0],.071,metal);
    for(let n=0;n<24;n++){const angle=n/24*Math.PI*2;rod(wheel,[n%2?-.075:.075,0,0],[0,Math.sin(angle)*.738,Math.cos(angle)*.738],.006,chrome);}
    // Valve stems and a fine sidewall bead remain visible in the close-up silhouette.
    rod(wheel,[0,.70,0],[0,.748,0],.012,metal);
    for(const side of [-1,1]){const bead=mesh(wheel,new T.TorusGeometry(.802,.003,4,80),metal,[side*.055,0,0]);bead.rotation.y=Math.PI/2;}
    wheels.push(wheel);
  }
  const head=new T.Group();head.position.set(0,2.94,-1.15);root.add(head);
  // One closed sculpted head: seamless skin around the temples, skull and jaw.
  const headGeo=new T.SphereGeometry(1,64,48),positions=headGeo.attributes.position;
  for(let i=0;i<positions.count;i++){
    const nx=positions.getX(i),ny=positions.getY(i),nz=positions.getZ(i);
    const gauss=(x:number,y:number,sx:number,sy:number)=>Math.exp(-((nx-x)**2/sx+(ny-y)**2/sy));
    const front=Math.max(0,-nz);
    const nose=.17*gauss(0,-.20,.022,.065),brow=.037*(gauss(-.35,.12,.065,.015)+gauss(.35,.12,.065,.015));
    const mouth=.048*gauss(0,-.55,.15,.022),eye=-.028*(gauss(-.35,.015,.024,.014)+gauss(.35,.015,.024,.014));
    const jaw=1-.10*Math.max(0,(-ny-.25)/.75);
    positions.setXYZ(i,nx*.43*jaw,ny*.57+.018,nz*.43-(nose+brow+mouth+eye)*front);
  }
  headGeo.computeVertexNormals();mesh(head,headGeo,headSkin.material);
  for(const side of [-1,1]){
    ellipsoid(head,[side*.419,-.04,.018],[.075,.15,.085],skin);
    ellipsoid(head,[side*.447,-.045,-.016],[.027,.085,.028],new T.MeshStandardMaterial({color:0x573829,roughness:.7}));
  }
  const ready=Promise.all([new T.TextureLoader().loadAsync('/character/skin-albedo-v2.png'),new T.TextureLoader().loadAsync('/character/face.png'),loadAnatomy()]).then(([texture,face,geometry])=>{
    texture.colorSpace=face.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.anisotropy=face.anisotropy=4;
    for(const m of [bodySkin,headSkin]){m.uniforms.skinTex.value=texture;m.uniforms.faceTex.value=face;}
    const body=new T.SkinnedMesh(geometry,skin);body.name='Continuous anatomical skin';body.castShadow=body.receiveShadow=true;body.add(bones[0]);
    root.add(body);body.bind(new T.Skeleton(bones));body.frustumCulled=false;
    animate(0,0,0);
  });
  // Black swept handlebars emerge beside the head, with grips and brake levers.
  for(const side of [-1,1]){
    curvedRod(root,[[side*.38,3.2,-1.12],[side*.63,3.33,-1.1],[side*.89,3.38,-1.23],[side*1.16,3.38,-1.24]],.046);
    rod(root,[side*.93,3.38,-1.24],[side*1.3,3.38,-1.24],.073,rubber);
    curvedRod(root,[[side*.83,3.35,-1.27],[side*.84,3.24,-1.40],[side*1.23,3.2,-1.43]],.025);
    curvedRod(root,[[side*.82,3.3,-1.19],[side*.72,2.9,-1.15],[side*.23,1.05,-1.35]],.008,rubber);
  }
  rod(root,[0,2.37,.86],[0,2.73,.93],.072);
  const saddle=ellipsoid(root,[0,2.79,.84],[.31,.10,.42],leather);saddle.rotation.x=-.08;
  ellipsoid(root,[0,2.775,.48],[.105,.07,.23],leather);
  const seam=new T.MeshStandardMaterial({color:0x524b40,roughness:.85});
  for(const side of [-1,1]){
    curvedRod(root,[[side*.07,2.786,.34],[side*.105,2.81,.53],[side*.275,2.806,.84],[side*.22,2.8,1.11]],.004,seam);
    curvedRod(root,[[side*.10,2.72,.52],[side*.14,2.62,.74],[side*.16,2.71,1.04]],.018,chrome);
  }
  const crankCenter:V=[0,.78,.48],crank=new T.Group();crank.position.set(...crankCenter);root.add(crank);
  const chainring=mesh(root,new T.TorusGeometry(.245,.018,6,40),metal,[-.20,.78,.48]);chainring.rotation.y=Math.PI/2;
  for(let i=0;i<32;i++){const a=i/32*Math.PI*2;const tooth=mesh(root,new T.BoxGeometry(.025,.035,.035),chrome,[-.20,.78+Math.cos(a)*.257,.48+Math.sin(a)*.257]);tooth.rotation.x=-a;}
  for(const side of [-1,1])rod(root,[side*.15,.78,.48],[side*.15,.88,1.35],.028);
  const chainPoints:V[]=[[-.22,1.02,.48],[-.22,1.01,1.35],[-.22,.75,1.35],[-.22,.54,.48],[-.22,1.02,.48]];
  for(let s=0;s<4;s++){const a=v(chainPoints[s]),b=v(chainPoints[s+1]);for(let i=0;i<18;i++){const p=a.clone().lerp(b,i/18);ellipsoid(root,[p.x,p.y,p.z],[.022,.018,.032],chrome);}}
  const pedals=[-1,1].map(side=>({side,mesh:mesh(root,new T.BoxGeometry(.27,.07,.20),rubber),arm:rod(crank,[side*.28,0,0],[side*.28,-side*.27,0],.031,chrome)}));
  for(const side of [-1,1])for(let n=0;n<12;n++){
    const ring=mesh(root,new T.TorusGeometry(.073,.003,4,16),metal,[side*(.95+n*.029),3.38,-1.24]);ring.rotation.y=Math.PI/2;
  }
  // The delivery briefcase hangs under the torso, leaving the reference silhouette visible.
  const bag=mesh(root,new T.BoxGeometry(.22,.42,.52),leather,[.62,1.81,.2]);
  for(const z of [-.14,.14])mesh(bag,new T.BoxGeometry(.025,.065,.055),chrome,[.122,.055,z]);
  curvedRod(root,[[.47,2.29,.06],[.65,2.22,.07],[.65,2.02,.07]],.017,leather);
  // Two-bone inverse kinematics deforms the continuous skin; no detached ball joints.
  function animate(distance:number,punch:number,time:number){
    for(const wheel of wheels)wheel.rotation.x=-distance/.815;
    const angle=-distance*2.25+Math.PI/2;crank.rotation.x=angle;
    for(const limb of rig){
      const phase=angle+(limb.side===1?Math.PI:0);
      const thrust=limb.kind==='arm'&&limb.side===-1&&punch>0?Math.sin(Math.min(1,punch/.4)*Math.PI):0;
      const target=limb.kind==='leg'?new T.Vector3(limb.side*.36,.78+Math.cos(phase)*.27,.48+Math.sin(phase)*.27):limb.c.clone().add(new T.Vector3(-.14*thrust,1.05*thrust,-.75*thrust));
      const dir=target.clone().sub(limb.a),d=Math.min(dir.length(),limb.length1+limb.length2-.001);dir.normalize();
      target.copy(limb.a).addScaledVector(dir,d);
      const along=(limb.length1**2-limb.length2**2+d*d)/(2*d),height=Math.sqrt(Math.max(0,limb.length1**2-along**2));
      const preferred=limb.kind==='leg'?new T.Vector3(limb.side*.12,0,1):limb.b.clone().sub(limb.a);
      const bend=preferred.addScaledVector(dir,-preferred.dot(dir)).normalize();
      const middle=limb.a.clone().addScaledVector(dir,along).addScaledVector(bend,height);
      limb.upper.position.copy(limb.a);limb.lower.position.copy(middle);limb.tip.position.copy(target);
      limb.upper.quaternion.setFromUnitVectors(limb.b.clone().sub(limb.a).normalize(),middle.clone().sub(limb.a).normalize());
      limb.lower.quaternion.setFromUnitVectors(limb.c.clone().sub(limb.b).normalize(),target.clone().sub(middle).normalize());
      if(limb.kind==='leg')pedals.find(p=>p.side===limb.side)!.mesh.position.copy(target).add(new T.Vector3(0,-.055,0));
    }
    head.rotation.x=Math.sin(time*2.2)*.009;
  }
  // Batch fixed parts by material so individual spokes and chain links do not add draw calls.
  const moving=new Set<T.Object3D>([...pedals.map(p=>p.mesh),bag]);
  function batch(group:T.Group){
    const buckets=new Map<T.Material,T.BufferGeometry[]>();
    for(const child of [...group.children])if(child instanceof T.Mesh&&!moving.has(child)&&!Array.isArray(child.material)){
      child.updateMatrix();const geo=child.geometry.clone().applyMatrix4(child.matrix);const list=buckets.get(child.material)??[];list.push(geo);buckets.set(child.material,list);group.remove(child);child.geometry.dispose();
    }
    for(const [mat,geometries] of buckets){const merged=mergeGeometries(geometries,false);if(merged)mesh(group,merged,mat);geometries.forEach(g=>g.dispose());}
  }
  wheels.forEach(batch);batch(root);batch(head);
  return{root,wheels,ready,animate};
}
