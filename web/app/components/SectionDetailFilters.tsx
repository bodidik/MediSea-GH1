// C:\Users\hucig\Medknowledge\web\app\components\SectionDetailFilters.tsx
"use client";
import React from "react";

export type Item = { type: string; id: string; createdAt: string };
const TYPES = ["Topic","BoardQuestion","Case","Video","Note"] as const;

export default function SectionDetailFilters({ items, onChange }: { items: Item[]; onChange: (rows: Item[]) => void }){
  const [types, setTypes] = React.useState<string[]>([]);
  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");

  React.useEffect(()=>{
    let arr = [...items];
    if (types.length) arr = arr.filter(i=> types.includes(i.type));
    if (from) arr = arr.filter(i=> new Date(i.createdAt) >= new Date(from));
    if (to)   arr = arr.filter(i=> new Date(i.createdAt) <= new Date(to));
    onChange(arr);
  },[types, from, to, items, onChange]);

  function toggle(t: string){ setTypes(prev => prev.includes(t) ? prev.filter(x=>x!==t) : [...prev, t]); }

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 flex flex-col md:flex-row md:items-end gap-6 shadow-lg backdrop-blur-sm mb-6">
      
      {/* Tür Filtreleri */}
      <div className="flex-1">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tür Seçimi</div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t=> {
            const isActive = types.includes(t);
            return (
              <button 
                key={t} 
                onClick={()=>toggle(t)} 
                className={`px-4 py-1.5 rounded-full border text-sm font-medium transition-all duration-300 ${
                  isActive 
                    ? "bg-blue-600 border-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                    : "bg-slate-900/50 border-slate-600 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {t}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tarih Filtreleri */}
      <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Başlangıç</label>
          <input 
            type="date" 
            value={from} 
            onChange={e=>setFrom(e.target.value)} 
            className="px-3 py-2 border border-slate-600 rounded-xl bg-slate-900/50 text-slate-200 text-sm focus:border-blue-500 outline-none transition-colors [color-scheme:dark]" 
          />
        </div>
        <div className="flex flex-col">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Bitiş</label>
          <input 
            type="date" 
            value={to} 
            onChange={e=>setTo(e.target.value)} 
            className="px-3 py-2 border border-slate-600 rounded-xl bg-slate-900/50 text-slate-200 text-sm focus:border-blue-500 outline-none transition-colors [color-scheme:dark]" 
          />
        </div>
      </div>
    </div>
  );
}