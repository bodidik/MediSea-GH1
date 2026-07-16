"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS = [
  { key: "cancer",    label: "Aktif Kanser",                    pts: 3, sub: "Metastaz veya kemoterapi/radyoterapi ≤6 ay" },
  { key: "prevvte",   label: "Geçirilmiş VTE",                  pts: 3, sub: "PE veya DVT öyküsü (yüzeyel tromboz hariç)" },
  { key: "mobility",  label: "Azalmış Mobilite",                pts: 3, sub: "≥3 gün yatak istirahati (hasta/hekim kararıyla)" },
  { key: "thrombo",   label: "Trombofili",                      pts: 3, sub: "Protein C/S eksikliği, faktör V Leiden, antifosfolipid antikoru" },
  { key: "trauma",    label: "Travma / Cerrahi",                pts: 2, sub: "Son 1 ay içinde" },
  { key: "age",       label: "Yaş ≥ 70",                       pts: 1, sub: "" },
  { key: "cardioresp",label: "Kalp / Solunum Yetmezliği",      pts: 1, sub: "KKY veya solunum yetmezliği" },
  { key: "ami",       label: "Akut MI veya İskemik İnme",       pts: 1, sub: "" },
  { key: "infect",    label: "Akut Enfeksiyon / Romatizmal Hst",pts: 1, sub: "" },
  { key: "obesity",   label: "Obezite (BMI ≥ 30)",             pts: 1, sub: "" },
  { key: "hormone",   label: "Hormon Tedavisi",                 pts: 1, sub: "OKS, HRT veya tamoksifen" },
];

export default function PaduaPage() {
  const [sel, setSel] = React.useState<Record<string, boolean>>({});
  const score = ITEMS.reduce((s, it) => s + (sel[it.key] ? it.pts : 0), 0);
  const highRisk = score >= 4;
  const params: Record<string, number> = {};
  ITEMS.forEach(it => { if (sel[it.key]) params[it.key] = 1; });

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="padua" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🩸</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Padua Skoru</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Yatan Dahili Hastalarda VTE Profilaksi Kararı</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid gap-2">
            {ITEMS.map(it => (
              <label key={it.key} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
                ${sel[it.key] ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center
                    ${sel[it.key] ? 'bg-amber-400 border-amber-400 text-blue-900' : 'bg-white border-slate-200 text-transparent'}`}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <div>
                    <span className={`text-sm font-bold block ${sel[it.key] ? 'text-white' : 'text-blue-900/70 group-hover:text-blue-900'}`}>{it.label}</span>
                    {it.sub && <span className={`text-[9px] font-bold uppercase tracking-widest ${sel[it.key] ? 'text-blue-200/60' : 'text-slate-400'}`}>{it.sub}</span>}
                  </div>
                </div>
                <input type="checkbox" className="hidden" checked={!!sel[it.key]} onChange={() => setSel(p => ({...p, [it.key]: !p[it.key]}))} />
                <span className={`text-[10px] font-black tracking-widest shrink-0 ${sel[it.key] ? 'text-amber-400' : 'text-slate-400'}`}>+{it.pts}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">SKOR</span>
            <div className="text-5xl font-black text-white">{score}</div>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed transition-all
            ${highRisk ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">KARAR</span>
            <p className={`text-2xl font-black italic tracking-tight ${highRisk ? 'text-rose-700' : 'text-emerald-700'}`}>
              {highRisk ? 'YÜKSEK RİSK — Profilaksi Önerilir' : 'DÜŞÜK RİSK — Rutin Takip'}
            </p>
            <p className={`text-sm font-bold mt-1 ${highRisk ? 'text-rose-600' : 'text-emerald-600'} opacity-80`}>
              {highRisk ? 'Eşik: ≥4 puan · LMWH veya fondaparinuks değerlendir' : 'Eşik: <4 puan · Erken mobilizasyon'}
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
              Padua skoru yalnızca dahili (non-cerrahi) yatan hastalar içindir. Kanama riski (HAS-BLED, IMPROVE) ayrıca değerlendirilmelidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
