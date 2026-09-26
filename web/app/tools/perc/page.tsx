"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { sozluk } from "@/lib/dil";
import { useDil } from "@/app/components/DilBaglami";
import metin from "./metin.dil.json";

const M = sozluk(metin);

/** * PERC Gündüz Modu (Sakin Deniz) Versiyonu
 * Konsept: Beyaz Zemin / Lacivert Vurgu / Güneş Sarısı Detay
 */

type State = {
  age50: boolean;
  hr100: boolean;
  sao2_95: boolean;
  hemoptysis: boolean;
  estrogen: boolean;
  priorVTE: boolean;
  unilateralLeg: boolean;
  recentSurgeryTrauma: boolean;
};

function readBool(x: string | null | undefined) {
  const v = (x ?? "").toLowerCase();
  return v === "1" || v === "true";
}

export default function PERCPage() {
  const t = M(useDil());
  const [st, setSt] = React.useState<State>(() => {
    const s = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    return {
      age50: readBool(s?.get("age50")),
      hr100: readBool(s?.get("hr100")),
      sao2_95: readBool(s?.get("sao2")),
      hemoptysis: readBool(s?.get("hemo")),
      estrogen: readBool(s?.get("est")),
      priorVTE: readBool(s?.get("vte")),
      unilateralLeg: readBool(s?.get("leg")),
      recentSurgeryTrauma: readBool(s?.get("sx")),
    };
  });

  const toggle = (k: keyof State) => setSt((v) => ({ ...v, [k]: !v[k] }));

  const allNegative =
    !st.age50 && !st.hr100 && !st.sao2_95 && !st.hemoptysis &&
    !st.estrogen && !st.priorVTE && !st.unilateralLeg && !st.recentSurgeryTrauma;
  const karar = allNegative ? t.kararNegatif : t.kararPozitif;

  const params = {
    age50: st.age50 ? 1 : "", hr100: st.hr100 ? 1 : "", sao2: st.sao2_95 ? 1 : "",
    hemo: st.hemoptysis ? 1 : "", est: st.estrogen ? 1 : "", vte: st.priorVTE ? 1 : "",
    leg: st.unilateralLeg ? 1 : "", sx: st.recentSurgeryTrauma ? 1 : "",
  };

  const ITEMS: { key: keyof State; label: string; sub: string }[] = [
    { key: "age50", label: t.age50, sub: t.age50_sub },
    { key: "hr100", label: t.hr100, sub: t.hr100_sub },
    { key: "sao2_95", label: t.sao2_95, sub: t.sao2_95_sub },
    { key: "unilateralLeg", label: t.unilateralLeg, sub: t.unilateralLeg_sub },
    { key: "hemoptysis", label: t.hemoptysis, sub: t.hemoptysis_sub },
    { key: "recentSurgeryTrauma", label: t.recentSurgeryTrauma, sub: t.recentSurgeryTrauma_sub },
    { key: "priorVTE", label: t.priorVTE, sub: t.priorVTE_sub },
    { key: "estrogen", label: t.estrogen, sub: t.estrogen_sub },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <ToolTopNav toolSlug="perc" />

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span className="drop-shadow-sm">🔍</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">{t.baslik}</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{t.altBaslik}</p>
          </div>
        </div>

        {/* KRİTERLER */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ITEMS.map((it) => (
              <label 
                key={it.key} 
                className={`focus-within:ring-2 focus-within:ring-blue-700 focus-within:ring-offset-2 flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group
                  ${st[it.key] ? 'bg-rose-50 border-rose-200 text-rose-900 shadow-sm' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}
                `}
              >
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all
                  ${st[it.key] ? 'bg-rose-700 border-rose-700 text-white shadow-[0_0_8px_rgba(225,29,72,0.4)]' : 'bg-white border-slate-200 text-transparent'}
                `}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <div>
                  <span className={`text-sm font-bold block transition-colors ${st[it.key] ? 'text-rose-900' : 'text-blue-900/80 group-hover:text-blue-900'}`}>
                    {it.label}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${st[it.key] ? 'text-rose-700' : 'text-slate-500'}`}>
                    {it.sub}
                  </span>
                </div>
                <input type="checkbox" className="sr-only" checked={st[it.key]} onChange={() => toggle(it.key)} />
              </label>
            ))}
          </div>
        </div>

        {/* SONUÇ PANELİ */}
        <SonucDuyuru metin={karar} />

        <div className={`rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 transition-all duration-500 relative overflow-hidden text-center
          ${allNegative ? 'bg-blue-900 border-amber-400' : 'bg-white border-rose-500 border-2'}
        `}>
           <div aria-hidden="true" className="absolute top-0 right-0 p-6 opacity-10 text-white text-8xl font-black italic">
             {allNegative ? 'OK' : '!'}
           </div>
           
           <span className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 ${allNegative ? 'text-blue-200' : 'text-rose-700'}`}>
             {t.protokolSonucu}
           </span>

           {allNegative ? (
             <>
               <div className="text-3xl font-black text-white italic tracking-tighter uppercase">{karar}</div>
               <p className="mt-3 text-xs font-bold text-amber-400 uppercase tracking-widest max-w-sm">
                 {t.negatifNot}
               </p>
             </>
           ) : (
             <>
               <div className="text-3xl font-black text-rose-700 italic tracking-tighter uppercase">{karar}</div>
               <p className="mt-3 text-xs font-bold text-slate-500 uppercase tracking-widest max-w-sm">
                 {t.pozitifNot}
               </p>
             </>
           )}
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {t.uyari}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}