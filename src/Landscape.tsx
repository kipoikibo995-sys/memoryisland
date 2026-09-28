import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
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
    const green=new THREE.Color(),dark=new THREE.Color('#6e925d'),light=new THREE.Color('#b0bf7d'),sand=new THREE.Color('#d9c58f'),stone=new THREE.Color('#8a9771');
    for(let i=0;i<p.count;i++){
      const n=new THREE.Vector3().fromBufferAttribute(p,i).normalize(),h=terrainHeight(n),grain=noise(n.x*20+4,n.y*20+3,n.z*20+2);
      const q=n.clone().multiplyScalar(R+h);p.setXYZ(i,q.x,q.y,q.z);
      green.copy(dark).lerp(light,THREE.MathUtils.clamp(.25+grain*.75+h*.4,0,1));
      if(h<.043)green.copy(sand).lerp(light,THREE.MathUtils.clamp((h-.016)/.034,0,1));
      if(h>.22)green.lerp(stone,THREE.MathUtils.clamp((h-.22)*3.8,0,.85));
      if(h>.43)green.lerp(new THREE.Color('#9b9a80'),.48);
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
  return <>{geometries.map((g,i)=><mesh key={i} geometry={g} receiveShadow><meshStandardMaterial color="#c3b07e" roughness={1} side={THREE.DoubleSide}/></mesh>)}</>;
}
function DenseForest(){
  const trunks=useRef<THREE.InstancedMesh>(null),branches=useRef<THREE.InstancedMesh>(null),crowns=useRef<THREE.InstancedMesh>(null),outlines=useRef<THREE.InstancedMesh>(null);
  const trees=useMemo(()=>{
    const result:{n:THREE.Vector3;height:number;size:number;seed:number}[]=[];
    for(let i=0;i<3300;i++){
      const y=1-2*(i+.5)/3300,a=i*2.3999632297,n=new THREE.Vector3(Math.sqrt(1-y*y)*Math.sin(a),y,Math.sqrt(1-y*y)*Math.cos(a));
      const h=terrainHeight(n),density=noise(n.x*7+1,n.y*7+3,n.z*7+2);
      if(h<.04||h>.28||nearMemory(n,.245)||n.dot(geo([8,37]))>.987||nearRoad(n)||random(i+28)>(density>.43?.45:.10))continue;
      result.push({n,height:.10+random(i+5)*.15,size:.050+random(i+55)*.035,seed:i});
    }
    return result;
  },[]);
  useLayoutEffect(()=>{
    const obj=new THREE.Object3D(),color=new THREE.Color();
    trees.forEach(({n,height,size,seed},i)=>{
      const base=surface(n),q=new THREE.Quaternion().setFromUnitVectors(UP,n);
      obj.quaternion.copy(q);obj.position.copy(base).addScaledVector(n,height*.5);obj.scale.set(.014,height,.014);obj.updateMatrix();trunks.current!.setMatrixAt(i,obj.matrix);
      for(let j=0;j<2;j++){
        obj.quaternion.copy(q).multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(.42*(j?1:-1),seed,.3)));
        obj.position.copy(base).addScaledVector(n,height*.72);obj.scale.set(.008,height*.48,.008);obj.updateMatrix();branches.current!.setMatrixAt(i*2+j,obj.matrix);
      }
      for(let j=0;j<8;j++){
        const a=j*2.39996+seed,ring=j<5?1:.48,offset=new THREE.Vector3(Math.cos(a)*size*ring,height*(j<5?.80:1.02),Math.sin(a)*size*ring);
        obj.position.copy(base).add(offset.applyQuaternion(q));obj.quaternion.copy(q);obj.scale.set(size*(.7+random(seed+j)*.2),size*.82,size*.76);obj.updateMatrix();crowns.current!.setMatrixAt(i*8+j,obj.matrix);
        color.set(['#547f56','#668e5f','#789d62','#8caa70','#5a8663'][(seed+j)%5]);crowns.current!.setColorAt(i*8+j,color);
        obj.scale.multiplyScalar(1.008);obj.updateMatrix();outlines.current!.setMatrixAt(i*8+j,obj.matrix);
      }
    });
    [trunks,branches,crowns,outlines].forEach(r=>{r.current!.instanceMatrix.needsUpdate=true;r.current!.computeBoundingSphere();});crowns.current!.instanceColor!.needsUpdate=true;
  },[trees]);
  return <group name="dense-forest">
    <instancedMesh ref={trunks} args={[undefined,undefined,trees.length]} castShadow><cylinderGeometry args={[.65,1,1,6]}/><meshStandardMaterial color="#75644a" roughness={1}/></instancedMesh>
    <instancedMesh ref={branches} args={[undefined,undefined,trees.length*2]} castShadow><cylinderGeometry args={[.5,1,1,5]}/><meshStandardMaterial color="#7a694b"/></instancedMesh>
    <instancedMesh ref={crowns} args={[undefined,undefined,trees.length*8]} castShadow receiveShadow><icosahedronGeometry args={[1,2]}/><meshStandardMaterial vertexColors={false} roughness={1} onBeforeCompile={painted}/></instancedMesh>
    <instancedMesh ref={outlines} args={[undefined,undefined,trees.length*8]}><icosahedronGeometry args={[1,2]}/><meshBasicMaterial color="#315b3b" side={THREE.BackSide}/></instancedMesh>
  </group>;
}
function Meadow(){
  const grass=useRef<THREE.InstancedMesh>(null),flowers=useRef<THREE.InstancedMesh>(null),rocks=useRef<THREE.InstancedMesh>(null),shrubs=useRef<THREE.InstancedMesh>(null);
  const data=useMemo(()=>{
    const grass:THREE.Vector3[]=[],rocks:THREE.Vector3[]=[],shrubs:THREE.Vector3[]=[];
    for(let i=0;i<19000;i++){
      const y=1-2*random(i*3+1),a=random(i*3+2)*Math.PI*2,n=new THREE.Vector3(Math.sqrt(1-y*y)*Math.cos(a),y,Math.sqrt(1-y*y)*Math.sin(a)),h=terrainHeight(n);
      if(h<.029||h>.43||nearMemory(n,.19)||n.dot(geo([8,37]))>.987||nearRoad(n))continue;
      if(i%55===0)rocks.push(n);else if(i%19===0&&h<.24)shrubs.push(n);else if(i%2===0)grass.push(n);
    }
    return{grass,rocks,shrubs};
  },[]);
  useLayoutEffect(()=>{
    const obj=new THREE.Object3D();
    data.grass.forEach((n,i)=>{obj.quaternion.setFromUnitVectors(UP,n);obj.rotateY(random(i)*6.28);obj.position.copy(surface(n,.004));obj.scale.set(.009+random(i)*.015,.016+random(i+1)*.025,.011);obj.updateMatrix();grass.current!.setMatrixAt(i,obj.matrix);grass.current!.setColorAt(i,new THREE.Color(['#a8bd69','#89aa58','#b9c97b','#719649'][i%4]));
      obj.position.copy(surface(n,.034));obj.scale.setScalar(i%9===0?.008:0);obj.updateMatrix();flowers.current!.setMatrixAt(i,obj.matrix);flowers.current!.setColorAt(i,new THREE.Color(['#edcf84','#e7c59c','#d9d8b7'][Math.floor(i/9)%3]));
    });
    data.rocks.forEach((n,i)=>{const s=.04+random(i+8)*.075;obj.quaternion.setFromUnitVectors(UP,n);obj.rotateY(i);obj.position.copy(surface(n,s*.29));obj.scale.set(s,s*.7,s*.83);obj.updateMatrix();rocks.current!.setMatrixAt(i,obj.matrix);rocks.current!.setColorAt(i,new THREE.Color(['#9da384','#b2b295','#8c987b'][i%3]));});
    data.shrubs.forEach((n,i)=>{const s=.035+random(i)*.033;obj.quaternion.setFromUnitVectors(UP,n);obj.position.copy(surface(n,s*.47));obj.scale.set(s,s*.7,s);obj.updateMatrix();shrubs.current!.setMatrixAt(i,obj.matrix);shrubs.current!.setColorAt(i,new THREE.Color(['#628c4c','#8ea75d','#719b53'][i%3]));});
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
  useLayoutEffect(()=>{const obj=new THREE.Object3D();for(let i=0;i<420;i++){const x=i%35,z=Math.floor(i/35),n=new THREE.Vector3((x/34-.5)*.61,R,(z/11-.5)*.37).normalize().applyQuaternion(q);obj.quaternion.setFromUnitVectors(UP,n);obj.position.copy(surface(n,.03));obj.scale.set(.006,.045+random(i)*.025,.006);obj.updateMatrix();crops.current!.setMatrixAt(i,obj.matrix);crops.current!.setColorAt(i,new THREE.Color(['#d2b95e','#e3ca70','#b9a64f'][i%3]));}
    for(let i=0;i<26;i++){const n=new THREE.Vector3((i%13/12-.5)*.7,R,i<13?-.24:.24).normalize().applyQuaternion(q);obj.quaternion.setFromUnitVectors(UP,n);obj.position.copy(surface(n,.06));obj.scale.set(.014,.13,.014);obj.updateMatrix();fences.current!.setMatrixAt(i,obj.matrix);}crops.current!.instanceMatrix.needsUpdate=true;crops.current!.instanceColor!.needsUpdate=true;fences.current!.instanceMatrix.needsUpdate=true;},[]);
  return <><mesh geometry={field} receiveShadow><meshStandardMaterial color="#a59757" side={THREE.DoubleSide}/></mesh><instancedMesh ref={crops} args={[undefined,undefined,420]}><coneGeometry args={[1,1,5]}/><meshStandardMaterial roughness={1}/></instancedMesh><instancedMesh ref={fences} args={[undefined,undefined,26]} castShadow><boxGeometry args={[1,1,1]}/><meshStandardMaterial color="#c8bd93"/></instancedMesh></>;
}
function RoadPoles(){
  const points=useMemo(()=>Array.from({length:7},(_,i)=>{const n=memoryNormals[1].clone().lerp(memoryNormals[2],.18+i*.095).normalize();n.applyAxisAngle(UP,.022);return n;}),[]);
  const wires=useMemo(()=>points.slice(1).map((n,i)=>{const a=surface(points[i],.27),b=surface(n,.27),mid=a.clone().lerp(b,.5).normalize().multiplyScalar((a.length()+b.length())/2-.035);return new THREE.TubeGeometry(new THREE.CatmullRomCurve3([a,mid,b]),14,.002,3,false);}),[points]);
  return <>{points.map((n,i)=><group key={i} position={surface(n)} quaternion={new THREE.Quaternion().setFromUnitVectors(UP,n)}><mesh position={[0,.13,0]} castShadow><cylinderGeometry args={[.009,.013,.26,5]}/><meshStandardMaterial color="#7c7157"/></mesh><mesh position={[0,.25,0]}><boxGeometry args={[.105,.013,.013]}/><meshStandardMaterial color="#8f8567"/></mesh>{[-.041,.041].map(x=><mesh key={x} position={[x,.267,0]}><cylinderGeometry args={[.005,.005,.025,5]}/><meshStandardMaterial color="#d7d6bb"/></mesh>)}</group>)}{wires.map((g,i)=><mesh key={i} geometry={g}><meshBasicMaterial color="#647664"/></mesh>)}</>;
}
export default function Landscape(){return <><Terrain/><Paths/><DenseForest/><Meadow/><LakeBridge/><Farm/><RoadPoles/></>}
