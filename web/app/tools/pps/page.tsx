"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const PPS_TABLE = [
  { pps: 100, ambulation: "Tam",           activity: "Normal — hastalık yok",                    selfcare: "Tam",          intake: "Normal",              consciousness: "Uyanık/Net" },
  { pps: 90,  ambulation: "Tam",           activity: "Normal — hastalık izleri var",               selfcare: "Tam",          intake: "Normal",              consciousness: "Uyanık/Net" },
  { pps: 80,  ambulation: "Tam",           activity: "Normal aktivite — efor gerekiyor",           selfcare: "Tam",          intake: "Normal/Azalmış",      consciousness: "Uyanık/Net" },
  { pps: 70,  ambulation: "Azalmış",       activity: "İş yapamıyor — önemli hastalık var",        selfcare: "Tam",          intake: "Normal/Azalmış",      consciousness: "Uyanık/Net" },
  { pps: 60,  ambulation: "Azalmış",       activity: "Hobiler/ev işleri yapamıyor",               selfcare: "Ara sıra yardım",intake: "Normal/Azalmış",    consciousness: "Uyanık/Net veya Konfüze" },
  { pps: 50,  ambulation: "Ağırlıklı oturur",activity: "Herhangi bir iş yapamıyor",               selfcare: "Sıklıkla yardım",intake: "Normal/Azalmış",   consciousness: "Uyanık/Net veya Konfüze" },
  { pps: 40,  ambulation: "Ağırlıklı yatar", activity: "Herhangi bir iş yapamıyor",               selfcare: "Ağırlıklıkla yardım",intake: "Normal/Azalmış",consciousness: "Uyanık/Net veya Uyuklar veya Konfüze" },
  { pps: 30,  ambulation: "Yatakta",       activity: "Herhangi bir iş yapamıyor",                 selfcare: "Tam bakım",    intake: "Azalmış",             consciousness: "Uyanık/Net veya Uyuklar veya Konfüze" },
  { pps: 20,  ambulation: "Yatakta",       activity: "Herhangi bir iş yapamıyor",                 selfcare: "Tam bakım",    intake: "Minimal ağız/yudum",  consciousness: "Uyanık/Net veya Uyuklar veya Konfüze" },
  { pps: 10,  ambulation: "Yatakta",       activity: "Herhangi bir iş yapamıyor",                 selfcare: "Tam bakım",    intake: "Ağız bakımı",         consciousness: "Uyuklar veya Komada" },
  { pps: 0,   ambulation: "–",             activity: "Exitus",                                     selfcare: "–",            intake: "–",                   consciousness: "–" },
];

export default function PpsPage() {
  const [selected, setSelected] = React.useState<number | null>(null);

  const getInterp = (v: number | null) => {
    if (v === null) return null;
    if (v >= 70) return { label: "BAĞIMSIZ",         sub: "Tahmini medyan hayatta kalma: aylar–yıllar",  color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (v >= 40) return { label: "BAĞIMLI",           sub: "Tahmini medyan hayatta kalma: haftalar–aylar", color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" };
    if (v >= 10) return { label: "TERMINAL",          sub: "Tahmini medyan hayatta kalma: günler–haftalar", color: "text-rose-700",  bg: "bg-rose-50",   border: "border-rose-200" };
    return           { label: "EXITUS",              sub: "",                                             color: "text-slate-500",  bg: "bg-slate-100", border: "border-slate-200" };
  };
  const row = PPS_TABLE.find(r => r.pps === selected);
  const interp = getInterp(selected);
  const params = { pps: selected ?? "" };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="pps" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🕊️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Palliative Performance Scale</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">PPS v2 — Palyatif Bakımda Fonksiyonel Durum</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid gap-2">
            {PPS_TABLE.map(g => (
              <button key={g.pps} type="button" onClick={() => setSelected(g.pps)}
                className={`text-left flex items-center gap-4 p-3 rounded-2xl border transition-all
                  ${selected === g.pps ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0
                  ${selected === g.pps ? 'bg-amber-400 text-blue-900' : 'bg-white border border-slate-200 text-blue-900/60'}`}>
                  {g.pps}
                </div>
                <div className="flex-1 min-w-0 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-0.5">
                  {[
                    { label: "Mobilizasyon", val: g.ambulation },
                    { label: "Aktivite", val: g.activity },
                    { label: "Öz Bakım", val: g.selfcare },
                    { label: "Alım", val: g.intake },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <span className={`text-[8px] font-black uppercase tracking-widest block ${selected === g.pps ? 'text-blue-300' : 'text-slate-400'}`}>{label}</span>
                      <span className={`text-[11px] font-bold leading-tight ${selected === g.pps ? 'text-white' : 'text-blue-900/80'}`}>{val}</span>
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-6xl font-black italic">PPS</div>
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">PPS SKORU</span>
          <div className="text-7xl font-black text-white">{selected ?? "–"}</div>
          {row && <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">{row.consciousness}</span>}
        </div>

        {interp && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${interp.border} ${interp.bg}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest block mb-2">PROGNOZ</span>
            <p className={`text-2xl font-black italic tracking-tight ${interp.color}`}>{interp.label}</p>
            {interp.sub && <p className={`text-sm font-bold mt-1 ${interp.color} opacity-80`}>{interp.sub}</p>}
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              PPS Karnofsky'nin palyatif bakıma uyarlanmış versiyonudur. PPS ≤30 olan hastalar için hospis başvurusu değerlendirilmelidir. Sol-sağ sütunlar "en kötü durum" esas alınarak doldurulur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
