import { useLayoutEffect, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { trip } from './data/trip';
import type { Memory } from './data/trip';

const R=2.5, up=new THREE.Vector3(0,1,0);
const random=(n:number)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x);};
const direction=([lat,lon]:[number,number])=>new THREE.Vector3(Math.cos(lat*Math.PI/180)*Math.sin(lon*Math.PI/180),Math.sin(lat*Math.PI/180),Math.cos(lat*Math.PI/180)*Math.cos(lon*Math.PI/180));
// Every decoration follows the local curvature instead of sitting on a flat plane.
export function Ground({x=0,z=0,height=.074,children,rotation=0}:{x?:number;z?:number;height?:number;rotation?:number;children:ReactNode}){
  const n=new THREE.Vector3(x,R,z).normalize();
  return <group position={n.clone().multiplyScalar(R+height).sub(new THREE.Vector3(0,R,0))} quaternion={new THREE.Quaternion().setFromUnitVectors(up,n)}><group rotation={[0,rotation,0]} scale={.82}>{children}</group></group>;
}
export function Box({at,size,color,rotation=0}:{at:[number,number,number];size:[number,number,number];color:string;rotation?:number}){return <mesh position={at} rotation={[0,rotation,0]} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color} roughness={.85}/></mesh>;}
export function Post({at,height=.2,radius=.015,color='#8f7052'}:{at:[number,number,number];height?:number;radius?:number;color?:string}){return <mesh position={at} castShadow><cylinderGeometry args={[radius,radius*1.2,height,6]}/><meshStandardMaterial color={color}/></mesh>;}
function Palm(){
  const leaf=useMemo(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([0,0,0,.16,.055,-.065,.16,.095,0,.16,.055,.065,.4,-.09,0],3));g.setIndex([0,2,1,0,3,2,1,2,4,2,3,4]);g.computeVertexNormals();return g;},[]);
  return <group><mesh castShadow position={[.02,.29,0]} rotation={[0,0,-.09]}><cylinderGeometry args={[.023,.042,.59,7]}/><meshStandardMaterial color="#b28b5e" flatShading/></mesh>{[0,1,2,3,4].map(i=><mesh key={i} position={[.048,.60,0]} rotation={[0,i*Math.PI*2/5,.05]} geometry={leaf} castShadow><meshStandardMaterial color={i%2?'#508965':'#78a76a'} side={THREE.DoubleSide} flatShading/></mesh>)}{[0,1,2].map(i=><mesh key={i} position={[.04+Math.cos(i*2)*.035,.555,Math.sin(i*2)*.035]}><icosahedronGeometry args={[.035,1]}/><meshStandardMaterial color="#8c7950"/></mesh>)}</group>;
}
function Chair(){return <group><Box at={[0,.065,0]} size={[.11,.026,.24]} color="#fff0c8"/><mesh position={[0,.14,-.115]} rotation={[-.4,0,0]} castShadow><boxGeometry args={[.11,.18,.024]}/><meshStandardMaterial color="#e49b70"/></mesh>{[-.045,.045].flatMap(x=>[-.09,.08].map(z=><Post key={`${x}${z}`} at={[x,.033,z]} height={.07} radius={.009}/>))}<Box at={[0,.084,.025]} size={[.032,.008,.18]} color="#d99166"/></group>}
function Fence({length=.5}:{length?:number}){return <group>{Array.from({length:6},(_,i)=><Box key={i} at={[(i/5-.5)*length,.075,0]} size={[.026,.15,.027]} color="#f0dfb5"/>)}{[.04,.11].map(y=><Box key={y} at={[0,y,0]} size={[length+.045,.018,.021]} color="#ead7ab"/>)}</group>}
export function FlowerPot(){return <group><mesh position={[0,.04,0]} castShadow><cylinderGeometry args={[.048,.033,.08,7]}/><meshStandardMaterial color="#cc8c64"/></mesh><mesh position={[0,.105,0]}><icosahedronGeometry args={[.066,0]}/><meshStandardMaterial color="#709366"/></mesh>{[0,1,2].map(i=><mesh key={i} position={[Math.cos(i*2)*.04,.15,Math.sin(i*2)*.035]}><icosahedronGeometry args={[.026,0]}/><meshStandardMaterial color={i%2?'#f1cb83':'#e2988c'}/></mesh>)}</group>}
export function Bench(){return <group><Box at={[0,.11,0]} size={[.31,.035,.13]} color="#bd8d58"/><Box at={[0,.23,-.065]} size={[.31,.12,.025]} color="#d1a06b"/>{[-.12,.12].map(x=><group key={x}><Box at={[x,.055,0]} size={[.028,.11,.10]} color="#756952"/><Box at={[x,.18,-.07]} size={[.018,.24,.019]} color="#756952"/></group>)}</group>}
function Windmill({reduced}:{reduced:boolean}){const rotor=useRef<THREE.Group>(null);useFrame((_,dt)=>{if(rotor.current&&!reduced)rotor.current.rotation.z+=dt*.24;});return <group><mesh position={[0,.28,0]} castShadow><cylinderGeometry args={[.095,.15,.56,8]}/><meshStandardMaterial color="#eee4c4" flatShading/></mesh><mesh position={[0,.64,0]} castShadow><coneGeometry args={[.16,.23,8]}/><meshStandardMaterial color="#aa7056"/></mesh><group ref={rotor} position={[0,.46,.12]} rotation={[0,0,.3]}>{[0,1,2,3].map(i=><group key={i} rotation={[0,0,i*Math.PI/2]}><Box at={[0,.19,0]} size={[.022,.39,.02]} color="#77654c"/><Box at={[.042,.24,.013]} size={[.08,.22,.013]} color="#fff3d4"/></group>)}<mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.035,.035,.07,8]}/><meshStandardMaterial color="#976744"/></mesh></group><Box at={[0,.10,.145]} size={[.058,.17,.02]} color="#7b9a88"/></group>}
export function Sailboat({color='#dc8860',scale=1}:{color?:string;scale?:number}){
  const sail=useMemo(()=>{const points:number[]=[],indices:number[]=[];for(let v=0;v<=10;v++)for(let u=0;u<=10;u++){const x=u/10,y=v/10;points.push(.26*x*(1-y),.45*y,.05*Math.sin(x*Math.PI)*Math.sin(y*Math.PI));if(u<10&&v<10){const k=v*11+u;indices.push(k,k+1,k+11,k+1,k+12,k+11);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.setIndex(indices);g.computeVertexNormals();return g;},[]);
  return <group scale={scale}><mesh scale={[.75,.42,1.7]} castShadow><sphereGeometry args={[.19,24,16]}/><meshStandardMaterial color={color} roughness={.75}/></mesh><Box at={[0,.035,0]} size={[.19,.022,.40]} color="#f2d9a3"/><Post at={[0,.29,0]} height={.64} radius={.012}/><mesh geometry={sail} position={[.012,.12,0]} castShadow><meshStandardMaterial color="#fff6d9" side={THREE.DoubleSide}/></mesh><mesh geometry={sail} position={[-.012,.12,0]} rotation={[0,Math.PI,0]} scale={[.58,.75,1]}><meshStandardMaterial color="#dfa16f" side={THREE.DoubleSide}/></mesh><Box at={[0,.62,0]} size={[.014,.03,.04]} color="#bc7654"/></group>;
}
function Tent(){const geometry=useMemo(()=>{const s=new THREE.Shape();s.moveTo(-.19,0);s.lineTo(0,.26);s.lineTo(.19,0);s.closePath();return new THREE.ExtrudeGeometry(s,{depth:.32,bevelEnabled:false});},[]);return <group><mesh geometry={geometry} position={[0,0,-.16]} castShadow><meshStandardMaterial color="#d99b60" flatShading/></mesh><mesh position={[0,.085,.164]} rotation={[0,0,0]}><coneGeometry args={[.118,.19,3]}/><meshStandardMaterial color="#675e45" flatShading/></mesh><Post at={[0,.15,.185]} height={.3} radius={.011} color="#b28a59"/></group>}
export function IslandDetails({kind,reduced}:{kind:Memory['kind'];reduced:boolean}){return <>
  {kind==='beach'&&<><Ground x={-.43} z={-.24}><Palm/></Ground><Ground x={.32} z={-.34} rotation={1}><Palm/></Ground><Ground x={-.03} z={.39} rotation={-.25}><Chair/></Ground><Ground x={.17} z={.39} rotation={-.25}><Chair/></Ground><Ground x={.33} z={.14}><mesh rotation={[0,0,.18]} position={[0,.18,0]}><capsuleGeometry args={[.04,.32,3,8]}/><meshStandardMaterial color="#efc477"/></mesh><Box at={[0,.18,.037]} size={[.016,.27,.012]} color="#fdf0c6"/></Ground><Ground x={-.42} z={.38}><mesh><torusGeometry args={[.07,.021,5,12]}/><meshStandardMaterial color="#db825a"/></mesh></Ground></>}
  {kind==='house'&&<><Ground x={.38} z={.12} rotation={Math.PI/2}><Fence length={.45}/></Ground><Ground x={.1} z={-.37}><Fence length={.48}/></Ground><Ground x={-.25} z={.21}><FlowerPot/></Ground><Ground x={.25} z={.25}><FlowerPot/></Ground><Ground x={-.34} z={.42} rotation={.4}><Bench/></Ground><group rotation={[0,-.3,0]} position={[0,.075,0]} scale={.82}><Box at={[0,.04,.24]} size={[.48,.07,.13]} color="#d9c7a0"/>{[-.17,.17].map(x=><group key={x}><Box at={[x,.24,.197]} size={[.10,.13,.026]} color="#658d7b"/><Box at={[x,.24,.214]} size={[.057,.092,.008]} color="#badbd1"/><Box at={[x,.24,.220]} size={[.01,.09,.005]} color="#fff1cc"/></group>)}<Box at={[0,.35,.22]} size={[.54,.032,.12]} color="#dfae7b"/></group></>}
  {kind==='hill'&&<><Ground x={-.33} z={-.23} height={.09}><Windmill reduced={reduced}/></Ground><Ground x={.3} z={.3} rotation={-.6}><Bench/></Ground><Ground x={-.24} z={.36}><Post at={[0,.10,0]} height={.2}/><Box at={[.025,.2,0]} size={[.18,.055,.025]} color="#bc9063"/></Ground></>}
  {kind==='harbor'&&<><Ground x={-.43} z={.68} height={.023} rotation={-.45}><Sailboat scale={.82}/></Ground><Ground x={.31} z={1.0} height={.018} rotation={.7}><Sailboat scale={.65} color="#789e9d"/></Ground><Ground x={-.19} z={.21}><Box at={[0,.065,0]} size={[.13,.13,.14]} color="#c79c69"/><Box at={[0,.138,0]} size={[.14,.012,.15]} color="#ddba85"/></Ground><Ground x={.24} z={.27}><mesh rotation={[0,Math.PI/2,0]}><torusGeometry args={[.055,.019,6,14]}/><meshStandardMaterial color="#e8a479"/></mesh></Ground>{[-.19,.19].flatMap(x=>[.34,.65].map(z=><Ground key={`${x}${z}`} x={x} z={z} height={.05}><Post at={[0,.1,0]} height={.23}/></Ground>))}</>}
  {kind==='forest'&&<>{[0,1,2,3,4].map(i=><Ground key={i} x={Math.cos(i*1.25)*.61} z={Math.sin(i*1.25)*.61}><Post at={[0,.18,0]} height={.36} radius={.025}/>{[0,1].map(j=><mesh key={j} position={[0,.29+j*.15,0]} castShadow><coneGeometry args={[.15-j*.025,.33,7]}/><meshStandardMaterial color={j?'#63957a':'#487d69'} flatShading/></mesh>)}</Ground>)}<Ground x={.07} z={.08} rotation={-.3}><Tent/></Ground><Ground x={.1} z={.46}><mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[.09,.025,5,9]}/><meshStandardMaterial color="#9d9c88"/></mesh>{[-.4,.4].map(a=><mesh key={a} rotation={[0,a,Math.PI/2]} position={[0,.025,0]}><cylinderGeometry args={[.021,.025,.13,5]}/><meshStandardMaterial color="#94684c"/></mesh>)}<mesh position={[0,.065,0]}><coneGeometry args={[.025,.09,5]}/><meshStandardMaterial color="#eba358" emissive="#db7e35" emissiveIntensity={.3}/></mesh></Ground><Ground x={-.25} z={.37} rotation={.5}><Bench/></Ground></>}
  {kind==='lighthouse'&&<><group position={[0,.075,0]} scale={.82}>{Array.from({length:10},(_,i)=>{const a=i*Math.PI/5;return <Post key={i} at={[Math.cos(a)*.18,.745,Math.sin(a)*.18]} height={.14} radius={.008} color="#607c77"/>;})}<mesh position={[0,.815,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.18,.008,4,20]}/><meshStandardMaterial color="#607c77"/></mesh>{[.25,.49].map(y=><mesh key={y} position={[0,y,.157]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.025,.025,.02,10]}/><meshStandardMaterial color="#668c92"/></mesh>)}</group><Ground x={.35} z={.17} rotation={.7}><Fence length={.43}/></Ground><Ground x={-.3} z={.02}><mesh scale={[1,.6,.85]}><icosahedronGeometry args={[.19,1]}/><meshStandardMaterial color="#879a95" flatShading/></mesh></Ground></>}
  {[0,1,2].map(i=><Ground key={i} x={Math.cos(i*2.1+.3)*.74} z={Math.sin(i*2.1+.3)*.74} height={.025}><mesh position={[0,.035,0]} scale={[1,.72,.8]} castShadow><icosahedronGeometry args={[.08+i*.025,0]}/><meshStandardMaterial color={i%2?'#9ca99d':'#b3b7a2'} flatShading/></mesh></Ground>)} 
  {Array.from({length:7},(_,i)=><Ground key={i} x={Math.sin(i*.7)*.09} z={.22+i*.064} height={.081}><mesh rotation={[-Math.PI/2,0,i*.6]} scale={[1,.7,1]} receiveShadow><circleGeometry args={[.047,6]}/><meshStandardMaterial color={i%2?'#d8c9a1':'#e9d8ae'}/></mesh></Ground>)}
</>}

export function Shore({size,index}:{size:number;index:number}){
  const geo=useMemo(()=>{const vertices:number[]=[],indices:number[]=[];for(let i=0;i<=72;i++){const a=i/72*Math.PI*2;for(const offset of [1.08,1.28]){const d=size*offset*(1+.13*Math.sin(a*3+index)+.08*Math.cos(a*5+index));const p=new THREE.Vector3(Math.cos(a)*d,R,Math.sin(a)*d).normalize().multiplyScalar(R+.008);vertices.push(p.x,p.y-R,p.z);}if(i<72){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;},[size,index]);
  return <mesh geometry={geo}><meshStandardMaterial color="#a1d9cc" transparent opacity={.55} depthWrite={false} side={THREE.DoubleSide}/></mesh>;
}

// Hundreds of tiny details in three instanced draws, shared across all six islands.
export function GroundCover(){
  const grass=useRef<THREE.InstancedMesh>(null),flowers=useRef<THREE.InstancedMesh>(null),pebbles=useRef<THREE.InstancedMesh>(null);
  const samples=useMemo(()=>trip.memories.flatMap((m,j)=>Array.from({length:38},(_,i)=>{const a=random(i+j*87)*Math.PI*2,d=.35+random(i*13+j)*.31;const q=new THREE.Quaternion().setFromUnitVectors(up,direction(m.position));return {n:new THREE.Vector3(Math.cos(a)*d,R,Math.sin(a)*d).normalize().applyQuaternion(q),seed:i+j*100};})),[]);
  useLayoutEffect(()=>{const obj=new THREE.Object3D();samples.forEach(({n,seed},i)=>{const q=new THREE.Quaternion().setFromUnitVectors(up,n);obj.quaternion.copy(q);obj.position.copy(n).multiplyScalar(R+.075);const s=.7+random(seed)*.5;obj.scale.set(.022*s,.065*s,.022*s);obj.updateMatrix();grass.current!.setMatrixAt(i,obj.matrix);grass.current!.setColorAt(i,new THREE.Color(i%2?'#79995c':'#98af65'));obj.position.copy(n).multiplyScalar(R+.117);obj.scale.setScalar(i%3===0?.020:0);obj.updateMatrix();flowers.current!.setMatrixAt(i,obj.matrix);flowers.current!.setColorAt(i,new THREE.Color(['#f0cc7d','#e9a78f','#fff1c9'][i%3]));obj.position.copy(n).multiplyScalar(R+.056);obj.scale.set(.027,.019,.023);obj.updateMatrix();pebbles.current!.setMatrixAt(i,obj.matrix);});[grass,flowers,pebbles].forEach(r=>{r.current!.instanceMatrix.needsUpdate=true;if(r.current!.instanceColor)r.current!.instanceColor.needsUpdate=true;});},[samples]);
  return <><instancedMesh ref={grass} args={[undefined,undefined,samples.length]}><coneGeometry args={[1,1,3]}/><meshStandardMaterial flatShading/></instancedMesh><instancedMesh ref={flowers} args={[undefined,undefined,samples.length]}><icosahedronGeometry args={[1,0]}/><meshStandardMaterial flatShading/></instancedMesh><instancedMesh ref={pebbles} args={[undefined,undefined,samples.length]}><icosahedronGeometry args={[1,0]}/><meshStandardMaterial color="#c1c3a7" flatShading/></instancedMesh></>;
}
export function SeaDetails({reduced}:{reduced:boolean}){
  const ripple=useMemo(()=>{const p:number[]=[],indices:number[]=[];for(let i=0;i<=16;i++){const x=i/16-.5,z=Math.sin(i/16*Math.PI*2)*.12;for(const side of [-1,1])p.push(x,0,z+side*.04*Math.sin(i/16*Math.PI));if(i<16){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(indices);g.computeVertexNormals();return g;},[]);
  const waves=useRef<THREE.InstancedMesh>(null),birds=useRef<THREE.Group>(null);
  const data=useMemo(()=>Array.from({length:240},(_,i)=>{const y=1-2*(i+.5)/240,a=i*2.399963;return new THREE.Vector3(Math.sqrt(1-y*y)*Math.cos(a),y,Math.sqrt(1-y*y)*Math.sin(a));}).filter(n=>trip.memories.every(m=>n.dot(direction(m.position))<.91)),[]);
  useLayoutEffect(()=>{const obj=new THREE.Object3D();data.forEach((n,i)=>{obj.quaternion.setFromUnitVectors(up,n);obj.rotateY(random(i)*6);obj.position.copy(n).multiplyScalar(R+.013);obj.scale.set(.09+random(i)*.09,1,.055);obj.updateMatrix();waves.current!.setMatrixAt(i,obj.matrix);});waves.current!.instanceMatrix.needsUpdate=true;},[data]);
  useFrame(({clock})=>{if(birds.current&&!reduced)birds.current.rotation.y=clock.elapsedTime*.045;});
  return <><instancedMesh ref={waves} args={[undefined,undefined,data.length]}><primitive object={ripple} attach="geometry"/><meshBasicMaterial color="#d8ece0" side={THREE.DoubleSide} transparent opacity={.36} depthWrite={false}/></instancedMesh><group ref={birds}>{[0,1,2,3,4].map(i=><group key={i} position={[Math.sin(i*1.27)*3.45,1.5+Math.cos(i)*.55,Math.cos(i*1.27)*3.45]} rotation={[0,-i*1.27,.15]}>{[-1,1].map(side=><mesh key={side} position={[side*.065,0,0]} rotation={[0,0,side*.30]}><boxGeometry args={[.14,.015,.04]}/><meshStandardMaterial color="#fff9df"/></mesh>)}</group>)}</group></>;
}

export function GableRoof(){const geometry=useMemo(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-.28,.34,-.24,.28,.34,-.24,0,.57,-.24,-.28,.34,.24,.28,.34,.24,0,.57,.24],3));g.setIndex([0,2,1,3,4,5,0,3,5,0,5,2,1,2,5,1,5,4,0,1,4,0,4,3]);g.computeVertexNormals();return g;},[]);return <group><mesh geometry={geometry} castShadow><meshStandardMaterial color="#c87b56" flatShading/></mesh>{[-1,1].map(side=><mesh key={side} position={[side*.14,.458,.248]} rotation={[0,0,side*-.687]}><boxGeometry args={[.37,.025,.025]}/><meshStandardMaterial color="#f6e2bc"/></mesh>)}<Box at={[0,.575,0]} size={[.028,.025,.51]} color="#ad654d"/>{[-.16,-.06,.06,.16].map(z=><group key={z}>{[-1,1].map(side=><mesh key={side} position={[side*.14,.463,z]} rotation={[0,0,side*-.687]}><boxGeometry args={[.34,.007,.013]}/><meshStandardMaterial color="#dd9970"/></mesh>)}</group>)}</group>}



function FishingBoat({color='#638f9d'}:{color?:string}){return <group>
  <mesh scale={[.8,.48,1.8]} castShadow><sphereGeometry args={[.19,24,16]}/><meshStandardMaterial color={color} roughness={.75}/></mesh>
  <Box at={[0,.045,0]} size={[.21,.025,.43]} color="#e8c897"/>
  <Box at={[0,.135,-.06]} size={[.15,.16,.16]} color="#fff0c8"/>
  <Box at={[0,.23,-.06]} size={[.2,.03,.2]} color="#cc8157"/>
  <Box at={[0,.155,.023]} size={[.10,.062,.008]} color="#79abb0"/>
  {[-1,1].map(side=><Box key={side} at={[side*.077,.15,-.065]} size={[.008,.063,.095]} color="#79abb0"/>)}
  <Post at={[.015,.34,-.085]} height={.22} radius={.009}/>
  <Box at={[.06,.42,-.085]} size={[.10,.046,.012]} color="#dc9562"/>
  <mesh position={[0,.085,.115]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.053,.012,5,12]}/><meshStandardMaterial color="#9b9777"/></mesh>
  {[-1,1].map(side=><mesh key={side} position={[side*.122,.026,.02]} rotation={[0,Math.PI/2,0]}><torusGeometry args={[.033,.009,5,10]}/><meshStandardMaterial color="#576d68"/></mesh>)}
</group>}
function Wake(){return <group>{[-1,1].map(side=><mesh key={side} position={[side*.125,-.035,-.37]} rotation={[-Math.PI/2,0,side*.26]}><planeGeometry args={[.018,.48]}/><meshBasicMaterial color="#d4ece0" transparent opacity={.55} depthWrite={false} side={THREE.DoubleSide}/></mesh>)}<mesh position={[0,-.033,-.43]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.03,.42]}/><meshBasicMaterial color="#eff7e6" transparent opacity={.4} depthWrite={false}/></mesh></group>}
function SailingVessel({index,reduced}:{index:number;reduced:boolean}){
  const ref=useRef<THREE.Group>(null);
  const transform=useMemo(()=>({p:new THREE.Vector3(),forward:new THREE.Vector3(),right:new THREE.Vector3(),basis:new THREE.Matrix4()}),[]);
  useFrame(({clock})=>{
    if(!ref.current)return;
    const t=reduced?0:clock.elapsedTime,phase=index*Math.PI/2+t*.022;
    const a=index<4?(16*Math.sin(phase))*Math.PI/180:(index*70+t*.6)*Math.PI/180;
    const latitude=index<4?(-30+6*Math.cos(phase))*Math.PI/180:-79*Math.PI/180;
    const da=index<4?16*Math.cos(phase):1,dl=index<4?-6*Math.sin(phase):0;
    transform.p.set(Math.cos(latitude)*Math.sin(a),Math.sin(latitude),Math.cos(latitude)*Math.cos(a));
    transform.forward.set(Math.cos(latitude)*Math.cos(a)*da-Math.sin(latitude)*Math.sin(a)*dl,Math.cos(latitude)*dl,-Math.cos(latitude)*Math.sin(a)*da-Math.sin(latitude)*Math.cos(a)*dl).normalize();
    transform.right.crossVectors(transform.p,transform.forward).normalize();
    transform.basis.makeBasis(transform.right,transform.p,transform.forward);
    ref.current.position.copy(transform.p).multiplyScalar(R+.049+(reduced?0:Math.sin(t*1.4+index)*.004));
    ref.current.quaternion.setFromRotationMatrix(transform.basis);
  });
  return <group ref={ref} scale={index%2?.46:.57}>{index%2?<Sailboat color={index===3?'#e3ac6e':'#c17d59'}/>:<FishingBoat color={index===2?'#ca8b67':'#628e9a'}/>}<Wake/></group>;
}
export function SailingFleet({reduced}:{reduced:boolean}){return <>{[0,1,2,3,4,5].map(i=><SailingVessel key={i} index={i} reduced={reduced}/>)}</>}

export function Bushes(){
  const mesh=useRef<THREE.InstancedMesh>(null);
  const data=useMemo(()=>trip.memories.flatMap((m,j)=>Array.from({length:m.kind==='beach'?5:11},(_,i)=>{
    const a=(i/(m.kind==='beach'?5:11))*Math.PI*2+j*.51,d=.39+random(i+j*80)*.25;
    const q=new THREE.Quaternion().setFromUnitVectors(up,direction(m.position));
    return [0,1,2].map(k=>{const n=new THREE.Vector3(Math.cos(a)*d+(k-1)*.048,R,Math.sin(a)*d+Math.sin(k*2)*.037).normalize().applyQuaternion(q);return{n,scale:.045+random(i*14+j*70+k)*.03,seed:i+j+k};});
  }).flat()),[]);
  useLayoutEffect(()=>{const obj=new THREE.Object3D();data.forEach(({n,scale,seed},i)=>{obj.quaternion.setFromUnitVectors(up,n);obj.position.copy(n).multiplyScalar(R+.055+scale*.47);obj.scale.set(scale,scale*.77,scale*.9);obj.updateMatrix();mesh.current!.setMatrixAt(i,obj.matrix);mesh.current!.setColorAt(i,new THREE.Color(['#749565','#8ba76c','#5d886b','#a2b57b'][seed%4]));});mesh.current!.instanceMatrix.needsUpdate=true;mesh.current!.instanceColor!.needsUpdate=true;},[data]);
  return <instancedMesh ref={mesh} args={[undefined,undefined,data.length]} castShadow receiveShadow><icosahedronGeometry args={[1,2]}/><meshStandardMaterial roughness={.95}/></instancedMesh>;
}



