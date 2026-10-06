import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { Bulbs } from './Christmas';
import { geo, noise, random, terrainHeight, surface, nearMemory, nearRoad, roadPairs, memoryNormals, PLANET_RADIUS as R, UP } from './terrain';

// Fine, world-space pigment variation gives the terrain/foliage a painted surface.
const pigment=`
float hash3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
float paintNoise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hash3(i),hash3(i+vec3(1,0,0)),f.x),mix(hash3(i+vec3(0,1,0)),hash3(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash3(i+vec3(0,0,1)),hash3(i+vec3(1,0,1)),f.x),mix(hash3(i+vec3(0,1,1)),hash3(i+vec3(1,1,1)),f.x),f.y),f.z);}
`;
function painted(shader:THREE.WebGLProgramParametersWithUniforms){
  shader.vertexShader='varying vec3 vPaintPosition;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vPaintPosition = position;');
  shader.fragmentShader='varying vec3 vPaintPosition;\n'+pigment+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n float grain=paintNoise(vPaintPosition*95.0)*.60+paintNoise(vPaintPosition*260.0)*.40; diffuseColor.rgb *= mix(.92,1.08,grain);');
}
function Terrain(){
  const geometry=useMemo(()=>{
    const g=new THREE.SphereGeometry(R,320,192),p=g.attributes.position,colors:number[]=[];
    const green=new THREE.Color(),snow=new THREE.Color('#eef3f6'),shade=new THREE.Color('#d7e2ea'),frost=new THREE.Color('#9db39b'),shore=new THREE.Color('#e3e7e2'),stone=new THREE.Color('#9aa3a8');
    for(let i=0;i<p.count;i++){
      const n=new THREE.Vector3().fromBufferAttribute(p,i).normalize(),h=terrainHeight(n),grain=noise(n.x*20+4,n.y*20+3,n.z*20+2),patch=noise(n.x*9+8,n.y*9+2,n.z*9+5);
      const q=n.clone().multiplyScalar(R+h);p.setXYZ(i,q.x,q.y,q.z);
      // Snow everywhere, with soft drifts and the odd patch of frosted grass showing through on low ground.
      green.copy(shade).lerp(snow,THREE.MathUtils.clamp(.2+grain*.9,0,1));
      if(h<.2)green.lerp(frost,THREE.MathUtils.smoothstep(patch,.6,.78)*.7);
      if(h<.043)green.copy(shore).lerp(snow,THREE.MathUtils.clamp((h-.016)/.034,0,1));
      if(h>.3)green.lerp(stone,THREE.MathUtils.clamp((h-.3)*2.2,0,.35));
      colors.push(green.r,green.g,green.b);
    }
    g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();return g;
  },[]);
  return <mesh geometry={geometry} castShadow receiveShadow><meshStandardMaterial vertexColors roughness={1} onBeforeCompile={painted}/></mesh>;
}
function Paths(){
  const geometries=useMemo(()=>roadPairs.map(([start,end])=>{
    const positions:number[]=[],indices:number[]=[];
    let last=false;
    for(let i=0;i<=100;i++){
      const t=i/100,n=memoryNormals[start].clone().lerp(memoryNormals[end],t).normalize();
      const next=memoryNormals[start].clone().lerp(memoryNormals[end],Math.min(1,t+.01)).normalize();
      const side=new THREE.Vector3().crossVectors(n,next.clone().sub(n)).normalize();
      const bend=Math.sin(t*Math.PI*5)*.008;
      const width=.010+Math.sin(t*Math.PI)*.004;
      const valid=terrainHeight(n)>.022;
      for(const sign of [-1,1]){const d=n.clone().addScaledVector(side,bend+width*sign).normalize();const p=surface(d,.004);positions.push(p.x,p.y,p.z);}
      if(i>0&&last&&valid){const a=i*2;indices.push(a-2,a-1,a,a-1,a+1,a);}
      last=valid;
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return g;
  }),[]);
  return <>{geometries.map((g,i)=><mesh key={i} geometry={g} receiveShadow><meshStandardMaterial color="#cfc2a8" roughness={1} side={THREE.DoubleSide}/></mesh>)}</>;
}
const SNOW_TINT=new THREE.Color('#f2f6f8'),PINE_TIERS=3,PINE_COLORS=['#2f6449','#3a6f51','#295a43','#447a57'],CROWN_LOBES=5,TREE_COLORS=['#5b8a58','#6b9660','#7ca366','#557f5c','#87aa6c'];
function PathStones(){
  const ref=useRef<THREE.InstancedMesh>(null);
  const stones=useMemo(()=>roadPairs.flatMap(([start,end],k)=>Array.from({length:34},(_,i)=>{
    const t=(i+.5)/34,n=memoryNormals[start].clone().lerp(memoryNormals[end],t).normalize(),next=memoryNormals[start].clone().lerp(memoryNormals[end],Math.min(1,t+.01)).normalize();
    const side=new THREE.Vector3().crossVectors(n,next.sub(n)).normalize(),sign=i%2?1:-1,bend=Math.sin(t*Math.PI*5)*.008,width=.010+Math.sin(t*Math.PI)*.004;
    return {n:n.clone().addScaledVector(side,bend+sign*(width+.009+random(i+k*40)*.004)).normalize(),seed:i+k*40};
  }).filter(s=>terrainHeight(s.n)>.03&&!nearMemory(s.n,.2))),[]);
  useLayoutEffect(()=>{const obj=new THREE.Object3D(),c=new THREE.Color();stones.forEach(({n,seed},i)=>{const s=.006+random(seed)*.006;obj.quaternion.setFromUnitVectors(UP,n);obj.rotateY(seed);obj.position.copy(surface(n,s*.25));obj.scale.set(s*1.3,s*.7,s);obj.updateMatrix();ref.current!.setMatrixAt(i,obj.matrix);ref.current!.setColorAt(i,c.set(['#d6cfb6','#c2bb9f','#e3dcc4'][seed%3]));});ref.current!.instanceMatrix.needsUpdate=true;ref.current!.instanceColor!.needsUpdate=true;ref.current!.computeBoundingSphere();},[stones]);
  return <instancedMesh ref={ref} args={[undefined,undefined,stones.length]} castShadow receiveShadow><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial roughness={1} flatShading/></instancedMesh>;
}
/** Snow-dusted cobbles laid in rings under each city, fraying out at the plaza's edge. */
const COBBLE=new RoundedBoxGeometry(1,1,1,2,.28);
function Plazas(){
  const ref=useRef<THREE.InstancedMesh>(null);
  const stones=useMemo(()=>memoryNormals.flatMap((m,k)=>{const q=new THREE.Quaternion().setFromUnitVectors(UP,m),out:{n:THREE.Vector3;a:number;seed:number}[]=[];
    for(let r=.03;r<.52;r+=.025){const count=Math.max(4,Math.round(2*Math.PI*r/.029));for(let i=0;i<count;i++){const seed=k*7919+Math.round(r*1000)*31+i,a=i/count*Math.PI*2+r*9;
      if(r>.38&&random(seed)<(r-.38)/.14)continue;const n=new THREE.Vector3(Math.cos(a)*r,R,Math.sin(a)*r).normalize().applyQuaternion(q);if(terrainHeight(n)<.03)continue;out.push({n,a,seed});}}
    return out;}),[]);
  useLayoutEffect(()=>{const obj=new THREE.Object3D(),c=new THREE.Color(),snow=new THREE.Color('#e9eef2');stones.forEach(({n,a,seed},i)=>{obj.quaternion.setFromUnitVectors(UP,n);obj.rotateY(-a+(random(seed+3)-.5)*.2);obj.position.copy(surface(n,.002));const s=.85+random(seed)*.25;obj.scale.set(.025*s,.006,.021*s);obj.updateMatrix();ref.current!.setMatrixAt(i,obj.matrix);
    c.set(['#b7b0a3','#a69f93','#c6bfb2','#9d968b'][seed%4]).lerp(snow,random(seed+9)*.55);ref.current!.setColorAt(i,c);});ref.current!.instanceMatrix.needsUpdate=true;ref.current!.instanceColor!.needsUpdate=true;ref.current!.computeBoundingSphere();},[stones]);
  return <instancedMesh ref={ref} args={[COBBLE,undefined,stones.length]} receiveShadow><meshStandardMaterial roughness={.85}/></instancedMesh>;
}
function DenseForest(){
  const trunks=useRef<THREE.InstancedMesh>(null),branches=useRef<THREE.InstancedMesh>(null),crowns=useRef<THREE.InstancedMesh>(null),tiers=useRef<THREE.InstancedMesh>(null),caps=useRef<THREE.InstancedMesh>(null);
  const trees=useMemo(()=>{
    const result:{n:THREE.Vector3;height:number;size:number;seed:number;pine:boolean}[]=[];
    for(let i=0;i<3300;i++){
      const y=1-2*(i+.5)/3300,a=i*2.3999632297,n=new THREE.Vector3(Math.sqrt(1-y*y)*Math.sin(a),y,Math.sqrt(1-y*y)*Math.cos(a));
      const h=terrainHeight(n),density=noise(n.x*7+1,n.y*7+3,n.z*7+2);
      if(h<.04||h>.28||nearMemory(n,.3)||n.dot(geo([8,37]))>.987||nearRoad(n)||random(i+28)>(density>.43?.30:.05))continue;
      result.push({n,height:.10+random(i+5)*.14,size:.058+random(i+55)*.034,seed:i,pine:random(i+77)<(h>.11?.97:.88)});
    }
    return result;
  },[]);
  const pines=useMemo(()=>trees.filter(t=>t.pine),[trees]),broad=useMemo(()=>trees.filter(t=>!t.pine),[trees]);
  useLayoutEffect(()=>{
    const obj=new THREE.Object3D(),color=new THREE.Color(),tint=new THREE.Color();
    trees.forEach(({n,height,pine},i)=>{const base=surface(n);obj.quaternion.setFromUnitVectors(UP,n);obj.position.copy(base).addScaledVector(n,height*(pine?.3:.5));obj.scale.set(.014,height*(pine?.6:1),.014);obj.updateMatrix();trunks.current!.setMatrixAt(i,obj.matrix);});
    pines.forEach(({n,height,size,seed},i)=>{const base=surface(n),q=new THREE.Quaternion().setFromUnitVectors(UP,n);
      for(let j=0;j<PINE_TIERS;j++){const w=size*(1.25-j*.3),y=height*(.42+j*.3);obj.quaternion.copy(q).multiply(new THREE.Quaternion().setFromAxisAngle(UP,seed+j));obj.position.copy(base).addScaledVector(n,y);obj.scale.set(w,height*.62,w);obj.updateMatrix();tiers.current!.setMatrixAt(i*PINE_TIERS+j,obj.matrix);
        obj.position.copy(base).addScaledVector(n,y+height*.62*.27);obj.scale.set(w*.54,height*.62*.48,w*.54);obj.updateMatrix();caps.current!.setMatrixAt(i*PINE_TIERS+j,obj.matrix);
        color.set(PINE_COLORS[seed%PINE_COLORS.length]).offsetHSL(0,0,j*.035);tiers.current!.setColorAt(i*PINE_TIERS+j,color);}
    });
    broad.forEach(({n,height,size,seed},i)=>{
      const base=surface(n),q=new THREE.Quaternion().setFromUnitVectors(UP,n);
      for(let j=0;j<2;j++){
        obj.quaternion.copy(q).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(.42*(j?1:-1),seed,.3)));
        obj.position.copy(base).addScaledVector(n,height*.72);obj.scale.set(.008,height*.48,.008);obj.updateMatrix();branches.current!.setMatrixAt(i*2+j,obj.matrix);
      }
      // One hue per tree with gentle per-lobe shading reads as a single rounded crown instead of loose blobs.
      tint.set(TREE_COLORS[seed%TREE_COLORS.length]);
      for(let j=0;j<CROWN_LOBES;j++){
        const a=j*2.39996+seed,top=j===CROWN_LOBES-1,offset=new THREE.Vector3(top?0:Math.cos(a)*size*.62,height*(top?1.0:.84),top?0:Math.sin(a)*size*.62);
        obj.position.copy(base).add(offset.applyQuaternion(q));obj.quaternion.copy(q);obj.scale.set(size*(.86+random(seed+j)*.16),size*(top?.86:.78),size*(.82+random(seed+j+9)*.14));obj.updateMatrix();crowns.current!.setMatrixAt(i*CROWN_LOBES+j,obj.matrix);
        color.copy(tint).lerp(SNOW_TINT,top?.85:.22).offsetHSL(0,0,(random(seed*3+j)-.5)*.04);crowns.current!.setColorAt(i*CROWN_LOBES+j,color);
      }
    });
    [trunks,branches,crowns,tiers,caps].forEach(r=>{r.current!.instanceMatrix.needsUpdate=true;r.current!.computeBoundingSphere();});crowns.current!.instanceColor!.needsUpdate=true;tiers.current!.instanceColor!.needsUpdate=true;
  },[trees,pines,broad]);
  return <group name="dense-forest">
    <instancedMesh ref={trunks} args={[undefined,undefined,trees.length]} castShadow><cylinderGeometry args={[.65,1,1,6]}/><meshStandardMaterial color="#75644a" roughness={1}/></instancedMesh>
    <instancedMesh ref={branches} args={[undefined,undefined,broad.length*2]} castShadow><cylinderGeometry args={[.5,1,1,5]}/><meshStandardMaterial color="#7a694b"/></instancedMesh>
    <instancedMesh ref={crowns} args={[undefined,undefined,broad.length*CROWN_LOBES]} castShadow receiveShadow><icosahedronGeometry args={[1,3]}/><meshStandardMaterial roughness={.92} onBeforeCompile={painted}/></instancedMesh>
    <instancedMesh ref={tiers} args={[undefined,undefined,pines.length*PINE_TIERS]} castShadow receiveShadow><coneGeometry args={[1,1,12]}/><meshStandardMaterial roughness={.95} flatShading onBeforeCompile={painted}/></instancedMesh>
    <instancedMesh ref={caps} args={[undefined,undefined,pines.length*PINE_TIERS]} castShadow receiveShadow><coneGeometry args={[1,1,12]}/><meshStandardMaterial color="#f2f6f8" roughness={.85} flatShading/></instancedMesh>
  </group>;
}
function Meadow(){
  const grass=useRef<THREE.InstancedMesh>(null),flowers=useRef<THREE.InstancedMesh>(null),rocks=useRef<THREE.InstancedMesh>(null),shrubs=useRef<THREE.InstancedMesh>(null);
  const data=useMemo(()=>{
    const grass:THREE.Vector3[]=[],rocks:THREE.Vector3[]=[],shrubs:THREE.Vector3[]=[];
    for(let i=0;i<19000;i++){
      const y=1-2*random(i*3+1),a=random(i*3+2)*Math.PI*2,n=new THREE.Vector3(Math.sqrt(1-y*y)*Math.cos(a),y,Math.sqrt(1-y*y)*Math.sin(a)),h=terrainHeight(n);
      if(h<.029||h>.43||nearMemory(n,.27)||n.dot(geo([8,37]))>.987||nearRoad(n))continue;
      if(i%260===0)rocks.push(n);else if(i%45===0&&h<.24)shrubs.push(n);else if(i%5===0)grass.push(n);
    }
    return{grass,rocks,shrubs};
  },[]);
  useLayoutEffect(()=>{
    const obj=new THREE.Object3D();
    data.grass.forEach((n,i)=>{obj.quaternion.setFromUnitVectors(UP,n);obj.rotateY(random(i)*6.28);obj.position.copy(surface(n,.004));obj.scale.set(.009+random(i)*.015,.016+random(i+1)*.025,.011);obj.updateMatrix();grass.current!.setMatrixAt(i,obj.matrix);grass.current!.setColorAt(i,new THREE.Color(['#c9d6cf','#b3c4b4','#dde6e3','#a2b8a4'][i%4]));
      obj.position.copy(surface(n,.034));obj.scale.setScalar(0);obj.updateMatrix();flowers.current!.setMatrixAt(i,obj.matrix);flowers.current!.setColorAt(i,new THREE.Color(['#edcf84','#e7c59c','#d9d8b7'][Math.floor(i/9)%3]));
    });
    data.rocks.forEach((n,i)=>{const s=.04+random(i+8)*.075;obj.quaternion.setFromUnitVectors(UP,n);obj.rotateY(i);obj.position.copy(surface(n,s*.29));obj.scale.set(s,s*.7,s*.83);obj.updateMatrix();rocks.current!.setMatrixAt(i,obj.matrix);rocks.current!.setColorAt(i,new THREE.Color(['#a3acb3','#b8c0c6','#949ea6'][i%3]));});
    data.shrubs.forEach((n,i)=>{const s=.035+random(i)*.033;obj.quaternion.setFromUnitVectors(UP,n);obj.position.copy(surface(n,s*.47));obj.scale.set(s,s*.7,s);obj.updateMatrix();shrubs.current!.setMatrixAt(i,obj.matrix);shrubs.current!.setColorAt(i,new THREE.Color(['#9fb7a6','#c4d3cc','#7f9d88'][i%3]));});
    [grass,flowers,rocks,shrubs].forEach(r=>{r.current!.instanceMatrix.needsUpdate=true;r.current!.instanceColor!.needsUpdate=true;r.current!.computeBoundingSphere();});
  },[data]);
  return <>
    <instancedMesh ref={grass} args={[undefined,undefined,data.grass.length]}><coneGeometry args={[1,1,3]}/><meshStandardMaterial side={THREE.DoubleSide} roughness={1}/></instancedMesh>
    <instancedMesh ref={flowers} args={[undefined,undefined,data.grass.length]}><icosahedronGeometry args={[1,0]}/><meshStandardMaterial/></instancedMesh>
    <instancedMesh ref={rocks} args={[undefined,undefined,data.rocks.length]} castShadow receiveShadow><icosahedronGeometry args={[1,0]}/><meshStandardMaterial flatShading roughness={1}/></instancedMesh>
    <instancedMesh ref={shrubs} args={[undefined,undefined,data.shrubs.length]} castShadow><icosahedronGeometry args={[1,2]}/><meshStandardMaterial onBeforeCompile={painted}/></instancedMesh>
  </>;
}
function LakeBridge(){const n=geo([12,-16]);return <group position={n.clone().multiplyScalar(R+.08)} quaternion={new THREE.Quaternion().setFromUnitVectors(UP,n)} rotation={undefined}>
  {Array.from({length:19},(_,i)=><mesh key={i} position={[(i-9)*.049,.025,0]} castShadow receiveShadow><boxGeometry args={[.041,.024,.19]}/><meshStandardMaterial color={i%2?'#b08e62':'#c3a16e'}/></mesh>)}
  {[-.43,-.21,0,.21,.43].flatMap(x=>[-.098,.098].map(z=><mesh key={`${x}${z}`} position={[x,.06,z]} castShadow><cylinderGeometry args={[.012,.016,.27,6]}/><meshStandardMaterial color="#82714f"/></mesh>))}
  {[-.098,.098].map(z=><mesh key={z} position={[0,.173,z]}><boxGeometry args={[.96,.016,.014]}/><meshStandardMaterial color="#a78a5e"/></mesh>)}
</group>}
function Farm(){
  const crops=useRef<THREE.InstancedMesh>(null),fences=useRef<THREE.InstancedMesh>(null);
  const base=geo([8,37]),q=new THREE.Quaternion().setFromUnitVectors(UP,base);
  const field=useMemo(()=>{const verts:number[]=[],indices:number[]=[];for(let z=0;z<=8;z++)for(let x=0;x<=12;x++){const n=new THREE.Vector3((x/12-.5)*.64,R,(z/8-.5)*.40).normalize().applyQuaternion(q);const p=surface(n,.007);verts.push(p.x,p.y,p.z);if(x<12&&z<8){const k=z*13+x;indices.push(k,k+13,k+1,k+1,k+13,k+14);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex(indices);g.computeVertexNormals();return g;},[]);
  useLayoutEffect(()=>{const obj=new THREE.Object3D();for(let i=0;i<420;i++){const x=i%35,z=Math.floor(i/35),n=new THREE.Vector3((x/34-.5)*.61,R,(z/11-.5)*.37).normalize().applyQuaternion(q);obj.quaternion.setFromUnitVectors(UP,n);obj.position.copy(surface(n,.03));obj.scale.set(.006,.045+random(i)*.025,.006);obj.updateMatrix();crops.current!.setMatrixAt(i,obj.matrix);crops.current!.setColorAt(i,new THREE.Color(['#b8a479','#a8946a','#c9b88f'][i%3]));}
    for(let i=0;i<26;i++){const n=new THREE.Vector3((i%13/12-.5)*.7,R,i<13?-.24:.24).normalize().applyQuaternion(q);obj.quaternion.setFromUnitVectors(UP,n);obj.position.copy(surface(n,.06));obj.scale.set(.014,.13,.014);obj.updateMatrix();fences.current!.setMatrixAt(i,obj.matrix);}crops.current!.instanceMatrix.needsUpdate=true;crops.current!.instanceColor!.needsUpdate=true;fences.current!.instanceMatrix.needsUpdate=true;},[]);
  return <><mesh geometry={field} receiveShadow><meshStandardMaterial color="#e6ebec" side={THREE.DoubleSide}/></mesh><instancedMesh ref={crops} args={[undefined,undefined,420]}><coneGeometry args={[1,1,5]}/><meshStandardMaterial roughness={1}/></instancedMesh><instancedMesh ref={fences} args={[undefined,undefined,26]} castShadow><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#c8bd93"/></instancedMesh></>;
}
function RoadPoles(){
  const points=useMemo(()=>Array.from({length:7},(_,i)=>{const n=memoryNormals[1].clone().lerp(memoryNormals[4],.18+i*.095).normalize();n.applyAxisAngle(UP,.022);return n;}),[]);
  const curves=useMemo(()=>points.slice(1).map((n,i)=>{const a=surface(points[i],.27),b=surface(n,.27),mid=a.clone().lerp(b,.5).normalize().multiplyScalar((a.length()+b.length())/2-.035);return new THREE.CatmullRomCurve3([a,mid,b]);}),[points]);
  const wires=useMemo(()=>curves.map(c=>new THREE.TubeGeometry(c,14,.002,3,false)),[curves]);
  const bulbs=useMemo(()=>curves.flatMap(c=>c.getSpacedPoints(10).slice(1,-1).map(p=>p.clone().addScaledVector(p.clone().normalize(),-.006))),[curves]);
  return <>{points.map((n,i)=><group key={i} position={surface(n)} quaternion={new THREE.Quaternion().setFromUnitVectors(UP,n)}><mesh position={[0,.13,0]} castShadow><cylinderGeometry args={[.009,.013,.26,5]}/><meshStandardMaterial color="#7c7157"/></mesh><mesh position={[0,.25,0]}><boxGeometry args={[.105,.013,.013]}/><meshStandardMaterial color="#8f8567"/></mesh>{[-.041,.041].map(x=><mesh key={x} position={[x,.267,0]}><cylinderGeometry args={[.005,.005,.025,5]}/><meshStandardMaterial color="#d7d6bb"/></mesh>)}</group>)}{wires.map((g,i)=><mesh key={i} geometry={g}><meshBasicMaterial color="#4f5f58"/></mesh>)}<Bulbs points={bulbs} size={.0075} seed={1}/></>;
}
export default function Landscape(){return <><Terrain/><Paths/><PathStones/><Plazas/><DenseForest/><Meadow/><LakeBridge/><Farm/><RoadPoles/></>}
