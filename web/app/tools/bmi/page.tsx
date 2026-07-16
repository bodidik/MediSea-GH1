"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

export default function BmiPage() {
  const [height, setHeight] = React.useState("170");
  const [weight, setWeight] = React.useState("70");
  const [sex, setSex]       = React.useState<"m" | "f">("m");

  const h = parseLocaleNumber(height);
  const w = parseLocaleNumber(weight);

  const bmi    = h > 0 ? Math.round((w / (h / 100) ** 2) * 10) / 10 : 0;
  const devine = h > 0 ? Math.round(((sex === "m" ? 50 : 45.5) + 2.3 * ((h - (sex === "m" ? 152.4 : 152.4)) / 2.54)) * 10) / 10 : 0;
  const hamwi  = h > 0 ? Math.round(((sex === "m" ? 48 : 45.5) + 2.7 * ((h - 152.4) / 2.54)) * 10) / 10 : 0;
  const ibw    = Math.max(devine, 0);

  const getBmiCat = () => {
    if (!bmi) return { label: "–", color: "text-slate-400", bg: "bg-slate-50", border: "border-slate-200" };
    if (bmi < 18.5) return { label: "ZAYIF",            color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200" };
    if (bmi < 25)   return { label: "NORMAL",            color: "text-emerald-700",bg: "bg-emerald-50",border: "border-emerald-200" };
    if (bmi < 30)   return { label: "FAZLA KİLO",        color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" };
    if (bmi < 35)   return { label: "OBEZİTE SINIF I",   color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" };
    if (bmi < 40)   return { label: "OBEZİTE SINIF II",  color: "text-rose-700",   bg: "bg-rose-50",   border: "border-rose-200" };
    return               { label: "OBEZİTE SINIF III (MORBİD)", color: "text-rose-900", bg: "bg-rose-100", border: "border-rose-300" };
  };
  const cat = getBmiCat();
  const params = { h, w, sex };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="bmi" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦋</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">BMI & İdeal Kilo</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Vücut Kitle İndeksi + Devine / Hamwi İdeal Kilo</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-4">
          <div className="flex gap-3">
            {(["m", "f"] as const).map(v => (
              <label key={v} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
                ${sex === v ? 'bg-blue-900 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 hover:border-blue-900/30'}`}>
                <input type="radio" className="hidden" checked={sex === v} onChange={() => setSex(v)} />
                <span className={`text-sm font-bold ${sex === v ? 'text-white' : 'text-blue-900/70'}`}>{v === "m" ? "Erkek" : "Kadın"}</span>
              </label>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Boy (cm)</span>
              <input type="text" inputMode="decimal" value={height} onChange={e => setHeight(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Ağırlık (kg)</span>
              <input type="text" inputMode="decimal" value={weight} onChange={e => setWeight(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            </label>
          </div>
        </div>

        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">VÜCUT KİTLE İNDEKSİ</span>
          <div className="text-7xl font-black text-white drop-shadow-lg">{bmi || "–"}</div>
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">kg / m²</span>
        </div>

        <div className={`p-6 rounded-[2rem] border-2 border-dashed ${cat.border} ${cat.bg}`}>
          <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest block mb-2">KATEGORİ</span>
          <p className={`text-2xl font-black italic tracking-tight ${cat.color}`}>{cat.label}</p>
        </div>

        {ibw > 0 && (
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">İDEAL VÜCUT AĞIRLIĞI</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-3xl font-black text-blue-900">{devine > 0 ? devine : "–"} <span className="text-base">kg</span></div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Devine Formülü</div>
              </div>
              <div className="text-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-3xl font-black text-blue-900">{hamwi > 0 ? hamwi : "–"} <span className="text-base">kg</span></div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Hamwi Formülü</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              BMI vücut yağ dağılımını yansıtmaz. İdeal vücut ağırlığı (Devine) ilaç dozlaması ve solunum parametreleri için kullanılır; hasta hedefi olarak değil.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
