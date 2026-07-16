"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const BURDEN_OPTS = [["Semptom yok / hafif semptom", 5], ["Orta düzey semptom", 3], ["Ciddi semptom / eksitus hali", 0]] as const;

export default function MasccPage() {
  const [burden, setBurden] = React.useState(5);
  const [hypotension, setHypotension] = React.useState(false); // yok → +5
  const [copd, setCopd] = React.useState(false);               // yok → +4
  const [solidOrNoFungal, setSolidOrNoFungal] = React.useState(false); // solid tümör veya önceden fungal enf. yok → +4
  const [dehydration, setDehydration] = React.useState(false); // yok → +3
  const [outpatient, setOutpatient] = React.useState(false);   // ateş başladığında ayaktan → +3
  const [age60, setAge60] = React.useState(false);             // <60 yaş → +2

  const score = burden
    + (hypotension ? 0 : 5)
    + (copd ? 0 : 4)
    + (solidOrNoFungal ? 4 : 0)
    + (dehydration ? 0 : 3)
    + (outpatient ? 3 : 0)
    + (age60 ? 0 : 2);

  const lowRisk = score >= 21;
  const params = { b: burden, h: hypotension?1:"", c: copd?1:"", s: solidOrNoFungal?1:"", d: dehydration?1:"", o: outpatient?1:"", a: age60?1:"" };

  const CheckRow = ({ label, sub, pts, checked, onChange }: { label: string; sub: string; pts: number; checked: boolean; onChange: () => void }) => (
    <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
      ${checked ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0
          ${checked ? 'bg-amber-400 border-amber-400 text-blue-900' : 'bg-white border-slate-200 text-transparent'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <div>
          <span className={`text-sm font-bold block ${checked ? 'text-white' : 'text-blue-900/70 group-hover:text-blue-900'}`}>{label}</span>
          <span className={`text-[9px] font-bold uppercase tracking-widest ${checked ? 'text-blue-200/60' : 'text-slate-400'}`}>{sub}</span>
        </div>
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      <span className={`text-[10px] font-black tracking-widest shrink-0 ${checked ? 'text-amber-400' : 'text-slate-400'}`}>+{pts}</span>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="mascc" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🎗️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">MASCC Risk İndeksi</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Febril Nötropenide Komplikasyon Riski</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <span className="text-sm font-bold text-blue-900/80 block">Hastalık Yükü / Semptom Şiddeti</span>
            <div className="grid gap-1.5">
              {BURDEN_OPTS.map(([l, v]) => (
                <label key={v} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all
                  ${burden === v ? 'bg-blue-900 border-blue-900 text-white' : 'bg-white border-slate-100 hover:border-blue-900/30'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                    ${burden === v ? 'border-amber-400 bg-amber-400' : 'border-slate-300'}`}>
                    {burden === v && <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />}
                  </div>
                  <input type="radio" className="hidden" checked={burden === v} onChange={() => setBurden(v)} />
                  <span className={`text-[12px] font-bold flex-1 ${burden === v ? 'text-white' : 'text-blue-900/70'}`}>{l}</span>
                  <span className={`text-[10px] font-black ${burden === v ? 'text-amber-400' : 'text-slate-400'}`}>+{v}</span>
                </label>
              ))}
            </div>
          </div>

          <CheckRow label="Hipotansiyon Yok" sub="SKB > 90 mmHg" pts={5} checked={hypotension} onChange={() => setHypotension(v => !v)} />
          <CheckRow label="KOAH Yok" sub="Aktif kronik obstrüktif akciğer hastalığı yok" pts={4} checked={copd} onChange={() => setCopd(v => !v)} />
          <CheckRow label="Solid Tümör veya Önceden Fungal Enf. Yok" sub="Hematolojik maligniteye bağlı geçmiş fungal enfeksiyon yok" pts={4} checked={solidOrNoFungal} onChange={() => setSolidOrNoFungal(v => !v)} />
          <CheckRow label="Dehidratasyon Yok" sub="IV sıvı gerektirmiyor" pts={3} checked={dehydration} onChange={() => setDehydration(v => !v)} />
          <CheckRow label="Ateş Başlangıcında Ayaktan Hasta" sub="Hastane dışında" pts={3} checked={outpatient} onChange={() => setOutpatient(v => !v)} />
          <CheckRow label="Yaş < 60" sub="" pts={2} checked={age60} onChange={() => setAge60(v => !v)} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">MASCC</span>
            <div className="text-5xl font-black text-white">{score}</div>
            <span className="text-[10px] font-black text-blue-300 mt-1">/ 26</span>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed
            ${lowRisk ? 'border-emerald-200 bg-emerald-50' : 'border-rose-200 bg-rose-50'}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">RİSK</span>
            <p className={`text-2xl font-black italic tracking-tight ${lowRisk ? 'text-emerald-700' : 'text-rose-700'}`}>
              {lowRisk ? 'DÜŞÜK RİSK' : 'YÜKSEK RİSK'}
            </p>
            <p className={`text-sm font-bold mt-1 ${lowRisk ? 'text-emerald-600' : 'text-rose-600'} opacity-80`}>
              {lowRisk ? 'Eşik: ≥21 puan · Ayaktan oral antibiyotik değerlendirilebilir' : 'Eşik: <21 puan · Hastane yatışı ve IV antibiyotik önerilir'}
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              MASCC indeksi febril nötropenik hastalarda düşük riskli grubu (ayaktan tedavi adayı) belirlemek için kullanılır. Nihai karar kurumsal protokol ve klinik değerlendirmeyle birlikte verilmelidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
