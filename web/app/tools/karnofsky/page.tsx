"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const GRADES = [
  { value: 100, label: "100 — Normal",                     desc: "Şikayet yok, hastalık belirtisi yok" },
  { value: 90,  label: "90 — Normal aktivite",             desc: "Normal aktivite, minimal semptomlar" },
  { value: 80,  label: "80 — Zorlanarak normal aktivite",  desc: "Normal aktivite efor gerektirir, semptomlar var" },
  { value: 70,  label: "70 — Öz bakım yapıyor",            desc: "Kendine bakabiliyor, normal çalışma yapamıyor" },
  { value: 60,  label: "60 — Arada yardım gerekiyor",      desc: "Öz bakımın büyük bölümünü yapıyor, yardım zaman zaman gerekli" },
  { value: 50,  label: "50 — Sık yardım gerekiyor",        desc: "Sık tıbbi bakım ve yardım gerekiyor" },
  { value: 40,  label: "40 — Engelli",                     desc: "Özel bakım ve yardım gerekiyor, yarı yatağa bağımlı" },
  { value: 30,  label: "30 — Ağır engelli",                desc: "Hastaneye yatış endikasyonu, aktif destekleyici tedavi" },
  { value: 20,  label: "20 — Çok ağır hasta",              desc: "Hastaneye yatış zorunlu, aktif destek gerekiyor" },
  { value: 10,  label: "10 — Ölmekte",                     desc: "Ölümcül süreç hızla ilerliyor" },
  { value: 0,   label: "0 — Exitus",                       desc: "" },
];

export default function KarnofskyPage() {
  const [selected, setSelected] = React.useState<number | null>(null);

  const getInterp = (v: number | null) => {
    if (v === null) return null;
    if (v >= 80) return { label: "BAĞIMSIZ",           color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", sub: "Evde yaşayabiliyor, özel bakım gerektirmiyor" };
    if (v >= 50) return { label: "YARIDAN BAĞIMLI",    color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200",  sub: "Değişen düzeyde yardım ve tıbbi bakım gerekiyor" };
    if (v >= 10) return { label: "BAĞIMLI / YATAĞA BAĞLI", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", sub: "Hastane veya hospis bakımı değerlendirilmeli" };
    return           { label: "EXITUS",                color: "text-slate-500",  bg: "bg-slate-100", border: "border-slate-200",  sub: "" };
  };
  const interp = getInterp(selected);
  const params = { kps: selected ?? "" };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="karnofsky" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🕊️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Karnofsky Performans Skalası</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">KPS — Fonksiyonel Kapasite & Prognoz</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid gap-2">
            {GRADES.map(g => (
              <button key={g.value} type="button" onClick={() => setSelected(g.value)}
                className={`text-left flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all
                  ${selected === g.value ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0
                    ${selected === g.value ? 'bg-amber-400 text-blue-900' : 'bg-white border border-slate-200 text-blue-900/60'}`}>
                    {g.value}
                  </div>
                  <div>
                    <span className={`text-sm font-bold block ${selected === g.value ? 'text-white' : 'text-blue-950'}`}>{g.label}</span>
                    {g.desc && <span className={`text-[10px] font-bold uppercase tracking-widest ${selected === g.value ? 'text-blue-200/70' : 'text-slate-400'}`}>{g.desc}</span>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-6xl font-black italic">KPS</div>
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">KARNOFSKY SKORU</span>
          <div className="text-7xl font-black text-white">{selected ?? "–"}</div>
          {selected !== null && <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">/ 100</span>}
        </div>

        {interp && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${interp.border} ${interp.bg}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest block mb-2">BAĞIMLILIK DÜZEYI</span>
            <p className={`text-2xl font-black italic tracking-tight ${interp.color}`}>{interp.label}</p>
            {interp.sub && <p className={`text-sm font-bold mt-1 ${interp.color} opacity-80`}>{interp.sub}</p>}
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              KPS kemoterapi uygunluğu, klinik çalışma katılımı ve prognoz değerlendirmesinde kullanılır. KPS &lt;50 çoğu yoğun kemoterapide dışlama kriteridir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
