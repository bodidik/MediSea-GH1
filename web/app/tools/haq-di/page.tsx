"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const CATEGORIES = [
  { id: "dress", label: "Giyinme & Bakım", items: ["Kendinizi giyinmek (düğme, fermuar dahil)", "Saçınızı yıkamak"] },
  { id: "rising", label: "Ayağa Kalkma", items: ["Kolsuz düz bir sandalyeden kalkmak", "Yataktan kalkmak"] },
  { id: "eating", label: "Yemek Yeme", items: ["Et kesmek", "Ağzınıza içecek doldurmak"] },
  { id: "walking", label: "Yürüyüş", items: ["Düz zeminde yürümek", "Merdiven çıkmak"] },
  { id: "hygiene", label: "Hijyen", items: ["Tüm vücudunuzu yıkamak", "Küvete girmek", "Tuvalette oturup kalkmak"] },
  { id: "reach", label: "Uzanma", items: ["Başınızın üstündeki bir rafa uzanmak", "Yerden bir nesne almak için eğilmek"] },
  { id: "grip", label: "Kavrama", items: ["Kapı kollarını açmak", "Kavanoz kapağını açmak", "Muslukları açıp kapamak"] },
  { id: "errands", label: "Günlük Aktiviteler", items: ["İş, alışveriş gibi yerleri ziyaret etmek", "Arabaya binip inmek", "Ev temizliği (süpürme, elektrikli süpürge)"] },
];

const SCORE_OPTS = [
  { v: 0, label: "Güçlük yok" },
  { v: 1, label: "Biraz güçlük" },
  { v: 2, label: "Çok güçlük" },
  { v: 3, label: "Yapamıyor" },
];

export default function HaqDiPage() {
  const [scores, setScores] = React.useState<Record<string, number>>({});

  const setScore = (key: string, val: number) => setScores(prev => ({ ...prev, [key]: val }));

  const catScores = CATEGORIES.map(cat => {
    const vals = cat.items.map((_, i) => scores[`${cat.id}_${i}`] ?? -1).filter(v => v >= 0);
    return vals.length > 0 ? Math.max(...vals) : -1;
  });

  const answered = catScores.filter(s => s >= 0);
  const total = answered.length === 8 ? answered.reduce((a, b) => a + b, 0) / 8 : null;

  const getResult = (score: number) => {
    if (score < 0.5)  return { label: "MİNİMAL ENGELLİLİK", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (score < 1.5)  return { label: "ORTA DERECE ENGELLİLİK", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    if (score < 2.5)  return { label: "AĞIR ENGELLİLİK", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" };
    return { label: "ÇOK AĞIR ENGELLİLİK", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const result = total !== null ? getResult(total) : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="haq-di" />
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦴</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">HAQ-DI</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Sağlık Değerlendirme Anketi — Engellilik İndeksi</p>
          </div>
        </div>

        <div className="space-y-4">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
              <p className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest mb-4">{cat.label}</p>
              <div className="space-y-4">
                {cat.items.map((item, i) => {
                  const key = `${cat.id}_${i}`;
                  const val = scores[key] ?? -1;
                  return (
                    <div key={key}>
                      <p className="text-sm font-bold text-blue-900 mb-2">{item}</p>
                      <div className="flex gap-2 flex-wrap">
                        {SCORE_OPTS.map(opt => (
                          <button key={opt.v} type="button" onClick={() => setScore(key, opt.v)}
                            className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                              ${val === opt.v
                                ? opt.v === 0 ? 'bg-emerald-600 border-emerald-600 text-white' :
                                  opt.v === 1 ? 'bg-amber-500 border-amber-500 text-white' :
                                  opt.v === 2 ? 'bg-orange-500 border-orange-500 text-white' :
                                  'bg-rose-600 border-rose-600 text-white'
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-900/30'}`}>
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Yanıtlanan kategori: {answered.length}/8
          </span>
          {total !== null && (
            <span className="text-3xl font-black text-blue-900">{total.toFixed(2)}</span>
          )}
        </div>

        {result && total !== null && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${result.border} ${result.bg}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">ENGELLİLİK DÜZEYİ (HAQ-DI: {total.toFixed(2)})</div>
            <p className={`text-2xl font-black italic tracking-tight ${result.color}`}>{result.label}</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {[
                { l: "Minimal", r: "0–0.5", c: "bg-emerald-100 text-emerald-700" },
                { l: "Orta", r: "0.5–1.5", c: "bg-amber-100 text-amber-700" },
                { l: "Ağır", r: "1.5–2.5", c: "bg-orange-100 text-orange-700" },
                { l: "Çok ağır", r: "2.5–3", c: "bg-rose-100 text-rose-700" },
              ].map(x => (
                <div key={x.l} className={`rounded-xl p-2 text-center text-[9px] font-black uppercase tracking-widest ${x.c}`}>
                  <div>{x.l}</div>
                  <div className="font-bold normal-case tracking-normal mt-0.5">{x.r}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Her kategoriden en yüksek soru skoru alınır; 8 kategorinin ortalaması HAQ-DI'yı verir (0–3). Yardımcı cihaz veya başka bir kişinin yardımı kullanılıyorsa ilgili soru skoru en az 2 olarak değerlendirilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
