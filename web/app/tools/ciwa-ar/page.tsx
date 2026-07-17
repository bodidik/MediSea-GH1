"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS = [
  {
    id: "nausea",
    label: "Bulantı / Kusma",
    question: "Son bir saatte bulantı hissettiniz mi? Kusmak için bastırma hissi var mıydı?",
    opts: [
      { v: 0, l: "Yok" },
      { v: 1, l: "Hafif bulantı, kusma yok" },
      { v: 4, l: "Aralıklı bulantı + kuru öğürme" },
      { v: 7, l: "Sürekli bulantı + sık kusma" },
    ],
  },
  {
    id: "tremor",
    label: "Tremor",
    question: "Kollar yanlara açık, parmaklar ayrıkken değerlendirin.",
    opts: [
      { v: 0, l: "Yok" },
      { v: 1, l: "Görülmüyor, hissediliyor" },
      { v: 4, l: "Orta; hasta dinlenirken" },
      { v: 7, l: "Ağır; kollar uzatılmamış halde bile" },
    ],
  },
  {
    id: "sweats",
    label: "Paroksismal Terleme",
    question: "Gözlemle değerlendirin.",
    opts: [
      { v: 0, l: "Yok" },
      { v: 1, l: "Hafif nem; avuç içi" },
      { v: 4, l: "Alın teri görülüyor" },
      { v: 7, l: "Sırılsıklam terleme" },
    ],
  },
  {
    id: "anxiety",
    label: "Anksiyete",
    question: "Kendinizi kaygılı veya gergin hissediyor musunuz?",
    opts: [
      { v: 0, l: "Yok, rahat" },
      { v: 1, l: "Hafif kaygılı" },
      { v: 4, l: "Orta — koruyucu davranış" },
      { v: 7, l: "Akut deliryum panik atağı eşdeğeri" },
    ],
  },
  {
    id: "agitation",
    label: "Ajitasyon",
    question: "Gözlemle değerlendirin.",
    opts: [
      { v: 0, l: "Normal aktivite" },
      { v: 1, l: "Normalden biraz fazla hareketli" },
      { v: 4, l: "Orta derecede huzursuz ve kıpır kıpır" },
      { v: 7, l: "Muayeneyi güçleştiren aşırı ajitasyon" },
    ],
  },
  {
    id: "tactile",
    label: "Dokunsal Bozukluklar",
    question: "Derinde kaşıntı, yanma, uyuşma hissettiniz mi? Böcek hissi? Böcek görüyor musunuz?",
    opts: [
      { v: 0, l: "Yok" },
      { v: 1, l: "Çok hafif kaşıntı / uyuşma" },
      { v: 2, l: "Hafif kaşıntı / uyuşma" },
      { v: 3, l: "Orta kaşıntı / uyuşma" },
      { v: 4, l: "Orta derecede dokunsal halüsinasyon" },
      { v: 5, l: "Ağır dokunsal halüsinasyon" },
      { v: 6, l: "Çok ağır dokunsal halüsinasyon" },
      { v: 7, l: "Sürekli dokunsal halüsinasyon" },
    ],
  },
  {
    id: "auditory",
    label: "İşitsel Bozukluklar",
    question: "Çevredeki seslerin daha sert veya rahatsız edici geldiği oluyor mu? Fısıltı mı? Ses mi duyuyorsunuz?",
    opts: [
      { v: 0, l: "Yok" },
      { v: 1, l: "Çok hafif sertlik / ürperme" },
      { v: 2, l: "Hafif sertlik / ürperme" },
      { v: 3, l: "Orta sertlik / ürperme" },
      { v: 4, l: "Orta derecede işitsel halüsinasyon" },
      { v: 5, l: "Ağır işitsel halüsinasyon" },
      { v: 6, l: "Çok ağır işitsel halüsinasyon" },
      { v: 7, l: "Sürekli işitsel halüsinasyon" },
    ],
  },
  {
    id: "visual",
    label: "Görsel Bozukluklar",
    question: "Işık rahatsız ediyor mu? Görme bulanıklığı? Bir şeyler görüyor musunuz?",
    opts: [
      { v: 0, l: "Yok" },
      { v: 1, l: "Çok hafif ışık hassasiyeti" },
      { v: 2, l: "Hafif ışık hassasiyeti" },
      { v: 3, l: "Orta ışık hassasiyeti" },
      { v: 4, l: "Orta derecede görsel halüsinasyon" },
      { v: 5, l: "Ağır görsel halüsinasyon" },
      { v: 6, l: "Çok ağır görsel halüsinasyon" },
      { v: 7, l: "Sürekli görsel halüsinasyon" },
    ],
  },
  {
    id: "headache",
    label: "Baş Ağrısı / Dolgunluk",
    question: "Başınız ağrıyor mu? Baskı veya dolgunluk hissediyor musunuz? (Baş dönmesi bu soruya dahil değil)",
    opts: [
      { v: 0, l: "Yok" },
      { v: 1, l: "Çok hafif" },
      { v: 2, l: "Hafif" },
      { v: 3, l: "Orta" },
      { v: 4, l: "Orta-şiddetli" },
      { v: 5, l: "Şiddetli" },
      { v: 6, l: "Çok şiddetli" },
      { v: 7, l: "Dayanılmaz" },
    ],
  },
  {
    id: "orientation",
    label: "Yönelim / Sensoriyum Bulanıklığı",
    question: "Bugün hangi gün? Neredesiniz? Benim adım ne?",
    max4: true,
    opts: [
      { v: 0, l: "Tam yönelim; kim, nerede, ne zaman biliyor" },
      { v: 1, l: "Tarihten emin değil" },
      { v: 2, l: "Tarih biliyor ama 2+ gün yanılıyor" },
      { v: 3, l: "Yer veya kişi yönelimi bozuk" },
      { v: 4, l: "Kişi, yer ve zamanda tamamen dezoryante" },
    ],
  },
] as const;

type ItemId = typeof ITEMS[number]["id"];

export default function CiwaArPage() {
  const [answers, setAnswers] = React.useState<Record<ItemId, number>>({} as Record<ItemId, number>);
  const setAns = (id: ItemId, v: number) => setAnswers(prev => ({ ...prev, [id]: v }));

  const answered = Object.keys(answers).length;
  const total    = answered === ITEMS.length
    ? ITEMS.reduce((sum, item) => sum + (answers[item.id] ?? 0), 0)
    : null;

  const getResult = (s: number) => {
    if (s < 8)  return { label: "HAFİF YOKSUNLUK", sub: "CIWA-Ar < 8 — İlaç tedavisi genellikle gerekmez; yakın izlem yeterli", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (s < 15) return { label: "ORTA YOKSUNLUK", sub: "CIWA-Ar 8–14 — Farmakolojik tedavi endikasyonu var", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    return { label: "AĞIR YOKSUNLUK", sub: "CIWA-Ar ≥ 15 — Acil farmakolojik müdahale; nöbet ve deliryum riski", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const result = total !== null ? getResult(total) : null;

  const scoreColor = (v: number, max: number) => {
    const r = v / max;
    if (r === 0) return "";
    if (r <= 0.3) return "bg-sky-600 text-white border-sky-600";
    if (r <= 0.6) return "bg-amber-500 text-white border-amber-500";
    return "bg-rose-600 text-white border-rose-600";
  };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="ciwa-ar" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🍺</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">CIWA-Ar</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Alkol Yoksunluğu Klinik Değerlendirme Skalası (Revize)</p>
          </div>
        </div>

        {/* İlerleme */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-900 rounded-full transition-all" style={{ width: `${(answered / ITEMS.length) * 100}%` }} />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{answered}/{ITEMS.length}</span>
          </div>
          {total !== null && (
            <span className="text-3xl font-black text-blue-900">{total} <span className="text-sm text-slate-400">/ 67</span></span>
          )}
        </div>

        {/* Sorular */}
        {ITEMS.map(item => {
          const max = item.max4 ? 4 : 7;
          const cur = answers[item.id as ItemId];
          return (
            <div key={item.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
              <div className="flex items-start justify-between mb-1">
                <p className="text-sm font-black text-blue-900">{item.label}</p>
                {cur !== undefined && (
                  <span className={`text-[10px] font-black rounded-lg px-2 py-1 border ${scoreColor(cur, max)}`}>
                    {cur}/{max}
                  </span>
                )}
              </div>
              <p className="text-[10px] font-bold text-slate-400 italic mb-4">{item.question}</p>
              <div className="space-y-2">
                {item.opts.map(opt => {
                  const sel = cur === opt.v;
                  return (
                    <button key={opt.v} type="button" onClick={() => setAns(item.id as ItemId, opt.v)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center gap-3
                        ${sel
                          ? opt.v === 0 ? 'bg-emerald-600 border-emerald-600'
                            : opt.v <= 2 ? 'bg-sky-600 border-sky-600'
                            : opt.v <= 4 ? 'bg-amber-500 border-amber-500'
                            : 'bg-rose-600 border-rose-600'
                          : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
                      <span className={`text-[10px] font-black shrink-0 w-6 text-center ${sel ? 'text-white/80' : 'text-slate-400'}`}>{opt.v}</span>
                      <span className={`text-sm font-bold leading-snug ${sel ? 'text-white' : 'text-blue-950'}`}>{opt.l}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Sonuç */}
        {result && total !== null && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${result.border} ${result.bg}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">CIWA-Ar = {total} / 67</div>
            <p className={`text-2xl font-black italic tracking-tight ${result.color}`}>{result.label}</p>
            <p className={`text-sm font-bold mt-1 ${result.color} opacity-80`}>{result.sub}</p>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { l: "Hafif", r: "< 8", c: "bg-emerald-100 text-emerald-700" },
                { l: "Orta", r: "8–14", c: "bg-amber-100 text-amber-700" },
                { l: "Ağır", r: "≥ 15", c: "bg-rose-100 text-rose-700" },
              ].map(x => (
                <div key={x.l} className={`rounded-xl p-3 text-center text-[9px] font-black uppercase tracking-widest ${x.c}`}>
                  <div>{x.l}</div>
                  <div className="font-bold normal-case tracking-normal mt-0.5">{x.r}</div>
                </div>
              ))}
            </div>

            {total >= 8 && (
              <div className="mt-4 pt-4 border-t border-current/10 space-y-2">
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-900/40">PROTOKOL NOTLARI</p>
                {total >= 15 && (
                  <p className={`text-[11px] font-bold ${result.color} opacity-80`}>• Diyazepam veya lorazepam ile yükleme dozunu değerlendirin. IV erişim, vital takibi, nöbet önlemi.</p>
                )}
                {total >= 8 && total < 15 && (
                  <p className={`text-[11px] font-bold ${result.color} opacity-80`}>• Semptom tetikli (PRN) benzodiyazepin protokolü başlatın. 1–2 saatte bir CIWA-Ar tekrarlayın.</p>
                )}
                <p className={`text-[11px] font-bold ${result.color} opacity-80`}>• Thiamin 100 mg IV/IM, elektrolit replasmanı (Mg, K, PO4), hidratasyon.</p>
              </div>
            )}
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={answers} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              CIWA-Ar klinik gözleme dayalıdır; hasta bildiriminden ziyade doğrudan değerlendirme esastır. Ağır yoksunlukta (≥15) ve komorbidite varlığında yoğun bakım/monitörizasyon gerekebilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
