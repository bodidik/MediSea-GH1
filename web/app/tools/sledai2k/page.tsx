"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";

/** * SLEDAI-2K Hızlı Değerlendirme - Gündüz Modu (Sakin Deniz)
 * Konsept: Beyaz Zemin / Lacivert Vurgu / Güneş Sarısı Detay
 */

type Item = { key: string; label: string; pts: number };

const ITEMS: Item[] = [
  { key: "seizure", label: "Nöbet", pts: 8 },
  { key: "psychosis", label: "Psikoz", pts: 8 },
  { key: "cva", label: "Serebrovasküler Olay", pts: 8 },
  { key: "vasculitis", label: "Vaskülit", pts: 8 },
  { key: "arthritis", label: "Artrit", pts: 4 },
  { key: "myositis", label: "Miyozit", pts: 4 },
  { key: "urinary", label: "Aktif İdrar Sedimenti", pts: 4 },
  { key: "proteinuria", label: "Proteinüri (>0.5 g/gün)", pts: 4 },
  { key: "lowComplement", label: "Düşük Kompleman", pts: 2 },
  { key: "antiDsDNA", label: "Anti-dsDNA Yüksekliği", pts: 2 },
  { key: "rash", label: "Lupus Döküntüsü", pts: 2 },
  { key: "alopecia", label: "Aktif Alopesi", pts: 2 },
  { key: "mucosal", label: "Oral/Nazal Ülserler", pts: 2 },
  { key: "fever", label: "Ateş (>38°C)", pts: 1 },
  { key: "thrombocytopenia", label: "Trombositopeni (<100k)", pts: 1 },
  { key: "leukopenia", label: "Lökopeni (<3k)", pts: 1 },
];

export default function Sledai2kPage() {
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const initial: Record<string, boolean> = {};
  ITEMS.forEach(i => { initial[i.key] = (search?.get(i.key) === "1"); });

  const [sel, setSel] = React.useState<Record<string, boolean>>(initial);
  function toggle(k: string) { setSel(s => ({ ...s, [k]: !s[k] })); }

  const score = ITEMS.reduce((sum, it) => sum + (sel[it.key] ? it.pts : 0), 0);

  let activity = { label: "Aktif Hastalık Yok", color: "text-slate-400", bg: "bg-slate-100" };
  if (score >= 12) activity = { label: "YÜKSEK AKTİVİTE", color: "text-rose-700", bg: "bg-rose-50" };
  else if (score >= 6) activity = { label: "ORTA AKTİVİTE", color: "text-amber-700", bg: "bg-amber-50" };
  else if (score >= 1) activity = { label: "DÜŞÜK AKTİVİTE", color: "text-emerald-700", bg: "bg-emerald-50" };

  const params: Record<string, string|number> = {};
  ITEMS.forEach(i => { if (sel[i.key]) params[i.key] = 1; });

  return (
    // SAKİN DENİZ: bg-slate-50 | text-blue-950
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            🧬
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">SLEDAI-2K</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Hızlı Hastalık Aktivite Analizi</p>
          </div>
        </div>

        {/* KRİTER LİSTESİ: BEYAZ KARTLAR */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ITEMS.map((it) => (
              <label 
                key={it.key} 
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
                  ${sel[it.key] ? 'bg-blue-900 border-blue-900 text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all
                    ${sel[it.key] ? 'bg-amber-400 border-amber-400 text-blue-900 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-white border-slate-200 text-transparent'}
                  `}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <span className={`text-sm font-bold transition-colors ${sel[it.key] ? 'text-white' : 'text-blue-900/70 group-hover:text-blue-900'}`}>
                    {it.label}
                  </span>
                </div>
                <input type="checkbox" className="hidden" checked={!!sel[it.key]} onChange={() => toggle(it.key)} />
                <span className={`text-[10px] font-black tracking-widest ${sel[it.key] ? 'text-amber-400' : 'text-slate-400'}`}>
                  +{it.pts}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ANALİZ SONUCU: LACİVERT & ALTIN */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">SKOR</span>
            <div className="text-5xl font-black text-white">{score}</div>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed border-blue-900/10 ${activity.bg} transition-colors duration-500`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">AKTİVİTE DURUMU</span>
            <p className={`text-2xl font-black italic tracking-tight ${activity.color}`}>
              {activity.label}
            </p>
          </div>
        </div>

        {/* ALT PANEL: PAYLAŞIM VE İSTİHBARAT */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Bu araç SLEDAI-2K klinik asistanıdır. Skorlar akademik çalışmalara dayanmaktadır ancak nihai klinik yargı ve tedavi planı hekim sorumluluğundadır.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}