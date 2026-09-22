// Rest pose and sculpt volumes shared by the baked organic mesh and animation rig.
export const limbs = [-1,1].flatMap(side=>[
  {kind:'arm',side,start:[side*.47,2.17,-.83],middle:[side*.43,1.52,-1.13],end:[side*.23,.88,-1.35]},
  {kind:'leg',side,start:[side*.35,2.1,.91],middle:[side*.43,1.38,1.15],end:[side*.36,.78,.48]},
]);
export function sculptParts(){
 const parts=[];
 const ell=(center,radii,bone=0,axis=[0,1,0])=>parts.push({center,radii,bone,axis});
 const segment=(a,b,radius,depth,bone,extend=.09)=>{const delta=b.map((n,i)=>n-a[i]),length=Math.hypot(...delta);ell(a.map((n,i)=>(n+b[i])/2),[radius,length/2+extend,depth],bone,delta.map(n=>n/length));};
 ell([0,2.17,-.04],[.40,.32,1.01]);ell([0,2.17,-.61],[.51,.37,.46]);ell([0,2.14,.37],[.34,.28,.49]);ell([0,2.13,.86],[.43,.32,.37]);
 segment([0,2.28,-.78],[0,2.71,-1.12],.29,.28,0,.12);
 for(const side of [-1,1]){
  ell([side*.23,1.97,-.66],[.28,.19,.32]); // pectorals
  ell([side*.26,2.34,-.25],[.25,.19,.54]); // trapezius and lats
  ell([side*.25,2.17,.94],[.27,.29,.29]);
 }
 limbs.forEach((l,index)=>{
  const upper=1+index*3,lower=upper+1,tip=upper+2,{start:a,middle:b,end:c}=l;
  if(l.kind==='arm'){
   ell(a,[.275,.30,.285],upper);
   segment(a,b,.161,.177,upper,.10);
   ell(a.map((n,i)=>n*.46+b[i]*.54+(i===2?-.08:0)),[.177,.275,.193],upper); // biceps/triceps blend into shoulder
   ell(b,[.118,.14,.13],lower);
   segment(b,c,.109,.127,lower,.09);
   ell(b.map((n,i)=>n*.68+c[i]*.32),[.158,.225,.145],lower,b.map((n,i)=>c[i]-n).map((n,_,d)=>n/Math.hypot(...d)));
   ell(c,[.12,.125,.14],tip);
   for(let t=0;t<4;t++)ell([c[0]+(t-1.5)*.047,c[1]-.018,c[2]-.11],[.028,.074,.062],tip);
  }else{
   segment(a,b,.24,.245,upper,.17);
   ell(b,[.137,.16,.146],lower);
   segment(b,c,.108,.113,lower,.12);
   const delta=c.map((n,i)=>n-b[i]);ell(b.map((n,i)=>n*.68+c[i]*.32),[.147,.285,.158],lower,delta.map(n=>n/Math.hypot(...delta)));
   ell(c.map((n,i)=>n+(i===2?-.115:i===1?.035:0)),[.132,.104,.218],tip);
   for(let t=0;t<5;t++)ell([c[0]+(t-2)*.044,c[1]+.02,c[2]-.30],[.027,.046,.072-t*.005],tip);
  }
 });return parts;
}
