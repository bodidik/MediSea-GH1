"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";

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

  const params = {
    age50: st.age50 ? 1 : "", hr100: st.hr100 ? 1 : "", sao2: st.sao2_95 ? 1 : "",
    hemo: st.hemoptysis ? 1 : "", est: st.estrogen ? 1 : "", vte: st.priorVTE ? 1 : "",
    leg: st.unilateralLeg ? 1 : "", sx: st.recentSurgeryTrauma ? 1 : "",
  };

  const ITEMS: { key: keyof State; label: string; sub: string }[] = [
    { key: "age50", label: "Yaş ≥ 50", sub: "Geriatrik yaş sınırı" },
    { key: "hr100", label: "Kalp Hızı ≥ 100/dk", sub: "Taşikardi varlığı" },
    { key: "sao2_95", label: "SpO₂ < %95", sub: "Oda havasında hipoksi" },
    { key: "unilateralLeg", label: "Tek Taraflı Bacak Şişliği", sub: "DVT klinik şüphesi" },
    { key: "hemoptysis", label: "Hemoptizi", sub: "Öksürükle kan gelmesi" },
    { key: "recentSurgeryTrauma", label: "Yakın Cerrahi / Travma", sub: "Son 4 hafta içinde" },
    { key: "priorVTE", label: "Önceki DVT / PE Öyküsü", sub: "Vasküler tromboembolizm geçmişi" },
    { key: "estrogen", label: "Östrojen Kullanımı", sub: "Oral kontraseptif veya HRT" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span className="drop-shadow-sm">🔍</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">PERC PROTOKOLÜ</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Pulmoner Emboli Dışlama Kriterleri</p>
          </div>
        </div>

        {/* KRİTERLER */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ITEMS.map((it) => (
              <label 
                key={it.key} 
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group
                  ${st[it.key] ? 'bg-rose-50 border-rose-200 text-rose-900 shadow-sm' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}
                `}
              >
                <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all
                  ${st[it.key] ? 'bg-rose-600 border-rose-600 text-white shadow-[0_0_8px_rgba(225,29,72,0.4)]' : 'bg-white border-slate-200 text-transparent'}
                `}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
                <div>
                  <span className={`text-sm font-bold block transition-colors ${st[it.key] ? 'text-rose-900' : 'text-blue-900/70 group-hover:text-blue-900'}`}>
                    {it.label}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-widest ${st[it.key] ? 'text-rose-400' : 'text-slate-400'}`}>
                    {it.sub}
                  </span>
                </div>
                <input type="checkbox" className="hidden" checked={st[it.key]} onChange={() => toggle(it.key)} />
              </label>
            ))}
          </div>
        </div>

        {/* SONUÇ PANELİ */}
        <div className={`rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 transition-all duration-500 relative overflow-hidden text-center
          ${allNegative ? 'bg-blue-900 border-amber-400' : 'bg-white border-rose-500 border-2'}
        `}>
           <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-8xl font-black italic">
             {allNegative ? 'OK' : '!'}
           </div>
           
           <span className={`text-[10px] font-black uppercase tracking-[0.4em] mb-2 ${allNegative ? 'text-blue-200' : 'text-rose-500'}`}>
             PROTOKOL SONUCU
           </span>

           {allNegative ? (
             <>
               <div className="text-3xl font-black text-white italic tracking-tighter uppercase">PE DIŞLANABİLİR</div>
               <p className="mt-3 text-xs font-bold text-amber-400 uppercase tracking-widest max-w-sm">
                 Düşük klinik şüphe + PERC Negatif → Görüntüleme önerilmez.
               </p>
             </>
           ) : (
             <>
               <div className="text-3xl font-black text-rose-700 italic tracking-tighter uppercase">PERC POZİTİF</div>
               <p className="mt-3 text-xs font-bold text-slate-500 uppercase tracking-widest max-w-sm">
                 Kriterlerden en az biri pozitif. D-dimer veya BT Anjiyo değerlendirilmeli.
               </p>
             </>
           )}
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              PERC kuralı yalnızca Pulmoner Emboli olasılığı klinisyen tarafından "Düşük" (< %15) olarak değerlendirilen hastalarda geçerlidir. Yüksek riskli hastalarda kriterlere bakılmaksızın tetkik planlanmalıdır.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}