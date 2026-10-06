import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrbitControls } from '@react-three/drei';
import { Bloom, EffectComposer, N8AO, SMAA } from '@react-three/postprocessing';
import { Bulbs, ChimneySmoke, ChristmasTree, Glow, SantaSleigh, Sled, Snowfall, Snowman } from './Christmas';
import * as THREE from 'three';
import { trip } from './data/trip';
import Landscape from './Landscape';
import { CottageCraft, HarborCraft, LakesideLife } from './CraftDetails';
import NewLandmarks from './NewLandmarks';
import type { Memory } from './data/trip';
import { terrainHeight } from './terrain';
import { IslandDetails, SeaDetails, GableRoof, Sailboat, SailingFleet } from './Details';

const R = 2.5;
const UP = new THREE.Vector3(0,1,0);
export function normal([lat,lon]:[number,number]) { const a=lat*Math.PI/180,b=lon*Math.PI/180; return new THREE.Vector3(Math.cos(a)*Math.sin(b),Math.sin(a),Math.cos(a)*Math.cos(b)); }
const orient = (n:THREE.Vector3)=>new THREE.Quaternion().setFromUnitVectors(UP,n);
function rand(seed:number) {const x=Math.sin(seed*127.1+311.7)*43758.5453;return x-Math.floor(x);}
function Island({memory,reduced}:{memory:Memory;reduced:boolean}){
  const n=useMemo(()=>normal(memory.position),[memory.position]);
  const q=useMemo(()=>orient(n),[n]);
  return <group position={n.clone().multiplyScalar(R)} quaternion={q}>
    <IslandDetails kind={memory.kind} reduced={reduced}/><NewLandmarks kind={memory.kind}/>
    <group position={[0,.075,0]} scale={.82}>
      {memory.kind==='house'&&<House reduced={reduced}/>}
      {memory.kind==='lighthouse'&&<Lighthouse/>}
      {memory.kind==='harbor'&&<><Harbor/><HarborCraft/></>}
      {memory.kind==='beach'&&<Beach/>}
      {memory.kind==='hill'&&<Hill reduced={reduced}/>}
      
    </group>
  </group>;
}
const ROOF=(()=>{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute([-.28,.34,-.24,.28,.34,-.24,0,.57,-.24,-.28,.34,.24,.28,.34,.24,0,.57,.24],3));g.setIndex([0,2,1,3,4,5,0,3,5,0,5,2,1,2,5,1,5,4,0,1,4,0,4,3]);g.computeVertexNormals();return g;})();
const EAVE_LIGHTS=[...[-1,1].flatMap(x=>Array.from({length:12},(_,i)=>new THREE.Vector3(x*.3,.33,-.25+i*.0455))),...Array.from({length:13},(_,i)=>{const t=i/12;return new THREE.Vector3(-.3+t*.6,.33+(1-Math.abs(t*2-1))*.24,.262);})];
function House({reduced}:{reduced:boolean}){return <group rotation={[0,-.3,0]}>
  <mesh castShadow receiveShadow position={[0,.18,0]}><boxGeometry args={[.43,.36,.36]}/><meshStandardMaterial color="#fff0ca"/></mesh>
  <GableRoof/><CottageCraft/>
  <mesh geometry={ROOF} position={[0,.022,0]} scale={[1.08,1,1.06]} castShadow receiveShadow><meshStandardMaterial color="#f4f7f9" roughness={.85}/></mesh>
  <Bulbs points={EAVE_LIGHTS} size={.0095} reduced={reduced} seed={2}/>
  <group position={[.06,.26,.192]}><mesh rotation={[0,0,0]}><torusGeometry args={[.035,.012,8,22]}/><meshStandardMaterial color="#2f6a49"/></mesh><mesh position={[0,-.032,.006]}><sphereGeometry args={[.011,10,8]}/><meshStandardMaterial color="#c8303a"/></mesh></group>
  <mesh position={[.04,.12,.183]}><boxGeometry args={[.095,.24,.014]}/><meshStandardMaterial color="#4a8279"/></mesh>
  <Glow at={[-.12,.23,.184]} size={[.085,.085,.018]}/><Glow at={[-.217,.2,.02]} size={[.018,.08,.09]}/>
  <group position={[.16,.56,-.06]}><ChimneySmoke reduced={reduced}/></group>
  <mesh position={[.16,.42,-.06]} castShadow><boxGeometry args={[.065,.26,.07]}/><meshStandardMaterial color="#e8cbad"/></mesh>
  {[-1,0,1,2].map(i=><mesh key={i} position={[-.39,.055,i*.13-.2]} castShadow><boxGeometry args={[.035,.17,.035]}/><meshStandardMaterial color="#f7e4ba"/></mesh>)}
  <mesh position={[-.39,.09,0]}><boxGeometry args={[.025,.027,.57]}/><meshStandardMaterial color="#f7e4ba"/></mesh>
  {[0,1,2].map(i=><mesh key={i} position={[.04,-.015,.31+i*.12]} rotation={[-Math.PI/2,0,.2*i]}><circleGeometry args={[.075,6]}/><meshStandardMaterial color="#d7c7a3"/></mesh>)}
</group>}
function Lighthouse(){return <group>
  <mesh castShadow position={[0,.32,0]}><cylinderGeometry args={[.12,.18,.64,10]}/><meshStandardMaterial color="#fff4d7" flatShading/></mesh>
  <mesh position={[0,.38,0]}><cylinderGeometry args={[.141,.155,.13,10]}/><meshStandardMaterial color="#d98162"/></mesh>
  <mesh castShadow position={[0,.66,0]}><cylinderGeometry args={[.21,.2,.045,10]}/><meshStandardMaterial color="#647e73"/></mesh>
  <mesh position={[0,.76,0]}><cylinderGeometry args={[.12,.12,.16,8]}/><meshBasicMaterial color={[3.6,2.7,1.2]} toneMapped={false}/></mesh>
  <mesh castShadow position={[0,.89,0]}><coneGeometry args={[.23,.17,10]}/><meshStandardMaterial color="#ce7352" flatShading/></mesh>
  <mesh position={[0,.1,.17]}><boxGeometry args={[.09,.18,.018]}/><meshStandardMaterial color="#527a75"/></mesh>
</group>}
function Harbor(){return <group rotation={[0,-.3,0]}>
  {Array.from({length:8},(_,i)=><mesh key={i} position={[0,-.02,.28+i*.09]} castShadow receiveShadow><boxGeometry args={[.29,.045,.075]}/><meshStandardMaterial color={i%2?'#b78e65':'#c59c73'}/></mesh>)}
  {[-.12,.12].flatMap(x=>[.32,.8].map(z=><mesh key={`${x}${z}`} position={[x,-.08,z]}><cylinderGeometry args={[.023,.023,.29,6]}/><meshStandardMaterial color="#866548"/></mesh>))}
  <group position={[.41,-.035,.63]} rotation={[0,.4,0]}><Sailboat scale={.9}/></group>
</group>}
function Beach(){return <group position={[-.24,-.02,.23]}>
  <group rotation={[0,.5,0]}><Snowman/></group>
  <group position={[.2,0,.16]} rotation={[0,-.6,0]}><Sled/></group>
</group>}
function Hill({reduced}:{reduced:boolean}){return <group>
  <mesh castShadow receiveShadow position={[0,.07,0]} scale={[1,.48,.85]}><sphereGeometry args={[.31,32,20]}/><meshStandardMaterial color="#eef3f6" roughness={.9}/></mesh>
  <group position={[0,.15,0]} scale={1.55}><ChristmasTree reduced={reduced}/></group>
</group>}
function Clouds({reduced}:{reduced:boolean}){
  const ref=useRef<THREE.Group>(null);
  useFrame(({clock})=>{if(ref.current&&!reduced)ref.current.rotation.y=clock.elapsedTime*.015;});
  return <group ref={ref}>{Array.from({length:9},(_,i)=>{
    const a=i/9*Math.PI*2;return <group key={i} position={[Math.sin(a)*3.42,Math.sin(a*2+1)*1.35,Math.cos(a)*3.42]} rotation={[0,a,0]} scale={.48+rand(i)*.38}>
      {[[-.23,0,0],[0,.07,0],[.24,0,.02],[.02,-.04,.14]].map((p,j)=><mesh key={j} position={p as [number,number,number]} scale={[1.35,.8,.85]}><sphereGeometry args={[j===1?.25:.2,24,16]}/><meshStandardMaterial color="#fffdf0" transparent opacity={.94} depthWrite={false}/></mesh>)}
    </group>;
  })}</group>
}
// Depth-tinted winter sea: deep cold blue offshore, pale icy shallows and a frosted line along every coast.
function Ocean({reduced}:{reduced:boolean}){
  const time=useMemo(()=>({value:0}),[]);
  const geometry=useMemo(()=>{
    const g=new THREE.SphereGeometry(R,256,160),p=g.attributes.position,colors:number[]=[],n=new THREE.Vector3(),c=new THREE.Color();
    const deep=new THREE.Color('#2e6f86'),shallow=new THREE.Color('#86c6d2'),foam=new THREE.Color('#f3f8fb');
    for(let i=0;i<p.count;i++){
      const h=terrainHeight(n.fromBufferAttribute(p,i).normalize());
      c.copy(deep).lerp(shallow,THREE.MathUtils.smoothstep(h,-.075,-.004)).lerp(foam,THREE.MathUtils.smoothstep(h,-.009,0)*.75);
      colors.push(c.r,c.g,c.b);
    }
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));return g;
  },[]);
  useFrame(({clock})=>{if(!reduced)time.value=clock.elapsedTime;});
  return <mesh name="ocean" geometry={geometry} receiveShadow><meshStandardMaterial vertexColors roughness={.42} metalness={0} onBeforeCompile={shader=>{
    shader.uniforms.uTime=time;shader.vertexShader='uniform float uTime;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed += normal * (sin(position.x * 9.0 + uTime * 0.7) * cos(position.z * 8.0 + uTime * 0.5) * 0.006);');
  }}/></mesh>
}
function Marker({memory,index,visited,active,onSelect}:{memory:Memory;index:number;visited:boolean;active:boolean;onSelect:(m:Memory)=>void}){
  const n=useMemo(()=>normal(memory.position),[memory.position]);const p=useMemo(()=>n.clone().multiplyScalar(R+.86).add(new THREE.Vector3(.24,0,0).applyQuaternion(orient(n))),[n]);
  const [view,setView]=useState(0);const visibility=useRef(0);const visible=view>0;const delta=useMemo(()=>new THREE.Vector3(),[]);
  useFrame(({camera})=>{const facing=n.dot(delta.copy(camera.position).sub(n.clone().multiplyScalar(R)).normalize());const next=facing>.22?(facing>.55?2:1):0;if(next!==visibility.current){visibility.current=next;setView(next);}});
  return <group position={p}><Html center zIndexRange={[30,10]} style={{display:visible?'block':'none'}}><button className={`marker ${visited?'visited':''} ${active?'active':''} ${view===1&&!active?'compact':''}`} tabIndex={visible?0:-1} aria-label={`${memory.title}${visited?' — discovered':''}`} title={memory.title} aria-pressed={active} onPointerDown={e=>e.stopPropagation()} onClick={e=>{e.stopPropagation();onSelect(memory);}}><span className="marker-number">{String(index+1).padStart(2,'0')}</span><span className="marker-label">{memory.title}</span><span className="marker-arrow">↗</span></button><span className="marker-stem"/></Html></group>
}
export type ViewRequest={id:number;position?:[number,number]};
function CameraRig({request,reduced,paused}:{request:ViewRequest;reduced:boolean;paused:boolean}){
  const hold=useRef<THREE.Vector3|null>(null);const controls=useRef<React.ComponentRef<typeof OrbitControls>>(null);const {camera,size}=useThree();
  const [interacted,setInteracted]=useState(false);const [moving,setMoving]=useState(true);const move=useRef<{from:THREE.Vector3;to:THREE.Vector3;time:number}|null>(null);
  useEffect(()=>{
    const distance=size.width<520?15.2:size.width<650?12.6:10.7;
    const to=request.position?normal(request.position).multiplyScalar(size.width<520?14:size.width<650?11.2:9.3):new THREE.Vector3(0,3.2,8.7).normalize().multiplyScalar(distance);
    hold.current=request.position?to.clone():null;
    if(reduced){camera.position.copy(to);controls.current?.update();setMoving(false);}else {move.current={from:camera.position.clone(),to,time:performance.now()};setMoving(true);}
  },[request,reduced,camera,size.width]);
  useFrame(()=>{if(!move.current){if(hold.current){camera.position.copy(hold.current);camera.lookAt(0,0,0);}return;}const m=move.current;const t=Math.min((performance.now()-m.time)/1250,1),s=t*t*(3-2*t);
    const a=m.from.clone().normalize(),b=m.to.clone().normalize();const quaternion=new THREE.Quaternion().setFromUnitVectors(a,b);const partial=new THREE.Quaternion().slerp(quaternion,s);
    camera.position.copy(a.applyQuaternion(partial).multiplyScalar(THREE.MathUtils.lerp(m.from.length(),m.to.length(),s)));camera.lookAt(0,0,0);controls.current?.update();if(t===1){move.current=null;setMoving(false);}
  });
  return <OrbitControls ref={controls} makeDefault enabled={!moving} enablePan={false} enableDamping={!reduced&&!moving} dampingFactor={.07} rotateSpeed={.55} zoomSpeed={.65} minDistance={6.6} maxDistance={16} minPolarAngle={.08} maxPolarAngle={Math.PI-.08} autoRotate={!interacted&&!paused&&!reduced&&!moving} autoRotateSpeed={.055} onStart={()=>{hold.current=null;setInteracted(true);move.current=null;setMoving(false);}}/>;
}
// Every solid prop casts and receives shadows; thin double-sided surfaces (paths, fields, grass) only receive, avoiding self-shadow streaks.
function ShadowSetup(){const scene=useThree(s=>s.scene);useLayoutEffect(()=>{scene.traverse(o=>{const m=o as THREE.Mesh;if(!m.isMesh||m.name==='ocean')return;const mats=([] as THREE.Material[]).concat(m.material);if(mats.some(x=>x.transparent||(x as THREE.MeshBasicMaterial).isMeshBasicMaterial))return;m.receiveShadow=true;if(!mats.some(x=>x.side===THREE.DoubleSide))m.castShadow=true;});},[scene]);return null;}
const SHADOW_MAP=window.innerWidth<700?2048:4096;
function Ready({onReady}:{onReady:()=>void}){useEffect(onReady,[onReady]);return null;}
export default function World({selected,visited,onSelect,request,reduced,onReady,paused}:{selected:string|null;visited:string[];onSelect:(m:Memory)=>void;request:ViewRequest;reduced:boolean;onReady:()=>void;paused:boolean}){
  return <Canvas shadows={{type:THREE.PCFShadowMap}} dpr={[1,window.innerWidth<700?1.5:2]} camera={{position:[0,3.2,8.7],fov:43,near:.1,far:80}} gl={{antialias:false,alpha:true,stencil:false,powerPreference:'high-performance',toneMapping:THREE.ACESFilmicToneMapping,toneMappingExposure:1.08}} onCreated={({gl})=>{gl.setClearColor(0x000000,0);}}>
    <ambientLight intensity={.3} color="#b9c6ff"/><hemisphereLight args={['#93a6e6','#3d4566',1.15]}/><directionalLight position={[-6.2,3,4.2]} intensity={3.3} color="#ffc896" castShadow shadow-mapSize={[SHADOW_MAP,SHADOW_MAP]} shadow-camera-left={-3.4} shadow-camera-right={3.4} shadow-camera-top={3.4} shadow-camera-bottom={-3.4} shadow-camera-near={3} shadow-camera-far={15} shadow-bias={-.00015} shadow-normalBias={.012}/><directionalLight position={[4.5,3.5,-4]} intensity={1.5} color="#a3bcff"/>
    <Ocean reduced={reduced}/><Landscape/><LakesideLife/>{trip.memories.map(m=><Island key={m.id} memory={m} reduced={reduced}/>)}<SailingFleet reduced={reduced}/><SeaDetails reduced={reduced}/><Clouds reduced={reduced}/><SantaSleigh reduced={reduced}/><Snowfall reduced={reduced} count={window.innerWidth<700?900:1600}/>
    {trip.memories.map((m,i)=><Marker key={m.id} memory={m} index={i} visited={visited.includes(m.id)} active={selected===m.id} onSelect={onSelect}/>)}
    <CameraRig request={request} reduced={reduced} paused={paused}/><ShadowSetup/><Ready onReady={onReady}/>
    {/* Ambient occlusion grounds trees, houses and rocks; bloom only picks up the over-bright bulbs and star. */}
    <EffectComposer multisampling={0} enableNormalPass={false}><N8AO aoRadius={.32} distanceFalloff={.6} intensity={1.9} color="#24412f" halfRes quality="medium"/><Bloom mipmapBlur luminanceThreshold={1.35} luminanceSmoothing={.25} intensity={1.5} radius={.7}/><SMAA/></EffectComposer>
  </Canvas>
}







