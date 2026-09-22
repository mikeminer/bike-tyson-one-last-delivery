import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { random } from './simulation.mjs';

type Frame = { t: number; distance: number; x: number; y: number; lean: number; roll: number; punch: number; speed: number };
type Obstacle = { id: number; type: string; x: number; z: number; hit: number; effect: string };
const palette = { ink: 0x163a37, orange: 0xf07434, cream: 0xf4e9c7, red: 0xec3f32, teal: 0x288779, yellow: 0xe6ed43 };
const material = (color: number, roughness = .65, metalness = 0) => new T.MeshStandardMaterial({ color, roughness, metalness });
const mats = {
  rubber: material(0x202c2b, .94), metal: material(0xadbdb6, .28, .85), dark: material(palette.ink, .65),
  paint: new T.MeshPhysicalMaterial({ color: palette.orange, roughness: .3, metalness: .25, clearcoat: .6 }),
  glove: material(palette.red, .54), cream: material(palette.cream), yellow: material(palette.yellow, .4),
  white: material(0xffffeb, .4), lens: material(0x162622, .16, .65), blue: material(0x67c4d7, .25, .3),
  pavement: material(0xc3bca6, .95), window: material(0x3d6865, .25, .5), terracotta: material(0xbe634c, .85),
};
function box(w: number, h: number, d: number, mat: T.Material, rounded = false) {
  const mesh = new T.Mesh(rounded ? new RoundedBoxGeometry(w, h, d, 2, .08) : new T.BoxGeometry(w, h, d), mat);
  mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
}
function sphere(r: number, mat: T.Material, segments = 16) { const mesh = new T.Mesh(new T.SphereGeometry(r, segments, 12), mat); mesh.castShadow = true; return mesh; }
function cylinder(r: number, length: number, mat: T.Material, segments = 12) {
  const mesh = new T.Mesh(new T.CylinderGeometry(r, r, length, segments), mat); mesh.castShadow = true; return mesh;
}
function at<T extends T.Object3D>(parent: T.Object3D, object: T, x: number, y: number, z: number): T { object.position.set(x, y, z); parent.add(object); return object; }
function tube(parent: T.Object3D, from: number[], to: number[], radius: number, mat: T.Material) {
  const a = new T.Vector3(...from as [number, number, number]), b = new T.Vector3(...to as [number, number, number]);
  const mesh = cylinder(radius, a.distanceTo(b), mat);
  mesh.position.copy(a).add(b).multiplyScalar(.5); mesh.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.sub(a).normalize());
  parent.add(mesh); return mesh;
}
function textTexture(text: string, background = '#f1e8cd', color = '#163a37', width = 512, height = 160) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext('2d')!; ctx.fillStyle = background; ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.font = `900 ${height * .45}px Arial`;
  ctx.fillText(text, width / 2, height / 2, width * .92);
  const texture = new T.CanvasTexture(canvas); texture.colorSpace = T.SRGBColorSpace; return texture;
}
function sign(text: string, w: number, h: number, bg?: string, fg?: string) {
  return new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: textTexture(text, bg, fg), roughness: .75, side: T.DoubleSide }));
}
function roadMaterial() {
  const size = 256, canvas = document.createElement('canvas'); canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d')!, rng = random(777); ctx.fillStyle = '#666e67'; ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 12000; i++) { const light = 65 + Math.floor(rng() * 65); ctx.fillStyle = `rgba(${light},${light + 7},${light},.4)`; ctx.fillRect(rng() * size, rng() * size, 1, 1); }
  const map = new T.CanvasTexture(canvas); map.colorSpace = T.SRGBColorSpace; map.wrapS = map.wrapT = T.RepeatWrapping; map.repeat.set(3, 190);
  const bump = map.clone(); bump.colorSpace = T.NoColorSpace; bump.needsUpdate = true;
  return new T.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: .025, roughness: .98 });
}
function mergeStatic(group: T.Group) {
  group.updateMatrixWorld(true);
  const buckets = new Map<T.Material, T.BufferGeometry[]>();
  group.traverse(node => {
    if (!(node instanceof T.Mesh) || Array.isArray(node.material)) return;
    const geo = node.geometry.clone().applyMatrix4(node.matrixWorld);
    const list = buckets.get(node.material) ?? []; list.push(geo); buckets.set(node.material, list);
  });
  const merged = new T.Group();
  for (const [mat, geometries] of buckets) {
    const geo = mergeGeometries(geometries, false); geometries.forEach(g => g.dispose());
    if (geo) { const mesh = new T.Mesh(geo, mat); mesh.castShadow = true; mesh.receiveShadow = true; merged.add(mesh); }
  }
  group.traverse(n => { if (n instanceof T.Mesh) n.geometry.dispose(); });
  return merged;
}
function makeBike() {
  const root = new T.Group(), wheels: T.Group[] = [], gloves: T.Group[] = [];
  for (const z of [-1.12, 1.12]) {
    const wheel = at(root, new T.Group(), 0, .73, z);
    const tyre = new T.Mesh(new T.TorusGeometry(.64, .125, 10, 28), mats.rubber); tyre.rotation.y = Math.PI / 2; tyre.castShadow = true; wheel.add(tyre);
    const rim = new T.Mesh(new T.TorusGeometry(.535, .032, 6, 28), mats.metal); rim.rotation.y = Math.PI / 2; wheel.add(rim);
    const hub = cylinder(.115, .36, mats.metal); hub.rotation.z = Math.PI / 2; wheel.add(hub);
    for (let j = 0; j < 10; j++) { const a = j / 10 * Math.PI * 2; tube(wheel, [0, 0, 0], [0, Math.cos(a) * .52, Math.sin(a) * .52], .013, mats.metal); }
    wheels.push(wheel);
  }
  const nodes = [[0,.73,1.12],[0,1.72,.45],[0,.75,0],[0,1.9,-.7],[0,.73,-1.12]];
  for (const [a,b] of [[0,1],[1,2],[2,0],[1,3],[3,2],[3,4]]) tube(root,nodes[a],nodes[b],.085,mats.paint);
  tube(root, [.16, .75, 1.12], [.16, .75, 0], .035, mats.dark);
  tube(root, [0, 1.7, .45], [0, 2, .5], .055, mats.metal);
  at(root, box(.55,.14,.7,mats.rubber,true),0,2.06,.5);
  const pedals = at(root,new T.Group(),0,.8,0);
  tube(pedals,[-.4,-.22,0],[.4,.22,0],.045,mats.metal);
  at(pedals,box(.3,.1,.2,mats.rubber),-.48,-.22,0); at(pedals,box(.3,.1,.2,mats.rubber),.48,.22,0);
  tube(root,[0,1.9,-.7],[0,2.3,-.86],.065,mats.metal);
  tube(root,[-.75,2.3,-.86],[.75,2.3,-.86],.065,mats.metal);
  for (const side of [-1,1]) {
    const arm = at(root,new T.Group(),side*.75,2.3,-.85);
    tube(arm,[0,0,0],[side*.2,-.12,-.25],.11,mats.paint);
    const glove = at(arm,new T.Group(),side*.14,-.08,-.48);
    const fist = at(glove,sphere(.32,mats.glove),0,0,0); fist.scale.set(.95,1.15,1.15);
    at(glove,sphere(.15,mats.glove),-side*.2,-.12,-.04);
    const cuff=at(glove,cylinder(.21,.25,mats.cream),0,0,.3); cuff.rotation.x=Math.PI/2;
    const seam=at(glove,box(.025,.32,.02,mats.cream),side*.14,0,-.31); seam.rotation.z=side*.25;
    gloves.push(arm);
  }
  tube(root,[0,2.3,-.86],[0,2.79,-.88],.085,mats.metal);
  const face=at(root,box(.8,.52,.35,mats.cream,true),0,2.83,-.94);
  for (const side of [-1,1]) { at(face,box(.24,.17,.055,mats.lens,true),side*.16,.035,-.17); tube(face,[side*.04,.15,-.2],[side*.28,.09,-.2],.035,mats.dark); }
  at(face,box(.2,.025,.04,mats.dark),0,-.13,-.17);
  const bag=at(root,box(.73,.56,.43,mats.dark,true),0,1.68,1.03); bag.rotation.x=-.1;
  at(bag,box(.6,.065,.025,mats.cream),0,0,.23);
  for (const side of [-1,1]) at(bag,box(.08,.17,.04,mats.metal),side*.21,.12,.23);
  tube(bag,[-.18,.29,0],[-.18,.43,0],.035,mats.metal);tube(bag,[.18,.29,0],[.18,.43,0],.035,mats.metal);tube(bag,[-.18,.43,0],[.18,.43,0],.035,mats.metal);
  return { root,wheels,gloves,pedals };
}
function makeObstacle(type: string) {
  const g=new T.Group();
  if (type==='hydrant') {
    at(g,cylinder(.25,.8,mats.glove),0,.5,0); at(g,sphere(.29,mats.glove),0,.94,0);
    at(g,cylinder(.4,.12,mats.dark),0,.08,0);
    for(const side of [-1,1]) { const cap=at(g,cylinder(.17,.23,mats.metal),side*.3,.7,0);cap.rotation.z=Math.PI/2; }
    at(g,sign('HIT ME',1,.35,'#e6ed43'),0,1.6,0);
  } else if(type==='barrier') {
    at(g,box(1.65,.5,.25,mats.cream),0,.9,0);
    for (let i=0;i<4;i++){const stripe=at(g,box(.17,.5,.27,mats.glove),-.6+i*.4,.9,0);stripe.rotation.z=-.3;}
    for(const x of [-.65,.65]) {at(g,box(.1,.8,.1,mats.dark),x,.4,0);at(g,box(.3,.08,.6,mats.dark),x,.05,0);}
  } else if(type==='ramp') {
    const ramp=at(g,box(1.9,.18,2.6,mats.yellow),0,.5,0);ramp.rotation.x=-.3;
    for(const x of [-.85,.85]) tube(g,[x,.15,1],[x,.85,-1],.055,mats.dark);
    at(g,sign('UP?',1,.4,'#e6ed43'),0,1,-1);
  } else if(type==='pigeon') {
    const body=at(g,sphere(.42,mats.window),0,.48,0);body.scale.set(.85,1.2,1.25);
    at(g,sphere(.28,mats.dark),0,1,-.18);
    const beak=new T.Mesh(new T.ConeGeometry(.09,.3,8),mats.yellow);beak.rotation.x=-Math.PI/2;at(g,beak,0,.97,-.48);
    for(const side of [-1,1]) {at(g,sphere(.07,mats.white),side*.2,1.1,-.32);at(g,sphere(.033,mats.dark),side*.21,1.1,-.38);tube(g,[side*.13,.2,0],[side*.13,.05,-.2],.025,mats.glove);}
    const crown=new T.Mesh(new T.ConeGeometry(.22,.27,5,1,true),mats.yellow);at(g,crown,0,1.36,-.17);
  } else {
    at(g,box(2.05,1.8,3.3,mats.yellow,true),0,1.3,0);
    at(g,box(1.8,.7,.04,mats.window,true),0,1.63,1.68);
    at(g,sign('SORRY!',1.5,.32,'#163a37','#e6ed43'),0,2.05,1.68);
    for(const side of [-1,1]) for(const z of [-1,1]) {const w=new T.Mesh(new T.TorusGeometry(.32,.12,8,14),mats.rubber);w.rotation.y=Math.PI/2;at(g,w,side*1.02,.43,z);}
    for(const side of [-1,1]) {at(g,sphere(.12,mats.white),side*.75,1,1.7); for(let i=0;i<3;i++)at(g,box(.03,.65,.65,mats.window),side*1.035,1.6,-.85+i*.85);}
  }
  return g;
}

export class CityScene {
  renderer: T.WebGLRenderer;
  scene=new T.Scene();camera=new T.PerspectiveCamera(45,1,.1,220);
  bike=makeBike();sun=new T.DirectionalLight(0xffe2bb,3.3);headlight=new T.SpotLight(0xffefbf,110,42,.52,.8,1.6);ambient=new T.HemisphereLight(0xe5f0df,0x817050,1.2);
  obstacles=new Map<number,T.Group>(); effects: T.Group;
  shadow: T.Mesh; frame?: Frame; mode='ready'; width=1;height=1;
  reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;needsFrame=true;
  constructor(public canvas: HTMLCanvasElement) {
    this.renderer=new T.WebGLRenderer({canvas,antialias:true,alpha:false,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.shadowMap.enabled=true;
    this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.95;
    this.scene.background=new T.Color(0xc5dcd0);this.scene.fog=new T.Fog(0xc5dcd0,60,180);
    const env=new RoomEnvironment();const pmrem=new T.PMREMGenerator(this.renderer);this.scene.environment=pmrem.fromScene(env,.05).texture;env.dispose();pmrem.dispose();
    this.scene.environmentIntensity=.55;
    this.scene.add(this.ambient,this.headlight,this.headlight.target);this.headlight.visible=false;this.sun.intensity=2.6;this.sun.position.set(-15,28,15);this.sun.castShadow=true;this.sun.shadow.mapSize.set(1024,1024);
    this.sun.shadow.camera.left=-22;this.sun.shadow.camera.right=22;this.sun.shadow.camera.top=26;this.sun.shadow.camera.bottom=-25;this.sun.shadow.normalBias=.025;this.sun.shadow.bias=-.0002;
    this.scene.add(this.sun,this.sun.target);
    const road=box(11,.15,900,roadMaterial());road.position.set(0,-.12,-390);this.scene.add(road);
    const ground=box(350,.3,900,material(0xc1cbb1));ground.position.set(0,-.35,-390);ground.receiveShadow=true;this.scene.add(ground);
    const urban=new T.Group(),rng=random(1138),facades=[material(0xc79872),material(0x6d9b8e),material(0xd8cba6),material(0xc17d69),material(0xa3b5a7)];
    for(const side of [-1,1]) {
      at(urban,box(3,.3,850,mats.pavement),side*6.9,0,-380);
      for(let i=0;i<64;i++)at(urban,box(.22,.32,5.7,i%2===0?mats.cream:mats.dark),side*5.55,0,35-i*12);
      for(let i=0;i<46;i++) {
        const z=25-i*15,h=6+rng()*11,w=5+rng()*3;
        at(urban,box(w,h,12,facades[i%facades.length]),side*(9+w/2),h/2,z);
        at(urban,box(w+.3,.3,12.3,mats.cream),side*(9+w/2),h+.1,z);
        // Recessed windows, raised frames and shop awnings.
        for(let level=0;level<Math.floor(h/2.5);level++)for(let col=0;col<4;col++){
          const x=side*8.98,y=2+level*2.4,zz=z-4.2+col*2.8;
          at(urban,box(.11,1.5,1.4,mats.cream),x,y,zz);at(urban,box(.14,1.2,1.1,mats.window),x-side*.03,y,zz);
          at(urban,box(.28,.1,1.6,mats.cream),x-side*.12,y-.78,zz);
        }
        const awning=at(urban,box(1.4,.15,8,i%2?mats.glove:mats.dark),side*8.5,2.4,z);awning.rotation.z=side*.1;
        if(i%2===0) {
          tube(urban,[side*6.4,.2,z],[side*6.4,4.5,z],.065,mats.dark);
          tube(urban,[side*6.4,4.5,z],[side*5.8,4.5,z],.065,mats.dark);
          at(urban,box(.6,.12,.38,mats.cream),side*5.8,4.45,z);
        }
        if(i%3===0){
          at(urban,cylinder(.13,2,mats.terracotta),side*7,1,z+5);
          const leaves=at(urban,sphere(1.4,facades[1],10),side*7,3.1,z+5);leaves.scale.set(.8,1.2,.85);
          at(urban,box(1.5,.45,1.5,mats.cream),side*7,.25,z+5);
        }
      }
    }
    for(let i=0;i<170;i++)at(urban,box(.12,.015,2,mats.cream),0,-.032,30-i*5);
    for(const z of [8,-78,-183,-325,-470,-597])for(let i=0;i<8;i++)at(urban,box(.7,.02,2,mats.cream),-4.3+i*1.2,-.025,z);
    this.scene.add(mergeStatic(urban));
    for(const [text,x,z] of [['PASTA LA VISTA',-9,0],['NO BRAKES CLUB',9,-18],['SORRY WE’RE OPEN',-9,-36]] as [string,number,number][]){const s=sign(text,6,.8,text.includes('PASTA')?'#ec3f32':'#e6ed43',text.includes('PASTA')?'#f4e9c7':'#163a37');s.rotation.y=x<0?Math.PI/2:-Math.PI/2;at(this.scene,s,x,2.7,z);}
    const finish=new T.Group();for(const x of [-5,5])at(finish,box(.4,6,.4,mats.glove),x,3,-612);
    at(finish,box(10.4,1.5,.45,mats.dark),0,5.4,-612);at(finish,sign('DELIVERY. PROBABLY.',9,1.1,'#163a37','#e6ed43'),0,5.4,-611.7);this.scene.add(finish);
    this.scene.add(this.bike.root);
    const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;const ctx=shadowCanvas.getContext('2d')!,grad=ctx.createRadialGradient(32,32,2,32,32,31);grad.addColorStop(0,'rgba(16,35,30,.55)');grad.addColorStop(1,'rgba(16,35,30,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,64,64);
    this.shadow=new T.Mesh(new T.PlaneGeometry(3,4.3),new T.MeshBasicMaterial({map:new T.CanvasTexture(shadowCanvas),transparent:true,depthWrite:false}));this.shadow.rotation.x=-Math.PI/2;this.shadow.position.y=.012;this.scene.add(this.shadow);
    this.effects=new T.Group();for(let i=0;i<16;i++)this.effects.add(sphere(.1,mats.blue,6));this.scene.add(this.effects);this.effects.visible=false;
    this.resize();new ResizeObserver(()=>this.resize()).observe(canvas);
  }
  resize(){this.width=this.canvas.clientWidth;this.height=this.canvas.clientHeight;this.renderer.setSize(this.width,this.height,false);this.camera.aspect=this.width/this.height;this.camera.updateProjectionMatrix();this.needsFrame=true;}
  setRun(obstacles: Obstacle[]) {
    this.needsFrame=true;
    const sharedMaterials=new Set<T.Material>(Object.values(mats));
    for(const g of this.obstacles.values()){this.scene.remove(g);g.traverse(n=>{if(n instanceof T.Mesh){n.geometry.dispose();for(const mat of (Array.isArray(n.material)?n.material:[n.material])){if(!sharedMaterials.has(mat)){(mat as T.MeshStandardMaterial).map?.dispose();mat.dispose();}}}});}this.obstacles.clear();
    for(const o of obstacles){const g=makeObstacle(o.type);g.position.set(o.x,0,-o.z);this.scene.add(g);this.obstacles.set(o.id,g);}
  }
  quality(low: boolean){this.renderer.setPixelRatio(low?1:Math.min(devicePixelRatio,1.5));this.renderer.shadowMap.enabled=!low;this.resize();}
  render(frame: Frame, obstacles: Obstacle[], mode: string, clock: number) {
    this.needsFrame=false;this.frame=frame;this.mode=mode;const distance=mode==='ready'?0:frame.distance;
    const night=mode!=='ready'&&this.canvas.parentElement!.classList.contains('special-run');
    (this.scene.background as T.Color).set(night?0x19333b:0xc5dcd0);(this.scene.fog as T.Fog).color.copy(this.scene.background as T.Color);
    this.sun.intensity=night?.5:2.6;this.ambient.intensity=night?.45:1.2;this.headlight.visible=night;
    this.headlight.position.set(frame.x,2.4+frame.y,-distance-.8);this.headlight.target.position.set(frame.x,0,-distance-18);
    this.bike.root.position.set(frame.x,frame.y,-distance);this.bike.root.rotation.set(frame.roll*.15,0,frame.lean+frame.roll);
    this.bike.root.scale.setScalar(mode==='ready'?1.3:1);
    if(mode==='ready'){this.bike.root.rotation.y=3.7;this.bike.root.rotation.z=-.07;}
    for(const w of this.bike.wheels)w.rotation.x=-distance/.65;
    this.bike.pedals.rotation.x=-distance*2;
    this.bike.gloves.forEach((g,i)=>{g.rotation.x=frame.punch>0?-Math.sin(frame.punch/.4*Math.PI)*1.25:(this.reduced?0:Math.sin(clock*3+i)*.07);});
    this.shadow.position.set(frame.x,.012,-distance);(this.shadow.material as T.MeshBasicMaterial).opacity=Math.max(.15,1-frame.y*.15);
    for(const o of obstacles){const g=this.obstacles.get(o.id)!;const age=o.hit<0?-1:frame.t-o.hit;
      g.visible=Math.abs(o.z-distance)<135 && (age<0||age<3.5);g.position.set(o.x,0,-o.z);g.rotation.set(0,0,0);g.scale.setScalar(1);
      if(age>=0 && o.effect==='punch'){g.position.y=age*7-age*age*2;g.position.x+=age*(o.x<0?-3:3);g.rotation.set(age*3,age*2,age*2);if(o.type==='pigeon')g.scale.setScalar(1+Math.min(age,1.5));}
      else if(o.type==='pigeon' && !this.reduced){g.position.y=Math.sin(frame.t*4+o.id)*.05;g.rotation.y=Math.sin(frame.t*3+o.id)*.25;}
    }
    const fountain=obstacles.find(o=>o.type==='hydrant'&&o.hit>=0&&frame.t>=o.hit&&frame.t-o.hit<2.5&&o.effect==='punch');
    this.effects.visible=!!fountain;
    if(fountain){const age=frame.t-fountain.hit;this.effects.children.forEach((p,i)=>{const u=((age+i*.08)%1.2);p.position.set(fountain.x+Math.sin(i*2.4)*u,1+u*10-u*u*7,-fountain.z+Math.cos(i*2.4)*u);});}
    let target=new T.Vector3(frame.x*.35,1.5,-distance-6),position:T.Vector3;
    if(mode==='ready') {position=new T.Vector3(8.4,4.8,9);target=new T.Vector3(-3.2,1.7,-1.5);this.camera.fov=this.width/this.height<.8?48:40;}
    else if(mode==='replay'){const offset=frame.x>0?-3.7:3.7;position=new T.Vector3(Math.max(-4.7,Math.min(4.7,frame.x+offset+Math.sin(clock*.2)*.6)),frame.y+3.5,-distance+6);target=new T.Vector3(frame.x,frame.y+1.3,-distance);this.camera.fov=42;}
    else {position=new T.Vector3(frame.x*.4,5.4+frame.y*.18,-distance+9.5);this.camera.fov=this.width/this.height<.8?62:50;}
    this.camera.position.copy(position);this.camera.lookAt(target);this.camera.updateProjectionMatrix();
    this.sun.position.set(-15,28,-distance+16);this.sun.target.position.set(0,0,-distance-12);
    this.renderer.render(this.scene,this.camera);
  }
  get stats(){return {calls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,textures:this.renderer.info.memory.textures};}
}
