"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

type Item = { id: string; label: string; options: { label: string; pts: number }[] };

const ITEMS: Item[] = [
  { id: "feeding",    label: "Beslenme",                options: [{ label: "Bağımlı", pts: 0 }, { label: "Yardım gerekli", pts: 5 }, { label: "Bağımsız", pts: 10 }] },
  { id: "transfer",   label: "Yatak–Sandalye Transferi", options: [{ label: "Bağımlı (kaldırma gerekli)", pts: 0 }, { label: "Büyük yardım", pts: 5 }, { label: "Az yardım / gözetim", pts: 10 }, { label: "Bağımsız", pts: 15 }] },
  { id: "grooming",   label: "Kişisel Bakım (yüz/saç/diş/tıraş)", options: [{ label: "Bağımlı", pts: 0 }, { label: "Bağımsız", pts: 5 }] },
  { id: "toilet",     label: "Tuvalet Kullanımı",       options: [{ label: "Bağımlı", pts: 0 }, { label: "Kısmen bağımsız", pts: 5 }, { label: "Bağımsız", pts: 10 }] },
  { id: "bathing",    label: "Banyo / Duş",             options: [{ label: "Bağımlı", pts: 0 }, { label: "Bağımsız", pts: 5 }] },
  { id: "mobility",   label: "Yürüme (düz zemin ≥ 50 m)", options: [{ label: "Yürüyemiyor", pts: 0 }, { label: "Tekerlekli sandalye bağımsız", pts: 5 }, { label: "Yardım / gözetim ile yürür", pts: 10 }, { label: "Bağımsız yürür", pts: 15 }] },
  { id: "stairs",     label: "Merdiven Çıkma",          options: [{ label: "Bağımlı", pts: 0 }, { label: "Yardım / gözetim", pts: 5 }, { label: "Bağımsız", pts: 10 }] },
  { id: "dressing",   label: "Giyinme",                 options: [{ label: "Bağımlı", pts: 0 }, { label: "Kısmen bağımsız (yarısını yapar)", pts: 5 }, { label: "Bağımsız", pts: 10 }] },
  { id: "bowel",      label: "Bağırsak Kontrolü",       options: [{ label: "İnkontinan / yardım gerekli", pts: 0 }, { label: "Ara sıra kaza", pts: 5 }, { label: "Kontinan (kontrollü)", pts: 10 }] },
  { id: "bladder",    label: "Mesane Kontrolü",          options: [{ label: "İnkontinan / kateterle bakılıyor", pts: 0 }, { label: "Ara sıra kaza", pts: 5 }, { label: "Kontinan", pts: 10 }] },
];

const BANDS = [
  { min: 0,  max: 20,  label: "Tam Bağımlı",     color: "rose" },
  { min: 21, max: 60,  label: "Ağır Bağımlı",    color: "rose" },
  { min: 61, max: 90,  label: "Orta Bağımlı",    color: "amber" },
  { min: 91, max: 99,  label: "Hafif Bağımlı",   color: "amber" },
  { min: 100, max: 100, label: "Tam Bağımsız",   color: "emerald" },
];

const COLOR = {
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
};

export default function BarthelPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(ITEMS.map(i => [i.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === ITEMS.length
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0)
    : null;

  const band = total !== null ? BANDS.slice().reverse().find(b => total >= b.min && total <= b.max) : null;
  const c = band ? COLOR[band.color as keyof typeof COLOR] : null;
  const pct = total !== null ? total : 0;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="barthel" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🧓</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Barthel ADL İndeksi</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Günlük Yaşam Aktiviteleri · Fonksiyonel Bağımsızlık (0–100)</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/{ITEMS.length} madde tamamlandı</span>
          <div className="flex gap-1">
            {ITEMS.map(i => (
              <div key={i.id} className={`w-5 h-2 rounded-full transition-all ${sel[i.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {ITEMS.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">{item.label}</p>
              <div className="flex flex-wrap gap-2">
                {item.options.map(opt => {
                  const active = sel[item.id] === opt.pts;
                  return (
                    <button key={opt.pts} type="button"
                      onClick={() => setSel(s => ({ ...s, [item.id]: s[item.id] === opt.pts ? null : opt.pts }))}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-[10px] font-black transition-all
                        ${active ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                      <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0
                        ${active ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {total !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[8px] font-black text-blue-300 uppercase">SKOR</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-xl font-black italic mt-1 ${c.text}`}>{band.min}–{band.max === 100 ? "100" : band.max} puan aralığı</p>
              </div>
            </div>
            <div className="w-full bg-white/60 rounded-full h-3 overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: band.color === "emerald" ? "#10b981" : band.color === "amber" ? "#f59e0b" : "#f43f5e" }} />
            </div>
            <div className="grid grid-cols-5 gap-1 text-center text-[8px]">
              {BANDS.map(b => (
                <div key={b.label} className={`rounded-lg p-1 font-black ${b.label === band.label ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.min === b.max ? b.min : `${b.min}–${b.max}`}</div>
                  <div className="font-bold normal-case">{b.label}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 10 maddeyi tamamlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={sel as Record<string, number>} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Barthel İndeksi fonksiyonel bağımsızlığı değerlendirir; bilişsel durumu veya sosyal katılımı yansıtmaz. Yüksek puan tedavi kalitesini değil hastanın kapasitesini gösterir. Mahoney & Barthel, 1965.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
