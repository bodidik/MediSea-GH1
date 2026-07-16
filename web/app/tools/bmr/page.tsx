"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

const ACTIVITY_OPTS = [
  { label: "Hareketsiz", sub: "Masa başı iş, egzersiz yok", factor: 1.2 },
  { label: "Hafif Aktif", sub: "Haftada 1–3 gün hafif egzersiz", factor: 1.375 },
  { label: "Orta Aktif", sub: "Haftada 3–5 gün orta egzersiz", factor: 1.55 },
  { label: "Çok Aktif", sub: "Haftada 6–7 gün yoğun egzersiz", factor: 1.725 },
  { label: "Aşırı Aktif", sub: "Günde 2× antrenman veya fiziksel iş", factor: 1.9 },
];

export default function BmrPage() {
  const [sex, setSex]       = React.useState<"m" | "f">("m");
  const [age, setAge]       = React.useState("35");
  const [height, setHeight] = React.useState("175");
  const [weight, setWeight] = React.useState("75");
  const [factor, setFactor] = React.useState(1.55);

  const a = parseLocaleNumber(age);
  const h = parseLocaleNumber(height);
  const w = parseLocaleNumber(weight);

  const bmr = h > 0 && w > 0 && a > 0
    ? Math.round(sex === "m"
        ? 10 * w + 6.25 * h - 5 * a + 5
        : 10 * w + 6.25 * h - 5 * a - 161)
    : 0;

  const tdee = bmr ? Math.round(bmr * factor) : 0;
  const params = { sex, age: a, h, w, factor };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="bmr" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦋</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">BMR & TDEE</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Bazal Metabolizma Hızı — Mifflin–St Jeor</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-4">
          <div className="flex gap-3">
            {(["m", "f"] as const).map(v => (
              <label key={v} className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all
                ${sex === v ? 'bg-blue-900 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 hover:border-blue-900/30'}`}>
                <input type="radio" className="hidden" checked={sex === v} onChange={() => setSex(v)} />
                <span className={`text-sm font-bold ${sex === v ? 'text-white' : 'text-blue-900/70'}`}>{v === "m" ? "Erkek" : "Kadın"}</span>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Yaş", value: age, set: setAge },
              { label: "Boy (cm)", value: height, set: setHeight },
              { label: "Ağırlık (kg)", value: weight, set: setWeight },
            ].map(({ label, value, set }) => (
              <label key={label} className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
                <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
              </label>
            ))}
          </div>

          <div>
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-2 pl-1">Aktivite Düzeyi</span>
            <div className="grid gap-1.5">
              {ACTIVITY_OPTS.map(opt => (
                <label key={opt.factor} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all
                  ${factor === opt.factor ? 'bg-blue-900 border-blue-900' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                    ${factor === opt.factor ? 'border-amber-400 bg-amber-400' : 'border-slate-300'}`}>
                    {factor === opt.factor && <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />}
                  </div>
                  <input type="radio" className="hidden" checked={factor === opt.factor} onChange={() => setFactor(opt.factor)} />
                  <div className="flex-1">
                    <span className={`text-sm font-bold block ${factor === opt.factor ? 'text-white' : 'text-blue-900/80'}`}>{opt.label}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${factor === opt.factor ? 'text-blue-200/60' : 'text-slate-400'}`}>{opt.sub}</span>
                  </div>
                  <span className={`text-[10px] font-black ${factor === opt.factor ? 'text-amber-400' : 'text-slate-400'}`}>×{opt.factor}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-900/80 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400/60">
            <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">BMR (Dinlenim)</span>
            <div className="text-4xl font-black text-white">{bmr || "–"}</div>
            <span className="text-[10px] font-bold text-amber-300 mt-1">kcal / gün</span>
          </div>
          <div className="bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">TDEE (Toplam Gereksinim)</span>
            <div className="text-4xl font-black text-white">{tdee || "–"}</div>
            <span className="text-[10px] font-bold text-amber-400 mt-1">kcal / gün</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Mifflin–St Jeor formülü ortalama popülasyonda en doğru tahminleri verir. Obez bireylerde ve ağır hastalık durumlarında ölçülmüş enerji gereksinimi (indirekt kalorimetri) tercih edilmelidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
