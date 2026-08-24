"use client";

import React, { useMemo, useState } from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/** * KDIGO AKI Evrelemesi Gündüz Modu (Sakin Deniz)
 * Akut Böbrek Hasarı — Kreatinin VEYA İdrar Çıkışı kriterlerinden en yüksek evre geçerlidir
 */

const URINE_OPTIONS = [
  { value: 0, label: "Normal (≥ 0.5 mL/kg/saat)" },
  { value: 1, label: "< 0.5 mL/kg/saat, 6–12 saat" },
  { value: 2, label: "< 0.5 mL/kg/saat, ≥ 12 saat" },
  { value: 3, label: "< 0.3 mL/kg/saat ≥ 24 saat VEYA anüri ≥ 12 saat" },
];

function creatinineStage(baseline: number, current: number, acuteRise03: boolean, onRRT: boolean): number {
  if (onRRT) return 3;
  if (!baseline || !current) return 0;
  const ratio = current / baseline;
  if (current >= 4.0 && (acuteRise03 || ratio >= 1.5)) return 3;
  if (ratio >= 3.0) return 3;
  if (ratio >= 2.0) return 2;
  if (ratio >= 1.5 || acuteRise03) return 1;
  return 0;
}

export default function KdigoAkiPage() {
  const [baseline, setBaseline] = useState<string>("0.8");
  const [current, setCurrent] = useState<string>("0.8");
  const [acuteRise, setAcuteRise] = useState(false);
  const [onRRT, setOnRRT] = useState(false);
  const [urineStage, setUrineStage] = useState<number>(0);

  const baselineNum = parseLocaleNumber(baseline);
  const currentNum = parseLocaleNumber(current);

  /**
   * ÇÖP VE SAÇMA GİRDİ "AKI YOK" DİYORDU — ve bu, güven veren yön.
   *
   * `creatinineStage` çöp girdide `if (!baseline || !current) return 0` ile
   * SIFIR döndürüyordu; 0 burada "AKI kriteri yok" demek. Ölçüldü:
   *
   *   bazal 0.8 · güncel "abc"  ->  Oran 0 · "Evre 0"   (kreatinin 2.5 olan
   *                                  hastada yazım hatası AKI'yi gizliyor)
   *   bazal 999 · güncel 2.5    ->  Oran 0 · "Evre 0"
   *   bazal 0.001 · güncel 2.5  ->  Oran 2500 · "Evre 3"
   *   güncel 999                ->  Oran 1248.75 · "Evre 3"
   *
   * AYRIM ÖNEMLİ: "AKI Kriteri Yok" bir İDDİADIR — değerlendirdik ve
   * bulmadık demek. Kreatinin okunamıyorsa doğru cevap bu değil,
   * "değerlendirilemedi". Araç ikisini karıştırıyordu.
   *
   * NE KUSUR DEĞİL: bazal 12 · güncel 2.5 (oran 0.21) makul bir okuma —
   * 12 gerçekçi bir bazal (kronik böbrek hastası) ve oran 1'in altında
   * olması iyileşme demek. Tipik "1.2 yerine 12" yazım hatası makullük
   * sınırıyla YAKALANAMAZ ve araç orada doğru davranıyor.
   *
   * Sınır 0.1–30 mg/dL: deponun öteki araçlarıyla aynı aile (`egfr` 0.1–30,
   * `sofa` 0.1–25). Klinik eşik değil, makullük sınırı.
   */
  const krMakul = (ham: string) => {
    if (!sayiGirildiMi(ham)) return false;
    const n = parseLocaleNumber(ham);
    return n >= 0.1 && n <= 30;
  };
  const krGecerli = krMakul(baseline) && krMakul(current);

  /**
   * `null` = kreatinin ölçütü DEĞERLENDİRİLEMEDİ (0 ile aynı şey değil).
   * RRT tek başına Evre 3 demek, o yüzden kreatininden bağımsız.
   */
  const crStage = useMemo<number | null>(
    () => (onRRT ? 3 : krGecerli ? creatinineStage(baselineNum, currentNum, acuteRise, onRRT) : null),
    [baselineNum, currentNum, acuteRise, onRRT, krGecerli]
  );

  /* İdrar ölçütü tek başına evreleyebilir (KDIGO buna izin veriyor), yani
     kreatinin okunamıyor olsa bile idrar bir evre veriyorsa sonuç geçerli. */
  const degerlendirilebilir = crStage !== null || urineStage > 0;
  const finalStage = Math.max(crStage ?? 0, urineStage);
  const ratio = krGecerli ? Math.round((currentNum / baselineNum) * 100) / 100 : null;

  const stageMeta =
    !degerlendirilebilir
      /* "AKI Kriteri Yok" bir İDDİA; kreatinin okunamadığında onu basmak
         yanlış güven verir. Burada sebep söyleniyor. */
      ? { label: "Değerlendirilemedi", color: "text-slate-600", bg: "bg-slate-50" }
      : finalStage === 3
      ? { label: "Evre 3", color: "text-rose-700", bg: "bg-rose-50" }
      : finalStage === 2
      ? { label: "Evre 2", color: "text-amber-700", bg: "bg-amber-50" }
      : finalStage === 1
      ? { label: "Evre 1", color: "text-amber-600", bg: "bg-amber-50" }
      : { label: "AKI Kriteri Yok", color: "text-emerald-700", bg: "bg-emerald-50" };

  const shareParams = {
    base: baselineNum, cur: currentNum, acute: acuteRise ? 1 : 0, rrt: onRRT ? 1 : 0, urine: urineStage,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">

        <ToolTopNav toolSlug="kdigo-aki" />

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            💧
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">KDIGO AKI Evrelemesi</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Akut Böbrek Hasarı — Kreatinin + İdrar Çıkışı Kriterleri</p>
          </div>
        </div>

        {/* KREATİNİN KRİTERLERİ */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <span className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest pl-1">Kreatinin Kriteri</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Bazal Kreatinin (mg/dL)</span>
              <input type="text" inputMode="decimal" value={baseline} onChange={(e) => setBaseline(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg transition-all" />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Güncel Kreatinin (mg/dL)</span>
              <input type="text" inputMode="decimal" value={current} onChange={(e) => setCurrent(e.target.value)}
                className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg transition-all" />
            </label>
          </div>
          {ratio !== null && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oran (güncel / bazal): {ratio}×</p>
          )}
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
            <input type="checkbox" checked={acuteRise} onChange={() => setAcuteRise(v => !v)} className="w-4 h-4 rounded border-slate-300 text-blue-900" />
            <span className="text-xs font-bold text-slate-600 uppercase">48 saat içinde ≥ 0.3 mg/dL akut artış</span>
          </label>
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer">
            <input type="checkbox" checked={onRRT} onChange={() => setOnRRT(v => !v)} className="w-4 h-4 rounded border-slate-300 text-blue-900" />
            <span className="text-xs font-bold text-slate-600 uppercase">Renal replasman tedavisi (RRT) başlandı</span>
          </label>
        </div>

        {/* İDRAR ÇIKIŞI KRİTERİ */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-3">
          <span className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest pl-1">İdrar Çıkışı Kriteri</span>
          <div className="grid gap-2">
            {URINE_OPTIONS.map((o) => (
              <button aria-pressed={urineStage === o.value}
                key={o.value}
                type="button"
                onClick={() => setUrineStage(o.value)}
                className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-left transition-all
                  ${urineStage === o.value
                    ? 'bg-blue-900 border-blue-900 text-white shadow-md'
                    : 'bg-slate-50 border-slate-100 hover:border-blue-900/30 text-blue-950'}
                `}
              >
                <span className="text-xs font-bold">{o.label}</span>
              </button>
            ))}
          </div>
          <p className="text-[9px] text-slate-400 font-bold italic uppercase leading-relaxed">
            * İdrar çıkışı kriterleri diüretik alan veya sirotik hastalarda güvenilir olmayabilir; yoğun bakım dışında dikkatli yorumlanmalıdır.
          </p>
        </div>

        {/* SONUÇ PANELİ */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
           <div aria-hidden="true" className="absolute top-0 right-0 p-6 opacity-10 text-white text-7xl font-black italic">AKI</div>
           <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">KDIGO EVRESİ</span>
           <div className="text-7xl font-black text-white">{!degerlendirilebilir || finalStage === 0 ? "–" : finalStage}</div>
           <span className="text-[9px] font-bold text-blue-300 uppercase tracking-widest mt-3">
             Kreatinin: Evre {crStage ?? "–"} · İdrar: Evre {urineStage} (yüksek olan geçerli)
           </span>
        </div>

        {/* YORUMLAMA PANELİ */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <div className={`text-center p-4 rounded-xl font-black italic uppercase tracking-tight ${stageMeta.bg} ${stageMeta.color}`}>
             {stageMeta.label}
           </div>
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-slate-900/5 p-6 rounded-[2rem] border border-slate-200 space-y-4">
          <ToolShare params={shareParams} />
          <p className="text-[9px] text-blue-900/80 font-bold uppercase tracking-[0.15em] text-center leading-relaxed italic">
            ⚠️ KDIGO evrelemesi kreatinin (48 saatlik veya 7 günlük pencere) VEYA idrar çıkışı kriterlerinden hangisi daha şiddetliyse ona göre yapılır. Kronik böbrek hastalığı zemininde bazal değer belirsizse yorum dikkatli yapılmalıdır.
          </p>
        </div>

      </div>
    </div>
  );
}
