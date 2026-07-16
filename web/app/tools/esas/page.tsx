"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const SYMPTOMS = [
  { key: "pain",       label: "Ağrı",           left: "Yok",      right: "En kötü" },
  { key: "fatigue",    label: "Yorgunluk",       left: "Yok",      right: "En kötü" },
  { key: "nausea",     label: "Bulantı",         left: "Yok",      right: "En kötü" },
  { key: "depression", label: "Depresyon",       left: "Yok",      right: "En kötü" },
  { key: "anxiety",    label: "Anksiyete",       left: "Yok",      right: "En kötü" },
  { key: "drowsiness", label: "Uyuklama",        left: "Yok",      right: "En kötü" },
  { key: "appetite",   label: "İştah Azalması",  left: "İyi",      right: "Hiç yok" },
  { key: "wellbeing",  label: "Genel İyilik Hali",left: "Çok iyi", right: "Çok kötü" },
  { key: "dyspnea",    label: "Nefes Darlığı",   left: "Yok",      right: "En kötü" },
];

function colorForScore(v: number) {
  if (v <= 3) return { bar: "bg-emerald-500", text: "text-emerald-700" };
  if (v <= 6) return { bar: "bg-amber-500",   text: "text-amber-700" };
  return            { bar: "bg-rose-500",     text: "text-rose-700" };
}

export default function EsasPage() {
  const [scores, setScores] = React.useState<Record<string, number>>(
    Object.fromEntries(SYMPTOMS.map(s => [s.key, 0]))
  );

  const set = (key: string, val: number) => setScores(p => ({ ...p, [key]: val }));
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const distress = total;

  const getDistress = () => {
    if (distress <= 20) return { label: "HAFİF", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (distress <= 50) return { label: "ORTA", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return               { label: "ŞİDDETLİ", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const d = getDistress();
  const params = Object.fromEntries(SYMPTOMS.map(s => [s.key, scores[s.key]]));

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="esas" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🕊️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">ESAS</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Edmonton Semptom Değerlendirme Skalası</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          {SYMPTOMS.map(s => {
            const v = scores[s.key];
            const c = colorForScore(v);
            return (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-blue-900">{s.label}</span>
                  <span className={`text-lg font-black w-8 text-right ${c.text}`}>{v}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] font-bold text-slate-400 w-12 text-right shrink-0">{s.left}</span>
                  <div className="flex-1 relative">
                    <input type="range" min={0} max={10} step={1} value={v}
                      onChange={e => set(s.key, Number(e.target.value))}
                      className="w-full h-2 rounded-full appearance-none cursor-pointer accent-blue-900"
                      style={{ background: `linear-gradient(to right, #1a1a6b ${v * 10}%, #e2e8f0 ${v * 10}%)` }}
                    />
                    <div className="flex justify-between mt-1">
                      {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                        <span key={n} className={`text-[8px] font-bold ${n === v ? c.text + ' font-black' : 'text-slate-300'}`}>{n}</span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 w-12 shrink-0">{s.right}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">TOPLAM</span>
            <div className="text-5xl font-black text-white">{total}</div>
            <span className="text-[10px] font-black text-blue-300 mt-1">/ 90</span>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed ${d.border} ${d.bg}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">SEMPTOM YÜKÜ</span>
            <p className={`text-2xl font-black italic tracking-tight ${d.color}`}>{d.label}</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {SYMPTOMS.filter(s => scores[s.key] >= 4).map(s => (
                <span key={s.key} className="text-[10px] font-black px-2 py-1 rounded-lg bg-white/60 text-blue-900 border border-slate-200">
                  {s.label}: {scores[s.key]}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              ESAS hastanın semptom yükünü kendi bildirimine dayanarak değerlendirir. Skor ≥4 olan her semptom klinik müdahale gerektirebilir. Seri ölçümlerle semptom takibi en değerli kullanım biçimidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
