import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Box, Post, Ground } from './Details';
import { Bulbs, Glow, Lantern, MiniFir, Reindeer } from './Christmas';
import type { Memory } from './data/trip';

// Miniature versions of ten European Christmas landmarks. Front faces +z; one unit ≈ the island's small scale.
const SNOW='#f2f6f8';
type V3=[number,number,number];
const hash=(n:number)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};

/** Triangular prism: the gable faces ±z, the ridge runs along z. Flat-shaded. */
function prism(w:number,h:number,d:number){
  const x=w/2,z=d/2,g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute([-x,0,-z,x,0,-z,0,h,-z,-x,0,z,x,0,z,0,h,z],3));
  g.setIndex([0,2,1,3,4,5,0,3,5,0,5,2,1,2,5,1,5,4,0,1,4,0,4,3]);
  const flat=g.toNonIndexed();flat.computeVertexNormals();return flat;
}
export function Roof({w,h,d,at=[0,0,0],color='#9c4a3c',snow=true,rotation=0}:{w:number;h:number;d:number;at?:V3;color?:string;snow?:boolean;rotation?:number}){
  const g=useMemo(()=>prism(w,h,d),[w,h,d]);
  return <group position={at} rotation={[0,rotation,0]}>
    <mesh geometry={g}><meshStandardMaterial color={color} roughness={.8}/></mesh>
    {snow&&<mesh geometry={g} position={[0,.012,0]} scale={[1.07,1,1.05]}><meshStandardMaterial color={SNOW} roughness={.85}/></mesh>}
    {snow&&<Icicles x={w*1.07/2} d={d}/>}
  </group>;
}
/** A fringe of icicles hanging from both eaves of a snowy roof, one draw call per roof. */
function Icicles({x,d}:{x:number;d:number}){
  const ref=useRef<THREE.InstancedMesh>(null),n=Math.max(3,Math.round(d/.02));
  useLayoutEffect(()=>{const o=new THREE.Object3D();let k=0;for(const s of [-1,1])for(let i=0;i<n;i++){const len=.008+hash(i*3+s+d*50)*.02;o.position.set(s*(x+.001),.01-len/2,-d/2+d*(i+.5)/n);o.rotation.set(Math.PI,0,0);o.scale.set(.0035,len,.0035);o.updateMatrix();ref.current!.setMatrixAt(k++,o.matrix);}ref.current!.instanceMatrix.needsUpdate=true;ref.current!.computeBoundingSphere();},[x,d,n]);
  return <instancedMesh ref={ref} args={[undefined,undefined,n*2]}><coneGeometry args={[1,1,5]}/><meshStandardMaterial color="#e6f3ff" roughness={.12} metalness={.1}/></instancedMesh>;
}
/** A grid of lit windows on a facade; a few stay dark so the building feels lived in. */
function Window({at,size:[w,h],lit=true,frame='#efe6d2'}:{at:V3;size:[number,number];lit?:boolean;frame?:string}){return <group position={at}>
  <Box at={[0,0,-.001]} size={[w+.008,h+.008,.005]} color={frame}/>
  {lit?<Glow at={[0,0,.002]} size={[w,h,.002]}/>:<mesh position={[0,0,.002]}><boxGeometry args={[w,h,.002]}/><meshStandardMaterial color="#26304a" roughness={.2} metalness={.3}/></mesh>}
  <mesh position={[0,0,.0035]}><boxGeometry args={[.0022,h,.0015]}/><meshStandardMaterial color={frame}/></mesh>
  <mesh position={[0,h*.12,.0035]}><boxGeometry args={[w,.0022,.0015]}/><meshStandardMaterial color={frame}/></mesh>
  <Box at={[0,-h/2-.0055,.004]} size={[w+.014,.005,.012]} color="#d6cbb5"/>
  <mesh position={[0,-h/2-.002,.004]}><boxGeometry args={[w+.012,.003,.01]}/><meshStandardMaterial color={SNOW}/></mesh>
</group>}
function Windows({w,y,z,cols,rows,gap=.05,size=[.022,.03],seed=0,frame}:{w:number;y:number;z:number;cols:number;rows:number;gap?:number;size?:[number,number];seed?:number;frame?:string}){
  return <>{Array.from({length:cols*rows},(_,i)=>{const c=i%cols,r=Math.floor(i/cols),x=cols>1?-w/2+w*c/(cols-1):0;
    return <Window key={i} at={[x,y+r*gap,z]} size={size} lit={(i*7+seed*3)%5!==0} frame={frame}/>;})}</>;
}
function Spire({at,r,h,color='#3e4652',seg=8}:{at:V3;r:number;h:number;color?:string;seg?:number}){
  return <mesh position={at}><coneGeometry args={[r,h,seg]}/><meshStandardMaterial color={color} roughness={.6}/></mesh>;
}
function Disc({at,r,color,rotation=[0,0,0]}:{at:V3;r:number;color:[number,number,number];rotation?:V3}){
  return <mesh position={at} rotation={rotation}><circleGeometry args={[r,24]}/><meshBasicMaterial color={color} toneMapped={false}/></mesh>;
}
function Figure({color='#c8303a',at=[0,0,0]}:{color?:string;at?:V3}){return <group position={at}>
  <mesh position={[0,.03,0]}><capsuleGeometry args={[.012,.03,4,8]}/><meshStandardMaterial color={color}/></mesh>
  <mesh position={[0,.068,0]}><sphereGeometry args={[.011,10,8]}/><meshStandardMaterial color="#f0c8a8"/></mesh>
  <mesh position={[0,.08,0]}><coneGeometry args={[.011,.018,8]}/><meshStandardMaterial color={color==='#2f6a49'?'#c8303a':'#2f6a49'}/></mesh>
</group>}

/** Market stall with a striped roof (stripes run down the slope) and a glowing counter. */
const STALL_LIGHTS=Array.from({length:8},(_,i)=>new THREE.Vector3(-.095+i*.027,.143-Math.sin(i/7*Math.PI)*.006,.079));
const GOODS=['#c8303a','#e2b75a','#2f6a49','#8a5a3a','#f2e6cf'];
export function Stall({colors=['#c8303a','#f6efe2'],reduced=false}:{colors?:[string,string];reduced?:boolean}){
  const strips=6,d=.15,g=useMemo(()=>prism(.2,.07,d/strips),[]);
  return <group>
    <Bulbs points={STALL_LIGHTS} size={.0055} reduced={reduced} seed={colors[0].length}/>
    {[-.05,-.02,.015,.045].map((x,i)=><mesh key={x} position={[x,.108,.03]}>{i%2?<sphereGeometry args={[.009,10,8]}/>:<boxGeometry args={[.016,.014,.014]}/>}<meshStandardMaterial color={GOODS[i]} roughness={.4}/></mesh>)}
    <Box at={[0,.172,.076]} size={[.08,.022,.006]} color="#3b2b22"/>
    <Box at={[0,.05,0]} size={[.16,.1,.11]} color="#7c5134"/>
    <Glow at={[0,.078,.056]} size={[.14,.022,.004]} color={[3,2,.95]}/>
    {[-.075,.075].map(x=><Post key={x} at={[x,.125,.06]} height={.05} radius={.005} color="#5d3d27"/>)}
    {Array.from({length:strips},(_,i)=><mesh key={i} geometry={g} position={[0,.15,-d/2+d/strips*(i+.5)]}><meshStandardMaterial color={colors[i%2]} roughness={.7}/></mesh>)}
  </group>;
}

/* 1 · Rovaniemi: reindeer, a kota hut and the Arctic Circle line (the cottage and snowman come from World). */
export function Lapland({reduced}:{reduced:boolean}){
  const kota=useMemo(()=>new THREE.ConeGeometry(.13,.24,10,1,true),[]);
  return <>
    <Ground x={.47} z={.28} rotation={-.8}><group position={[0,.1,0]}><Reindeer/></group></Ground>
    <Ground x={.32} z={.42} rotation={-.5}><group position={[0,.1,0]}><Reindeer lead/></group></Ground>
    <Ground x={-.05} z={-.46}><mesh geometry={kota} position={[0,.12,0]}><meshStandardMaterial color="#6d4c35" side={THREE.DoubleSide}/></mesh><mesh position={[0,.205,0]}><coneGeometry args={[.045,.08,10]}/><meshStandardMaterial color={SNOW}/></mesh><Glow at={[0,.045,.105]} size={[.05,.08,.01]}/>{[-1,1].map(s=><Post key={s} at={[s*.02,.25,0]} height={.07} radius={.004} color="#4a3324"/>)}</Ground>
    {Array.from({length:9},(_,i)=><Ground key={i} x={-.62+i*.155} z={.62-i*.02} height={.068}><Box at={[0,.004,0]} size={[.13,.006,.025]} color={i%2?'#2f5f9a':'#f4f7fb'}/></Ground>)}
    <Ground x={.66} z={.5}><Post at={[0,.12,0]} height={.24} radius={.008} color="#3b3f45"/><Box at={[0,.22,0]} size={[.17,.05,.012]} color="#2f5f9a"/><Box at={[0,.22,.007]} size={[.15,.008,.002]} color="#f4f7fb"/></Ground>
    <Ground x={-.5} z={-.12}><MiniFir reduced={reduced} seed={1}/></Ground><Ground x={.52} z={-.3}><MiniFir reduced={reduced} seed={4}/></Ground>
  </>;
}

/* 2 · Tallinn: the medieval Town Hall with its slender tower and Old Thomas on top. */
export function TallinnTownHall(){return <group>
  <Box at={[0,.1,0]} size={[.42,.2,.17]} color="#cfc6b4"/>
  <Roof w={.18} h={.14} d={.44} at={[0,.2,0]} rotation={Math.PI/2} color="#5a463f"/>
  {Array.from({length:5},(_,i)=><Box key={i} at={[-.16+i*.08,.05,.086]} size={[.05,.07,.004]} color="#3d3430"/>)}
  <Windows w={.3} y={.15} z={.087} cols={5} rows={1}/>
  <group position={[-.15,0,-.02]}>
    <mesh position={[0,.29,0]}><cylinderGeometry args={[.045,.05,.18,8]}/><meshStandardMaterial color="#c7bead"/></mesh>
    <mesh position={[0,.39,0]}><cylinderGeometry args={[.06,.06,.016,8]}/><meshStandardMaterial color="#5a463f"/></mesh>
    <mesh position={[0,.43,0]}><cylinderGeometry args={[.034,.04,.07,8]}/><meshStandardMaterial color="#c7bead"/></mesh>
    <mesh position={[0,.49,0]}><cylinderGeometry args={[.022,.028,.05,8]}/><meshStandardMaterial color="#c7bead"/></mesh>
    <Spire at={[0,.58,0]} r={.026} h={.13} color="#3f5f52"/>
    <Box at={[.008,.665,0]} size={[.006,.03,.004]} color="#d9b04c"/>
    <Glow at={[0,.43,.036]} size={[.018,.03,.004]}/>
  </group>
</group>}

/* 3 · Copenhagen: Nyhavn's painted gable houses and a lit Tivoli wheel. */
const NYHAVN=['#e8b84a','#c4473e','#3f6fa0','#e07a3f','#efe2c4','#6f9a7a','#d98fa0'];
export function Nyhavn(){return <group>{NYHAVN.map((c,i)=>{const h=.2+((i*5)%3)*.04,x=-.33+i*.11;return <group key={i} position={[x,0,0]}>
  <Box at={[0,h/2,0]} size={[.1,h,.14]} color={c}/>
  <Roof w={.11} h={.07} d={.15} at={[0,h,0]} color="#7a3b32"/>
  <Windows w={.05} y={.06} z={.071} cols={2} rows={Math.round((h-.06)/.05)} seed={i}/>
  <Box at={[0,.03,.071]} size={[.03,.05,.004]} color="#3b2b22"/>
</group>;})}</group>}
export function TivoliWheel({reduced}:{reduced:boolean}){
  const wheel=useRef<THREE.Group>(null);
  const ring=useMemo(()=>Array.from({length:20},(_,i)=>{const a=i/20*Math.PI*2;return new THREE.Vector3(Math.cos(a)*.15,Math.sin(a)*.15,0);}),[]);
  useFrame((_,dt)=>{if(wheel.current&&!reduced)wheel.current.rotation.z+=dt*.25;});
  return <group>
    {[-1,1].flatMap(z=>[-1,1].map(x=><mesh key={`${x}${z}`} position={[x*.05,.1,z*.03]} rotation={[0,0,x*-.42]}><cylinderGeometry args={[.006,.007,.22,5]}/><meshStandardMaterial color="#f4ead6"/></mesh>))}
    <group ref={wheel} position={[0,.2,0]}>
      <mesh><torusGeometry args={[.15,.006,6,40]}/><meshStandardMaterial color="#f4ead6"/></mesh>
      {Array.from({length:8},(_,i)=><mesh key={i} rotation={[0,0,i*Math.PI/8]}><boxGeometry args={[.3,.004,.004]}/><meshStandardMaterial color="#f4ead6"/></mesh>)}
      <Bulbs points={ring} size={.009} reduced={reduced} seed={2}/>
      {Array.from({length:8},(_,i)=>{const a=i/8*Math.PI*2;return <Box key={i} at={[Math.cos(a)*.15,Math.sin(a)*.15-.018,0]} size={[.03,.026,.03]} color={['#c8303a','#2f6a49','#e2b75a','#3f6fa0'][i%4]}/>;})}
    </group>
  </group>;
}

/* 4 · London: Elizabeth Tower, Nelson's Column, a phone box and a red double-decker. */
export function BigBen(){return <group>
  <Box at={[0,.23,0]} size={[.13,.46,.13]} color="#d3bd86"/>
  {[-1,1].flatMap(a=>[-1,1].map(b=><Box key={`${a}${b}`} at={[a*.062,.23,b*.062]} size={[.014,.46,.014]} color="#c4ad75"/>))}
  <Box at={[0,.525,0]} size={[.16,.13,.16]} color="#d8c28c"/>
  {[0,1,2,3].map(i=><group key={i} rotation={[0,i*Math.PI/2,0]}><Disc at={[0,.525,.081]} r={.048} color={[3.1,2.7,1.8]}/><mesh position={[0,.525,.0815]}><torusGeometry args={[.05,.005,6,24]}/><meshStandardMaterial color="#c9a24d" metalness={.5} roughness={.4}/></mesh><Box at={[0,.536,.083]} size={[.004,.03,.002]} color="#20242a"/><Box at={[.01,.525,.083]} size={[.022,.004,.002]} color="#20242a"/></group>)}
  <Box at={[0,.625,0]} size={[.13,.07,.13]} color="#cdb781"/>
  {[0,1,2,3].map(i=><group key={i} rotation={[0,i*Math.PI/2,0]}><Box at={[0,.625,.066]} size={[.06,.045,.004]} color="#2a2f36"/></group>)}
  <Box at={[0,.592,0]} size={[.168,.008,.168]} color="#c9a24d"/>
  {[-1,1].flatMap(a=>[-1,1].map(b=><Spire key={`${a}${b}`} at={[a*.062,.69,b*.062]} r={.011} h={.07} color="#c9a24d"/>))}
  <Spire at={[0,.71,0]} r={.105} h={.1} seg={4} color="#47535c"/>
  <Spire at={[0,.81,0]} r={.022} h={.12} seg={8} color="#c9a24d"/>
</group>}
export function LondonStreet({reduced}:{reduced:boolean}){return <>
  <Ground x={-.45} z={-.3}><Box at={[0,.03,0]} size={[.12,.06,.12]} color="#c9b98e"/><mesh position={[0,.3,0]}><cylinderGeometry args={[.018,.022,.5,10]}/><meshStandardMaterial color="#d6c79d"/></mesh><Box at={[0,.56,0]} size={[.05,.03,.05]} color="#b7a77d"/><mesh position={[0,.6,0]}><capsuleGeometry args={[.01,.03,4,8]}/><meshStandardMaterial color="#6f7377"/></mesh></Ground>
  <Ground x={-.38} z={.22}><group scale={2.1}><MiniFir reduced={reduced} white/></group></Ground>
  <Ground x={.33} z={.27} rotation={-.4}><Box at={[0,.065,0]} size={[.055,.13,.055]} color="#c8202d"/><Box at={[0,.138,0]} size={[.062,.016,.062]} color="#a81a25"/><Glow at={[0,.08,.0285]} size={[.034,.07,.003]} color={[2.8,2.3,1.4]}/><Box at={[0,.121,.0285]} size={[.04,.01,.003]} color="#f6efe2"/></Ground>
  <Ground x={.42} z={-.22} rotation={.35}><group position={[0,.012,0]}>
    <Box at={[0,.06,0]} size={[.09,.1,.24]} color="#c8202d"/><Box at={[0,.112,0]} size={[.092,.006,.242]} color="#a81a25"/>
    {[.035,.085].map(y=><group key={y}>{[-1,1].map(s=><Glow key={s} at={[s*.046,y,0]} size={[.003,.022,.2]} color={[2.6,2.1,1.2]}/>)}</group>)}
    {[-.08,.08].flatMap(z=>[-1,1].map(s=><mesh key={`${z}${s}`} position={[s*.046,.006,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.016,.016,.012,12]}/><meshStandardMaterial color="#1e2226"/></mesh>))}
  </group></Ground>
</>}

/* 5 · Strasbourg: the pink sandstone cathedral with its famous single spire, and half-timbered houses. */
export function StrasbourgCathedral(){return <group>
  <Box at={[0,.1,-.14]} size={[.18,.2,.4]} color="#cf957f"/>
  <Roof w={.2} h={.12} d={.4} at={[0,.2,-.14]} color="#6b4f49"/>
  <Box at={[0,.19,.1]} size={[.27,.38,.07]} color="#d79e88"/>
  {[-.13,-.045,.045,.13].map(x=><Box key={x} at={[x,.17,.138]} size={[.016,.34,.012]} color="#c88b75"/>)}
  {[-.09,0,.09].map(x=><Spire key={x} at={[x,.405,.136]} r={.009} h={.05} color="#c88b75"/>)}
  {[-.06,.06].map(x=><Box key={x} at={[x,.34,.137]} size={[.04,.06,.004]} color="#6e4038"/>)}
  <Disc at={[0,.26,.136]} r={.048} color={[3.2,1.9,1.4]}/>
  <mesh position={[0,.26,.137]}><torusGeometry args={[.05,.006,6,24]}/><meshStandardMaterial color="#a96d5c"/></mesh>
  {[-.08,0,.08].map(x=><Box key={x} at={[x,.06,.136]} size={[x?.04:.055,x?.09:.11,.004]} color="#4a2f2a"/>)}
  <Glow at={[0,.05,.139]} size={[.03,.06,.003]}/>
  {[-.12,.12].map(x=><Spire key={x} at={[x,.42,.1]} r={.018} h={.08} color="#b97f6b"/>)}
  <group position={[-.075,0,.1]}>
    <Box at={[0,.455,0]} size={[.1,.17,.08]} color="#cf9580"/>
    <Glow at={[0,.47,.041]} size={[.03,.08,.003]} color={[2.6,1.6,1]}/>
    <mesh position={[0,.6,0]}><cylinderGeometry args={[.04,.048,.12,8]}/><meshStandardMaterial color="#c88d79"/></mesh>
    <Spire at={[0,.79,0]} r={.05} h={.26} color="#bf8571"/>
    <mesh position={[0,.93,0]}><sphereGeometry args={[.008,8,6]}/><meshStandardMaterial color="#d9b04c"/></mesh>
  </group>
  <Box at={[.075,.43,.1]} size={[.1,.1,.08]} color="#cf9580"/>
</group>}
export function TimberHouse({color='#f3ead6',roof='#8e3f33'}:{color?:string;roof?:string}){return <group>
  <Box at={[0,.1,0]} size={[.14,.2,.13]} color={color}/>
  {[.06,.13].map(y=><Box key={y} at={[0,y,.066]} size={[.142,.01,.003]} color="#4a3024"/>)}
  {[-.066,-.022,.022,.066].map(x=><Box key={x} at={[x,.1,.066]} size={[.01,.2,.003]} color="#4a3024"/>)}
  {[-1,1].map(s=><mesh key={s} position={[s*.044,.165,.067]} rotation={[0,0,s*.75]}><boxGeometry args={[.008,.075,.003]}/><meshStandardMaterial color="#4a3024"/></mesh>)}
  <Glow at={[-.044,.095,.068]} size={[.026,.03,.003]}/><Glow at={[.044,.095,.068]} size={[.026,.03,.003]}/>
  <Roof w={.16} h={.14} d={.15} at={[0,.2,0]} color={roof}/>
</group>}

/* 6 · Nuremberg: the stepped gable of the Frauenkirche above a square of striped stalls. */
export function Frauenkirche(){return <group>
  <Box at={[0,.12,0]} size={[.3,.24,.12]} color="#c7a184"/>
  {[[.26,.27],[.21,.31],[.16,.35],[.1,.39]].map(([w,y],i)=><Box key={i} at={[0,y,0]} size={[w,.04,.12]} color={i%2?'#bf987b':'#c7a184'}/>)}
  {[-.13,-.105,-.08,.08,.105,.13].map((x,i)=><Spire key={i} at={[x,.31+Math.min(i,5-i)*.04,.04]} r={.01} h={.05} color="#a7826a"/>)}
  <Spire at={[0,.45,0]} r={.022} h={.08} color="#3f5f52"/>
  <Disc at={[0,.3,.061]} r={.03} color={[3,2.4,1.3]}/>
  <Box at={[0,.175,.075]} size={[.11,.012,.04]} color="#8a6a52"/>
  {[-.09,0,.09].map(x=><Glow key={x} at={[x,.08,.061]} size={[.03,.07,.003]}/>)}
</group>}

/* 7 · Prague: the twin black spires of the Týn Church and the astronomical clock. */
function TynSpire({at}:{at:V3}){return <group position={at}>
  <Spire at={[0,.13,0]} r={.045} h={.26} color="#2c2f36"/>
  {[-1,1].flatMap(a=>[-1,1].map(b=><Spire key={`${a}${b}`} at={[a*.032,.06,b*.032]} r={.012} h={.1} color="#2c2f36"/>))}
  <mesh position={[0,.27,0]}><sphereGeometry args={[.01,8,6]}/><meshStandardMaterial color="#d9b04c" metalness={.6} roughness={.3}/></mesh>
</group>}
export function TynChurch(){return <group>
  <Box at={[0,.12,-.14]} size={[.22,.24,.3]} color="#d2c4aa"/>
  <Roof w={.24} h={.15} d={.3} at={[0,.24,-.14]} color="#5b4c45"/>
  {[-.075,.075].map(x=><group key={x}><Box at={[x,.2,.04]} size={[.075,.4,.075]} color="#d2c4aa"/><TynSpire at={[x,.4,.04]}/><Glow at={[x,.3,.078]} size={[.022,.045,.003]}/></group>)}
  <Box at={[0,.17,.06]} size={[.08,.18,.04]} color="#cdbfa4"/>
  <Roof w={.09} h={.08} d={.04} at={[0,.26,.06]} color="#5b4c45" snow={false}/>
  <Glow at={[0,.12,.081]} size={[.03,.06,.003]}/>
</group>}
export function Orloj(){return <group>
  <Box at={[0,.2,0]} size={[.1,.4,.1]} color="#b9ab90"/>
  <Spire at={[0,.46,0]} r={.075} h={.12} seg={4} color="#2c2f36"/>
  <Disc at={[0,.2,.051]} r={.036} color={[.5,.9,2.4]}/>
  <mesh position={[0,.2,.052]}><torusGeometry args={[.037,.006,6,24]}/><meshStandardMaterial color="#d9b04c" metalness={.6} roughness={.35}/></mesh>
  <Disc at={[0,.11,.051]} r={.025} color={[2.6,2,.9]}/>
  <Glow at={[0,.3,.051]} size={[.04,.03,.003]}/>
</group>}

/* 8 · Vienna: the neo-Gothic Rathaus, a skating rink with skaters and a tree of glowing hearts. */
export function Rathaus(){return <group>
  <Box at={[0,.1,0]} size={[.48,.2,.14]} color="#d8cdb5"/>
  <Roof w={.15} h={.07} d={.5} at={[0,.2,0]} rotation={Math.PI/2} color="#56606a"/>
  <Windows w={.4} y={.07} z={.071} cols={9} rows={2} gap={.07} size={[.018,.035]}/>
  <Box at={[0,.2,.04]} size={[.08,.4,.08]} color="#dbd1ba"/>
  <Glow at={[0,.3,.081]} size={[.03,.06,.003]}/>
  <mesh position={[0,.44,.04]}><cylinderGeometry args={[.032,.04,.08,8]}/><meshStandardMaterial color="#cfc4ab"/></mesh>
  <Spire at={[0,.55,.04]} r={.034} h={.15} color="#56606a"/>
  <mesh position={[0,.64,.04]}><capsuleGeometry args={[.006,.016,4,6]}/><meshStandardMaterial color="#d9b04c" metalness={.6} roughness={.3}/></mesh>
  {[-.21,-.14,.14,.21].map(x=><group key={x}><Box at={[x,.15,.04]} size={[.04,.3,.04]} color="#d3c8af"/><Spire at={[x,.34,.04]} r={.028} h={.08} color="#56606a"/></group>)}
</group>}
export function IceRink({reduced}:{reduced:boolean}){
  const skaters=useRef<THREE.Group>(null);
  useFrame((_,dt)=>{if(skaters.current&&!reduced)skaters.current.rotation.y-=dt*.45;});
  return <group>
    <mesh position={[0,.01,0]} scale={[1,1,.62]}><cylinderGeometry args={[.27,.27,.008,48]}/><meshStandardMaterial color="#dcefff" roughness={.08} metalness={.15}/></mesh>
    <mesh position={[0,.016,0]} scale={[1,1,.62]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.275,.009,6,48]}/><meshStandardMaterial color={SNOW}/></mesh>
    <group ref={skaters} scale={[1,1,.62]}>{[0,1,2,3].map(i=>{const a=i/4*Math.PI*2+i*.3,r=.12+(i%2)*.08;return <group key={i} position={[Math.cos(a)*r,.01,Math.sin(a)*r]} rotation={[0,-a,0]} scale={[1,1,1/.62]}><Figure color={['#c8303a','#2f6a49','#3f6fa0','#e2b75a'][i]}/></group>;})}</group>
  </group>;
}
export function HeartTree({reduced}:{reduced:boolean}){
  const heart=useMemo(()=>{const s=new THREE.Shape();s.moveTo(0,-.02);s.bezierCurveTo(-.04,.005,-.025,.03,0,.015);s.bezierCurveTo(.025,.03,.04,.005,0,-.02);const g=new THREE.ExtrudeGeometry(s,{depth:.006,bevelEnabled:false});g.center();return g;},[]);
  const spots=useMemo(()=>Array.from({length:9},(_,i)=>{const a=i*2.4,y=.12+(i%3)*.08,r=.1-(i%3)*.025;return [Math.cos(a)*r,y,Math.sin(a)*r] as V3;}),[]);
  const group=useRef<THREE.Group>(null);
  useFrame(({clock})=>{if(group.current&&!reduced)group.current.rotation.y=Math.sin(clock.elapsedTime*.5)*.2;});
  return <group>
    <mesh position={[0,.12,0]}><cylinderGeometry args={[.012,.02,.24,6]}/><meshStandardMaterial color="#5a4030"/></mesh>
    {[[.03,.18,.4],[-.04,.2,-.5],[.0,.24,.1]].map(([x,y,r],i)=><mesh key={i} position={[x,y,0]} rotation={[0,0,r]}><cylinderGeometry args={[.004,.007,.12,5]}/><meshStandardMaterial color="#5a4030"/></mesh>)}
    <group ref={group}>{spots.map((p,i)=><mesh key={i} geometry={heart} position={p} rotation={[0,i,0]}><meshBasicMaterial color={i%2?[3.6,.7,.9]:[3.4,2.4,1.2]} toneMapped={false} side={THREE.DoubleSide}/></mesh>)}</group>
  </group>;
}

/* 9 · Oberndorf: the octagonal Silent Night Chapel, carollers with candles and rising notes. */
export function SilentNightChapel(){return <group>
  <mesh position={[0,.11,0]}><cylinderGeometry args={[.12,.12,.22,8]}/><meshStandardMaterial color="#efe9dc" roughness={.9}/></mesh>
  <mesh position={[0,.27,0]}><coneGeometry args={[.15,.11,8]}/><meshStandardMaterial color="#6b5a4e"/></mesh>
  <mesh position={[0,.282,0]}><coneGeometry args={[.13,.09,8]}/><meshStandardMaterial color={SNOW}/></mesh>
  <mesh position={[0,.35,0]}><cylinderGeometry args={[.028,.03,.06,8]}/><meshStandardMaterial color="#efe9dc"/></mesh>
  <mesh position={[0,.405,0]}><sphereGeometry args={[.034,10,8,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color="#556b55"/></mesh>
  <Box at={[0,.47,0]} size={[.006,.05,.006]} color="#d9b04c"/><Box at={[0,.48,0]} size={[.03,.006,.006]} color="#d9b04c"/>
  {Array.from({length:8},(_,i)=><group key={i} rotation={[0,i*Math.PI/4+Math.PI/8,0]}>{i===2?<Box at={[0,.06,.112]} size={[.045,.1,.01]} color="#5a3c2a"/>:<Glow at={[0,.13,.112]} size={[.028,.06,.006]}/>}</group>)}
</group>}
export function Carollers(){return <>{Array.from({length:6},(_,i)=>{const a=(i/5-.5)*1.6;return <group key={i} position={[Math.sin(a)*.3,0,Math.cos(a)*.3]} rotation={[0,a+Math.PI,0]}>
  <Figure color={['#2f6a49','#c8303a','#3f6fa0'][i%3]}/>
  <Glow at={[.014,.05,-.012]} size={[.004,.012,.004]} color={[3.6,2.4,1]}/>
</group>;})}</>}
export function MusicNotes({reduced}:{reduced:boolean}){
  const notes=useRef<(THREE.Group|null)[]>([]);
  useFrame(({clock})=>{const t=clock.elapsedTime;notes.current.forEach((g,i)=>{if(!g)return;const k=reduced?i/5:((t*.12+i/5)%1);g.position.set(Math.sin(k*6+i*2)*.08+(i-2)*.03,.3+k*.45,Math.cos(i)*.05);g.scale.setScalar(Math.sin(k*Math.PI)*1.1);});});
  return <>{Array.from({length:5},(_,i)=><group key={i} ref={g=>{notes.current[i]=g;}}>
    <mesh scale={[1.25,1,1]}><sphereGeometry args={[.012,10,8]}/><meshBasicMaterial color={[3,2.4,1]} toneMapped={false}/></mesh>
    <mesh position={[.012,.03,0]}><boxGeometry args={[.003,.06,.003]}/><meshBasicMaterial color={[3,2.4,1]} toneMapped={false}/></mesh>
    {i%2===0&&<mesh position={[.022,.055,0]} rotation={[0,0,-.5]}><boxGeometry args={[.022,.004,.003]}/><meshBasicMaterial color={[3,2.4,1]} toneMapped={false}/></mesh>}
  </group>)}</>;
}

/* 10 · Zermatt: wooden chalets with balconies beneath a miniature Matterhorn. */
export function Matterhorn(){
  // A twisted, rock-faceted cone: jittered vertices give craggy faces, and snow settles on high or upward-facing facets.
  const rock=useMemo(()=>{const g=new THREE.ConeGeometry(.34,.95,8,16).toNonIndexed();const p=g.attributes.position,v=new THREE.Vector3();
    for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const y=v.y+.475,k=y/.95,key=Math.round(v.x*500)*7+Math.round(v.y*500)*13+Math.round(v.z*500)*17,j=k>.98?0:(hash(key)-.5)*.045*(1-k*.6);
      p.setXYZ(i,v.x*(1+j*6)+k*k*.09,v.y+j*.4,v.z*(1-.18*k)*(1+j*6));}
    g.computeVertexNormals();const nrm=g.attributes.normal,colors:number[]=[],c=new THREE.Color(),stone=new THREE.Color('#7b7f86'),dark=new THREE.Color('#5f636b'),snow=new THREE.Color(SNOW);
    for(let f=0;f<p.count;f+=3){const k=(p.getY(f)+p.getY(f+1)+p.getY(f+2))/3/.95+.5,up=(nrm.getY(f)+nrm.getY(f+1)+nrm.getY(f+2))/3;
      const cover=THREE.MathUtils.clamp((k-.42)*3.2+(up-.35)*1.8+(hash(f)-.5)*.6,0,1);c.copy(hash(f+1)>.5?stone:dark).lerp(snow,cover>.5?1:cover*.4);for(let q=0;q<3;q++)colors.push(c.r,c.g,c.b);}
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));return g;},[]);
  return <mesh geometry={rock} position={[0,.475,0]}><meshStandardMaterial vertexColors roughness={.92} flatShading/></mesh>;
}
export function Chalet({seed=0}:{seed?:number}){return <group>
  <Box at={[0,.03,0]} size={[.19,.06,.16]} color="#8f8a80"/>
  <Box at={[0,.12,0]} size={[.19,.12,.16]} color="#6b4428"/>
  <Roof w={.26} h={.07} d={.21} at={[0,.18,0]} color="#4a3324"/>
  <Box at={[0,.112,.09]} size={[.2,.01,.03]} color="#5a3a24"/>
  {Array.from({length:7},(_,i)=><Box key={i} at={[-.09+i*.03,.13,.103]} size={[.006,.03,.004]} color="#5a3a24"/>)}
  <Box at={[0,.145,.103]} size={[.2,.006,.004]} color="#5a3a24"/>
  <Windows w={.1} y={.16} z={.081} cols={3} rows={1} seed={seed}/>
  <Windows w={.08} y={.035} z={.081} cols={2} rows={1} seed={seed+2}/>
</group>}

/** Props spread across each city's plateau; Ground keeps every piece on the curved surface. */
export function CityDetails({kind,reduced}:{kind:Memory['kind'];reduced:boolean}){
  const fir=(x:number,z:number,scale=1,seed=0)=><Ground x={x} z={z}><group scale={scale}><MiniFir reduced={reduced} seed={seed}/></group></Ground>;
  switch(kind){
    case 'lapland':return <Lapland reduced={reduced}/>;
    case 'tallinn':return <><Ground x={.5} z={-.2} rotation={-.45}><TallinnTownHall/></Ground><Ground x={-.52} z={.08} rotation={1}><Stall reduced={reduced}/></Ground><Ground x={-.44} z={.32} rotation={.7}><Stall reduced={reduced} colors={['#2f6a49','#f6efe2']}/></Ground></>;
    case 'nyhavn':return <><Ground z={-.42}><Nyhavn/></Ground><Ground x={-.55} z={.05} rotation={.6}><TivoliWheel reduced={reduced}/></Ground></>;
    case 'london':return <LondonStreet reduced={reduced}/>;
    case 'strasbourg':return <><Ground x={.46} z={.04} rotation={-.6}><TimberHouse/></Ground><Ground x={.4} z={.3} rotation={-.95}><TimberHouse color="#f0dcc0" roof="#7c3a30"/></Ground><Ground x={-.46} z={-.16} rotation={.6}><TimberHouse color="#efe4cf"/></Ground>{fir(-.42,.3,2,3)}<Ground x={.06} z={.46}><Stall reduced={reduced}/></Ground><Ground x={-.16} z={.47} rotation={.2}><Stall reduced={reduced} colors={['#2f6a49','#f6efe2']}/></Ground></>;
    case 'nuremberg':return <>{[-.25,0,.25].flatMap(x=>[.06,.32].map(z=><Ground key={`${x}${z}`} x={x} z={z}><Stall reduced={reduced}/></Ground>))}{fir(-.5,-.2,1.4,1)}{fir(.5,-.18,1.4,2)}</>;
    case 'prague':return <><Ground x={.46} z={-.12} rotation={-.4}><Orloj/></Ground>{fir(-.46,-.06,1.9,2)}<Ground x={-.28} z={.34} rotation={.35}><Stall reduced={reduced} colors={['#2f6a49','#f6efe2']}/></Ground><Ground x={.04} z={.42}><Stall reduced={reduced}/></Ground><Ground x={.34} z={.3} rotation={-.4}><Stall reduced={reduced} colors={['#3f6fa0','#f6efe2']}/></Ground></>;
    case 'vienna':return <><Ground z={.28}><IceRink reduced={reduced}/></Ground><Ground x={-.48} z={.1}><HeartTree reduced={reduced}/></Ground><Ground x={.48} z={.12}><HeartTree reduced={reduced}/></Ground><Ground x={-.5} z={-.22} rotation={.5}><Stall reduced={reduced}/></Ground><Ground x={.5} z={-.22} rotation={-.5}><Stall reduced={reduced} colors={['#2f6a49','#f6efe2']}/></Ground></>;
    case 'silentnight':return <>{[[-.36,.18],[.36,.2],[-.12,.4],[.14,.42]].map(([x,z])=><Ground key={`${x}${z}`} x={x} z={z}><Lantern/></Ground>)}{fir(-.45,-.25,1.3,1)}{fir(.46,-.2,1.3,3)}</>;
    case 'zermatt':return <><Ground x={-.32} z={.16} rotation={.35}><Chalet/></Ground><Ground x={.06} z={.34}><Chalet seed={2}/></Ground><Ground x={.4} z={.1} rotation={-.4}><Chalet seed={4}/></Ground>{fir(-.52,-.1,1.2,2)}{fir(.55,-.25,1.2,4)}<Ground x={-.12} z={.55}><Lantern/></Ground></>;
  }
}
