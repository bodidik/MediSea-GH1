"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

const PROTOCOLS = [
  {
    id: "overnight",
    label: "1 mg Gece Yarısı DST",
    desc: "Cushing sendromu tarama testi",
    protocol: "Gece 23:00'de 1 mg deksametazon p.o. → ertesi sabah 08:00–09:00 serum kortizol",
    unit: "μg/dL",
    cutoff: 1.8,
    low: "Normal süpresyon — Cushing sendromu olası değil",
    high: "Süpresyon yetersiz — doğrulama testi gerekli (24 saat idrar serbest kortizol, gece tükürük kortizolu)",
    note: "Duyarlılık ~%95, özgüllük ~%80. Yanlış pozitif: obezite, depresyon, alkol, OKS, fenitoin, rifampisin.",
  },
  {
    id: "lddst",
    label: "2 mg LDDST (Düşük Doz)",
    desc: "Cushing sendromu doğrulama testi",
    protocol: "0.5 mg deksametazon 6 saatte bir × 48 saat (toplamda 2 mg) → son dozdan 6 saat sonra serum kortizol",
    unit: "μg/dL",
    cutoff: 1.8,
    low: "Normal süpresyon — Cushing sendromu dışlanır",
    high: "Süpresyon yetersiz — Cushing sendromu doğrulanmış, kaynak araştırması gerekli (ACTH, görüntüleme)",
    note: "Doğrulama için tercih edilen test. Duyarlılık ~%97, özgüllük ~%93.",
  },
  {
    id: "hddst",
    label: "8 mg HDDST (Yüksek Doz)",
    desc: "Cushing hastalığı vs ektopik/adrenal ayrımı",
    protocol: "2 mg deksametazon 6 saatte bir × 48 saat (toplamda 8 mg) → bazal ve son doz sonrası kortizol",
    unit: "% süpresyon",
    cutoff: 50,
    low: "≥ %50 süpresyon — Hipofiz kaynağı (Cushing hastalığı) olası",
    high: "< %50 süpresyon — Ektopik ACTH veya adrenal tümör düşün",
    note: "Duyarlılık ~%80. Bazal ve son ölçüm arasındaki farkı yüzde olarak hesaplayın: (Bazal − Son) / Bazal × 100",
  },
];

export default function DstPage() {
  const [protoIdx, setProtoIdx] = React.useState(0);
  const [value, setValue]       = React.useState("");
  const [base, setBase]         = React.useState("");

  const proto = PROTOCOLS[protoIdx];
  const val   = parseLocaleNumber(value);
  const bVal  = parseLocaleNumber(base);

  const effectiveVal = proto.id === "hddst" && bVal > 0 && val > 0
    ? Math.round(((bVal - val) / bVal) * 1000) / 10
    : val;

  const hasResult = val > 0;
  const suppressed = hasResult && effectiveVal < proto.cutoff;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="dst" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦋</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Deksametazon Süpresyon Testi</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">DST — Cushing Sendromu Tanı & Lokalizasyon</p>
          </div>
        </div>

        {/* Protokol seçimi */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Protokol</p>
          {PROTOCOLS.map((p, i) => (
            <button key={p.id} type="button" onClick={() => { setProtoIdx(i); setValue(""); setBase(""); }}
              className={`w-full text-left p-4 rounded-2xl border transition-all
                ${protoIdx === i ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
              <div className={`text-sm font-bold ${protoIdx === i ? 'text-white' : 'text-blue-950'}`}>{p.label}</div>
              <div className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${protoIdx === i ? 'text-blue-200/70' : 'text-slate-400'}`}>{p.desc}</div>
            </button>
          ))}
        </div>

        {/* Protokol detayı */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest mb-1">Protokol</p>
          <p className="text-sm font-bold text-blue-900">{proto.protocol}</p>
        </div>

        {/* Değer girişi */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
          {proto.id === "hddst" && (
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Bazal Kortizol (μg/dL)</span>
              <input type="text" inputMode="decimal" value={base} onChange={e => setBase(e.target.value)} placeholder="ör. 28"
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
            </label>
          )}
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">
              {proto.id === "hddst" ? "Son Kortizol (μg/dL)" : `Kortizol Sonucu (${proto.unit})`}
            </span>
            <input type="text" inputMode="decimal" value={value} onChange={e => setValue(e.target.value)} placeholder="ör. 1.2"
              className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
          </label>
          {proto.id === "hddst" && bVal > 0 && val > 0 && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hesaplanan süpresyon: </span>
              <span className="font-black text-blue-900">%{effectiveVal}</span>
            </div>
          )}
        </div>

        {/* Sonuç */}
        {hasResult && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed transition-all
            ${suppressed ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className={`text-[10px] font-black uppercase tracking-widest mb-2 ${suppressed ? 'text-emerald-800/50' : 'text-rose-800/50'}`}>
              SONUÇ — Eşik: {proto.id === "hddst" ? `%${proto.cutoff}` : `${proto.cutoff} ${proto.unit}`}
            </div>
            <p className={`text-xl font-black italic tracking-tight ${suppressed ? 'text-emerald-700' : 'text-rose-700'}`}>
              {suppressed ? "✓ SÜPRESİYON YETERLİ" : "✗ SÜPRESİYON YETERSİZ"}
            </p>
            <p className={`text-sm font-bold mt-2 leading-relaxed ${suppressed ? 'text-emerald-700' : 'text-rose-700'} opacity-80`}>
              {suppressed ? proto.low : proto.high}
            </p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={{ proto: protoIdx, val, base: bVal || "" }} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">{proto.note}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
