import * as T from 'three';
import { tattooTexture } from './surface-textures';

// Rest-space coordinates keep skin detail attached while the skeleton deforms.
export function skinMaterial(face = false) {
  const material = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: .49, metalness: 0, clearcoat: .025, clearcoatRoughness: .65, specularIntensity: .62 });
  const uniforms = { skinTex: { value: null as T.Texture | null }, faceTex: { value: null as T.Texture | null }, inkTex: { value: tattooTexture() } };
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = 'varying vec3 skinPosition; varying vec3 skinNormal;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nskinPosition=position; skinNormal=normal;');
    shader.fragmentShader = `varying vec3 skinPosition; varying vec3 skinNormal; uniform sampler2D skinTex; uniform sampler2D faceTex; uniform sampler2D inkTex;\n` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
      vec3 weights=pow(abs(normalize(skinNormal)),vec3(4.0)); weights/=dot(weights,vec3(1.0));
      vec3 p=skinPosition*1.65;
      vec3 skinColor=texture2D(skinTex,p.yz).rgb*weights.x+texture2D(skinTex,p.xz).rgb*weights.y+texture2D(skinTex,p.xy).rgb*weights.z;
      float skinHeight=dot(skinColor,vec3(.2126,.7152,.0722));
      skinColor*=vec3(.62,.68,.75);
      ${face ? `
      float nx=skinPosition.x/.43; float ny=(skinPosition.y-.018)/.57;
      vec2 faceUV=vec2(.5-nx*.335,.5+ny*.487);
      float front=(1.0-smoothstep(-.22,.025,skinPosition.z))*(1.0-smoothstep(.76,1.0,abs(nx)));
      skinColor=mix(skinColor,texture2D(faceTex,faceUV).rgb,front);
      ` : `
      vec2 armUV=vec2((skinPosition.z+.87)/.57+.5,(skinPosition.y-1.98)/.69+.5);
      vec2 legUV=vec2((skinPosition.z-.99)/.53+.5,(skinPosition.y-1.86)/.72+.5);
      float armMask=step(0.0,armUV.x)*step(armUV.x,1.0)*step(0.0,armUV.y)*step(armUV.y,1.0);
      float legMask=step(0.0,legUV.x)*step(legUV.x,1.0)*step(0.0,legUV.y)*step(legUV.y,1.0);
      float ink=max(texture2D(inkTex,clamp(armUV,0.0,1.0)).a*armMask,texture2D(inkTex,clamp(legUV,0.0,1.0)).a*legMask);
      ink*=smoothstep(.42,.57,abs(skinPosition.x));
      skinColor=mix(skinColor,skinColor*vec3(.20,.27,.28),ink*.73);
      // Restrained vascular color follows forearm anatomy, remaining attached in rest space.
      float armRegion=(1.0-smoothstep(.12,.24,abs(skinPosition.z+1.18)))*(1.0-smoothstep(.23,.42,abs(skinPosition.y-1.36)));
      float vein=exp(-pow((abs(skinPosition.x)-(.49+.022*sin(skinPosition.y*14.0)))/.009,2.0))*armRegion;
      skinColor=mix(skinColor,skinColor*vec3(.72,.82,.82),vein*.18);
      `}
      diffuseColor.rgb*=skinColor;
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+(skinHeight-.25)*.22,.39,.67);');
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      vec3 skinDx=dFdx(-vViewPosition),skinDy=dFdy(-vViewPosition);
      vec3 skinR1=cross(skinDy,normal),skinR2=cross(normal,skinDx);
      float skinDet=dot(skinDx,skinR1);
      vec3 skinGradient=(dFdx(skinHeight)*skinR1+dFdy(skinHeight)*skinR2)*.006;
      normal=normalize(abs(skinDet)*normal-sign(skinDet)*skinGradient);
    `);
  };
  material.customProgramCacheKey = () => `bike-skin-v3-${face}`;
  return { material, uniforms };
}

export function grainTexture(repeat: number) {
  const size=128, data=new Uint8Array(size*size*4);let seed=771;
  for(let i=0;i<data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const g=110+seed%50;data.set([g,g,g,255],i);}
  const texture=new T.DataTexture(data,size,size);texture.wrapS=texture.wrapT=T.RepeatWrapping;texture.repeat.set(repeat,repeat);texture.magFilter=T.LinearFilter;texture.minFilter=T.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.needsUpdate=true;return texture;
}

export async function loadAnatomy() {
  const response=await fetch('/character/anatomy-v2.bin');if(!response.ok)throw new Error('Character anatomy could not load.');
  const data=await response.arrayBuffer(),header=new Uint32Array(data,0,4),count=header[1],indices=header[2];
  if(header[0]!==0x42545932||header[3]!==13||data.byteLength!==16+count*56+indices*4)throw new Error('Invalid character anatomy.');
  let offset=16;const geo=new T.BufferGeometry();
  for(const [name,size] of [['position',3],['normal',3],['uv',2]] as const){geo.setAttribute(name,new T.BufferAttribute(new Float32Array(data,offset,count*size),size));offset+=count*size*4;}
  geo.setAttribute('skinIndex',new T.BufferAttribute(new Uint16Array(data,offset,count*4),4));offset+=count*8;
  geo.setAttribute('skinWeight',new T.BufferAttribute(new Float32Array(data,offset,count*4),4));offset+=count*16;
  geo.setIndex(new T.BufferAttribute(new Uint32Array(data,offset,indices),1));geo.computeBoundingSphere();return geo;
}

