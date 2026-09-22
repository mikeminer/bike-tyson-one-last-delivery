import * as T from 'three';

// Rest-space coordinates keep skin detail attached while the skeleton deforms.
export function skinMaterial(face = false) {
  const material = new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: .49, metalness: 0, clearcoat: .025, clearcoatRoughness: .65, specularIntensity: .62 });
  const uniforms = { skinTex: { value: null as T.Texture | null }, faceTex: { value: null as T.Texture | null } };
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    shader.vertexShader = 'varying vec3 skinPosition; varying vec3 skinNormal;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\nskinPosition=position; skinNormal=normal;');
    shader.fragmentShader = `varying vec3 skinPosition; varying vec3 skinNormal; uniform sampler2D skinTex; uniform sampler2D faceTex;\n` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
      vec3 weights=pow(abs(normalize(skinNormal)),vec3(4.0)); weights/=dot(weights,vec3(1.0));
      vec3 p=skinPosition*1.65;
      vec3 skinColor=texture2D(skinTex,p.yz).rgb*weights.x+texture2D(skinTex,p.xz).rgb*weights.y+texture2D(skinTex,p.xy).rgb*weights.z;
      skinColor*=vec3(.68,.71,.77);
      ${face ? `
      float nx=skinPosition.x/.43; float ny=(skinPosition.y-.018)/.57;
      vec2 faceUV=vec2(.5-nx*.335,.5+ny*.487);
      float front=(1.0-smoothstep(-.22,.025,skinPosition.z))*(1.0-smoothstep(.76,1.0,abs(nx)));
      skinColor=mix(skinColor,texture2D(faceTex,faceUV).rgb,front);
      ` : ''}
      diffuseColor.rgb*=skinColor;
    `);
  };
  material.customProgramCacheKey = () => `bike-skin-v2-${face}`;
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

