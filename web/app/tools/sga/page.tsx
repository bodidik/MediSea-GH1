"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

type SGARating = "A" | "B" | "C" | null;

const SECTIONS = [
  {
    id: "weight",
    title: "Kilo Değişimi",
    questions: [
      { id: "wt_6mo", label: "Son 6 ayda kilo kaybı", opts: [{ v: "A", l: "< %5" }, { v: "B", l: "%5–10" }, { v: "C", l: "> %10" }] },
      { id: "wt_2wk", label: "Son 2 haftadaki değişim", opts: [{ v: "A", l: "Artış / değişim yok" }, { v: "B", l: "Azalma" }, { v: "C", l: "Belirgin azalma" }] },
    ]
  },
  {
    id: "intake",
    title: "Gıda Alımı",
    questions: [
      { id: "diet", label: "Mevcut gıda alımı karşılaştırması", opts: [{ v: "A", l: "Normal" }, { v: "B", l: "Hafif azalmış" }, { v: "C", l: "Belirgin azalmış / sıvı diyet" }] },
    ]
  },
  {
    id: "symptoms",
    title: "GİS Semptomları (> 2 haftadır)",
    questions: [
      { id: "gi", label: "Bulantı, kusma, ishal, anoreksi", opts: [{ v: "A", l: "Semptom yok" }, { v: "B", l: "Hafif / aralıklı" }, { v: "C", l: "Belirgin ve sürekli" }] },
    ]
  },
  {
    id: "function",
    title: "Fonksiyonel Kapasite",
    questions: [
      { id: "func", label: "Günlük aktivite kapasitesi", opts: [{ v: "A", l: "Normal / hafif azalmış" }, { v: "B", l: "Orta derecede azalmış" }, { v: "C", l: "Yatağa bağlı" }] },
    ]
  },
  {
    id: "disease",
    title: "Hastalık ve Metabolik Stres",
    questions: [
      { id: "stress", label: "Metabolik gereksinim / katabolik stres", opts: [{ v: "A", l: "Düşük stres" }, { v: "B", l: "Orta stres (elektif cerrahi, kronik hastalık)" }, { v: "C", l: "Yüksek stres (majör sepsis, yanık, travma)" }] },
    ]
  },
  {
    id: "physical",
    title: "Fizik Muayene",
    questions: [
      { id: "subcut", label: "Subkütan yağ kaybı (triseps, göğüs)", opts: [{ v: "A", l: "Normal" }, { v: "B", l: "Hafif azalmış" }, { v: "C", l: "Belirgin azalmış" }] },
      { id: "muscle", label: "Kas kaybı (kuadriseps, deltoid)", opts: [{ v: "A", l: "Normal" }, { v: "B", l: "Hafif kaybı var" }, { v: "C", l: "Belirgin kayıp" }] },
      { id: "edema", label: "Ödem / asit", opts: [{ v: "A", l: "Yok" }, { v: "B", l: "Hafif" }, { v: "C", l: "Belirgin" }] },
    ]
  },
];

function calcGlobal(answers: Record<string, SGARating>): SGARating {
  const vals = Object.values(answers).filter(Boolean) as string[];
  if (vals.length === 0) return null;
  const cCount = vals.filter(v => v === "C").length;
  const bCount = vals.filter(v => v === "B").length;
  if (cCount >= 3 || (cCount >= 2 && bCount >= 1)) return "C";
  if (bCount >= 3 || (bCount >= 2 && cCount >= 1)) return "B";
  if (vals.length >= 6 && vals.every(v => v === "A")) return "A";
  if (bCount >= 1) return "B";
  return "A";
}

export default function SgaPage() {
  const [answers, setAnswers] = React.useState<Record<string, SGARating>>({});
  const setAns = (id: string, v: SGARating) => setAnswers(prev => ({ ...prev, [id]: v }));

  const totalQ = SECTIONS.flatMap(s => s.questions).length;
  const answered = Object.keys(answers).length;
  const global = answered >= totalQ ? calcGlobal(answers) : null;

  const RESULT = {
    A: { label: "SGA-A: İYİ BESLENMİŞ", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", sub: "Malnütrisyon yok; rutin izlem yeterli" },
    B: { label: "SGA-B: HAFİF / ORTA MALNÜTRISYON", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", sub: "Hafif-orta malnütrisyon şüphesi; nütrisyon desteği planla" },
    C: { label: "SGA-C: AĞIR MALNÜTRISYON", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", sub: "Ağır malnütrisyon; acil nütrisyon müdahalesi gerekli" },
  };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="sga" />
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🍏</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">SGA</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Sübjektif Global Değerlendirme — Malnütrisyon Tanı Aracı</p>
          </div>
        </div>

        {SECTIONS.map(sec => (
          <div key={sec.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
            <p className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest">{sec.title}</p>
            {sec.questions.map(q => (
              <div key={q.id}>
                <p className="text-sm font-bold text-blue-900 mb-2">{q.label}</p>
                <div className="flex gap-2 flex-wrap">
                  {q.opts.map(o => (
                    <button key={o.v} type="button" onClick={() => setAns(q.id, o.v as SGARating)}
                      className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                        ${answers[q.id] === o.v
                          ? o.v === "A" ? "bg-emerald-600 border-emerald-600 text-white"
                            : o.v === "B" ? "bg-amber-500 border-amber-500 text-white"
                            : "bg-rose-600 border-rose-600 text-white"
                          : "bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-900/30"}`}>
                      {o.v}: {o.l}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Yanıtlanan: {answered}/{totalQ}</span>
          {global && <span className={`text-2xl font-black ${RESULT[global].color}`}>SGA-{global}</span>}
        </div>

        {global && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${RESULT[global].border} ${RESULT[global].bg}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">GLOBAL DEĞERLENDİRME</div>
            <p className={`text-xl font-black italic tracking-tight ${RESULT[global].color}`}>{RESULT[global].label}</p>
            <p className={`text-sm font-bold mt-1 ${RESULT[global].color} opacity-80`}>{RESULT[global].sub}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              SGA klinisyen tarafından yapılan bütüncül bir değerlendirmedir; algoritmik hesaplamadan ziyade klinik yargı esas alınır. Buradaki sonuç yönlendirici niteliktedir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
