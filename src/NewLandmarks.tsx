import type { Memory } from './data/trip';
import { Ground, Box, Post, FlowerPot, Bench } from './Details';
import { Glow } from './Christmas';

function Garden(){return <>
  {[-.25,0,.25].map((x,i)=><Ground key={i} x={x} z={-.1+(i%2)*.24}><mesh position={[0,.024,0]} scale={[1,.25,.72]} receiveShadow><cylinderGeometry args={[.145,.15,.12,18]}/><meshStandardMaterial color="#d0ba88"/></mesh>{[-1,0,1].map(j=><group key={j} position={[j*.07,0,(j%2)*.045]}><Post at={[0,.075,0]} height={.12} radius={.008} color="#6d986a"/><mesh position={[0,.15,0]}><sphereGeometry args={[.032,8,6]}/><meshStandardMaterial color={['#e8a299','#edcc83','#d5b5cc'][i]}/></mesh></group>)}</Ground>)}
  <Ground x={0} z={-.38}><mesh position={[0,.22,0]}><torusGeometry args={[.19,.018,6,20,Math.PI]}/><meshStandardMaterial color="#91a17b"/></mesh>{[-.19,.19].map(x=><Post key={x} at={[x,.11,0]} height={.22} radius={.018} color="#91a17b"/>)}</Ground>
  <Ground x={.31} z={.32} rotation={-.5}><Bench/></Ground><Ground x={-.3} z={.3}><FlowerPot/></Ground>
</>}
function Stargazing(){return <>
  <Ground x={0} z={.02}>
    {Array.from({length:8},(_,i)=><Box key={i} at={[0,.035,-.27+i*.075]} size={[.47,.028,.064]} color={i%2?'#c89e6e':'#d7b080'}/>)}
    {[-.22,.22].flatMap(x=>[-.27,0,.255].map(z=><Post key={`${x}${z}`} at={[x,.12,z]} height={.24} radius={.014}/>))}
    {[-.22,.22].map(x=><Box key={x} at={[x,.22,0]} size={[.018,.018,.57]} color="#b48a61"/>)}
    <group position={[0,.035,-.04]}>
      {[0,1,2].map(i=><group key={i} rotation={[0,i*Math.PI*2/3,0]}><group position={[.037,.1,0]} rotation={[0,0,-.34]}><Post at={[0,0,0]} height={.22} radius={.011} color="#728a84"/></group></group>)}
      <group position={[0,.24,0]} rotation={[.8,0,.35]}><mesh><cylinderGeometry args={[.045,.036,.27,12]}/><meshStandardMaterial color="#799b9e"/></mesh><mesh position={[0,.14,0]}><cylinderGeometry args={[.047,.047,.014,12]}/><meshStandardMaterial color="#d2e8dc" emissive="#b7dcd6" emissiveIntensity={.12}/></mesh></group>
    </group>
  </Ground>
  <Ground x={-.35} z={-.15} rotation={.6}><Bench/></Ground>
  {[-.29,.29].map(x=><Ground key={x} x={x} z={.34}><Post at={[0,.10,0]} height={.2} radius={.012}/><Glow at={[0,.23,0]} size={[.058,.08,.055]}/><Box at={[0,.28,0]} size={[.073,.02,.067]} color="#7e927b"/></Ground>)}
</>}
function Coral(){return <>
  <Ground height={.09}><mesh position={[0,.004,0]}><cylinderGeometry args={[.38,.38,.008,40]}/><meshStandardMaterial color="#88c8bd"/></mesh>
    {[0,1,2,3,4].map(i=><group key={i} position={[Math.cos(i*1.25)*.23,.025,Math.sin(i*1.25)*.21]}>
      {[0,1,2].map(j=><group key={j} rotation={[0,j*2,(j-1)*.42]}><Post at={[0,.07,0]} height={.14} radius={.016} color={i%2?'#e0a19b':'#bba5c1'}/><mesh position={[0,.14,0]}><sphereGeometry args={[.025,8,6]}/><meshStandardMaterial color={i%2?'#e9b5a7':'#c5bad4'}/></mesh></group>)}
    </group>)}
    <mesh position={[0,.09,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.37,40]}/><meshStandardMaterial color="#a9e0d6" transparent opacity={.32} depthWrite={false}/></mesh>
  </Ground>
  <Ground x={-.37} z={.32}><mesh rotation={[Math.PI/2,0,0]}><torusGeometry args={[.059,.016,6,16]}/><meshStandardMaterial color="#efbb80"/></mesh></Ground>
</>}
function Cafe(){return <>
  <Ground z={-.13}><Box at={[0,.16,0]} size={[.40,.32,.30]} color="#f1dfb8"/><Glow at={[0,.19,.16]} size={[.30,.14,.015]}/><Box at={[0,.135,.205]} size={[.43,.035,.13]} color="#c99762"/>
    {Array.from({length:6},(_,i)=><mesh key={i} position={[-.225+i*.09,.355,.11]} rotation={[.13,0,0]} castShadow><boxGeometry args={[.09,.025,.53]}/><meshStandardMaterial color={i%2?'#f7e5b8':'#d99b73'}/></mesh>)}
    {[-.23,.23].map(x=><Post key={x} at={[x,.17,.34]} height={.34} radius={.012} color="#aa8b61"/>)}
  </Ground>
  {[-.25,.23].map(x=><Ground key={x} x={x} z={.36}><Post at={[0,.07,0]} height={.14} radius={.02}/><mesh position={[0,.145,0]}><cylinderGeometry args={[.10,.10,.021,16]}/><meshStandardMaterial color="#bc945f"/></mesh>{[-.035,.035].map(a=><mesh key={a} position={[a,.175,0]}><cylinderGeometry args={[.017,.013,.04,8]}/><meshStandardMaterial color="#fff3d4"/></mesh>)}{[-.13,.13].map(a=><group key={a}><Post at={[a,.045,0]} height={.09} radius={.014}/><Box at={[a,.097,0]} size={[.065,.017,.065]} color="#c7a16d"/></group>)}</Ground>)}
  <Ground x={.35} z={-.32}><FlowerPot/></Ground>
</>}
export default function NewLandmarks({kind}:{kind:Memory['kind']}){
  if(kind==='garden')return <Garden/>;
  if(kind==='stargazing')return <Stargazing/>;
  if(kind==='coral')return <Coral/>;
  if(kind==='cafe')return <Cafe/>;
  return null;
}
