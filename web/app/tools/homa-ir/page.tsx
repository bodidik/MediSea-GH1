"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

export default function HomaIrPage() {
  const [glucose, setGlucose] = React.useState("95");
  const [insulin, setInsulin] = React.useState("10");

  const glu = parseLocaleNumber(glucose);
  const ins = parseLocaleNumber(insulin);
  const homa = glu > 0 && ins > 0 ? Math.round((glu * ins / 405) * 100) / 100 : 0;

  const getResult = () => {
    if (homa === 0) return { label: "–", color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200", sub: "" };
    if (homa < 1.0) return { label: "İNSÜLİN DUYARLI", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", sub: "Normal insülin duyarlılığı" };
    if (homa < 2.0) return { label: "NORMAL SINIR", color: "text-lime-700", bg: "bg-lime-50", border: "border-lime-200", sub: "Hafif insülin direnci riski — izlem önerilir" };
    if (homa < 2.5) return { label: "SINIRDA İNSÜLİN DİRENCİ", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", sub: "Yaşam tarzı değişikliği değerlendir" };
    return { label: "İNSÜLİN DİRENCİ", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", sub: "HOMA-IR ≥2.5 — klinik değerlendirme gerekli" };
  };
  const r = getResult();
  const params = { glu, ins };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="homa-ir" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦋</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">HOMA-IR</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">İnsülin Direnci İndeksi</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Açlık Kan Glukozu (mg/dL)</span>
            <input type="text" inputMode="decimal" value={glucose} onChange={e => setGlucose(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">8–12 saatlik açlık sonrası ölçüm</span>
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Açlık İnsülin (μIU/mL)</span>
            <input type="text" inputMode="decimal" value={insulin} onChange={e => setInsulin(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest pl-1">Eş zamanlı açlık insülini</span>
          </label>
        </div>

        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-6xl font-black italic">HOMA</div>
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">HOMA-IR</span>
          <div className="text-7xl font-black text-white drop-shadow-lg">{homa || "–"}</div>
          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest mt-2">Glukoz × İnsülin ÷ 405</span>
        </div>

        <div className={`p-6 rounded-[2rem] border-2 border-dashed ${r.border} ${r.bg}`}>
          <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest block mb-2">YORUM</span>
          <p className={`text-2xl font-black italic tracking-tight ${r.color}`}>{r.label}</p>
          {r.sub && <p className={`text-sm font-bold mt-1 ${r.color} opacity-80`}>{r.sub}</p>}
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              HOMA-IR eşik değeri laboratuvara ve popülasyona göre değişir (yaygın eşik: 2.0–2.5). İnsülin ölçümü için standartize assay gereklidir. Tek başına tanı koydurucudeğildir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
