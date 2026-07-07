"use client";

import React, { useMemo } from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

/** * Ranson Kriterleri Gündüz Modu (Sakin Deniz)
 * Akut Pankreatit Şiddet Değerlendirmesi — Girişte 5, 48. saatte 6 kriter
 * NOT: Klasik (non-biliyer / alkole bağlı) kesme değerleri kullanılmıştır.
 * Safra taşı pankreatitinde bazı eşikler farklıdır — yerel protokolünüzü kontrol edin.
 */

type CriterionKey =
  | "age" | "wbc" | "glucose" | "ldh" | "ast"
  | "hctDrop" | "bunRise" | "calcium" | "pao2" | "baseDeficit" | "fluidSeq";

const ADMISSION: { key: CriterionKey; label: string }[] = [
  { key: "age", label: "Yaş > 55" },
  { key: "wbc", label: "Lökosit (WBC) > 16.000 /mm³" },
  { key: "glucose", label: "Glukoz > 200 mg/dL" },
  { key: "ldh", label: "LDH > 350 IU/L" },
  { key: "ast", label: "AST > 250 IU/L" },
];

const HOUR_48: { key: CriterionKey; label: string }[] = [
  { key: "hctDrop", label: "Hematokrit düşüşü > %10" },
  { key: "bunRise", label: "BUN artışı > 5 mg/dL (sıvı tedavisine rağmen)" },
  { key: "calcium", label: "Serum Kalsiyum < 8 mg/dL" },
  { key: "pao2", label: "PaO₂ < 60 mmHg" },
  { key: "baseDeficit", label: "Baz açığı > 4 mEq/L" },
  { key: "fluidSeq", label: "Tahmini sıvı sekestrasyonu > 6 L" },
];

export default function RansonPage() {
  const [sel, setSel] = React.useState<Record<string, boolean>>({});
  function toggle(k: string) { setSel((v) => ({ ...v, [k]: !v[k] })); }

  const admissionCount = ADMISSION.filter((c) => sel[c.key]).length;
  const hour48Count = HOUR_48.filter((c) => sel[c.key]).length;
  const total = admissionCount + hour48Count;

  const interpretation = useMemo(() => {
    if (total >= 7) return { label: "Çok Ağır (Mortalite &gt;%50)", color: "text-rose-900", bg: "bg-rose-100" };
    if (total >= 5) return { label: "Ağır (Mortalite ~%40)", color: "text-rose-700", bg: "bg-rose-50" };
    if (total >= 3) return { label: "Orta (Mortalite ~%15)", color: "text-amber-700", bg: "bg-amber-50" };
    return { label: "Hafif (Mortalite ~%2)", color: "text-emerald-700", bg: "bg-emerald-50" };
  }, [total]);

  const params: Record<string, number> = {};
  [...ADMISSION, ...HOUR_48].forEach((c) => { if (sel[c.key]) params[c.key] = 1; });

  const Row = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) => (
    <label
      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer
        ${checked ? 'bg-blue-900 border-blue-900 text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30 text-blue-950'}
      `}
    >
      <span className="text-xs font-bold">{label}</span>
      <div className="flex items-center gap-3">
        <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${checked ? 'bg-amber-400 border-amber-400 text-blue-900' : 'bg-white border-slate-200 text-transparent'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
      </div>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">

        <ToolTopNav toolSlug="ranson" />

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            🍺
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Ranson Kriterleri</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Akut Pankreatit Şiddet Değerlendirmesi</p>
          </div>
        </div>

        {/* GİRİŞ KRİTERLERİ */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-2">
          <span className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest pl-1 block mb-2">Girişte (Admission) — {admissionCount}/5</span>
          {ADMISSION.map((c) => (
            <Row key={c.key} label={c.label} checked={!!sel[c.key]} onChange={() => toggle(c.key)} />
          ))}
        </div>

        {/* 48. SAAT KRİTERLERİ */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-2">
          <span className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest pl-1 block mb-2">48. Saatte — {hour48Count}/6</span>
          {HOUR_48.map((c) => (
            <Row key={c.key} label={c.label} checked={!!sel[c.key]} onChange={() => toggle(c.key)} />
          ))}
        </div>

        {/* SKOR VE ANALİTİK YORUM */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">TOPLAM</span>
            <div className="text-5xl font-black text-white">{total}</div>
            <span className="text-[9px] font-bold text-blue-300/70 uppercase tracking-widest mt-1">/ 11</span>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed ${interpretation.bg} transition-all duration-500`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block text-center md:text-left">ŞİDDET DEĞERLENDİRMESİ</span>
            <p className={`text-2xl font-black italic tracking-tight text-center md:text-left ${interpretation.color}`}>
              {interpretation.label}
            </p>
          </div>
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Skor 48 saat dolmadan tamamlanamaz. Burada klasik (non-biliyer) eşik değerleri kullanılmıştır; safra taşı pankreatitinde bazı kesme değerleri farklıdır. Erken (24 saat) değerlendirme için BISAP skoru tercih edilebilir.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
