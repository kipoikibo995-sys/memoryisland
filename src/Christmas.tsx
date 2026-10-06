import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box, Post } from './Details';

// Bulbs and the star use unlit colors above 1.0 so only they pass the bloom threshold.
export const BULB_COLORS:[number,number,number][]=[[4,.8,.65],[3.7,2.6,.8],[.9,3.3,1.4],[3.8,3.4,2.5]];
const SNOW='#f4f7f9';

/** A strand of glowing bulbs that twinkle gently, laid along any list of points. */
export function Bulbs({points,size=.011,reduced=false,seed=0,white=false}:{points:THREE.Vector3[];size?:number;reduced?:boolean;seed?:number;white?:boolean}){
  const ref=useRef<THREE.InstancedMesh>(null);
  const base=useMemo(()=>points.map((_,i)=>white?new THREE.Color(3.4,3.1,2.4):new THREE.Color(...BULB_COLORS[(i+seed)%BULB_COLORS.length])),[points,seed,white]);
  useLayoutEffect(()=>{const obj=new THREE.Object3D();points.forEach((p,i)=>{obj.position.copy(p);obj.scale.setScalar(size);obj.updateMatrix();ref.current!.setMatrixAt(i,obj.matrix);ref.current!.setColorAt(i,base[i]);});ref.current!.instanceMatrix.needsUpdate=true;ref.current!.instanceColor!.needsUpdate=true;ref.current!.computeBoundingSphere();},[points,size,base]);
  const color=useMemo(()=>new THREE.Color(),[]);
  useFrame(({clock})=>{if(reduced||!ref.current)return;const t=clock.elapsedTime;base.forEach((c,i)=>{const k=.55+.45*Math.max(0,Math.sin(t*1.7+i*1.9+seed));ref.current!.setColorAt(i,color.copy(c).multiplyScalar(k));});ref.current.instanceColor!.needsUpdate=true;});
  return <instancedMesh ref={ref} args={[undefined,undefined,points.length]}><sphereGeometry args={[1,10,8]}/><meshBasicMaterial toneMapped={false}/></instancedMesh>;
}

function Star(){
  const geometry=useMemo(()=>{const s=new THREE.Shape();for(let i=0;i<10;i++){const r=i%2?.028:.068,a=i/10*Math.PI*2+Math.PI/2;const x=Math.cos(a)*r,y=Math.sin(a)*r;if(i)s.lineTo(x,y);else s.moveTo(x,y);}s.closePath();const g=new THREE.ExtrudeGeometry(s,{depth:.016,bevelEnabled:true,bevelSize:.006,bevelThickness:.006,bevelSegments:1});g.center();return g;},[]);
  const ref=useRef<THREE.Mesh>(null);
  useFrame((_,dt)=>{if(ref.current)ref.current.rotation.y+=dt*.6;});
  return <mesh ref={ref} geometry={geometry}><meshBasicMaterial color={[4.6,3.5,1.2]} toneMapped={false}/></mesh>;
}

/** The island's centrepiece: a snowy fir with baubles, a spiral of lights, a star and gifts. */
export function ChristmasTree({reduced}:{reduced:boolean}){
  const tiers=[{y:.2,r:.27,h:.3},{y:.37,r:.22,h:.26},{y:.52,r:.16,h:.22},{y:.65,r:.1,h:.17}];
  const baubles=useMemo(()=>Array.from({length:30},(_,i)=>{const tier=tiers[i%3],a=i*2.4,t=.2+((i*7)%5)/10;const r=tier.r*(1-t)*1.02,y=tier.y-tier.h/2+tier.h*t;return{p:[Math.cos(a)*r,y,Math.sin(a)*r] as [number,number,number],c:['#c8303a','#d9ae4c','#e8eef2','#b5252f','#2f6fa3'][i%5]};}),[]);
  const lights=useMemo(()=>Array.from({length:64},(_,i)=>{const t=i/63,y=.08+t*.62,r=.29*(1-t)+.03,a=t*Math.PI*2*4.2;return new THREE.Vector3(Math.cos(a)*r,y,Math.sin(a)*r);}),[]);
  return <group>
    <mesh position={[0,.05,0]} castShadow><cylinderGeometry args={[.035,.045,.1,8]}/><meshStandardMaterial color="#6e5038"/></mesh>
    {tiers.map((t,i)=><group key={i}>
      <mesh position={[0,t.y,0]} castShadow receiveShadow><coneGeometry args={[t.r,t.h,14]}/><meshStandardMaterial color={i%2?'#2f6a49':'#285f42'} roughness={.9}/></mesh>
      <mesh position={[0,t.y+t.h*.26,0]} castShadow><coneGeometry args={[t.r*.5,t.h*.5,14]}/><meshStandardMaterial color={SNOW} roughness={.8}/></mesh>
    </group>)}
    {baubles.map((b,i)=><mesh key={i} position={b.p} castShadow><sphereGeometry args={[.017,12,10]}/><meshStandardMaterial color={b.c} roughness={.25} metalness={.35}/></mesh>)}
    <Bulbs points={lights} size={.0085} reduced={reduced}/>
    <group position={[0,.78,0]}><Star/></group>
    {/* Gifts */}
    {[[.2,.11,'#c8303a','#e9c66a',.08],[-.22,.07,'#2f6a49','#f2e9d8',.07],[.06,-.24,'#e9c66a','#c8303a',.065],[-.12,.22,'#2f6fa3','#f2e9d8',.055]].map(([x,z,box,ribbon,s],i)=><group key={i} position={[x as number,(s as number)/2,z as number]} rotation={[0,i*.7,0]}>
      <Box at={[0,0,0]} size={[s as number,s as number,s as number]} color={box as string}/>
      <Box at={[0,0,0]} size={[(s as number)*1.02,(s as number)*1.02,(s as number)*.22]} color={ribbon as string}/>
      <Box at={[0,0,0]} size={[(s as number)*.22,(s as number)*1.02,(s as number)*1.02]} color={ribbon as string}/>
    </group>)}
  </group>;
}

export function Snowman(){return <group>
  <mesh position={[0,.07,0]} castShadow receiveShadow><sphereGeometry args={[.08,20,16]}/><meshStandardMaterial color={SNOW} roughness={.85}/></mesh>
  <mesh position={[0,.18,0]} castShadow><sphereGeometry args={[.058,20,16]}/><meshStandardMaterial color={SNOW} roughness={.85}/></mesh>
  <mesh position={[0,.265,0]} castShadow><sphereGeometry args={[.042,20,16]}/><meshStandardMaterial color={SNOW} roughness={.85}/></mesh>
  <mesh position={[0,.265,.05]} rotation={[Math.PI/2,0,0]}><coneGeometry args={[.009,.045,8]}/><meshStandardMaterial color="#e3772f"/></mesh>
  {[-1,1].map(s=><mesh key={s} position={[s*.015,.278,.036]}><sphereGeometry args={[.0055,8,6]}/><meshStandardMaterial color="#26302c"/></mesh>)}
  {[.2,.17,.14].map(y=><mesh key={y} position={[0,y,.056-(.2-y)*.05]}><sphereGeometry args={[.006,8,6]}/><meshStandardMaterial color="#26302c"/></mesh>)}
  <mesh position={[0,.228,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.04,.011,8,20]}/><meshStandardMaterial color="#c8303a"/></mesh>
  <Box at={[.03,.2,.035]} size={[.016,.06,.008]} color="#c8303a"/>
  <mesh position={[0,.3,0]} castShadow><cylinderGeometry args={[.05,.05,.008,16]}/><meshStandardMaterial color="#26302c"/></mesh>
  <mesh position={[0,.33,0]} castShadow><cylinderGeometry args={[.03,.032,.055,16]}/><meshStandardMaterial color="#26302c"/></mesh>
  {[-1,1].map(s=><mesh key={s} position={[s*.075,.2,0]} rotation={[0,0,s*-1]}><cylinderGeometry args={[.004,.005,.09,5]}/><meshStandardMaterial color="#6e5038"/></mesh>)}
</group>}

/** Sled with a small stack of gifts, used as a little scene prop. */
export function Sled(){return <group>
  {[-1,1].map(s=><Box key={s} at={[s*.06,.012,0]} size={[.012,.012,.26]} color="#a8242d"/>)}
  <Box at={[0,.04,0]} size={[.15,.018,.2]} color="#c8303a"/>
  {[-.07,.07].flatMap(z=>[-1,1].map(s=><Post key={`${z}${s}`} at={[s*.06,.025,z]} height={.03} radius={.005} color="#a8242d"/>))}
  <Box at={[0,.08,-.02]} size={[.07,.06,.07]} color="#2f6a49"/><Box at={[0,.08,-.02]} size={[.072,.062,.016]} color="#e9c66a"/>
  <Box at={[.02,.13,-.02]} size={[.045,.04,.045]} color="#e9c66a"/>
</group>}

/** Gentle snowfall around the planet; static flakes when reduced motion is preferred. */
export function Snowfall({reduced,count=1600}:{reduced:boolean;count?:number}){
  const ref=useRef<THREE.Points>(null);
  const {geometry,speed}=useMemo(()=>{const p=new Float32Array(count*3),speed=new Float32Array(count);for(let i=0;i<count;i++){p[i*3]=(Math.random()-.5)*11;p[i*3+1]=(Math.random()-.5)*10;p[i*3+2]=(Math.random()-.5)*11;speed[i]=.18+Math.random()*.25;}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));return{geometry:g,speed};},[count]);
  const sprite=useMemo(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d')!;const g=x.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.45,'rgba(255,255,255,.85)');g.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=g;x.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return t;},[]);
  useFrame(({clock},dt)=>{if(reduced||!ref.current)return;const a=geometry.attributes.position as THREE.BufferAttribute,p=a.array as Float32Array,t=clock.elapsedTime,step=Math.min(dt,.05);
    for(let i=0;i<count;i++){p[i*3+1]-=speed[i]*step;p[i*3]+=Math.sin(t*.6+i)*.0016;if(p[i*3+1]<-5){p[i*3+1]=5;}}a.needsUpdate=true;});
  return <points ref={ref} geometry={geometry}><pointsMaterial map={sprite} size={.055} sizeAttenuation transparent depthWrite={false} opacity={.95} color="#ffffff"/></points>;
}

/** A small snowy fir wrapped in a few lights, for scattering around landmarks. */
export function MiniFir({reduced=false,seed=0,white=false}:{reduced?:boolean;seed?:number;white?:boolean}){
  const lights=useMemo(()=>Array.from({length:white?22:14},(_,i)=>{const t=i/(white?21:13),r=.14*(1-t)+.02,a=white?i*2.4:t*Math.PI*2*2.6+seed;return new THREE.Vector3(Math.cos(a)*r,.08+t*.34,Math.sin(a)*r);}),[seed,white]);
  return <group>
    <mesh position={[0,.04,0]}><cylinderGeometry args={[.02,.026,.08,6]}/><meshStandardMaterial color="#6e5038"/></mesh>
    {[[.12,.16,.19],[.22,.13,.16],[.31,.095,.13],[.39,.06,.1]].map(([y,r,h],i)=><group key={i}>
      <mesh position={[0,y,0]}><coneGeometry args={[r,h,18]}/><meshStandardMaterial color={i%2?'#2f6a4c':'#285f43'} roughness={.9}/></mesh>
      <mesh position={[0,y+h*.27,0]}><coneGeometry args={[r*.52,h*.48,18]}/><meshStandardMaterial color={SNOW} roughness={.85}/></mesh>
    </group>)}
    <Bulbs points={lights} size={.0075} reduced={reduced} seed={seed} white={white}/>
  </group>;
}

/** Street lantern with a warm glowing pane. */
export function Lantern(){return <group>
  <Post at={[0,.16,0]} height={.32} radius={.008} color="#2d3a35"/>
  <Box at={[0,.335,0]} size={[.05,.05,.05]} color="#2d3a35"/>
  <mesh position={[0,.335,0]}><boxGeometry args={[.038,.042,.054]}/><meshBasicMaterial color={[3.7,2.5,1.1]} toneMapped={false}/></mesh>
  <mesh position={[0,.37,0]}><coneGeometry args={[.042,.03,4]}/><meshStandardMaterial color="#2d3a35"/></mesh>
</group>}

export function Wreath(){return <group rotation={[Math.PI/2,0,0]}>
  <mesh><torusGeometry args={[.07,.024,8,20]}/><meshStandardMaterial color="#2f6a49" roughness={.9}/></mesh>
  <mesh position={[0,-.07,.01]}><sphereGeometry args={[.018,10,8]}/><meshStandardMaterial color="#c8303a"/></mesh>
</group>}

/** Warm, unlit pane used for windows and lamps so they glow through the bloom pass. */
export function Glow({at,size,color=[3.2,2.1,.9]}:{at:[number,number,number];size:[number,number,number];color?:[number,number,number]}){
  return <mesh position={at}><boxGeometry args={size}/><meshBasicMaterial color={color} toneMapped={false}/></mesh>;
}

/** Soft puffs drifting up from a chimney; each puff grows and fades on a loop. */
export function ChimneySmoke({reduced}:{reduced:boolean}){
  const puffs=useRef<(THREE.Mesh|null)[]>([]);
  useFrame(({clock})=>{const t=clock.elapsedTime;puffs.current.forEach((m,i)=>{if(!m)return;const k=reduced?i/6:((t*.22+i/6)%1);m.position.set(Math.sin(k*5+i)*.025+k*.05,k*.34,0);m.scale.setScalar(.02+k*.05);(m.material as THREE.MeshStandardMaterial).opacity=.55*(1-k)*Math.min(1,k*6);});});
  return <group>{Array.from({length:6},(_,i)=><mesh key={i} ref={m=>{puffs.current[i]=m;}}><sphereGeometry args={[1,12,10]}/><meshStandardMaterial color="#eef1f6" transparent depthWrite={false} roughness={1}/></mesh>)}</group>;
}

export function Reindeer({lead=false}:{lead?:boolean}){return <group>
  <mesh position={[0,0,0]} rotation={[Math.PI/2,0,0]} castShadow><capsuleGeometry args={[.045,.11,4,10]}/><meshStandardMaterial color="#8a5a3a"/></mesh>
  <mesh position={[0,.06,.1]} rotation={[-.6,0,0]}><cylinderGeometry args={[.018,.024,.08,8]}/><meshStandardMaterial color="#8a5a3a"/></mesh>
  <mesh position={[0,.1,.13]}><sphereGeometry args={[.032,12,10]}/><meshStandardMaterial color="#9a6844"/></mesh>
  <mesh position={[0,.095,.165]}>{lead?<><sphereGeometry args={[.014,10,8]}/><meshBasicMaterial color={[4.5,.5,.4]} toneMapped={false}/></>:<><sphereGeometry args={[.01,8,6]}/><meshStandardMaterial color="#2b1d16"/></>}</mesh>
  {[-1,1].map(s=><group key={s} position={[s*.018,.13,.12]} rotation={[0,0,s*-.5]}><mesh position={[0,.03,0]}><cylinderGeometry args={[.004,.005,.06,5]}/><meshStandardMaterial color="#e8d6b5"/></mesh><mesh position={[s*-.012,.045,0]} rotation={[0,0,s*.9]}><cylinderGeometry args={[.003,.004,.03,5]}/><meshStandardMaterial color="#e8d6b5"/></mesh></group>)}
  {[[-1,.06],[1,.06],[-1,-.06],[1,-.06]].map(([s,z],i)=><mesh key={i} position={[s*.025,-.06,z]} rotation={[z>0?-.5:.5,0,0]}><cylinderGeometry args={[.007,.006,.07,5]}/><meshStandardMaterial color="#6f4630"/></mesh>)}
</group>}

/** Santa's sleigh and four reindeer circling the island on a tilted orbit. */
export function SantaSleigh({reduced}:{reduced:boolean}){
  const ref=useRef<THREE.Group>(null);
  const tmp=useMemo(()=>({p:new THREE.Vector3(),q:new THREE.Vector3(),tilt:new THREE.Quaternion().setFromEuler(new THREE.Euler(.38,0,.22))}),[]);
  const trail=useMemo(()=>Array.from({length:14},(_,i)=>new THREE.Vector3((Math.random()-.5)*.06,(Math.random()-.5)*.05,-.2-i*.055)),[]);
  const orbit=(a:number,out:THREE.Vector3)=>out.set(Math.cos(a)*3.55,Math.sin(a*2)*.12,Math.sin(a)*3.55).applyQuaternion(tmp.tilt);
  useFrame(({clock})=>{if(!ref.current)return;const a=reduced?1.1:clock.elapsedTime*.16+1.1;orbit(a,tmp.p);orbit(a+.01,tmp.q);ref.current.position.copy(tmp.p);ref.current.up.copy(tmp.p).normalize();ref.current.lookAt(tmp.q);});
  return <group ref={ref} scale={.62}>
    <group position={[0,0,-.06]}>
      {[-1,1].map(s=><mesh key={s} position={[s*.07,-.07,0]} rotation={[Math.PI/2,0,0]}><capsuleGeometry args={[.007,.3,4,8]}/><meshStandardMaterial color="#d9b04c" metalness={.6} roughness={.3}/></mesh>)}
      <Box at={[0,0,0]} size={[.17,.09,.26]} color="#b8232d"/>
      <Box at={[0,.07,-.1]} size={[.17,.1,.05]} color="#b8232d"/>
      <Box at={[0,.048,.01]} size={[.175,.012,.27]} color="#d9b04c"/>
      <mesh position={[0,.08,-.06]} castShadow><sphereGeometry args={[.055,14,12]}/><meshStandardMaterial color="#c8303a"/></mesh>
      <mesh position={[0,.15,-.05]}><sphereGeometry args={[.032,12,10]}/><meshStandardMaterial color="#f2c7a5"/></mesh>
      <mesh position={[0,.13,-.025]}><sphereGeometry args={[.03,12,10]}/><meshStandardMaterial color="#f7f7f4"/></mesh>
      <mesh position={[0,.19,-.06]} rotation={[-.3,0,0]}><coneGeometry args={[.032,.07,12]}/><meshStandardMaterial color="#c8303a"/></mesh>
      <mesh position={[0,.226,-.075]}><sphereGeometry args={[.012,8,6]}/><meshStandardMaterial color="#f7f7f4"/></mesh>
      <mesh position={[0,.08,-.15]}><sphereGeometry args={[.05,12,10]}/><meshStandardMaterial color="#7a5636"/></mesh>
    </group>
    {[[-1,.36],[1,.36],[-1,.62],[1,.62]].map(([s,z],i)=><group key={i} position={[s*.06,.02,z]}><Reindeer lead={i===2}/></group>)}
    {[-1,1].map(s=><mesh key={s} position={[s*.035,.03,.33]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.002,.002,.6,4]}/><meshBasicMaterial color="#d9b04c"/></mesh>)}
    {trail.map((p,i)=><mesh key={i} position={p}><sphereGeometry args={[.012*(1-i/16),6,5]}/><meshBasicMaterial color={[3.2,2.6,1.4]} toneMapped={false} transparent opacity={1-i/15}/></mesh>)}
  </group>;
}
