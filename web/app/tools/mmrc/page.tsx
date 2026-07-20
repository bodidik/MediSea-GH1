"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const GRADES = [
  { grade: 0, label: "Efor sırasında değil, yalnızca ağır egzersizde nefes darlığı", tag: "Minimal", color: "emerald" },
  { grade: 1, label: "Düz zeminde hızlı yürürken veya hafif bir yokuş çıkarken nefes darlığı", tag: "Hafif", color: "emerald" },
  { grade: 2, label: "Nefes darlığı nedeniyle yaşıtlarından daha yavaş yürüyor veya düz zeminde 15 dakikadan sonra durmak zorunda kalıyor", tag: "Orta", color: "amber" },
  { grade: 3, label: "Düz zeminde yaklaşık 100 m yürüdükten sonra veya birkaç dakika yürüdükten sonra durmak zorunda kalıyor", tag: "Ağır", color: "orange" },
  { grade: 4, label: "Evden çıkamıyor veya giyinip soyunurken nefes darlığı yaşıyor", tag: "Çok Ağır", color: "rose" },
];

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  badge: "bg-orange-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function MMRCPage() {
  const [sel, setSel] = React.useState<number | null>(null);
  const g = sel !== null ? GRADES[sel] : null;
  const c = g ? COLOR[g.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="mmrc" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🫁</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">mMRC Dispne</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Modifiye Medical Research Council · Dispne Şiddet Skalası · Grade 0–4</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
          <p className="text-[10px] font-bold text-blue-800">📌 GOLD kılavuzu mMRC ≥ 2 veya CAT ≥ 10 eşiğini "yüksek semptom" grubu olarak tanımlar. mMRC aynı zamanda BODE indeksinin bileşenidir.</p>
        </div>

        <div className="space-y-2">
          {GRADES.map(g => (
            <button key={g.grade} type="button" onClick={() => setSel(s => s === g.grade ? null : g.grade)}
              className={`w-full text-left flex items-center gap-4 p-4 rounded-2xl border-2 transition-all
                ${sel === g.grade ? "border-blue-900 bg-blue-900 text-white shadow-md" : "border-slate-200 bg-white text-blue-950 hover:border-blue-300"}`}>
              <div className={`w-10 h-10 rounded-xl shrink-0 flex items-center justify-center font-black text-lg border-2
                ${sel === g.grade ? "bg-amber-400 border-amber-400 text-blue-900" : "bg-slate-100 border-slate-200 text-slate-500"}`}>
                {g.grade}
              </div>
              <div className="flex-1">
                <p className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${sel === g.grade ? "text-amber-300" : "text-slate-400"}`}>{g.tag}</p>
                <p className={`text-[11px] font-bold leading-snug ${sel === g.grade ? "text-white" : "text-slate-700"}`}>{g.label}</p>
              </div>
            </button>
          ))}
        </div>

        {sel !== null && g && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} flex items-center gap-6`}>
            <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
              <span className="text-[8px] font-black text-blue-300 uppercase">Grade</span>
              <span className="text-5xl font-black text-white leading-none">{g.grade}</span>
            </div>
            <div>
              <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{g.tag.toUpperCase()}</span>
              <p className={`text-sm font-bold mt-1 ${c.text}`}>{g.label}</p>
              <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">
                {g.grade >= 2 ? "GOLD: Yüksek semptom grubu → LABA/LAMA kombinasyonu değerlendir" : "GOLD: Düşük semptom — monoterapi yeterli olabilir"}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hasta için uygun tanımı seçin</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={{ grade: sel ?? 0 }} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              mMRC tek başına tedavi kararı için yetersizdir; spirometri, alevlenme öyküsü ve CAT ile birlikte değerlendirilmelidir. Bestall et al., Thorax 1999.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
