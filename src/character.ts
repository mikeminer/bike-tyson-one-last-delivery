import * as T from 'three';
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
// Continuous, tapered muscle surfaces, with elliptical cross sections rather than rigid cylinders.
function muscle(parent: T.Object3D, a: V, b: V, width: number, depth: number, mat: T.Material) {
  const profile = [[0,.38],[.10,.67],[.27,.96],[.46,1],[.67,.84],[.87,.57],[1,.35]];
  const length = v(a).distanceTo(v(b));
  const geo = new T.LatheGeometry(profile.map(([y,r])=>new T.Vector2(r*width,y*length)),24);
  const m = mesh(parent,geo,mat); m.userData.restLength=length;m.scale.z=depth/width;m.position.copy(v(a));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v(b).sub(v(a)).normalize());return m;
}
function skinMaterial() {
  const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d')!;
  const pixels=ctx.createImageData(128,128);let seed=43;
  for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const t=116+(seed%62);pixels.data.set([t,t,t,255],i);}ctx.putImageData(pixels,0,0);
  const bump=new T.CanvasTexture(c);bump.wrapS=bump.wrapT=T.RepeatWrapping;bump.repeat.set(5,5);
  return new T.MeshPhysicalMaterial({color:0x72462f,roughness:.66,metalness:0,bumpMap:bump,bumpScale:.016,clearcoat:.04,clearcoatRoughness:.7});
}
export function makeReferenceBike() {
  const root=new T.Group(),wheels:T.Group[]=[],skin=skinMaterial();root.name='Reference-inspired muscle bicycle';
  for(const z of [-1.35,1.35]){
    const wheel=new T.Group();wheel.position.set(0,.88,z);root.add(wheel);
    for(const [radius,tube,mat] of [[.815,.062,rubber],[.754,.028,metal],[.73,.012,chrome]] as const){const tyre=mesh(wheel,new T.TorusGeometry(radius,tube,10,56),mat);tyre.rotation.y=Math.PI/2;}
    rod(wheel,[-.15,0,0],[.15,0,0],.071,metal);
    for(let n=0;n<24;n++){const angle=n/24*Math.PI*2;rod(wheel,[n%2?-.075:.075,0,0],[0,Math.sin(angle)*.738,Math.cos(angle)*.738],.006,chrome);}
    wheels.push(wheel);
  }
  // A human torso is the frame. The only tubes here are drivetrain supports.
  const torsoGeo=new T.LatheGeometry([
    new T.Vector2(.20,0),new T.Vector2(.44,.10),new T.Vector2(.57,.35),new T.Vector2(.51,.60),
    new T.Vector2(.42,.92),new T.Vector2(.39,1.18),new T.Vector2(.47,1.52),new T.Vector2(.39,1.78),new T.Vector2(.12,1.93)
  ],36);
  const torso=mesh(root,torsoGeo,skin,[0,2.19,-.91]);torso.rotation.x=Math.PI/2;torso.scale.z=.76;
  for(const side of [-1,1]){
    ellipsoid(root,[side*.46,2.16,-.76],[.30,.35,.37],skin);
    const pec=ellipsoid(root,[side*.245,1.98,-.54],[.3,.19,.47],skin);pec.rotation.z=side*.12;
    ellipsoid(root,[side*.31,2.1,.79],[.31,.34,.36],skin);
  }
  muscle(root,[0,2.18,-.78],[0,2.69,-1.12],.34,.32,skin);
  const head=new T.Group();head.position.set(0,2.94,-1.15);root.add(head);
  ellipsoid(head,[0,.04,.015],[.455,.57,.43],skin);
  for(const side of [-1,1]){
    ellipsoid(head,[side*.44,-.03,-.015],[.095,.17,.10],skin);
    ellipsoid(head,[side*.463,-.035,-.061],[.043,.098,.029],new T.MeshStandardMaterial({color:0x633b2d,roughness:.65}));
  }
  const faceMaterial=skin.clone();faceMaterial.color.setHex(0xffffff);faceMaterial.bumpMap=null;
  // A curved UV-projected facial surface: nose, brow, cheeks and jaw have actual depth.
  const positions:number[]=[],uvs:number[]=[],indices:number[]=[];const cols=48,rows=48;
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
    const lat=(j/rows-.5)*Math.PI,phi=(i/cols-.5)*Math.PI;
    const nx=Math.sin(phi)*Math.cos(lat),ny=Math.sin(lat),nz=Math.cos(phi)*Math.cos(lat);
    const gauss=(x:number,y:number,sx:number,sy:number)=>Math.exp(-((nx-x)**2/sx+(ny-y)**2/sy));
    const nose=.14*gauss(0,-.20,.028,.07),brow=.035*(gauss(-.36,.13,.065,.01)+gauss(.36,.13,.065,.01));
    const muzzle=.048*gauss(0,-.54,.15,.022),eyes=-.026*(gauss(-.35,.01,.027,.015)+gauss(.35,.01,.027,.015));
    positions.push(nx*.447,ny*.57+.018,-nz*.441-nose-brow-muzzle-eyes-.014);
    uvs.push(.5-nx*.335,.5+ny*.487);
    if(j<rows&&i<cols){const a=j*(cols+1)+i,b=a+cols+1;indices.push(a,b,a+1,a+1,b,b+1);}
  }
  const faceGeo=new T.BufferGeometry();faceGeo.setAttribute('position',new T.Float32BufferAttribute(positions,3));faceGeo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));faceGeo.setIndex(indices);faceGeo.computeVertexNormals();mesh(head,faceGeo,faceMaterial);
  const ready=new T.TextureLoader().loadAsync('/character/face.png').then(texture=>{texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;faceMaterial.map=texture;faceMaterial.needsUpdate=true;});
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
  const crankCenter:V=[0,.78,.48],crank=new T.Group();crank.position.set(...crankCenter);root.add(crank);
  const chainring=mesh(root,new T.TorusGeometry(.245,.018,6,40),metal,[-.20,.78,.48]);chainring.rotation.y=Math.PI/2;
  for(let i=0;i<32;i++){const a=i/32*Math.PI*2;const tooth=mesh(root,new T.BoxGeometry(.025,.035,.035),chrome,[-.20,.78+Math.cos(a)*.257,.48+Math.sin(a)*.257]);tooth.rotation.x=-a;}
  for(const side of [-1,1])rod(root,[side*.15,.78,.48],[side*.15,.88,1.35],.028);
  const chainPoints:V[]=[[-.22,1.02,.48],[-.22,1.01,1.35],[-.22,.75,1.35],[-.22,.54,.48],[-.22,1.02,.48]];
  for(let s=0;s<4;s++){const a=v(chainPoints[s]),b=v(chainPoints[s+1]);for(let i=0;i<18;i++){const p=a.clone().lerp(b,i/18);ellipsoid(root,[p.x,p.y,p.z],[.022,.018,.032],chrome);}}
  const legs=[-1,1].map(side=>{
    const hip:V=[side*.36,2.04,.84],knee:V=[side*.47,1.46,1.12],ankle:V=[side*.36,.73,.51];
    const upper=muscle(root,hip,knee,.245,.25,skin),lower=muscle(root,knee,ankle,.155,.16,skin);
    const joint=ellipsoid(root,knee,[.175,.2,.18],skin),foot=ellipsoid(root,ankle,[.135,.10,.25],skin);
    const pedal=mesh(root,new T.BoxGeometry(.27,.07,.20),rubber);
    const crankArm=rod(crank,[side*.28,0,0],[side*.28,-side*.27,0],.031,chrome);
    const toes:T.Mesh[]=[];for(let t=0;t<5;t++)toes.push(ellipsoid(root,ankle,[.026,.045,.067],skin));
    return{side,hip,upper,lower,joint,foot,pedal,crankArm,toes};
  });
  const arms=[-1,1].map(side=>{
    const shoulder:V=[side*.53,2.12,-.83],elbow:V=[side*.48,1.56,-1.13],hand:V=[side*.23,.88,-1.35];
    const upper=muscle(root,shoulder,elbow,.235,.245,skin),lower=muscle(root,elbow,hand,.17,.18,skin);
    const joint=ellipsoid(root,elbow,[.155,.17,.17],skin),fist=ellipsoid(root,hand,[.14,.135,.16],skin);
    const knuckles=[0,1,2,3].map(n=>ellipsoid(fist,[(n-1.5)*.38,-.17,-.65],[.22,.30,.31],skin));
    return{side,shoulder,upper,lower,joint,fist,knuckles};
  });
  // The delivery briefcase hangs under the torso, leaving the reference silhouette visible.
  const bag=mesh(root,new T.BoxGeometry(.22,.42,.52),leather,[.62,1.81,.2]);
  for(const z of [-.14,.14])mesh(bag,new T.BoxGeometry(.025,.065,.055),chrome,[.122,.055,z]);
  curvedRod(root,[[.47,2.29,.06],[.65,2.22,.07],[.65,2.02,.07]],.017,leather);
  function moveMuscle(m:T.Mesh,a:V,b:V){m.scale.y=v(a).distanceTo(v(b))/m.userData.restLength;m.position.copy(v(a));m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),v(b).sub(v(a)).normalize());}
  // Two-bone IK: feet stay on pedals, while the knees bend and the wheels rotate.
  function animate(distance:number,punch:number,time:number){
    for(const wheel of wheels)wheel.rotation.x=-distance/.815;
    const angle=-distance*2.25;crank.rotation.x=angle;
    for(const leg of legs){
      const phase=angle+(leg.side===1?Math.PI:0),ankle:V=[leg.side*.36,.78+Math.cos(phase)*.27,.48+Math.sin(phase)*.27];
      const a=v(leg.hip),b=v(ankle),dir=b.clone().sub(a),d=dir.length(),l1=.72,l2=.82;
      const mid=l1*l1-l2*l2+d*d,along=mid/(2*d),h=Math.sqrt(Math.max(0,l1*l1-along*along));
      dir.normalize();const bend=new T.Vector3(0,0,1).addScaledVector(dir,-dir.z).normalize();
      const knee=a.addScaledVector(dir,along).addScaledVector(bend,h);const k:V=[knee.x,knee.y,knee.z];
      moveMuscle(leg.upper,leg.hip,k);moveMuscle(leg.lower,k,ankle);
      leg.joint.position.copy(knee);leg.foot.position.set(ankle[0],ankle[1]+.05,ankle[2]-.1);leg.pedal.position.set(ankle[0],ankle[1]-.045,ankle[2]);
      leg.toes.forEach((toe,n)=>toe.position.set(ankle[0]+(n-2)*.043,ankle[1]+.045,ankle[2]-.30));
    }
    for(const arm of arms){
      const thrust=arm.side===-1&&punch>0?Math.sin(Math.min(1,punch/.4)*Math.PI):0;
      const hand:V=[arm.side*(.23+.14*thrust),.88+1.05*thrust,-1.35-.75*thrust],elbow:V=[arm.side*.48,1.56+.25*thrust,-1.13-.38*thrust];
      moveMuscle(arm.upper,arm.shoulder,elbow);
      moveMuscle(arm.lower,elbow,hand);
      arm.joint.position.set(...elbow);arm.fist.position.set(...hand);
    }
    head.rotation.x=Math.sin(time*2.2)*.012;
  }
  // Batch fixed parts by material so individual spokes and chain links do not add draw calls.
  const moving=new Set<T.Object3D>([...legs.flatMap(l=>[l.upper,l.lower,l.joint,l.foot,l.pedal,...l.toes]),...arms.flatMap(a=>[a.upper,a.lower,a.joint,a.fist]),bag]);
  function batch(group:T.Group){
    const buckets=new Map<T.Material,T.BufferGeometry[]>();
    for(const child of [...group.children])if(child instanceof T.Mesh&&!moving.has(child)&&!Array.isArray(child.material)){
      child.updateMatrix();const geo=child.geometry.clone().applyMatrix4(child.matrix);const list=buckets.get(child.material)??[];list.push(geo);buckets.set(child.material,list);group.remove(child);child.geometry.dispose();
    }
    for(const [mat,geometries] of buckets){const merged=mergeGeometries(geometries,false);if(merged)mesh(group,merged,mat);geometries.forEach(g=>g.dispose());}
  }
  wheels.forEach(batch);batch(root);batch(head);
  animate(0,0,0);return{root,wheels,ready,animate};
}
