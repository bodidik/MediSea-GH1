"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";

/** * SLEDAI-2K Gündüz Modu (Sakin Deniz) Versiyonu
 * Konsept: Beyaz Zemin / Lacivert Vurgu / Güneş Sarısı Detay
 */

type Item = {
  key: string;
  label: string;
  points: number;
  group: "Nöro" | "Renal" | "Kardiyo-Pulmoner" | "Mukokutanöz" | "Kas-İskelet" | "Seroloji" | "Sistemik";
};

const ITEMS: Item[] = [
  { key: "seizure", label: "Nöbet (Seizure)", points: 8, group: "Nöro" },
  { key: "psychosis", label: "Psikoz", points: 8, group: "Nöro" },
  { key: "obs", label: "Organik Beyin Sendromu", points: 8, group: "Nöro" },
  { key: "visual", label: "Görme Bozukluğu", points: 8, group: "Nöro" },
  { key: "cranial", label: "Kraniyal Sinir Tutulumu", points: 8, group: "Nöro" },
  { key: "lupus_headache", label: "Lupus Baş Ağrısı", points: 8, group: "Nöro" },
  { key: "cva", label: "Serebrovasküler Olay (CVA)", points: 8, group: "Nöro" },
  { key: "vasculitis", label: "Vaskülit (Kütanöz/Visseral)", points: 8, group: "Nöro" },
  { key: "arthritis", label: "Artrit (≥2 Eklem)", points: 4, group: "Kas-İskelet" },
  { key: "myositis", label: "Miyozit", points: 4, group: "Kas-İskelet" },
  { key: "casts", label: "İdrar Silendirleri", points: 4, group: "Renal" },
  { key: "hematuria", label: "Hematüri", points: 4, group: "Renal" },
  { key: "proteinuria", label: "Proteinüri (≥0.5 g/gün)", points: 4, group: "Renal" },
  { key: "pyuria", label: "Piyüri (>5 WBC/hpf)", points: 4, group: "Renal" },
  { key: "rash", label: "Malar/Diskoid İnflamatuar Döküntü", points: 2, group: "Mukokutanöz" },
  { key: "alopecia", label: "Aktif Alopesi", points: 2, group: "Mukokutanöz" },
  { key: "ulcers", label: "Oral/Nazal Ülserler", points: 2, group: "Mukokutanöz" },
  { key: "pleurisy", label: "Plevrit", points: 2, group: "Kardiyo-Pulmoner" },
  { key: "pericarditis", label: "Perikardit", points: 2, group: "Kardiyo-Pulmoner" },
  { key: "low_complement", label: "Düşük Kompleman (C3/C4)", points: 2, group: "Seroloji" },
  { key: "anti_dsDNA", label: "Artmış Anti-dsDNA", points: 2, group: "Seroloji" },
  { key: "fever", label: "Ateş (>38°C, non-enfeksiyöz)", points: 1, group: "Sistemik" },
  { key: "thrombocytopenia", label: "Trombositopeni (<100k)", points: 1, group: "Sistemik" },
  { key: "leukopenia", label: "Lökopeni (<3k)", points: 1, group: "Sistemik" },
];

const GROUP_ORDER: Item["group"][] = ["Nöro", "Renal", "Kardiyo-Pulmoner", "Mukokutanöz", "Kas-İskelet", "Seroloji", "Sistemik"];

export default function SLEDAIPage() {
  const [sel, setSel] = React.useState<Record<string, boolean>>({});

  const total = React.useMemo(() => ITEMS.reduce((acc, it) => (sel[it.key] ? acc + it.points : acc), 0), [sel]);

  const interpret = (score: number) => {
    if (score <= 4) return { label: "Düşük Aktivite", color: "text-emerald-700", bg: "bg-emerald-50" };
    if (score <= 9) return { label: "Orta Aktivite", color: "text-amber-700", bg: "bg-amber-50" };
    if (score <= 14) return { label: "Yüksek Aktivite", color: "text-rose-700", bg: "bg-rose-50" };
    return { label: "Çok Yüksek Aktivite", color: "text-rose-900", bg: "bg-rose-100" };
  };

  const interp = interpret(total);

  const toggle = (k: string) => setSel(s => ({ ...s, [k]: !s[k] }));
  const reset = () => setSel({});

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* BAŞLIK */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b-2 border-blue-900/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🧬</div>
            <div>
              <div className="flex items-center gap-2">
                 <span className="text-amber-500 text-xs">☀️</span>
                 <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">SLEDAI-2K</h1>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Lupus Hastalık Aktivite İndeksi</p>
            </div>
          </div>
          <button onClick={reset} className="px-6 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black text-blue-900 hover:bg-slate-50 transition-all uppercase tracking-widest">Sıfırla 🔄</button>
        </div>

        {/* ANA SKOR PANELİ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2.5rem] p-8 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">TOPLAM</span>
            <div className="text-6xl font-black text-white">{total}</div>
          </div>
          <div className={`md:col-span-3 rounded-[2.5rem] p-8 flex flex-col justify-center border-2 border-dashed border-blue-900/10 ${interp.bg}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">KLİNİK AKTİVİTE DURUMU</span>
            <p className={`text-3xl font-black italic tracking-tight ${interp.color}`}>
              {interp.label}
            </p>
          </div>
        </div>

        {/* KRİTER GRUPLARI */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {GROUP_ORDER.map((g) => (
            <div key={g} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
              <h2 className="text-[10px] font-black text-blue-900 uppercase tracking-[0.3em] ml-2 opacity-60 border-l-4 border-amber-400 pl-3">
                {g}
              </h2>
              <div className="space-y-2">
                {ITEMS.filter(it => it.group === g).map((it) => (
                  <label 
                    key={it.key} 
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
                      ${sel[it.key] ? 'bg-blue-900 border-blue-900 text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/20'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all
                        ${sel[it.key] ? 'bg-amber-400 border-amber-400 text-blue-900' : 'bg-white border-slate-200 text-transparent'}
                      `}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                      </div>
                      <span className={`text-xs font-bold leading-tight ${sel[it.key] ? 'text-white' : 'text-blue-900/70'}`}>
                        {it.label}
                      </span>
                    </div>
                    <input type="checkbox" className="hidden" checked={!!sel[it.key]} onChange={() => toggle(it.key)} />
                    <span className={`text-[10px] font-black ${sel[it.key] ? 'text-amber-400' : 'text-slate-400'}`}>+{it.points}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={{ ...sel, total }} />
          </div>
          <p className="text-[9px] text-blue-900/60 font-bold uppercase tracking-[0.15em] text-center leading-relaxed italic max-w-2xl mx-auto">
            ⚠️ SLEDAI-2K son 10 gündeki kalıcı, tekrarlayan veya yeni gelişen bulguları değerlendirir. Klinik aktiviteyi objektif olarak ölçmek içindir, tek başına tanı koydurmaz.
          </p>
        </div>

      </div>
    </div>
  );
}