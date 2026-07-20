"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

// ACR/EULAR 2015 Gout Classification — entry criterion + domains
// Entry criterion: ≥ 1 atak epizodu ile periferik eklem/bursa tutulumu
// Yeterli tanı: sinoviyal sıvıda MSU kristal pozitifliği (otomatik sınıflandırma)
// Yetersiz tanı için domain skorlama: ≥ 8 puan = gut artrit

const DOMAIN_ITEMS = [
  {
    id: "joint",
    label: "Semptomatik Eklem/Bursa",
    detail: "En az bir atakta tutulan eklem",
    options: [
      { label: "Ayak bileği veya ayak ortası (midfoot)", pts: 1 },
      { label: "1. metatarsofalangeal eklem (MTP)", pts: 2 },
    ],
    single: true,
  },
  {
    id: "characteristics",
    label: "Atak Karakteristikleri",
    detail: "Her biri 1 puan — mevcut ataktaki özellikler",
    options: [
      { label: "Etkilenen eklemde eritem", pts: 1 },
      { label: "Dokunmaya veya baskıya dayanılmaz hassasiyet", pts: 1 },
      { label: "Yürümekte veya eklem kullanmakta büyük güçlük", pts: 1 },
    ],
    single: false,
  },
  {
    id: "time_course",
    label: "Zaman Seyri",
    detail: "Tipik atak sayısı (ağrı başlangıcından ≤ 24 saat, ≤ 14 günde tam gerileme, iki atak arası tamamen asemptomatik)",
    options: [
      { label: "Tipik atak özelliklerinden 1 tanesi", pts: 1 },
      { label: "Tipik atak özelliklerinden 2 tanesi", pts: 2 },
      { label: "Tipik atak özelliklerinden 3 tanesi (klasik atak)", pts: 3 },
    ],
    single: true,
  },
  {
    id: "tophus",
    label: "Tofüs Varlığı",
    detail: "Klinik olarak tofüs: saydam cildin altında nodül, deşarj veya tebeşirsi malzeme",
    options: [
      { label: "Yok", pts: 0 },
      { label: "Var", pts: 4 },
    ],
    single: true,
  },
  {
    id: "urate",
    label: "Serum Ürat",
    detail: "MSU kristali tespit edilemeyen birinde veya yetersiz tanı döneminde ölçülen en yüksek değer",
    options: [
      { label: "< 4 mg/dL (< 0.24 mmol/L)", pts: -4 },
      { label: "4–< 6 mg/dL (0.24–< 0.36)", pts: 0 },
      { label: "6–< 8 mg/dL (0.36–< 0.48)", pts: 2 },
      { label: "8–< 10 mg/dL (0.48–< 0.60)", pts: 3 },
      { label: "≥ 10 mg/dL (≥ 0.60 mmol/L)", pts: 4 },
    ],
    single: true,
  },
  {
    id: "synovial",
    label: "Sinoviyal Analiz",
    detail: "Semptomatik eklemden alınan sinoviyal sıvı",
    options: [
      { label: "Yapılmadı / Bilinmiyor", pts: 0 },
      { label: "MSU kristali negatif", pts: -2 },
    ],
    single: true,
  },
  {
    id: "imaging",
    label: "Görüntüleme",
    detail: "Semptomatik eklem/bursa veya 1. MTP / ayak bileği ultrason/dual-enerji BT",
    options: [
      { label: "Görüntüleme yok", pts: 0 },
      { label: "USG: çift kontur bulgusu VEYA DECT: ürat birikimi", pts: 4 },
      { label: "X-Ray: gut ile ilişkili erozyon", pts: 4 },
    ],
    single: true,
  },
];

export default function GoutACRPage() {
  const [msu,  setMsu]  = React.useState<boolean | null>(null);
  const [entry,setEntry]= React.useState<boolean | null>(null);
  const [sel,  setSel]  = React.useState<Record<string, number[]>>(
    Object.fromEntries(DOMAIN_ITEMS.map(i => [i.id, []]))
  );

  const domainTotal = DOMAIN_ITEMS.reduce((s, item) => {
    const vals = sel[item.id];
    if (item.single) return s + (vals[0] ?? 0);
    return s + vals.reduce((a, v) => a + v, 0);
  }, 0);

  const allDone = entry !== null && msu !== null && DOMAIN_ITEMS.every(i => sel[i.id].length > 0 || i.options.some(o => o.pts === 0));

  const toggle = (itemId: string, pts: number, single: boolean) => {
    setSel(s => {
      const prev = s[itemId];
      if (single) return { ...s, [itemId]: prev[0] === pts ? [] : [pts] };
      return { ...s, [itemId]: prev.includes(pts) ? prev.filter(v => v !== pts) : [...prev, pts] };
    });
  };

  const isGout = msu === true || (entry === true && domainTotal >= 8);
  const isExcluded = msu === false && entry === false;
  const showDomains = entry === true && msu !== true;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="gout-acr" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">💎</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Gut Artrit 2015</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">ACR/EULAR Sınıflandırma Kriterleri · ≥ 8 Puan = Gut</p>
          </div>
        </div>

        {/* Adım 1: Giriş */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <p className="font-black text-blue-900 uppercase italic text-sm mb-1">Adım 1 — Giriş Kriteri</p>
          <p className="text-[10px] text-slate-600 mb-3">Periferik eklem veya bursada ≥ 1 atak epizodu var mı?</p>
          <div className="flex gap-2">
            {([true, false] as const).map(v => (
              <button key={String(v)} type="button" onClick={() => setEntry(e => e === v ? null : v)}
                className={`flex-1 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all
                  ${entry === v ? (v ? "border-emerald-600 bg-emerald-600 text-white" : "border-rose-500 bg-rose-500 text-white") : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200"}`}>
                {v ? "Evet" : "Hayır"}
              </button>
            ))}
          </div>
        </div>

        {entry === true && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="font-black text-blue-900 uppercase italic text-sm mb-1">Adım 2 — Yeterli Tanı</p>
            <p className="text-[10px] text-slate-600 mb-3">Sinoviyal sıvı veya tofüs aspiratında MSU kristali görüldü mü?</p>
            <div className="flex gap-2">
              {([true, false] as const).map(v => (
                <button key={String(v)} type="button" onClick={() => setMsu(m => m === v ? null : v)}
                  className={`flex-1 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all
                    ${msu === v ? (v ? "border-emerald-600 bg-emerald-600 text-white" : "border-blue-900 bg-blue-900 text-white") : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200"}`}>
                  {v ? "Evet — MSU Pozitif" : "Hayır / Yapılmadı"}
                </button>
              ))}
            </div>
          </div>
        )}

        {showDomains && (
          <div className="space-y-3">
            {DOMAIN_ITEMS.map(item => (
              <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">{item.label}</p>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{item.detail}</p>
                <div className="space-y-1.5">
                  {item.options.map(opt => {
                    const active = item.single ? sel[item.id][0] === opt.pts : sel[item.id].includes(opt.pts);
                    return (
                      <button key={opt.pts} type="button" onClick={() => toggle(item.id, opt.pts, item.single)}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-xl border-2 text-[10px] font-bold transition-all
                          ${active ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                        <span className={`w-7 h-5 rounded-md flex items-center justify-center text-[9px] font-black shrink-0
                          ${active ? opt.pts > 0 ? "bg-amber-400 text-blue-900" : "bg-slate-400 text-white" : "bg-white border border-slate-200 text-slate-400"}`}>
                          {opt.pts > 0 ? `+${opt.pts}` : opt.pts}
                        </span>
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {entry !== null && msu !== null ? (
          msu === true ? (
            <div className="p-6 rounded-[2rem] border-2 border-dashed border-rose-400 bg-rose-50 flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-rose-600 flex flex-col items-center justify-center shadow-lg shrink-0">
                <span className="text-2xl">💎</span>
                <span className="text-[8px] font-black text-white uppercase mt-1">GUT ARTRİT</span>
              </div>
              <div>
                <span className="text-[9px] font-black px-3 py-1 rounded-full bg-rose-700 text-white">YETERLI TANI — MSU POZİTİF</span>
                <p className="text-sm font-bold text-rose-700 mt-1">Sinoviyal sıvıda MSU kristali = Gut artrit tanısı kesindir</p>
              </div>
            </div>
          ) : entry === false ? (
            <div className="p-6 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 flex items-center gap-4">
              <div className="text-4xl">❌</div>
              <div>
                <span className="text-[9px] font-black px-3 py-1 rounded-full bg-slate-600 text-white">KAPSAM DIŞI</span>
                <p className="text-sm font-bold text-slate-600 mt-1">Periferik eklem atağı yok — gut sınıflandırma kriterleri uygulanamaz</p>
              </div>
            </div>
          ) : showDomains ? (
            <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-4 ${domainTotal >= 8 ? "border-rose-400 bg-rose-50" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                  <span className="text-[7px] font-black text-blue-300 uppercase">Domain</span>
                  <span className="text-4xl font-black text-white leading-none">{domainTotal}</span>
                  <span className="text-[8px] text-blue-300">/ ≥8</span>
                </div>
                <div>
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full ${domainTotal >= 8 ? "bg-rose-700 text-white" : "bg-slate-500 text-white"}`}>
                    {domainTotal >= 8 ? "GUT ARTRİT — Kriterleri Karşılıyor" : "Kriter Karşılanmadı"}
                  </span>
                  <p className={`text-sm font-bold mt-1 ${domainTotal >= 8 ? "text-rose-700" : "text-slate-600"}`}>
                    {domainTotal >= 8 ? "ACR/EULAR 2015 kriterlerine göre gut artrit sınıflandırması yapılmıştır" : `${8 - domainTotal} puan daha gerekiyor`}
                  </p>
                </div>
              </div>
            </div>
          ) : null
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adımları sırasıyla tamamlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={{ entry: entry ? 1 : 0, msu: msu ? 1 : 0, domain: domainTotal }} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Bu kriterler klinik çalışmalar için sınıflandırma amaçlıdır; bireysel hasta tanısı klinisyen değerlendirmesine dayanır. Neogi et al., Arthritis Rheumatol 2015.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
