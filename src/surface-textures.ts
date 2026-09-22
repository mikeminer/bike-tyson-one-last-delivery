import * as T from 'three';

// Authored material patterns; these are generated in code, not remote texture dependencies.
function canvas(size: number) { const c=document.createElement('canvas');c.width=c.height=size;return {c,ctx:c.getContext('2d')!}; }
function texture(c: HTMLCanvasElement, repeat=1) {const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=4;return t;}
export function leatherGrain() {
  const {c,ctx}=canvas(256);ctx.fillStyle='#858585';ctx.fillRect(0,0,256,256);let seed=14;
  const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  for(let y=-8;y<264;y+=6)for(let x=-8;x<264;x+=6){const xx=x+rand()*3,yy=y+rand()*3;ctx.fillStyle=`rgb(${125+rand()*55},${125},${125})`;ctx.beginPath();ctx.ellipse(xx,yy,2+rand(),1+rand()*1.5,rand()*3,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#666';ctx.lineWidth=.6;ctx.stroke();}
  return texture(c,2);
}
export function treadTexture() {
  const {c,ctx}=canvas(256);ctx.fillStyle='#b5b5b5';ctx.fillRect(0,0,256,256);
  ctx.strokeStyle='#515151';ctx.lineWidth=6;
  for(let x=-64;x<320;x+=64){ctx.beginPath();ctx.moveTo(x,70);ctx.lineTo(x+18,112);ctx.moveTo(x+18,144);ctx.lineTo(x,186);ctx.stroke();}
  for(const y of [56,200]){ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(256,y);ctx.stroke();}
  const t=texture(c);t.repeat.set(16,1);t.offset.y=.5;return t;
}
export function tattooTexture() {
  const {c,ctx}=canvas(256);ctx.strokeStyle='#12201d';ctx.fillStyle='#12201d';ctx.lineCap='round';ctx.lineJoin='round';ctx.lineWidth=7;
  // Original winged wheel emblem, weathered by shader opacity rather than stamped opaque black.
  for(const r of [29,40]){ctx.beginPath();ctx.arc(128,129,r,0,Math.PI*2);ctx.stroke();}
  for(let n=0;n<8;n++){const a=n*Math.PI/4;ctx.beginPath();ctx.moveTo(128+Math.cos(a)*9,129+Math.sin(a)*9);ctx.lineTo(128+Math.cos(a)*27,129+Math.sin(a)*27);ctx.stroke();}
  for(const side of [-1,1])for(let n=0;n<5;n++){
    ctx.beginPath();ctx.moveTo(128+side*39,112+n*11);ctx.bezierCurveTo(128+side*57,108+n*8,128+side*(98-n*6),71+n*7,128+side*(100-n*7),44+n*13);ctx.bezierCurveTo(128+side*(73-n*3),91+n*8,128+side*53,102+n*10,128+side*39,112+n*11);ctx.stroke();
  }
  ctx.lineWidth=4;for(const side of [-1,1]){ctx.beginPath();ctx.moveTo(128,175);ctx.bezierCurveTo(128+side*47,177,128+side*56,208,128+side*21,220);ctx.bezierCurveTo(128+side*5,225,128+side*6,199,128+side*26,201);ctx.stroke();}
  return texture(c);
}
export function asphaltTexture() {
  const {c,ctx}=canvas(512);let seed=944;const rand=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
  ctx.fillStyle='#484c49';ctx.fillRect(0,0,512,512);
  for(let n=0;n<24000;n++){const x=rand()*512,y=rand()*512,r=.4+rand()*1.7,l=45+Math.floor(rand()*53);ctx.fillStyle=`rgb(${l},${l+2},${l})`;ctx.beginPath();ctx.ellipse(x,y,r,r*.7,rand()*3,0,Math.PI*2);ctx.fill();}
  // Sparse fine hairline cracks, continued across tile boundaries.
  ctx.strokeStyle='rgba(22,26,25,.34)';ctx.lineWidth=1;
  for(let n=0;n<6;n++){let x=rand()*512,y=rand()*512;ctx.beginPath();ctx.moveTo(x,y);for(let i=0;i<8;i++){x+=rand()*16-8;y+=rand()*18;ctx.lineTo(x,y);}ctx.stroke();}
  const t=texture(c);t.colorSpace=T.SRGBColorSpace;t.repeat.set(5.5,450);return t;
}
