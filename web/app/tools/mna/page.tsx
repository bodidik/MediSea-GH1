"use client";

import React, { useState } from "react";
import ToolShare from "../components/ToolShare";

/** * MediSea Donanması - Geriatri & Nütrisyon Üssü
 * MNA® - Mini Nutritional Assessment (Kısa Form)
 */

const QUESTIONS = [
  {
    id: "intake",
    label: "Son 3 ayda iştah kaybı, sindirim sorunları, çiğneme veya yutma zorluğu nedeniyle gıda alımında azalma oldu mu?",
    options: [
      { val: 0, txt: "Ciddi alım azalması" },
      { val: 1, txt: "Hafif alım azalması" },
      { val: 2, txt: "Alım değişmedi" },
    ]
  },
  {
    id: "weightLoss",
    label: "Son 3 ayda kilo kaybı oldu mu?",
    options: [
      { val: 0, txt: "3 kg'dan fazla kayıp" },
      { val: 1, txt: "Bilinmiyor" },
      { val: 2, txt: "1-3 kg arası kayıp" },
      { val: 3, txt: "Kilo kaybı yok" },
    ]
  },
  {
    id: "mobility",
    label: "Hareketlilik (Mobilite) durumu nedir?",
    options: [
      { val: 0, txt: "Yatağa veya tekerlekli sandalyeye bağımlı" },
      { val: 1, txt: "Yataktan kalkabiliyor ancak dışarı çıkamıyor" },
      { val: 2, txt: "Dışarı çıkabiliyor" },
    ]
  },
  {
    id: "stress",
    label: "Son 3 ayda psikolojik stres veya akut hastalık geçirdi mi?",
    options: [
      { val: 0, txt: "Evet" },
      { val: 2, txt: "Hayır" },
    ]
  },
  {
    id: "neuro",
    label: "Nöropsikolojik sorunlar var mı?",
    options: [
      { val: 0, txt: "Ağır demans veya depresyon" },
      { val: 1, txt: "Hafif demans" },
      { val: 2, txt: "Psikolojik sorun yok" },
    ]
  },
  {
    id: "bmi",
    label: "Vücut Kitle İndeksi (VKİ) kg/m²",
    options: [
      { val: 0, txt: "VKİ < 19" },
      { val: 1, txt: "VKİ: 19 - 21" },
      { val: 2, txt: "VKİ: 21 - 23" },
      { val: 3, txt: "VKİ ≥ 23" },
    ]
  }
];

export default function MNAPage() {
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const score = Object.values(answers).reduce((a, b) => a + b, 0);

  const getResult = (s: number) => {
    if (s >= 12) return { label: "Normal Beslenme Durumu", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (s >= 8) return { label: "Malnütrisyon Riski", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "Malnütrisyon (Kötü Beslenme)", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };

  const result = getResult(score);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">👴</div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">MNA®</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Mini Nutritional Assessment (Kısa Form)</p>
          </div>
        </div>

        {/* SORULAR */}
        <div className="space-y-4">
          {QUESTIONS.map((q) => (
            <div key={q.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-blue-950 leading-snug">{q.label}</h3>
              <div className="grid grid-cols-1 gap-2">
                {q.options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.val }))}
                    className={`text-left p-4 rounded-xl text-xs font-bold transition-all border-2 ${
                      answers[q.id] === opt.val 
                      ? "border-blue-900 bg-blue-50 text-blue-900" 
                      : "border-slate-50 bg-slate-50/50 text-slate-500 hover:border-slate-200"
                    }`}
                  >
                    {opt.txt} <span className="float-right opacity-50">({opt.val} Puan)</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* SKOR PANELİ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-950 rounded-[2rem] p-6 text-center border-t-4 border-amber-400 shadow-xl">
            <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest block mb-1">SKOR</span>
            <div className="text-5xl font-black text-white">{score}</div>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex items-center justify-center border-2 border-dashed ${result.border} ${result.bg} ${result.color} transition-all duration-500`}>
            <p className="text-xl font-black uppercase italic text-center leading-tight">
              {result.label}
            </p>
          </div>
        </div>

        {/* ALT BİLGİ */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <ToolShare params={answers} />
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Skor ≤ 11 ise tam MNA değerlendirmesi veya ileri nütrisyonel müdahale düşünülmelidir. Bu test 65 yaş ve üzeri bireyler için validedir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}