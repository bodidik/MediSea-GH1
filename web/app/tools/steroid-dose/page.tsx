"use client";
import React from "react";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

type Steroid = {
  name: string;
  gluco: number;  // glukokortikoid etkinlik
  half: string;   // etki süresi
  mineralocorticoid: string;
  pred: number;   // prednizon eşdeğeri mg
};

const STEROIDS: Steroid[] = [
  { name: "Hidrokortizon",       gluco: 1,    half: "Kısa (8–12 saat)",    mineralocorticoid: "++",  pred: 0.25 },
  { name: "Kortison",            gluco: 0.8,  half: "Kısa (8–12 saat)",    mineralocorticoid: "+",   pred: 0.2 },
  { name: "Prednizon",           gluco: 4,    half: "Orta (12–36 saat)",   mineralocorticoid: "+/-", pred: 1 },
  { name: "Prednizolon",         gluco: 4,    half: "Orta (12–36 saat)",   mineralocorticoid: "+/-", pred: 1 },
  { name: "Metilprednizolon",    gluco: 5,    half: "Orta (12–36 saat)",   mineralocorticoid: "0",   pred: 1.25 },
  { name: "Triamsinolon",        gluco: 5,    half: "Orta (12–36 saat)",   mineralocorticoid: "0",   pred: 1.25 },
  { name: "Deksametazon",        gluco: 25,   half: "Uzun (36–72 saat)",   mineralocorticoid: "0",   pred: 6.25 },
  { name: "Betametazon",         gluco: 25,   half: "Uzun (36–72 saat)",   mineralocorticoid: "0",   pred: 6.25 },
  { name: "Fludrokortizon",      gluco: 10,   half: "Orta (12–24 saat)",   mineralocorticoid: "++++",pred: 2.5 },
  { name: "Budesonid",           gluco: 40,   half: "Kısa (lokal etki)",   mineralocorticoid: "0",   pred: 10 },
];

export default function SteroidDosePage() {
  const [from, setFrom] = React.useState(2); // prednizon index
  const [dose, setDose] = React.useState("20");

  const doseNum = Math.max(0, parseFloat(dose) || 0);
  const fromSteroid = STEROIDS[from];

  const equiv = (steroid: Steroid) => {
    if (!doseNum || !fromSteroid.pred) return "–";
    const predEq = doseNum * fromSteroid.pred;
    return Math.round((predEq / steroid.pred) * 10) / 10;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="steroid-dose" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦋</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Steroid Eşdeğer Doz</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Kortikosteroid Dönüşüm Tablosu</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 pl-1">Mevcut İlaç</span>
              <select value={from} onChange={e => setFrom(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-sm text-blue-950">
                {STEROIDS.map((s, i) => <option key={i} value={i}>{s.name}</option>)}
              </select>
            </div>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Doz (mg)</span>
              <input type="text" inputMode="decimal" value={dose} onChange={e => setDose(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            </label>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prednizon eşdeğeri: </span>
            <span className="font-black text-blue-900">
              {doseNum && fromSteroid ? Math.round(doseNum * fromSteroid.pred * 10) / 10 : "–"} mg
            </span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="grid grid-cols-5 text-[9px] font-black uppercase tracking-widest text-slate-400 bg-slate-50 border-b border-slate-100 px-4 py-3">
            <span className="col-span-2">İlaç</span>
            <span className="text-center">Eşdeğer Doz</span>
            <span className="text-center">Etki Süresi</span>
            <span className="text-center">Mineralokortikoid</span>
          </div>
          {STEROIDS.map((s, i) => (
            <div key={i} className={`grid grid-cols-5 items-center px-4 py-3 border-b border-slate-50 transition-colors
              ${i === from ? 'bg-blue-900 text-white' : 'hover:bg-slate-50'}`}>
              <span className={`col-span-2 text-sm font-bold ${i === from ? 'text-white' : 'text-blue-950'}`}>{s.name}</span>
              <span className={`text-center text-sm font-black ${i === from ? 'text-amber-400' : 'text-blue-900'}`}>
                {i === from ? `${doseNum || "–"} mg` : `${equiv(s)} mg`}
              </span>
              <span className={`text-center text-[10px] font-bold ${i === from ? 'text-blue-200' : 'text-slate-400'}`}>{s.half.split(" ")[0]}</span>
              <span className={`text-center text-[11px] font-black ${i === from ? 'text-blue-200' : 'text-slate-500'}`}>{s.mineralocorticoid}</span>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Eşdeğer dozlar glukokortikoid etkiye göre hesaplanır; mineralokortikoid etki ayrıca değerlendirilmelidir. Adrenal yetmezlikte stres dozu protokolleri farklıdır. İlaç kesilmesi kademeli yapılmalıdır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
