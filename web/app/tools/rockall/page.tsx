"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const AGE_OPTS      = [["< 60 yaş", 0], ["60–79 yaş", 1], ["≥ 80 yaş", 2]] as const;
const SHOCK_OPTS    = [["Şok yok (SKB≥100, Nabız<100)", 0], ["Taşikardi (SKB≥100, Nabız≥100)", 1], ["Hipotansiyon (SKB<100)", 2]] as const;
const COMOR_OPTS    = [["Komorbidite yok", 0], ["KKY, KAH veya herhangi major komorbidite", 2], ["Böbrek/KC yetmezliği veya metastatik kanser", 3]] as const;
const ENDO_OPTS     = [["Lezyon yok / Mallory-Weiss yırtığı", 0], ["Peptik ülser, erozyon veya özofajit", 1], ["Malignite, kanayan damar veya pıhtı", 2]] as const;
const STIGMATA_OPTS = [["Aktif kanama bulgusu yok / koyu nokta", 0], ["ÜGİS'de kan, adhezan pıhtı veya fışkıran damar", 2]] as const;

export default function RockallPage() {
  const [age, setAge]       = React.useState(0);
  const [shock, setShock]   = React.useState(0);
  const [comor, setComor]   = React.useState(0);
  const [endo, setEndo]     = React.useState(0);
  const [stig, setStig]     = React.useState(0);

  const preEndo  = age + shock + comor;
  const postEndo = preEndo + endo + stig;

  const getPreRisk = (s: number) => {
    if (s === 0) return { label: "DÜŞÜK", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", sub: "Yeniden kanama riski düşük" };
    if (s <= 2)  return { label: "ORTA",  color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200",  sub: "Yakın takip önerilir" };
    return { label: "YÜKSEK", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", sub: "Yoğun bakım değerlendirmesi" };
  };

  const getPostRisk = (s: number) => {
    if (s <= 2) return { label: "DÜŞÜK", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", sub: "≤%0.1 mortalite · Erken taburculuk mümkün" };
    if (s <= 4) return { label: "ORTA",  color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200",  sub: "~%5.3 mortalite" };
    if (s <= 6) return { label: "YÜKSEK", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", sub: "~%11 mortalite" };
    return { label: "ÇOK YÜKSEK", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", sub: "≥%41 mortalite" };
  };

  const rPre  = getPreRisk(preEndo);
  const rPost = getPostRisk(postEndo);
  const params = { age, shock, comor, endo, stig };

  const SelectRow = ({ label, opts, value, onChange }: { label: string; opts: readonly (readonly [string, number])[]; value: number; onChange: (v: number) => void }) => (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
      <span className="text-sm font-bold text-blue-900/80 block">{label}</span>
      <div className="grid gap-1.5">
        {opts.map(([l, v]) => (
          <label key={v} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all
            ${value === v ? 'bg-blue-900 border-blue-900 text-white' : 'bg-white border-slate-100 hover:border-blue-900/30'}`}>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
              ${value === v ? 'border-amber-400 bg-amber-400' : 'border-slate-300'}`}>
              {value === v && <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />}
            </div>
            <input type="radio" className="hidden" checked={value === v} onChange={() => onChange(v)} />
            <span className={`text-[12px] font-bold flex-1 ${value === v ? 'text-white' : 'text-blue-900/70'}`}>{l}</span>
            <span className={`text-[10px] font-black ${value === v ? 'text-amber-400' : 'text-slate-400'}`}>+{v}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="rockall" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🍺</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Rockall Skoru</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Üst GİS Kanaması — Yeniden Kanama & Mortalite Riski</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klinik (Endoskopi Öncesi)</p>
          <SelectRow label="Yaş" opts={AGE_OPTS} value={age} onChange={setAge} />
          <SelectRow label="Şok" opts={SHOCK_OPTS} value={shock} onChange={setShock} />
          <SelectRow label="Komorbidite" opts={COMOR_OPTS} value={comor} onChange={setComor} />

          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">Endoskopi Bulguları</p>
          <SelectRow label="Endoskopik Tanı" opts={ENDO_OPTS} value={endo} onChange={setEndo} />
          <SelectRow label="Kanama Stigmataları" opts={STIGMATA_OPTS} value={stig} onChange={setStig} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-900/80 rounded-[2rem] p-5 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400/60">
            <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">Pre-Endoskopi</span>
            <div className="text-4xl font-black text-white">{preEndo}</div>
            <span className={`text-[10px] font-black mt-1 ${rPre.color.replace('text-', 'text-').replace('700', '300')}`}>{rPre.label}</span>
          </div>
          <div className="bg-blue-900 rounded-[2rem] p-5 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">Post-Endoskopi</span>
            <div className="text-4xl font-black text-white">{postEndo}</div>
            <span className="text-[10px] font-black text-amber-300 mt-1">TAM SKOR</span>
          </div>
        </div>

        <div className={`rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed ${rPost.border} ${rPost.bg}`}>
          <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">RİSK DEĞERLENDİRMESİ</span>
          <p className={`text-2xl font-black italic tracking-tight ${rPost.color}`}>{rPost.label}</p>
          <p className={`text-sm font-bold mt-1 ${rPost.color} opacity-80`}>{rPost.sub}</p>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Rockall skoru ÜGİS kanamasında yeniden kanama ve mortaliteyi tahmin eder. Glasgow-Blatchford skoru endoskopi gerekliliği için, Rockall ise prognoz için kullanılır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
