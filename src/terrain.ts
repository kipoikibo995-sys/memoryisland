import * as THREE from 'three';
import { trip } from './data/trip';
export const PLANET_RADIUS=2.5;
export const UP=new THREE.Vector3(0,1,0);
export function geo([lat,lon]:[number,number]){const a=lat*Math.PI/180,b=lon*Math.PI/180;return new THREE.Vector3(Math.cos(a)*Math.sin(b),Math.sin(a),Math.cos(a)*Math.cos(b));}
export function random(seed:number){const x=Math.sin(seed*127.1+311.7)*43758.5453123;return x-Math.floor(x);}
const smooth=(a:number,b:number,x:number)=>{const t=THREE.MathUtils.clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
export function noise(x:number,y:number,z:number){const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z);const fx=smooth(0,1,x-ix),fy=smooth(0,1,y-iy),fz=smooth(0,1,z-iz);const h=(dx:number,dy:number,dz:number)=>random((ix+dx)*17.17+(iy+dy)*73.71+(iz+dz)*117.13);const l=THREE.MathUtils.lerp;return l(l(l(h(0,0,0),h(1,0,0),fx),l(h(0,1,0),h(1,1,0),fx),fy),l(l(h(0,0,1),h(1,0,1),fx),l(h(0,1,1),h(1,1,1),fx),fy),fz);}
export const memoryNormals=trip.memories.map(m=>geo(m.position));
const continents=[{n:geo([27,3]),radius:1.04},{n:geo([46,-57]),radius:.77},{n:geo([9,145]),radius:1.02},{n:geo([-23,-110]),radius:.81}];
const peaks=[{n:geo([68,-26]),height:.62,width:.021},{n:geo([30,77]),height:.42,width:.021},{n:geo([8,111]),height:.37,width:.032},{n:geo([-32,-142]),height:.32,width:.029}];
const bay=geo([-30,0]),lake=geo([12,-16]);
export function angle(a:THREE.Vector3,b:THREE.Vector3){return Math.acos(THREE.MathUtils.clamp(a.dot(b),-1,1));}
export function terrainHeight(n:THREE.Vector3){
  const coarse=noise(n.x*4+3,n.y*4+9,n.z*4+6),detail=noise(n.x*13+7,n.y*13+1,n.z*13+3);
  let field=-2;for(const c of continents)field=Math.max(field,c.radius-angle(n,c.n));
  field+=(coarse-.5)*.20+(detail-.5)*.055;
  for(let i=0;i<memoryNormals.length;i++)field=Math.max(field,.285-angle(n,memoryNormals[i]));
  // Two real water cutouts: a sheltered southern bay and a lake crossed by a timber bridge.
  field=Math.min(field,angle(n,bay)-.38,angle(n,lake)-.145);
  if(field<0)return Math.max(-.12,field*.5);
  const coast=smooth(0,.085,field);
  let h=.018*smooth(0,.035,field)+coast*(.058+(coarse-.35)*.12+(detail-.5)*.03);
  for(const p of peaks){const a=angle(n,p.n);h+=p.height*Math.exp(-a*a/p.width)*coast*(.88+detail*.2);}
  let nearest=2;for(const m of memoryNormals)nearest=Math.min(nearest,angle(n,m));
  h=THREE.MathUtils.lerp(.064*coast,h,smooth(.16,.34,nearest));
  return h;
}
export function surface(n:THREE.Vector3,offset=0){return n.clone().multiplyScalar(PLANET_RADIUS+Math.max(terrainHeight(n),0)+offset);}
export const roadPairs:[[number,number],[number,number],[number,number],[number,number],[number,number],[number,number],[number,number]]=[[0,1],[1,2],[0,2],[1,7],[4,6],[4,8],[5,9]];
export const roadSamples=roadPairs.flatMap(([a,b])=>Array.from({length:52},(_,i)=>{const t=i/51;const n=memoryNormals[a].clone().lerp(memoryNormals[b],t).normalize();return {n,t,pair:a};})).filter(p=>terrainHeight(p.n)>.024);
export function nearRoad(n:THREE.Vector3){return roadSamples.some(p=>n.dot(p.n)>.9996);}
export function nearMemory(n:THREE.Vector3,radius=.255){return memoryNormals.some(m=>n.dot(m)>Math.cos(radius));}
