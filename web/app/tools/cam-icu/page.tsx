"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

// CAM-ICU: 4 özellik — Özellik 1 + Özellik 2 + (Özellik 3 VEYA Özellik 4) = Deliryum
const FEATURES = [
  {
    id: "f1",
    label: "Özellik 1: Akut Bilinç Değişikliği veya Dalgalı Seyir",
    detail: "Bazal mental durumdan akut değişim VAR mı? VEYA mental durumun son 24 saatte dalgalandığı bildirildi mi? (RASS, GCS veya önceki değerlendirmeler kullanılır)",
    required: true,
  },
  {
    id: "f2",
    label: "Özellik 2: Dikkat Bozukluğu",
    detail: "ASE (Dikkat Tarama Sınavı) — Harf veya Resim seti. 10 öğeden ≥ 3 hata = dikkat bozukluğu",
    required: true,
  },
  {
    id: "f3",
    label: "Özellik 3: Değişmiş Bilinç Düzeyi",
    detail: "RASS 0 dışında herhangi bir değer (yani uyanık ve sakin değil)",
    required: false,
  },
  {
    id: "f4",
    label: "Özellik 4: Dezorganize Düşünce",
    detail: "4 Evet/Hayır sorusu + 1 komut (5 öğeden ≥ 2 hata = dezorganize düşünce)",
    required: false,
  },
];

export default function CAMICUPage() {
  const [sel, setSel] = React.useState<Record<string, boolean | null>>({
    f1: null, f2: null, f3: null, f4: null,
  });

  const answered = Object.values(sel).filter(v => v !== null).length;
  const f1 = sel.f1, f2 = sel.f2, f3 = sel.f3, f4 = sel.f4;

  const complete = f1 !== null && f2 !== null && f3 !== null && f4 !== null;

  // RASS -4 veya -5 ise değerlendirilemez — burada basit olarak CAM-ICU mantığı
  // Deliryum = F1 VE F2 VE (F3 VEYA F4)
  let result: "delirium" | "no_delirium" | "not_evaluable" | null = null;
  if (complete) {
    if (!f1 || !f2) result = "no_delirium";
    else if (f3 || f4) result = "delirium";
    else result = "no_delirium";
  }

  const RESULT_MAP = {
    delirium:      { label: "DELİRYUM POZİTİF", color: "rose",   sub: "CAM-ICU kriterleri karşılandı — yönetim protokolü başlatın" },
    no_delirium:   { label: "DELİRYUM NEGATİF", color: "emerald",sub: "Şu anda CAM-ICU kriterleri karşılanmıyor" },
    not_evaluable: { label: "DEĞERLENDİRİLEMEZ",color: "slate",  sub: "RASS −4 veya −5: hasta uyaranlara yanıt vermiyor" },
  };

  const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    rose:   { bg: "bg-rose-50",   border: "border-rose-300",   text: "text-rose-700",   badge: "bg-rose-700 text-white" },
    emerald:{ bg: "bg-emerald-50",border: "border-emerald-200",text: "text-emerald-700",badge: "bg-emerald-700 text-white" },
    slate:  { bg: "bg-slate-100", border: "border-slate-300",  text: "text-slate-700",  badge: "bg-slate-700 text-white" },
  };

  const r = result ? RESULT_MAP[result] : null;
  const c = r ? COLOR[r.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="cam-icu" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🧩</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">CAM-ICU</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Konfüzyon Değerlendirme Yöntemi — YBÜ Deliryum Taraması</p>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-3">
          <p className="text-[10px] font-bold text-rose-700">🔴 Deliryum Kriteri: Özellik 1 VE Özellik 2 VE (Özellik 3 VEYA Özellik 4) birlikte pozitif olmalıdır.</p>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/4 özellik</span>
          <div className="flex gap-1.5">
            {["F1","F2","F3","F4"].map((l, i) => {
              const key = `f${i+1}`;
              return (
                <span key={l} className={`w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black
                  ${sel[key] === true ? "bg-rose-600 text-white" : sel[key] === false ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-400"}`}>{l}</span>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          {FEATURES.map(feat => (
            <div key={feat.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start gap-2 mb-0.5">
                <p className="font-black text-blue-900 text-sm leading-snug">{feat.label}</p>
                {feat.required && <span className="text-[8px] bg-rose-100 text-rose-700 font-black px-1.5 py-0.5 rounded-full shrink-0 mt-0.5">ZORUNLU</span>}
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{feat.detail}</p>
              <div className="flex gap-2">
                {([true, false] as const).map(v => (
                  <button key={String(v)} type="button"
                    onClick={() => setSel(s => ({ ...s, [feat.id]: s[feat.id] === v ? null : v }))}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all
                      ${sel[feat.id] === v ? (v ? "border-rose-500 bg-rose-500 text-white" : "border-emerald-600 bg-emerald-600 text-white") : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200"}`}>
                    {v ? "Mevcut" : "Yok"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {result && r && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg}`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">CAM</span>
                <span className="text-3xl">{result === "delirium" ? "🔴" : result === "no_delirium" ? "🟢" : "⚪"}</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{r.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{r.sub}</p>
                {result === "delirium" && (
                  <div className="mt-2 space-y-0.5">
                    {["Predispozan faktörleri azalt (mobilizasyon, ışık, oryantasyon)", "Antikolinerjik ilaçları kesin/azalt", "Ağrı ve anksiyeteyi yönet (ABCDEF Bundle)"].map(s => (
                      <p key={s} className="text-[9px] font-bold text-rose-700">• {s}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 4 özelliği değerlendirin</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={Object.fromEntries(Object.entries(sel).map(([k, v]) => [k, v ? 1 : 0]))} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              CAM-ICU YBÜ deliryumu için duyarlılık %80, özgüllük %95.9. Günlük tarama önerilir. PADIS Kılavuzu (SCCM 2018) birinci basamak tarama olarak önerir. Ely et al., JAMA 2001.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
