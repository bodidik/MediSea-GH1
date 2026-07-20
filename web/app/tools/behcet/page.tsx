"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

// ISG (International Study Group) 1990 Kriterleri: rekürran oral ülser + 2 minor kriter
// ICBD 2014 puanlama sistemi: ≥ 4 puan = Behçet hastalığı

const ICBD_ITEMS = [
  { id: "oral",    label: "Tekrarlayan Oral Ülser",      pts: 2, detail: "Yılda ≥ 3 kez, minör/majör aftöz veya herpetiform ülser" },
  { id: "genital", label: "Genital Ülserasyon",          pts: 2, detail: "Skrotum, labia veya servikste tipik derin ülserler; skar bırakabilir" },
  { id: "ocular",  label: "Göz Tutulumu",               pts: 2, detail: "Üveitis, retinal vaskülit (oftalmolog onaylı)" },
  { id: "skin",    label: "Deri Lezyonları",             pts: 1, detail: "Erythema nodosum, psödofollikülit, papülopüstüler lezyon veya akneiform nodüller" },
  { id: "neuro",   label: "Nörolojik Tutulum",           pts: 1, detail: "Santral sinir sistemi parenkimal tutulumu; bağ doku hastalığı ile açıklanamayan" },
  { id: "vascu",   label: "Vasküler Tutulum",            pts: 1, detail: "Arteriyel veya venöz tromboz, anevrizma" },
  { id: "patho",   label: "Paterji Testi Pozitifliği",  pts: 1, detail: "48 saat sonra papül veya püstül oluşumu" },
];

export default function BehcetPage() {
  const [sel, setSel] = React.useState<Record<string, boolean | null>>(
    Object.fromEntries(ICBD_ITEMS.map(i => [i.id, null]))
  );

  const answered = Object.values(sel).filter(v => v !== null).length;
  const total = answered === ICBD_ITEMS.length
    ? ICBD_ITEMS.reduce((s, i) => s + (sel[i.id] === true ? i.pts : 0), 0)
    : null;

  const isBehcet = total !== null && total >= 4;
  const isPossible = total !== null && total === 3;

  const c = isBehcet
    ? { bg: "bg-rose-50", border: "border-rose-300", text: "text-rose-700", badge: "bg-rose-700 text-white" }
    : isPossible
    ? { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", badge: "bg-amber-600 text-white" }
    : { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="behcet" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">👁️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Behçet Hastalığı</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">ICBD 2014 Tanı Kriterleri · ≥ 4 Puan = Behçet</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
          <p className="text-[10px] font-bold text-blue-800">📌 ICBD 2014 sistemi ISG 1990'a göre daha yüksek duyarlılık (%97) ile Behçet hastalığını tanımlar. Oral ülser tek başına 2 puan verir.</p>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/7 kriter</span>
          <div className="flex gap-1">
            {ICBD_ITEMS.map(i => (
              <div key={i.id} className={`w-5 h-2 rounded-full transition-all ${sel[i.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {ICBD_ITEMS.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-0.5">
                <p className="font-black text-blue-900 uppercase italic text-sm">{item.label}</p>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${item.pts === 2 ? "bg-blue-900 text-white" : "bg-slate-200 text-slate-600"}`}>+{item.pts} puan</span>
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">{item.detail}</p>
              <div className="flex gap-2">
                {([true, false] as const).map(v => (
                  <button key={String(v)} type="button"
                    onClick={() => setSel(s => ({ ...s, [item.id]: s[item.id] === v ? null : v }))}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all
                      ${sel[item.id] === v
                        ? v ? "border-rose-500 bg-rose-500 text-white" : "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200"}`}>
                    {v ? `Evet (+${item.pts})` : "Hayır (0)"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {total !== null ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">ICBD</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ ≥4</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>
                  {isBehcet ? "BEHÇET HASTALIĞI" : isPossible ? "ŞÜPHELI (3 puan)" : "BEHÇET DEĞİL"}
                </span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>
                  {isBehcet ? "ICBD 2014 kriterlerine göre tanı konulabilir" :
                   isPossible ? "Yakın izlem, ek tetkik ve uzman konsültasyonu planlanmalı" :
                   "Mevcut kriterler Behçet hastalığını desteklemiyor"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1 text-center text-[8px]">
              {[
                { l: "< 4 pt", sub: "Behçet Değil" },
                { l: "3 pt",   sub: "Şüpheli" },
                { l: "≥ 4 pt", sub: "Behçet Hastalığı" },
              ].map((b, i) => (
                <div key={b.l} className={`rounded-lg p-1.5 font-black
                  ${(total < 3 && i === 0) || (total === 3 && i === 1) || (total >= 4 && i === 2) ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.l}</div><div className="font-bold text-[7px]">{b.sub}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 7 kriteri değerlendirin</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={Object.fromEntries(ICBD_ITEMS.map(i => [i.id, sel[i.id] === true ? i.pts : 0]))} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Behçet hastalığı klinik tanıdır; patolognomik bulgu yoktur. Göz tutulumu kalıcı görme kaybına yol açabileceğinden acil oftalmoloji konsültasyonu gerektirir. International Team for the Revision of the International Criteria for Behçet's Disease, 2014.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
