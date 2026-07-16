"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

const QUESTIONS = [
  { id: "q1", label: "Genel yorgunluk/halsizlik düzeyi", sub: "Son hafta" },
  { id: "q2", label: "Boyun, sırt veya kalça ağrısı düzeyi", sub: "Son hafta" },
  { id: "q3", label: "Ağrılı eklem/şişlik düzeyi (boyun/sırt/kalça dışı)", sub: "Son hafta" },
  { id: "q4", label: "Dokunulan herhangi bir yerde duyarlılık/ağrı", sub: "Son hafta" },
  { id: "q5", label: "Sabah tutukluğunun şiddeti", sub: "Uyanmadan sonra" },
  { id: "q6", label: "Sabah tutukluğunun süresi", sub: "Saat (0=yok → 10=2 saat veya daha fazla)" },
];

export default function BasdaiPage() {
  const [vals, setVals] = React.useState<Record<string, string>>({});

  const set = (id: string, v: string) => setVals(prev => ({ ...prev, [id]: v }));
  const n = (id: string) => parseLocaleNumber(vals[id] ?? "");

  const q1 = n("q1"); const q2 = n("q2"); const q3 = n("q3");
  const q4 = n("q4"); const q5 = n("q5"); const q6 = n("q6");
  const answered = [q1,q2,q3,q4,q5,q6].filter(v => v > 0 || vals[["q1","q2","q3","q4","q5","q6"].find((_, i) => [q1,q2,q3,q4,q5,q6][i] === v) ?? ""] === "0").length;

  const allFilled = Object.keys(vals).length === 6;
  const morning = (q5 + q6) / 2;
  const score = allFilled ? (q1 + q2 + q3 + q4 + morning) / 5 : null;

  const getResult = (s: number) => {
    if (s < 4) return { label: "DÜŞÜK / İNAKTİF", sub: "BASDAI < 4 — Aktif tedavi değişikliği genellikle gerekmez", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    return { label: "AKTİF HASTALIK", sub: "BASDAI ≥ 4 — Biyolojik tedavi için eşik değer", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const result = score !== null ? getResult(score) : null;
  const params = { q1, q2, q3, q4, q5, q6 };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="basdai" />
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦴</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">BASDAI</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Bath Ankilozan Spondilit Hastalık Aktivite İndeksi</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-[11px] font-bold text-blue-900">Her soru için 0–10 NRS (Sayısal Derecelendirme Skalası) giriniz. <strong>0 = yok / hiç</strong> → <strong>10 = çok şiddetli</strong></p>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          {QUESTIONS.map(q => (
            <label key={q.id} className="flex flex-col gap-1">
              <span className="text-sm font-bold text-blue-900">{q.label}</span>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-0.5">{q.sub}</span>
              <input type="text" inputMode="decimal" value={vals[q.id] ?? ""} onChange={e => set(q.id, e.target.value)} placeholder="0–10"
                className="mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            </label>
          ))}

          {allFilled && score !== null && (
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sabah tutukluluğu ort. (S5+S6)/2</span>
                <span className="font-black text-blue-900">{morning.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">BASDAI SKORU</span>
                <span className="text-4xl font-black text-blue-900">{score.toFixed(1)}</span>
              </div>
            </div>
          )}
        </div>

        {result && score !== null && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${result.border} ${result.bg}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">BASDAI = {score.toFixed(1)}</div>
            <p className={`text-2xl font-black italic tracking-tight ${result.color}`}>{result.label}</p>
            <p className={`text-sm font-bold mt-1 ${result.color} opacity-80`}>{result.sub}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              BASDAI ≥ 4 ve NSAID yanıtsızlık, biyolojik (anti-TNF/IL-17) tedavi başlangıcı için ASAS kriterlerinin parçasıdır. ASDAS-CRP ile birlikte değerlendirin.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
