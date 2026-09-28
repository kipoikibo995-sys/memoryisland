import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { geo, PLANET_RADIUS as R, UP, random, terrainHeight } from './terrain';

/** Small details share geometry and materials; repeated roof tiles use one draw call. */
function RoofTiles(){
  const ref=useRef<THREE.InstancedMesh>(null);
  const geometry=useMemo(()=>{
    const positions:number[]=[],indices:number[]=[];
    for(let x=0;x<2;x++)for(let j=0;j<=8;j++){const z=(j/8-.5)*.044;positions.push((x-.5)*.069,.005*Math.cos((j/8-.5)*Math.PI),z);if(x===0&&j<8)indices.push(j,j+9,j+1,j+1,j+9,j+10);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
  },[]);
  useLayoutEffect(()=>{const obj=new THREE.Object3D();let i=0;for(const side of [-1,1])for(let row=0;row<6;row++)for(let col=0;col<12;col++){
    const x=side*(.026+row*.045);obj.position.set(x,.579-Math.abs(x)*.821,(col-5.5)*.040);obj.rotation.set(0,0,-side*.687);obj.updateMatrix();ref.current!.setMatrixAt(i,obj.matrix);ref.current!.setColorAt(i,new THREE.Color(['#c48765','#cf9370','#b7795b','#d39a75'][Math.floor(random(i+13)*4)]));i++;
  }ref.current!.instanceMatrix.needsUpdate=true;ref.current!.instanceColor!.needsUpdate=true;ref.current!.computeBoundingSphere();},[]);
  return <instancedMesh ref={ref} args={[geometry,undefined,144]} castShadow receiveShadow><meshStandardMaterial roughness={.95} side={THREE.DoubleSide}/></instancedMesh>;
}
function Cord({points,radius=.003,color='#b4a079'}:{points:[number,number,number][];radius?:number;color?:string}){
  const geometry=useMemo(()=>new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),20,radius,5,false),[points,radius]);
  return <mesh geometry={geometry}><meshStandardMaterial color={color} roughness={1}/></mesh>;
}
function Lantern(){return <group>
  <mesh position={[0,.025,0]}><boxGeometry args={[.034,.050,.026]}/><meshStandardMaterial color="#ffe8af" emissive="#e8b768" emissiveIntensity={.35} roughness={.35}/></mesh>
  {[-.022,.022].flatMap(x=>[-.017,.017].map(z=><mesh key={`${x}${z}`} position={[x,.026,z]}><cylinderGeometry args={[.0025,.0025,.065,5]}/><meshStandardMaterial color="#586458"/></mesh>))}
  {[0,.058].map(y=><mesh key={y} position={[0,y,0]}><boxGeometry args={[.049,.007,.039]}/><meshStandardMaterial color="#69735c"/></mesh>)}
  <mesh position={[0,.073,0]}><torusGeometry args={[.011,.0025,5,12]}/><meshStandardMaterial color="#69735c"/></mesh>
</group>}
export function CottageCraft(){return <>
  <RoofTiles/>
  <mesh position={[0,.425,.247]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.034,.034,.013,20]}/><meshStandardMaterial color="#6e9692" roughness={.28}/></mesh>
  <mesh position={[0,.425,.256]}><torusGeometry args={[.036,.005,6,24]}/><meshStandardMaterial color="#f4dfb5"/></mesh>
  <mesh position={[0,.425,.260]}><boxGeometry args={[.003,.060,.004]}/><meshStandardMaterial color="#f4dfb5"/></mesh>
  <mesh position={[0,.425,.260]}><boxGeometry args={[.060,.003,.004]}/><meshStandardMaterial color="#f4dfb5"/></mesh>
  {[-.17,.17].flatMap(x=>[-.074,.074].map(offset=><group key={`${x}${offset}`} position={[x+offset,.24,.212]}>{[0,1,2,3,4,5].map(i=><mesh key={i} position={[0,(i-2.5)*.017,0]} rotation={[.18,0,0]}><boxGeometry args={[.027,.008,.011]}/><meshStandardMaterial color={i%2?'#698a71':'#7b9980'}/></mesh>)}</group>))}
  <group position={[.12,.235,.226]}><Lantern/></group>
  <mesh position={[.066,.123,.195]}><sphereGeometry args={[.007,10,8]}/><meshStandardMaterial color="#c1a161" metalness={.5} roughness={.4}/></mesh>
  <mesh position={[.16,.555,-.06]}><boxGeometry args={[.084,.018,.085]}/><meshStandardMaterial color="#e6d5b4"/></mesh>
  <mesh position={[.16,.566,-.06]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.039,.033]}/><meshStandardMaterial color="#5c655b"/></mesh>
  {[-.045,.035].map(x=><Cord key={x} points={[[x,.055,.17],[x,.044,.265],[x,.023,.34]]} radius={.002} color="#ad9773"/>)}
</>}
export function HarborCraft(){
  const net=useMemo(()=>{const positions:number[]=[];for(let i=0;i<=9;i++)for(let j=0;j<9;j++){
    const at=(u:number,v:number)=>new THREE.Vector3(-.27+u*.18,.115-.038*Math.sin(u*Math.PI)*Math.sin(v*Math.PI),.27+v*.19);
    for(const [a,b] of [[at(i/9,j/9),at(i/9,(j+1)/9)],[at(j/9,i/9),at((j+1)/9,i/9)]])positions.push(...a.toArray(),...b.toArray());
  }const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));return g;},[]);
  return <group rotation={[0,-.3,0]}>
    {[-.12,.12].flatMap(x=>[.32,.8].map(z=><group key={`${x}${z}`} position={[x,.02,z]}>{[0,1,2].map(i=><mesh key={i} rotation={[Math.PI/2,0,0]} position={[0,i*.007,0]}><torusGeometry args={[.026,.003,5,16]}/><meshStandardMaterial color="#d4c099"/></mesh>)}</group>))}
    <Cord points={[[.12,.043,.32],[.21,-.015,.47],[.33,-.006,.55]]}/><Cord points={[[-.12,.044,.8],[-.23,-.013,.68],[-.34,-.004,.64]]}/>
    <lineSegments geometry={net}><lineBasicMaterial color="#849280" transparent opacity={.8}/></lineSegments>
    <group position={[-.18,.018,.52]}><mesh position={[0,.045,0]}><cylinderGeometry args={[.034,.03,.075,14,1,true]}/><meshStandardMaterial color="#8ea7a0" side={THREE.DoubleSide} metalness={.15} roughness={.65}/></mesh><mesh position={[0,.083,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.034,.003,5,20]}/><meshStandardMaterial color="#d1d7be"/></mesh><Cord points={[[-.034,.076,0],[0,.126,0],[.034,.076,0]]} radius={.002} color="#788c83"/></group>
    <group position={[-.13,.065,.24]} scale={.8}><Lantern/></group>
  </group>;
}
export function LakesideLife(){
  const pads=useRef<THREE.InstancedMesh>(null),stems=useRef<THREE.InstancedMesh>(null),heads=useRef<THREE.InstancedMesh>(null);
  const data=useMemo(()=>{const q=new THREE.Quaternion().setFromUnitVectors(UP,geo([12,-16]));return {
    pads:Array.from({length:24},(_,i)=>{const a=i*2.4,d=.18+random(i+23)*.14;return new THREE.Vector3(Math.cos(a)*d,R,Math.sin(a)*d).normalize().applyQuaternion(q);}).filter(n=>terrainHeight(n)<0),
    reeds:Array.from({length:90},(_,i)=>{const a=i*2.399,d=.345+random(i+11)*.052;return new THREE.Vector3(Math.cos(a)*d,R,Math.sin(a)*d).normalize().applyQuaternion(q);}).filter(n=>terrainHeight(n)<.035)
  };},[]);
  useLayoutEffect(()=>{const obj=new THREE.Object3D();data.pads.forEach((n,i)=>{obj.position.copy(n).multiplyScalar(R+.014);obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),n);obj.rotateZ(i*2.4);obj.scale.setScalar(.019+random(i)*.021);obj.updateMatrix();pads.current!.setMatrixAt(i,obj.matrix);pads.current!.setColorAt(i,new THREE.Color(i%2?'#7f9e66':'#a6b67c'));});
    data.reeds.forEach((n,i)=>{const height=.055+random(i)*.055;obj.quaternion.setFromUnitVectors(UP,n);obj.position.copy(n).multiplyScalar(R+Math.max(0,terrainHeight(n))+height*.5);obj.scale.set(.002,height,.002);obj.updateMatrix();stems.current!.setMatrixAt(i,obj.matrix);obj.position.addScaledVector(n,height*.47);obj.scale.set(.005,.023,.005);obj.updateMatrix();heads.current!.setMatrixAt(i,obj.matrix);});
    [pads,stems,heads].forEach(r=>{r.current!.instanceMatrix.needsUpdate=true;r.current!.computeBoundingSphere();});if(pads.current!.instanceColor)pads.current!.instanceColor.needsUpdate=true;
  },[data]);
  return <group name="lakeside-life"><instancedMesh ref={pads} args={[undefined,undefined,data.pads.length]} receiveShadow><circleGeometry args={[1,20,.14,Math.PI*2-.28]}/><meshStandardMaterial side={THREE.DoubleSide} roughness={.85}/></instancedMesh><instancedMesh ref={stems} args={[undefined,undefined,data.reeds.length]}><cylinderGeometry args={[.7,1,1,4]}/><meshStandardMaterial color="#809665"/></instancedMesh><instancedMesh ref={heads} args={[undefined,undefined,data.reeds.length]}><sphereGeometry args={[1,6,5]}/><meshStandardMaterial color="#a98c5b"/></instancedMesh></group>;
}
