"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

// Canadian CT Head Rule — minor head injury (GCS 13-15 after witnessed LOC/amnesia/confusion)
const HIGH_RISK = [
  { id: "gcs_fail", label: "GCS 2 saat sonra < 15", detail: "Acil serviste 2 saat gözlem sonrasında GCS skoru 15'in altında" },
  { id: "sus_skull", label: "Açık veya çökmüş kırık şüphesi", detail: "Palpasyonda kafatası kırığı şüphesi; penetran yaralanma" },
  { id: "basilar",   label: "Kafatabanı kırığı bulguları", detail: "Hemotimpanum, 'raccoon eyes', Battle işareti, BOS'ta rinoré/otoré" },
  { id: "vomit",     label: "≥ 2 Kez Kusma", detail: "2 veya daha fazla kusma epizodu" },
  { id: "age65",     label: "Yaş ≥ 65", detail: "65 yaş ve üzeri" },
];

const MEDIUM_RISK = [
  { id: "amnesia",   label: "Çarpma öncesi ≥ 30 dak amnezi", detail: "Yaralanmadan önceki 30 dakika veya daha uzun süreye ait bellek kaybı" },
  { id: "dangerous", label: "Tehlikeli mekanizma",           detail: "Yaya–araç çarpması, yolcunun araçtan fırlaması, > 90 cm veya > 5 basamak düşme" },
];

export default function CanadianCTPage() {
  const [high, setHigh] = React.useState<Record<string, boolean | null>>(
    Object.fromEntries(HIGH_RISK.map(i => [i.id, null]))
  );
  const [med, setMed] = React.useState<Record<string, boolean | null>>(
    Object.fromEntries(MEDIUM_RISK.map(i => [i.id, null]))
  );

  const highAnswered = Object.values(high).filter(v => v !== null).length;
  const medAnswered  = Object.values(med).filter(v => v !== null).length;
  const totalAnswered = highAnswered + medAnswered;
  const total = HIGH_RISK.length + MEDIUM_RISK.length;

  const anyHigh = HIGH_RISK.some(i => high[i.id] === true);
  const anyMed  = MEDIUM_RISK.some(i => med[i.id] === true);

  const complete = totalAnswered === total;
  const result = !complete ? null : anyHigh ? "HIGH" : anyMed ? "MEDIUM" : "NONE";

  const RESULT_MAP = {
    HIGH:   { label: "BT GEREKLİ (Yüksek Risk)", color: "rose",    sub: "Nöroşirürji gerektiren bulgu açısından yüksek risk — hemen BT çekilmeli" },
    MEDIUM: { label: "BT GEREKLİ (Orta Risk)",   color: "amber",   sub: "Beyin hasarı açısından orta risk — BT önerilir" },
    NONE:   { label: "BT GEREKMİYOR",            color: "emerald", sub: "Düşük riskli hasta — rutin BT endike değil" },
  };

  const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
    amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
    rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
  };

  const r = result ? RESULT_MAP[result] : null;
  const c = r ? COLOR[r.color] : null;

  const CriterionRow = ({ item, value, onChange }: {
    item: { id: string; label: string; detail: string };
    value: boolean | null; onChange: (v: boolean | null) => void;
  }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm">
      <p className="font-black text-blue-900 text-sm mb-0.5">{item.label}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">{item.detail}</p>
      <div className="flex gap-2">
        {([true, false] as const).map(v => (
          <button key={String(v)} type="button"
            onClick={() => onChange(value === v ? null : v)}
            className={`flex-1 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all
              ${value === v ? (v ? "border-rose-500 bg-rose-500 text-white" : "border-emerald-600 bg-emerald-600 text-white") : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200"}`}>
            {v ? "Evet" : "Hayır"}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="canadian-ct" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🩻</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Kanada BT Kural</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Minör Kafa Travmasında BT Endikasyonu · GCS 13–15</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
          <p className="text-[10px] font-bold text-blue-800">📌 Endikasyon: Bilinç kaybı, amnezi veya konfüzyon ile birlikte olan minör kafa travması (GCS 13–15). Antikoagülan kullananlarda veya koagulopati varlığında uygulanmaz.</p>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{totalAnswered}/{total} kriter</span>
          <div className="flex gap-0.5">
            {Array.from({length: total}).map((_, i) => (
              <div key={i} className={`w-4 h-2 rounded-sm transition-all ${i < totalAnswered ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-2 px-1">Yüksek Risk Kriterleri (herhangi biri → BT gerekli)</p>
          <div className="space-y-2">
            {HIGH_RISK.map(item => (
              <CriterionRow key={item.id} item={item} value={high[item.id]}
                onChange={v => setHigh(s => ({ ...s, [item.id]: v }))} />
            ))}
          </div>
        </div>

        <div>
          <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-2 px-1">Orta Risk Kriterleri (herhangi biri → BT önerilir)</p>
          <div className="space-y-2">
            {MEDIUM_RISK.map(item => (
              <CriterionRow key={item.id} item={item} value={med[item.id]}
                onChange={v => setMed(s => ({ ...s, [item.id]: v }))} />
            ))}
          </div>
        </div>

        {result && r && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg}`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">BT</span>
                <span className="text-2xl">{result === "NONE" ? "✗" : "✓"}</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{r.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{r.sub}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm kriterleri yanıtlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={{
              ...Object.fromEntries(HIGH_RISK.map(i => [i.id, high[i.id] ? 1 : 0])),
              ...Object.fromEntries(MEDIUM_RISK.map(i => [i.id, med[i.id] ? 1 : 0])),
            }} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              %100 duyarlılık ile nöroşirürji gerektiren lezyonu ve klinik önemi olan beyin hasarını tespit eder. Stiell et al., Lancet 2001.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
