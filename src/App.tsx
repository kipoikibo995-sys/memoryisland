import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, BookOpen, Check, Compass, Expand, Globe2, MapPin, Maximize2, Minimize2, Move, RotateCcw, Volume2, VolumeX, Waves, X, Sunrise, Wind, House, Anchor, TreePine, Telescope, Flower2, Coffee, Shell, TowerControl } from 'lucide-react';
import { trip } from './data/trip';
import type { Memory } from './data/trip';
import type { ViewRequest } from './World';
const World=lazy(()=>import('./World'));
const TOTAL=trip.memories.length;
const KEY=`dao-ky-uc:${trip.id}:visited`;
function readProgress():string[]{try{const value=JSON.parse(localStorage.getItem(KEY)||'[]');return Array.isArray(value)?value.filter((v:unknown)=>typeof v==='string'&&trip.memories.some(m=>m.id===v)):[];}catch{return [];}}
function supportsWebGL(){try{const c=document.createElement('canvas');const gl=c.getContext('webgl2');if(gl){gl.getExtension('WEBGL_lose_context')?.loseContext();return true;}return false;}catch{return false;}}
function useReducedMotion(){const [reduced,setReduced]=useState(()=>window.matchMedia('(prefers-reduced-motion: reduce)').matches);useEffect(()=>{const media=window.matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);return reduced;}
class SceneBoundary extends Component<{children:ReactNode;onFailure:()=>void},{failed:boolean}>{state={failed:false};static getDerivedStateFromError(){return{failed:true};}componentDidCatch(_error:Error,_info:ErrorInfo){this.props.onFailure();}render(){return this.state.failed?null:this.props.children;}}
function dateLabel(date:string){return new Intl.DateTimeFormat('en-US',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(`${date}T12:00:00`));}
function MemoryImage({memory}:{memory:Memory}){const [failed,setFailed]=useState(false);useEffect(()=>setFailed(false),[memory.image]);return memory.image&&!failed?<img className="memory-photo" src={memory.image} alt={memory.imageAlt||memory.title} onError={()=>setFailed(true)}/>:null;}
const placeIcons={beach:Sunrise,hill:Wind,house:House,harbor:Anchor,forest:TreePine,lighthouse:TowerControl,garden:Flower2,stargazing:Telescope,coral:Shell,cafe:Coffee};
function PlaceIcon({kind}:{kind:Memory['kind']}){const Icon=placeIcons[kind];return <Icon size={28} strokeWidth={1.35}/>;}
export default function App(){
  const [supported]=useState(supportsWebGL);const [failed,setFailed]=useState(false);const [loaded,setLoaded]=useState(false);
  const [started,setStarted]=useState(false),[selected,setSelected]=useState<Memory|null>(null),[visited,setVisited]=useState<string[]>(readProgress);
  const [request,setRequest]=useState<ViewRequest>({id:0});const [journal,setJournal]=useState(false);const [full,setFull]=useState(false);const [message,setMessage]=useState('');
  const reduced=useReducedMotion();const dialog=useRef<HTMLDialogElement>(null);const closeButton=useRef<HTMLButtonElement>(null);const journalButton=useRef<HTMLButtonElement>(null);const overviewButton=useRef<HTMLButtonElement>(null);const audio=useRef<HTMLAudioElement>(null);const [playing,setPlaying]=useState(false);const [audioFailed,setAudioFailed]=useState(false);
  useEffect(()=>{try{localStorage.setItem(KEY,JSON.stringify(visited));}catch{setMessage('Your browser cannot save progress. Your memories will stay open for this visit.');}},[visited]);
  useEffect(()=>{const update=()=>setFull(!!document.fullscreenElement);document.addEventListener('fullscreenchange',update);return()=>document.removeEventListener('fullscreenchange',update);},[]);
  useEffect(()=>{if(journal)dialog.current?.showModal();else dialog.current?.close();},[journal]);
  useEffect(()=>{if(selected)closeButton.current?.focus({preventScroll:true});},[selected]);
  useEffect(()=>{if(!message)return;const id=window.setTimeout(()=>setMessage(''),6500);return()=>clearTimeout(id);},[message]);
  const ready=useCallback(()=>setLoaded(true),[]);const failure=useCallback(()=>setFailed(true),[]);
  const choose=useCallback((m:Memory)=>{setStarted(true);setJournal(false);setSelected(m);setVisited(prev=>prev.includes(m.id)?prev:[...prev,m.id]);setRequest(prev=>({id:prev.id+1,position:m.position}));},[]);
  const overview=()=>{setSelected(null);setRequest(prev=>({id:prev.id+1}));overviewButton.current?.focus({preventScroll:true});};
  const closeMemory=()=>{setSelected(null);overviewButton.current?.focus({preventScroll:true});};
  useEffect(()=>{const esc=(e:KeyboardEvent)=>{if(e.key==='Escape'&&!journal){setSelected(null);overviewButton.current?.focus({preventScroll:true});}};window.addEventListener('keydown',esc);return()=>window.removeEventListener('keydown',esc);},[journal]);
  const fullscreen=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{setMessage('Full screen is not available in this browser.');}};
  const toggleAudio=async()=>{if(!audio.current)return;try{if(playing){audio.current.pause();setPlaying(false);}else{await audio.current.play();setPlaying(true);}}catch{setAudioFailed(true);setMessage('Audio could not be played. You can still explore the island.');}};
  const current=selected?trip.memories.findIndex(m=>m.id===selected.id):0;const unavailable=!supported||failed;
  return <main className={`app ${started?'has-started':''} ${selected?'has-memory':''}`}>
    <a className="skip-link" href="#explore-list">Skip to memories</a>
    <header className="topbar">
      <a className="brand" href="#" onClick={e=>{e.preventDefault();overview();}} aria-label="Memory Island — return to overview"><span className="brand-symbol"><Waves size={23}/></span><span>memory island<span className="brand-caption">A PLACE FOR THE GOOD DAYS</span></span></a>
      <div className="trip-heading"><span>{trip.title}</span><span className="header-date">{trip.date}</span></div>
      <div className="top-actions"><span className="progress" aria-label={`${visited.length} of ${TOTAL} memories discovered`}><span className="progress-ring" style={{background:`conic-gradient(var(--orange) ${visited.length/TOTAL*360}deg, #d9ded3 0)`}}/><span><b>{visited.length}</b><span className="muted"> / {TOTAL}</span></span></span><button className="journal-button" aria-label="Open journal" ref={journalButton} onClick={()=>setJournal(true)}><BookOpen size={17}/><span>Journal</span></button></div>
    </header>
    <section className="world-wrap" aria-label="Interactive memory island. Drag to rotate, scroll or pinch to zoom.">
      <div className="planet-shadow"/>
      {!unavailable&&<SceneBoundary onFailure={failure}><Suspense fallback={null}><World selected={selected?.id||null} visited={visited} onSelect={choose} request={request} reduced={reduced} onReady={ready} paused={!!selected||journal}/></Suspense></SceneBoundary>}
    </section>
    {!loaded&&!unavailable&&<div className="loading" role="status"><span className="loading-orbit"><Globe2 size={28}/></span><span>Waking up the island…</span></div>}
    {unavailable&&<div className="webgl-fallback" role="status"><Globe2 size={32}/><h2>The island needs a little help</h2><p>This device could not open the 3D scene. Enable hardware acceleration or try another browser. You can still read all {TOTAL} memories in the journal.</p><button className="primary" onClick={()=>setJournal(true)}>Open journal <BookOpen size={18}/></button></div>}
    <div className="scene-caption" aria-hidden="true"><span className="tiny-sun">✳</span><span>A LITTLE SUNSHINE.<br/>A WORLD TO REMEMBER.</span></div>
    <nav className="scene-tools" aria-label="View controls">
      <button className="icon-button" ref={overviewButton} onClick={overview} title="Return to overview" aria-label="Return to overview"><RotateCcw size={19}/></button>
      {document.fullscreenEnabled&&<button className="icon-button" onClick={fullscreen} title={full?'Exit full screen':'Full screen'} aria-label={full?'Exit full screen':'Full screen'}>{full?<Minimize2 size={19}/>:<Maximize2 size={19}/>}</button>}
      {trip.audio&&!audioFailed&&<button className="icon-button" onClick={toggleAudio} title={playing?'Mute audio':'Play audio'} aria-label={playing?'Mute audio':'Play audio'} aria-pressed={playing}>{playing?<Volume2 size={19}/>:<VolumeX size={19}/>}</button>}
    </nav>
    {trip.audio&&<audio ref={audio} src={trip.audio} loop preload="none" onError={()=>{setAudioFailed(true);setPlaying(false);setMessage('The audio file is unavailable.');}}/>}
    {!started&&<section className="intro paper" aria-labelledby="intro-title"><div className="eyebrow"><span className="little-line"/> MEMORY ISLAND <span className="edition">VOL. 01</span></div><h1 id="intro-title" aria-label={trip.title}>{trip.title.split(' ').slice(0,2).join(' ')}{' '}<br/><em>{trip.title.split(' ').slice(2).join(' ')}.</em></h1><div className="intro-location"><MapPin size={15}/><span>{trip.location}</span></div><p className="intro-date">{trip.date}</p><p className="intro-description">{trip.description}</p><button className="primary" onClick={()=>{setStarted(true);setRequest(p=>({id:p.id+1}));}}>Explore the island <ArrowRight size={19}/></button><div className="intro-footer"><span className="mini-dot"/> {TOTAL} places. One summer to remember.</div><div className="postmark" aria-hidden="true"><Compass size={27}/><span>CLOUD ISLAND</span></div></section>}
    {started&&!selected&&<div className="collapsed-intro paper"><span className="tiny-sun">✳</span><div><span className="eyebrow">A SUMMER TO KEEP</span><strong>{trip.title}</strong><span className="collapsed-date">{trip.date}</span></div></div>}
    {selected&&<aside className="memory-card paper" aria-labelledby="memory-title" onPointerDown={e=>e.stopPropagation()} onWheel={e=>e.stopPropagation()}>
      <div className="memory-top"><span className="eyebrow">MEMORY {String(current+1).padStart(2,'0')} / {String(TOTAL).padStart(2,'0')}</span><button className="close-button" ref={closeButton} onClick={closeMemory} aria-label="Close memory"><X size={20}/></button></div>
      <div className="memory-scroll"><div className={`memory-emblem ${selected.kind}`}><span><PlaceIcon kind={selected.kind}/></span><span>{selected.time}<small>LOCAL TIME</small></span><span className="memory-stamp">CLOUD<br/>ISLAND</span></div><p className="chapter">{selected.chapter}</p><h2 id="memory-title">{selected.title}</h2><div className="memory-date">{dateLabel(selected.date)}<span>•</span><span><Check size={13}/> Discovered</span></div><MemoryImage memory={selected}/><p className="story">{selected.story}</p><blockquote>“{selected.note}”</blockquote></div>
      <div className="memory-bottom"><button className="text-button" onClick={overview}><ArrowLeft size={16}/> Overview</button><button className="next-button" onClick={()=>choose(trip.memories[(current+1)%TOTAL])}>Next memory <ArrowRight size={17}/></button></div>
    </aside>}
    <footer className="bottom-bar"><div className="gesture-hint"><span><Move size={16}/> Drag to rotate</span><i/><span><Expand size={15}/> Scroll to zoom</span></div><nav id="explore-list" className="memory-index" aria-label="Choose a place to explore"><span className="index-label">TEN LITTLE MOMENTS</span><div className="index-buttons">{trip.memories.map((m,i)=><button key={m.id} className={`${visited.includes(m.id)?'done':''} ${selected?.id===m.id?'selected':''}`} onClick={()=>choose(m)} title={m.title} aria-label={`Explore ${m.title}`} aria-current={selected?.id===m.id?'location':undefined}>{String(i+1).padStart(2,'0')}</button>)}</div></nav></footer>
    <div className="north-mark" aria-hidden="true"><span>N</span><Compass size={35} strokeWidth={1}/><span>12° N · 109° E</span></div>
    <dialog ref={dialog} className="journal paper" onCancel={()=>setJournal(false)} onClose={()=>{setJournal(false);(selected?closeButton:journalButton).current?.focus({preventScroll:true});}} onClick={e=>{if(e.target===dialog.current){const r=dialog.current.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)setJournal(false);}}} aria-labelledby="journal-title">
      <div className="journal-heading"><div><div className="eyebrow">THE DAYS WE WANT TO KEEP</div><h2 id="journal-title">Travel journal<span>.</span></h2></div><button className="close-button" onClick={()=>setJournal(false)} aria-label="Close journal"><X size={22}/></button></div><div className="journal-summary"><span>{trip.title}</span><span>{visited.length}/{TOTAL} memories discovered</span></div>
      <div className="journal-list">{trip.memories.map((m,i)=><button className="journal-entry" key={m.id} onClick={()=>choose(m)}><span className={`entry-number ${visited.includes(m.id)?'done':''}`}>{visited.includes(m.id)?<Check size={20}/>:String(i+1).padStart(2,'0')}</span><span><small>{dateLabel(m.date)} · {m.time}</small><strong>{m.title}</strong><span className="entry-note">{m.note}</span></span><ArrowRight size={19}/></button>)}</div><p className="journal-foot"><BookOpen size={15}/>{visited.length===TOTAL?'Every place explored. Every memory waiting for another visit.':'Every place holds a story. Choose one to step inside.'}</p>
    </dialog>
    <div className="sr-only" role="status" aria-live="polite">{visited.length} of {TOTAL} memories discovered.</div>
    {message&&<div className="toast" role="status">{message}<button onClick={()=>setMessage('')} aria-label="Dismiss notification"><X size={16}/></button></div>}
    <span className="down-note" aria-hidden="true"><ArrowDown size={13}/> CHOOSE A PLACE. FIND A MEMORY.</span>
  </main>;
}




