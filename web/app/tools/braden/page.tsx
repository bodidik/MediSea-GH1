"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const SUBSCALES: { id: string; label: string; detail: string; opts: { label: string; desc: string; pts: number }[] }[] = [
  {
    id: "sensory",
    label: "Duyusal Algılama",
    detail: "Basınçla ilgili rahatsızlığa yanıt verme kapasitesi",
    opts: [
      { pts: 1, label: "Tamamen Sınırlı",  desc: "Bilinçsizlik veya sedatasyon nedeniyle ağrı uyaranına yanıt yok" },
      { pts: 2, label: "Çok Sınırlı",      desc: "Yalnızca ağrı uyaranına yanıt; vücut yüzeyinin yarısından fazlasında duyu bozukluğu" },
      { pts: 3, label: "Hafif Sınırlı",    desc: "Sözel komutlara yanıt; 1-2 ekstremitede his kaybı" },
      { pts: 4, label: "Sınırsız",          desc: "Sözel komutlara tam yanıt; duyusal bozukluk yok" },
    ],
  },
  {
    id: "moisture",
    label: "Nem",
    detail: "Derinin neme maruz kalma düzeyi",
    opts: [
      { pts: 1, label: "Sürekli Nemli",    desc: "Deri idrar/dışkıyla sürekli ıslak; her pozisyon değişimi" },
      { pts: 2, label: "Çok Nemli",        desc: "Deri sık ama her zaman değil nemli; günde en az 1 çarşaf değişimi" },
      { pts: 3, label: "Bazen Nemli",      desc: "Deri zaman zaman nemli; her gün yaklaşık 1 kez çarşaf değişimi" },
      { pts: 4, label: "Nadiren Nemli",    desc: "Deri genellikle kuru; rutin aralıklarda çarşaf değişimi" },
    ],
  },
  {
    id: "activity",
    label: "Aktivite",
    detail: "Fiziksel aktivite düzeyi",
    opts: [
      { pts: 1, label: "Yatağa Bağımlı",  desc: "Yatakta sınırlı" },
      { pts: 2, label: "Koltuğa Bağımlı", desc: "Yürüme kapasitesi çok az veya yok; koltuk/tekerlekli sandalyeye taşınma" },
      { pts: 3, label: "Bazen Yürüyor",   desc: "Gün içinde kısa mesafe yürüme; zamanın büyük kısmı yatakta/sandalyede" },
      { pts: 4, label: "Sık Yürüyor",     desc: "Gün içinde en az 2 kez ve uyandığı saatlerde oda dışına çıkıyor" },
    ],
  },
  {
    id: "mobility",
    label: "Hareket",
    detail: "Vücut pozisyonunu kontrol etme ve değiştirme kapasitesi",
    opts: [
      { pts: 1, label: "Tamamen Hareketsiz", desc: "Yardım olmaksızın vücudun veya ekstremitelerin pozisyonunda küçük bir değişiklik bile yapamıyor" },
      { pts: 2, label: "Çok Kısıtlı",       desc: "Zaman zaman hafif pozisyon değişikliği; bağımsız değil" },
      { pts: 3, label: "Hafif Kısıtlı",      desc: "Sık olmasa da bağımsız küçük vücut veya ekstremite pozisyon değişikliği yapabiliyor" },
      { pts: 4, label: "Kısıtlama Yok",      desc: "Sık ve büyük pozisyon değişikliği yapabiliyor; yardımsız" },
    ],
  },
  {
    id: "nutrition",
    label: "Beslenme",
    detail: "Olağan besin alım düzeni",
    opts: [
      { pts: 1, label: "Çok Yetersiz",  desc: "Porsiyon yok veya asla tam porsiyon tüketmiyor; sıvı alımı az; parenteral beslenme gerekiyor" },
      { pts: 2, label: "Muhtemelen Yetersiz", desc: "Nadiren tam porsiyon bitirir; protein alımı yetersiz; zaman zaman takviye" },
      { pts: 3, label: "Yeterli",       desc: "Çoğu öğünü bitiriyor; günde 4 porsiyon protein; zaman zaman takviye reddediyor" },
      { pts: 4, label: "Mükemmel",      desc: "Her öğünü yiyor; protein alımı iyi; ek gerek yok" },
    ],
  },
  {
    id: "friction",
    label: "Sürtünme ve Yırtılma",
    detail: "Hareket sırasında deri ile yatak yüzeyi arasındaki sürtünme",
    opts: [
      { pts: 1, label: "Problem",       desc: "Çekilmek için orta-maksimum yardım gerekiyor; spastisite, kontraktür veya ajitasyon" },
      { pts: 2, label: "Potansiyel Problem", desc: "Zayıf hareket; çarşafta sürtünme" },
      { pts: 3, label: "Problem Yok",   desc: "Bağımsız hareket; yatak ve sandalyede yeterli güç" },
    ],
  },
];

const getBand = (v: number) =>
  v <= 9  ? { label: "ÇOK YÜKSEK RİSK",color: "rose",   sub: "Ağır bası yarası önleme protokolü — 2 saatte bir döndür, basınç giderici yatak" } :
  v <= 12 ? { label: "YÜKSEK RİSK",   color: "orange", sub: "Günlük deri kontrolü, basınç giderici ped, erken mobilizasyon" } :
  v <= 14 ? { label: "ORTA RİSK",     color: "amber",  sub: "Riskin önlenmesi için döndürme programı ve nem yönetimi" } :
  v <= 18 ? { label: "HAFİF RİSK",    color: "sky",    sub: "Önleyici önlemler — zemin olarak deri bakımı ve mobilizasyon" } :
             { label: "DÜŞÜK RİSK",   color: "emerald",sub: "Standart bakım yeterli" };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  rose:   { bg: "bg-rose-50",   border: "border-rose-300",   text: "text-rose-700",   badge: "bg-rose-700 text-white" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-600 text-white" },
  amber:  { bg: "bg-amber-50",  border: "border-amber-200",  text: "text-amber-700",  badge: "bg-amber-600 text-white" },
  sky:    { bg: "bg-sky-50",    border: "border-sky-200",    text: "text-sky-700",    badge: "bg-sky-700 text-white" },
  emerald:{ bg: "bg-emerald-50",border: "border-emerald-200",text: "text-emerald-700",badge: "bg-emerald-700 text-white" },
};

export default function BradenPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(SUBSCALES.map(s => [s.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === SUBSCALES.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0)
    : null;

  const band = total !== null ? getBand(total) : null;
  const c = band ? COLOR[band.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="braden" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🛏️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Braden Skalası</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Bası Yarası Risk Değerlendirmesi · 6 Alt Ölçek · 6–23</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3">
          <p className="text-[10px] font-bold text-amber-700">📌 Düşük puan = Yüksek risk. ≤ 18 puan risk taşıyor; ≤ 12 yüksek risk. Değerlendirme kabule ve ardından en az günde bir kez yapılmalıdır.</p>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/6 alt ölçek</span>
          <div className="flex gap-1.5">
            {SUBSCALES.map(s => (
              <div key={s.id} className={`w-5 h-2 rounded-full transition-all ${sel[s.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {SUBSCALES.map(scale => (
            <div key={scale.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">{scale.label}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{scale.detail}</p>
              <div className="space-y-1.5">
                {scale.opts.map(opt => (
                  <button key={opt.pts} type="button"
                    onClick={() => setSel(s => ({ ...s, [scale.id]: s[scale.id] === opt.pts ? null : opt.pts }))}
                    className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-[10px] font-bold transition-all
                      ${sel[scale.id] === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                    <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0
                      ${sel[scale.id] === opt.pts ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                    <div>
                      <span className="font-black">{opt.label}</span>
                      <span className="text-[8px] ml-1 opacity-70">— {opt.desc}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {total !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">Braden</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 23</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-1 text-center text-[7px]">
              {[
                { l: "Çok Yüksek", r: "≤ 9" },
                { l: "Yüksek", r: "10–12" },
                { l: "Orta", r: "13–14" },
                { l: "Hafif", r: "15–18" },
                { l: "Düşük", r: "≥ 19" },
              ].map(b => (
                <div key={b.l} className={`rounded-lg p-1 font-black
                  ${(b.l === "Çok Yüksek" && total <= 9) || (b.l === "Yüksek" && total >= 10 && total <= 12) || (b.l === "Orta" && total >= 13 && total <= 14) || (b.l === "Hafif" && total >= 15 && total <= 18) || (b.l === "Düşük" && total >= 19) ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.l}</div><div className="font-bold">{b.r}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 6 alt ölçeği tamamlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Braden skalası bası yarası riskini tahmin eder; klinik yargının yerini tutmaz. ≤ 18 için önleme protokolü başlatılmalıdır. Braden & Bergstrom, Nurs Res 1987.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
