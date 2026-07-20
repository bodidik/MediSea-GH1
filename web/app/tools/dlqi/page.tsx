"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS = [
  { id: "q1",  q: "Geçen hafta cildiniz ne kadar kaşındı, sertleşti, acıdı veya yaktı?" },
  { id: "q2",  q: "Geçen hafta cilt durumunuzdan dolayı ne kadar utanç veya mahcubiyet duydunuz?" },
  { id: "q3",  q: "Geçen hafta cilt probleminiz alışveriş yapmaya veya evinizi/bahçenizi düzenlemeye engel oldu mu?" },
  { id: "q4",  q: "Geçen hafta cilt probleminiz giydiğiniz kıyafetleri ne ölçüde etkiledi?" },
  { id: "q5",  q: "Geçen hafta cilt probleminiz sosyal veya eğlence faaliyetlerinizi ne ölçüde etkiledi?" },
  { id: "q6",  q: "Geçen hafta cilt probleminiz herhangi bir spor yapmayı ne ölçüde engelledi?" },
  { id: "q7",  q: "Geçen hafta cilt probleminiz çalışmanızı veya öğrenmenizi engelledi mi?" },
  { id: "q8",  q: "Geçen hafta cilt probleminiz partneriniz, yakın dostlarınız veya ailenizle ilişkinizi etkiledi mi?" },
  { id: "q9",  q: "Geçen hafta cilt probleminiz cinsel hayatınızda ne ölçüde güçlük yarattı?" },
  { id: "q10", q: "Geçen hafta cilt tedaviniz ne kadar sorun yarattı? (zaman aldı veya kirli oldu)" },
];

const OPTIONS = [
  { pts: 3, label: "Çok fazla" },
  { pts: 2, label: "Oldukça fazla" },
  { pts: 1, label: "Biraz" },
  { pts: 0, label: "Hiç" },
];

const getBand = (v: number) =>
  v <= 1  ? { label: "ETKİ YOK",          color: "emerald", sub: "Cilt problemi yaşam kalitesini etkilemiyor" } :
  v <= 5  ? { label: "KÜÇÜK ETKİ",        color: "sky",     sub: "Minimal etki" } :
  v <= 10 ? { label: "ORTA ETKİ",         color: "amber",   sub: "Anlamlı etki — tedavi gözden geçirilmeli" } :
  v <= 20 ? { label: "BÜYÜK ETKİ",        color: "orange",  sub: "Ciddi etki — kapsamlı yönetim gerekli" } :
             { label: "ÇOK BÜYÜK ETKİ",   color: "rose",    sub: "Hayat kalitesi çok ciddi ölçüde bozulmuş" };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  sky:     { bg: "bg-sky-50",     border: "border-sky-200",     text: "text-sky-700",     badge: "bg-sky-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  badge: "bg-orange-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function DLQIPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(ITEMS.map(i => [i.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === ITEMS.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0)
    : null;

  const band = total !== null ? getBand(total) : null;
  const c = band ? COLOR[band.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="dlqi" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🌿</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">DLQI</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Dermatoloji Yaşam Kalitesi İndeksi · 10 Soru · 0–30 Puan</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/10 soru</span>
          <div className="flex flex-wrap gap-0.5">
            {ITEMS.map(i => (
              <div key={i.id} className={`w-4 h-2 rounded-sm transition-all ${sel[i.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-5 shadow-sm space-y-4">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Son 1 haftanıza göre yanıtlayın</p>
          {ITEMS.map((item, idx) => (
            <div key={item.id} className="border border-slate-100 rounded-2xl p-3 bg-slate-50">
              <p className="text-[11px] font-bold text-blue-950 mb-2 leading-snug">
                <span className="font-black text-slate-400 mr-1.5">{idx + 1}.</span>{item.q}
              </p>
              <div className="flex gap-1.5">
                {OPTIONS.map(opt => (
                  <button key={opt.pts} type="button"
                    onClick={() => setSel(s => ({ ...s, [item.id]: s[item.id] === opt.pts ? null : opt.pts }))}
                    className={`flex-1 py-2 rounded-xl border-2 text-[9px] font-black uppercase tracking-widest transition-all
                      ${sel[item.id] === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-white text-slate-500 hover:border-blue-200"}`}>
                    {opt.label}
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
                <span className="text-[8px] font-black text-blue-300 uppercase">DLQI</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 30</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
              </div>
            </div>
            <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(total / 30) * 100}%`, background: band.color === "emerald" ? "#10b981" : band.color === "sky" ? "#0ea5e9" : band.color === "amber" ? "#f59e0b" : band.color === "orange" ? "#f97316" : "#f43f5e" }} />
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 10 soruyu yanıtlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              DLQI psoriazis, atopik dermatit, ürtiker ve alopesi başta olmak üzere pek çok dermatolojik hastalıkta biyolojik tedavi endikasyonunu belirlemede kullanılır (örn. DLQI > 10). Finlay & Khan, Clin Exp Dermatol 1994.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
