"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";

const ITEMS = [
  {
    id: "bmi",
    label: "Vücut Kitle İndeksi (VKİ)",
    detail: "kg/m²",
    options: [
      { label: "> 21 kg/m²", pts: 0 },
      { label: "≤ 21 kg/m²", pts: 1 },
    ],
  },
  {
    id: "fev1",
    label: "FEV₁ (% Beklenen)",
    detail: "Bronkodilatör sonrası spirometri",
    options: [
      { label: "≥ 65%", pts: 0 },
      { label: "50–64%", pts: 1 },
      { label: "36–49%", pts: 2 },
      { label: "≤ 35%", pts: 3 },
    ],
  },
  {
    id: "mmrc",
    label: "mMRC Dispne Skalası",
    detail: "Modifiye MRC dispne derecesi",
    options: [
      { label: "Grade 0–1 (egzersizde veya hızlı yürürken)", pts: 0 },
      { label: "Grade 2 (yaşıtlarından yavaş veya düz zeminde duruyor)", pts: 1 },
      { label: "Grade 3 (yaklaşık 100 m veya birkaç dakika sonra duruyor)", pts: 2 },
      { label: "Grade 4 (evden çıkamıyor veya giyinirken nefes darlığı)", pts: 3 },
    ],
  },
  {
    id: "6mwt",
    label: "6 Dakika Yürüme Testi",
    detail: "Düz zeminde 6 dakikada kat edilen mesafe",
    options: [
      { label: "≥ 350 m", pts: 0 },
      { label: "250–349 m", pts: 1 },
      { label: "150–249 m", pts: 2 },
      { label: "< 150 m", pts: 3 },
    ],
  },
];

/* Tavan ŞIKLARDAN türüyor: elle yazılan payda bu depoda bir kez sessizce
   bayatladı (nihss ekranda "/ 42" basıyordu ama tavan türetilmişti). */
const TAVAN = ITEMS.reduce((s, i) => s + Math.max(...i.options.map(o => o.pts)), 0);

const QUARTILES = [
  { min: 0, max: 2, label: "Q1 — Düşük Risk", os4: "%80+", color: "emerald" },
  { min: 3, max: 4, label: "Q2 — Orta-Düşük",  os4: "%67",  color: "sky" },
  { min: 5, max: 6, label: "Q3 — Orta-Yüksek", os4: "%57",  color: "amber" },
  { min: 7, max: TAVAN, label: "Q4 — Yüksek Risk", os4: "%18",  color: "rose" },
];

/* İKİNCİ OKUMA — alevlenme öyküsü. BODE'nin bileşenleri arasında alevlenme
   YOK (Celli, NEJM 2004): dört eksen de STABİL dönem ölçümü. Oysa GOLD
   farmakolojik basamağı doğrudan alevlenme öyküsünden kuruyor (ABE
   gruplaması), ve BODEx ile DOSE zaten bu boşluğu kapatmak için türetildi.
   Sonuç ölçülebilir bir kör nokta: VKİ'si, spirometrisi, dispnesi ve yürüme
   mesafesi iyi olan hasta Q1'de olabilir ve aynı yıl iki kez hastaneye
   yatmış olabilir. Bu okuma SKORU DEĞİŞTİRMİYOR — değiştirdiği şey tedavi
   basamağı ve o basamak kılavuzun kendi kuralı. */
const ALEVLENME_SECENEKLERI: { kod: string; label: string; sub: string; agir: boolean }[] = [
  { kod: "yok",  label: "0–1 orta alevlenme, hastane yatışı yok", sub: "Son 12 ayda · GOLD grup A veya B", agir: false },
  { kod: "sik",  label: "≥ 2 orta alevlenme",                     sub: "Son 12 ayda · GOLD grup E",        agir: true  },
  { kod: "yatis", label: "≥ 1 hastane yatışı gerektiren alevlenme", sub: "Son 12 ayda · GOLD grup E",       agir: true  },
];

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     badge: "bg-sky-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-700 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function BODEPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(ITEMS.map(i => [i.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === ITEMS.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0)
    : null;

  const q = total !== null ? QUARTILES.find(b => total >= b.min && total <= b.max)! : null;
  const c = q ? COLOR[q.color] : null;

  /* Seçim İNDEKSLE saklanıyor, puanla değil — bu alanın puanı yok ama kalıp
     bu depoda altı kez kusur üretti (aynı puanlı iki şık tek düğme oluyordu). */
  const [alevIdx, setAlevIdx] = React.useState<number | null>(null);
  const alev = alevIdx === null ? null : ALEVLENME_SECENEKLERI[alevIdx];

  /* Ayrışma KİMLİKTEN okunuyor, indeksten değil: cetvel sırası değişirse
     koşul sessizce yanlış banda kaymasın. */
  const dusukCeyrek = q?.label.startsWith("Q1") || q?.label.startsWith("Q2");
  const ayrisiyor = !!(alev?.agir && dusukCeyrek);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="bode" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">📊</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">BODE İndeksi</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">KOAH Mortalite Tahmini · BMI · Obstrüksiyon · Dispne · Egzersiz</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/4 parametre</span>
          <div className="flex gap-2 text-[8px] font-black text-slate-500 uppercase tracking-widest">
            {["B","O","D","E"].map((l, i) => (
              <span key={l} className={`w-6 h-6 rounded-lg flex items-center justify-center
                ${Object.values(sel)[i] !== null ? "bg-blue-900 text-white" : "bg-slate-200 text-slate-400"}`}>{l}</span>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {ITEMS.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p id={`grp-0b-${String(item.id).replace(/[^a-zA-Z0-9]+/g, '-')}`} className="font-black text-blue-900 uppercase italic text-sm mb-0.5">{item.label}</p>
              <p id={`grp-0-${String(item.id).replace(/[^a-zA-Z0-9]+/g, '-')}`} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{item.detail}</p>
              <div role="group" aria-labelledby={`grp-0b-${String(item.id).replace(/[^a-zA-Z0-9]+/g, '-')} grp-0-${String(item.id).replace(/[^a-zA-Z0-9]+/g, '-')}`} className="space-y-1.5">
                {item.options.map(opt => (
                  <button aria-pressed={sel[item.id] === opt.pts} key={opt.pts} type="button"
                    onClick={() => setSel(s => ({ ...s, [item.id]: s[item.id] === opt.pts ? null : opt.pts }))}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl border-2 text-[10px] font-bold transition-all
                      ${sel[item.id] === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0
                      ${sel[item.id] === opt.pts ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <SonucDuyuru metin={q ? `BODE ${total} — ${q.label}` : null} />

        {total !== null && q && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[8px] font-black text-blue-300 uppercase">BODE</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ {TAVAN}</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{q.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>4 Yıllık Sağkalım ≈ {q.os4}</p>
                <p className="text-[9px] text-slate-500 font-bold mt-0.5 uppercase tracking-widest">Quartil: {q.min}–{q.max} puan</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-[8px]">
              {QUARTILES.map(b => (
                <div key={b.label} className={`rounded-lg p-1.5 font-black
                  ${b.label === q.label ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.min}–{b.max}</div>
                  <div className="font-bold">{b.os4}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 4 parametreyi tamamlayın</p>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p id="alev-baslik" className="font-black text-blue-900 uppercase italic text-sm mb-0.5">Alevlenme öyküsü <span className="text-slate-400 normal-case not-italic font-bold">— opsiyonel</span></p>
          <p id="alev-detay" className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">BODE bileşeni DEĞİL · skoru değiştirmez, ayrıca okunur</p>
          <div role="group" aria-labelledby="alev-baslik alev-detay" className="space-y-1.5">
            {ALEVLENME_SECENEKLERI.map((o, i) => (
              <button aria-pressed={alevIdx === i} key={o.kod} type="button"
                onClick={() => setAlevIdx(alevIdx === i ? null : i)}
                className={`w-full text-left px-3 py-2 rounded-xl border-2 text-[10px] font-bold transition-all
                  ${alevIdx === i ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                <span className="block">{o.label}</span>
                <span className={`block text-[9px] font-bold mt-0.5 ${alevIdx === i ? "text-blue-200" : "text-slate-400"}`}>{o.sub}</span>
              </button>
            ))}
          </div>

          {alev && q ? (
            <div className={`mt-3 rounded-xl border-2 p-3 ${ayrisiyor ? "border-amber-300 bg-amber-50" : "border-slate-100 bg-slate-50"}`}>
              <p className={`text-[9px] font-black uppercase tracking-widest ${ayrisiyor ? "text-amber-700" : "text-slate-500"}`}>
                {ayrisiyor ? "Çapraz kontrol — iki okuma ayrışıyor" : "Çapraz kontrol"}
              </p>
              <p className="text-[11px] text-slate-700 leading-relaxed mt-1">
                {ayrisiyor ? (
                  <>BODE <span className="font-black text-blue-900">{q.label}</span> diyor, ama alevlenme yükü GOLD grup E karşılığı. BODE dört ekseni de STABİL dönemde ölçüyor; alevlenme öyküsü hem mortaliteyi hem yatış riskini bağımsız olarak yükseltiyor ve farmakolojik basamağı doğrudan o belirliyor. <span className="font-black">Skora dokunulmadı</span> — değişen şey tedavi basamağı.</>
                ) : alev.agir ? (
                  <>Alevlenme yükü yüksek ve BODE de <span className="font-black text-blue-900">{q.label}</span> — iki okuma <span className="font-black">aynı yönü</span> işaret ediyor.</>
                ) : (
                  <>Alevlenme yükü düşük; BODE <span className="font-black text-blue-900">{q.label}</span> ile <span className="font-black">iki okuma ayrışmıyor</span>.</>
                )}
              </p>
            </div>
          ) : null}
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              BODE indeksi yalnızca FEV₁ kullanımına kıyasla KOAH mortalitesini daha iyi öngörür. Akciğer transplantasyonu ve pulmoner rehabilitasyon kararlarında referans alınır. Dört eksenin dördü de STABİL dönem ölçümüdür: alevlenme öyküsü indekste yer almaz — BODEx ve DOSE tam bu boşluk için türetilmiştir, GOLD farmakolojik basamağı da alevlenme öyküsünden kurulur. Yukarıdaki alevlenme alanı bu yüzden skora katılmaz, ayrıca okunur. Celli et al., NEJM 2004.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
