import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Box, Fish, Gem, House, Package, Trophy, X } from 'lucide-react';
import { FISH_MAP, LOCATIONS, LOOT_MAP, RODS, REELS, LINES } from '../game/data';
import { CaughtFish, FoundLootEntry, SaveState, SavedTackleSet } from '../game/types';

type WindowKey = 'storage' | 'trophies' | 'gear';
interface Props {
  gameState: SaveState; savedTackleSets: SavedTackleSet[]; onBack: () => void;
  onSaveTackleSet: (name: string) => void; onEquipTackleSet: (set: SavedTackleSet) => void;
  onDeleteTackleSet: (id: string) => void; onUseConsumable: (id: string) => void; onRest: () => void;
  onStoreFish: (uid: string) => void; onTakeFish: (uid: string) => void;
  onStoreLoot: (uid: string) => void; onTakeLoot: (uid: string) => void;
  onMountFish: (uid: string) => void; onUnmountFish: (uid: string) => void;
  onMountLoot: (uid: string) => void; onUnmountLoot: (uid: string) => void;
}
const initialPositions: Record<WindowKey, {x:number;y:number}> = {
  storage:{x:22,y:105}, trophies:{x:340,y:105}, gear:{x:22,y:390}
};
export const HomeView: React.FC<Props> = (p) => {
  const [opened,setOpened]=useState<WindowKey[]>([]);
  const [positions,setPositions]=useState(initialPositions);
  const [drag,setDrag]=useState<{key:WindowKey;dx:number;dy:number}|null>(null);
  const [tab,setTab]=useState<'fish'|'loot'|'currencies'>('fish');
  const [setName,setSetName]=useState('');
  const rootRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    try {
      const saved=localStorage.getItem('polissia_home_window_positions');
      if(saved) setPositions({...initialPositions,...JSON.parse(saved)});
    } catch {}
  },[]);
  useEffect(()=>{
    if(!drag) return;
    const move=(e:PointerEvent)=>{
      const rect=rootRef.current?.getBoundingClientRect(); if(!rect) return;
      setPositions(prev=>({...prev,[drag.key]:{
        x:Math.max(0,Math.min(rect.width-260,e.clientX-rect.left-drag.dx)),
        y:Math.max(0,Math.min(rect.height-120,e.clientY-rect.top-drag.dy))
      }}));
    };
    const up=()=>setDrag(null);
    window.addEventListener('pointermove',move); window.addEventListener('pointerup',up);
    return ()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);};
  },[drag]);
  useEffect(()=>{try{localStorage.setItem('polissia_home_window_positions',JSON.stringify(positions));}catch{}},[positions]);
  const toggle=(key:WindowKey)=>setOpened(prev=>prev.includes(key)?prev.filter(x=>x!==key):[...prev,key]);
  const fishName=(f:CaughtFish)=>FISH_MAP[f.speciesId]?.name ?? 'Невідома риба';
  const lootName=(l:FoundLootEntry)=>LOOT_MAP[l.itemId]?.name ?? 'Знахідка';
  const panel='absolute z-20 w-[min(330px,calc(100vw-24px))] overflow-hidden rounded-xl border border-amber-200/40 bg-[#101a15]/95 text-slate-100 shadow-2xl backdrop-blur-md';
  const header=(key:WindowKey,title:string,icon:React.ReactNode)=><div onPointerDown={e=>{const rect=e.currentTarget.parentElement?.getBoundingClientRect();if(rect)setDrag({key,dx:e.clientX-rect.left,dy:e.clientY-rect.top});}} className="flex cursor-move touch-none items-center justify-between border-b border-white/10 bg-[#26372b] px-3 py-2"><div className="flex items-center gap-2 text-sm font-bold text-amber-100">{icon}{title}</div><button onPointerDown={e=>e.stopPropagation()} onClick={()=>toggle(key)} className="rounded p-1 hover:bg-white/10"><X size={16}/></button></div>;
  const row=(name:string,detail:string,action:string,fn:()=>void)=><div className="flex items-center justify-between gap-2 border-b border-white/5 px-3 py-2 text-xs"><div className="min-w-0"><b className="block truncate">{name}</b><span className="text-slate-400">{detail}</span></div><button onClick={fn} className="shrink-0 rounded-md border border-emerald-300/30 px-2 py-1 text-emerald-200 hover:bg-emerald-900/40">{action}</button></div>;
  const loc=(id:string)=>LOCATIONS[id as keyof typeof LOCATIONS]?.name ?? id;
  return <main ref={rootRef} className="fixed inset-0 z-[95] overflow-hidden bg-[#070d0b] text-white">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-cover bg-center" style={{backgroundImage:"linear-gradient(rgba(4,10,7,.32), rgba(4,10,7,.48)), url('https://raw.githubusercontent.com/maister-online/hromada-social/main/1111_%D0%BD%D0%B0%D0%BF%D0%B8%D1%88%D0%B8_%D1%87%D1%96%D1%82%D0%BA%D1%96%D1%88%D0%B5_%D1%83_%D0%BA%D0%BD%D0%B8%D0%B7%D1%96_a9b756a9_2K.jpg')"}}/>
    <div className="absolute left-3 top-3 z-30 flex items-center gap-2 rounded-lg bg-black/55 px-3 py-2 backdrop-blur"><House size={18} className="text-amber-200"/><span className="text-sm font-bold">Мій дім · День {p.gameState.day}</span><button onClick={p.onBack} className="ml-2 flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs"><ArrowLeft size={14}/>Карта</button></div>
    <div className="absolute bottom-3 left-3 z-30 flex max-w-[calc(100vw-24px)] flex-wrap gap-2">
      <button onClick={()=>toggle('storage')} className="flex items-center gap-2 rounded-lg border border-amber-200/40 bg-black/65 px-3 py-2 text-xs font-bold shadow-lg"><Box size={16}/>Сховище</button>
      <button onClick={()=>toggle('trophies')} className="flex items-center gap-2 rounded-lg border border-amber-200/40 bg-black/65 px-3 py-2 text-xs font-bold shadow-lg"><Trophy size={16}/>Трофейна кімната</button>
      <button onClick={()=>toggle('gear')} className="flex items-center gap-2 rounded-lg border border-amber-200/40 bg-black/65 px-3 py-2 text-xs font-bold shadow-lg"><Package size={16}/>Снасті й інструменти</button>
    </div>
    {opened.includes('storage')&&<section className={panel} style={{left:positions.storage.x,top:positions.storage.y}}>
      {header('storage','Сховище предметів',<Box size={16}/>)}
      <div className="flex gap-1 p-2">{(['fish','loot','currencies'] as const).map(t=><button key={t} onClick={()=>setTab(t)} className={`flex-1 rounded px-2 py-1.5 text-[11px] ${tab===t?'bg-emerald-700':'bg-white/5 text-slate-300'}`}>{t==='fish'?'Риба':t==='loot'?'Знахідки':'Ресурси'}</button>)}</div>
      <div className="max-h-[48vh] overflow-y-auto">
        {tab==='fish'&&<>{p.gameState.keepnet.map(f=>row(fishName(f),`${f.weightKg.toFixed(2)} кг · ${loc(f.locationId)}`,'До дому',()=>p.onStoreFish(f.uid)))}{p.gameState.homeStoredFish.map(f=>row(fishName(f),`${f.weightKg.toFixed(2)} кг · День ${f.caughtDay}`,'У садок',()=>p.onTakeFish(f.uid)))}{!p.gameState.keepnet.length&&!p.gameState.homeStoredFish.length&&<p className="p-3 text-xs text-slate-400">Поки немає риби для зберігання.</p>}</>}
        {tab==='loot'&&<>{p.gameState.foundLoot.map(l=>row(lootName(l),`${loc(l.locationId)} · День ${l.foundDay}`,'У скриню',()=>p.onStoreLoot(l.uid)))}{p.gameState.homeStoredLoot.map(l=>row(lootName(l),`Знахідка · День ${l.foundDay}`,'Забрати',()=>p.onTakeLoot(l.uid)))}{!p.gameState.foundLoot.length&&!p.gameState.homeStoredLoot.length&&<p className="p-3 text-xs text-slate-400">Скриня поки порожня.</p>}</>}
        {tab==='currencies'&&<div className="space-y-2 p-3 text-xs"><p>Гривні: <b>₴ {p.gameState.credits.toLocaleString('uk-UA')}</b></p><p>Золоті монети: <b>{p.gameState.goldCoins}</b></p><p>Бурштин: <b>{p.gameState.amberShards}</b></p><p className="text-slate-400">Грошові ресурси зберігаються на рахунку персонажа.</p></div>}
      </div>
    </section>}
    {opened.includes('trophies')&&<section className={panel} style={{left:positions.trophies.x,top:positions.trophies.y}}>
      {header('trophies','Кімната трофеїв',<Trophy size={16}/>)}
      <div className="max-h-[55vh] overflow-y-auto">
        <div className="border-b border-white/10 px-3 py-2 text-[11px] font-bold text-amber-200">Риба на стенді</div>
        {p.gameState.homeStoredFish.filter(f=>f.isTrophy||f.isMutant).map(f=>row(fishName(f),`${f.weightKg.toFixed(2)} кг · ${f.lengthCm} см · День ${f.caughtDay}`,'Виставити',()=>p.onMountFish(f.uid)))}
        {p.gameState.homeTrophyFish.map(f=>row(fishName(f),`${f.weightKg.toFixed(2)} кг · ${f.lengthCm} см · ${loc(f.locationId)}`,'Зняти',()=>p.onUnmountFish(f.uid)))}
        <div className="border-y border-white/10 px-3 py-2 text-[11px] font-bold text-amber-200">Монети та артефакти у вітрині</div>
        {p.gameState.homeStoredLoot.map(l=>row(lootName(l),`Знахідка · ${loc(l.locationId)}`,'У вітрину',()=>p.onMountLoot(l.uid)))}
        {p.gameState.homeTrophyLoot.map(l=>row(lootName(l),`День ${l.foundDay} · ${loc(l.locationId)}`,'Зняти',()=>p.onUnmountLoot(l.uid)))}
        <p className="px-3 py-2 text-[10px] text-slate-400">Після виставлення предмет зникає зі сховища. Знятий трофей повертається назад.</p>
      </div>
    </section>}
    {opened.includes('gear')&&<section className={panel} style={{left:positions.gear.x,top:positions.gear.y}}>
      {header('gear','Снасті та інструменти',<Package size={16}/>)}
      <div className="max-h-[55vh] overflow-y-auto p-3 text-xs">
        <p className="mb-2 text-emerald-200">Наявне спорядження</p>
        <p>Вудилища: {p.gameState.ownedRodIds.map(id=>RODS.find(x=>x.id===id)?.name??id).join(', ')||'—'}</p>
        <p className="mt-1">Котушки: {p.gameState.ownedReelIds.map(id=>REELS.find(x=>x.id===id)?.name??id).join(', ')||'—'}</p>
        <p className="mt-1">Ліски: {p.gameState.ownedLineIds.map(id=>LINES.find(x=>x.id===id)?.name??id).join(', ')||'—'}</p>
        <div className="my-3 border-t border-white/10 pt-2"><p className="mb-2 text-emerald-200">Збережені комплекти</p>
          <div className="mb-2 flex gap-1"><input value={setName} onChange={e=>setSetName(e.target.value)} placeholder="Назва комплекту" className="min-w-0 flex-1 rounded bg-black/40 px-2 py-1.5"/><button onClick={()=>{p.onSaveTackleSet(setName);setSetName('')}} className="rounded bg-emerald-700 px-2">Зберегти</button></div>
          {(p.savedTackleSets??[]).map(s=><div key={s.id} className="mb-1 flex items-center justify-between gap-2"><span className="truncate">{s.name}</span><span className="flex gap-1"><button onClick={()=>p.onEquipTackleSet(s)} className="rounded bg-emerald-800 px-2 py-1">Взяти</button><button onClick={()=>p.onDeleteTackleSet(s.id)} className="rounded bg-rose-900 px-2 py-1">×</button></span></div>)}
        </div>
      </div>
    </section>}
  </main>;
};
