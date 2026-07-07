"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

/** * ECOG Performans Durumu Gündüz Modu (Sakin Deniz)
 * Kaynak: Eastern Cooperative Oncology Group Performance Status Scale
 */

type Grade = { value: number; label: string; desc: string };

const GRADES: Grade[] = [
  { value: 0, label: "0 — Tam Aktif", desc: "Hastalık öncesi tüm aktiviteleri kısıtlama olmaksızın sürdürebiliyor" },
  { value: 1, label: "1 — Hafif Kısıtlı", desc: "Fiziksel olarak zorlu aktivitede kısıtlı, ama hafif/oturarak iş yapabiliyor (örn. hafif ev işi, ofis işi)" },
  { value: 2, label: "2 — Ayakta, Çalışamıyor", desc: "Kendine bakabiliyor, ama hiçbir iş aktivitesi yapamıyor; uyanık saatlerin %50'sinden fazlasında ayakta" },
  { value: 3, label: "3 — Kısıtlı Öz Bakım", desc: "Sadece kısıtlı öz bakım yapabiliyor; uyanık saatlerin %50'sinden fazlası yatak/koltukta" },
  { value: 4, label: "4 — Tamamen Bağımlı", desc: "Hiç öz bakım yapamıyor, tamamen yatağa/koltuğa bağımlı" },
  { value: 5, label: "5 — Eksitus", desc: "Kayıt tamlığı için kullanılır" },
];

export default function EcogPage() {
  const s = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const initial = s?.get("ecog") ? parseInt(s.get("ecog")!, 10) : null;

  const [selected, setSelected] = React.useState<number | null>(
    initial !== null && !isNaN(initial) && initial >= 0 && initial <= 5 ? initial : null
  );

  const current = GRADES.find((g) => g.value === selected) || null;

  const interpretation =
    selected === null
      ? null
      : selected <= 1
      ? { label: "Tedaviye Uygun (Genellikle Tüm Rejimler)", color: "text-emerald-700", bg: "bg-emerald-50" }
      : selected === 2
      ? { label: "Seçilmiş Rejimlerle Değerlendirilmeli", color: "text-amber-700", bg: "bg-amber-50" }
      : { label: "Çoğu Klinik Çalışma/Yoğun Rejim Dışı", color: "text-rose-700", bg: "bg-rose-50" };

  const shareParams = { ecog: selected ?? "" };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <ToolTopNav toolSlug="ecog" />

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            🎗️
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">ECOG Performans Durumu</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Onkolojik Fonksiyonel Kapasite Değerlendirmesi</p>
          </div>
        </div>

        {/* DERECELER: TEK SEÇİM */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid gap-2">
            {GRADES.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setSelected(g.value)}
                className={`text-left flex items-center justify-between gap-4 p-4 rounded-2xl border transition-all
                  ${selected === g.value
                    ? 'bg-blue-900 border-blue-900 text-white shadow-md'
                    : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}
                `}
              >
                <div>
                  <span className={`text-sm font-black block transition-colors ${selected === g.value ? 'text-white' : 'text-blue-950'}`}>
                    {g.label}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${selected === g.value ? 'text-blue-200/70' : 'text-slate-400'}`}>
                    {g.desc}
                  </span>
                </div>
                <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-all
                  ${selected === g.value ? 'bg-amber-400 border-amber-400 text-blue-900' : 'bg-white border-slate-200 text-transparent'}
                `}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SONUÇ PANELİ */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-7xl font-black italic">ECOG</div>
           <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">PERFORMANS DURUMU</span>
           <div className="text-7xl font-black text-white">{selected ?? "–"}</div>
           {current && (
             <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mt-3 max-w-sm">{current.desc}</span>
           )}
        </div>

        {/* YORUMLAMA PANELİ */}
        {interpretation && (
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
             <div className={`text-center p-4 rounded-xl font-black italic uppercase tracking-tight ${interpretation.bg} ${interpretation.color}`}>
               {interpretation.label}
             </div>
          </div>
        )}

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-slate-900/5 p-6 rounded-[2rem] border border-slate-200 space-y-4">
          <ToolShare params={shareParams} />
          <p className="text-[9px] text-blue-900/60 font-bold uppercase tracking-[0.15em] text-center leading-relaxed italic">
            ⚠️ ECOG performans durumu, kemoterapi/klinik çalışma uygunluğu ve prognoz değerlendirmesinde kullanılan standart bir fonksiyonel kapasite ölçeğidir (Kaynak: Eastern Cooperative Oncology Group). Tedavi kararı tek başına bu skora dayandırılmamalıdır.
          </p>
        </div>

      </div>
    </div>
  );
}
