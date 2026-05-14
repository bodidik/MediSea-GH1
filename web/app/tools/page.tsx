"use client";

import React, { useState } from "react";
import Link from "next/link";

// --- MEDISEA HESAPLAYICI VERİTABANI (SİSTEMATİK GÜNCELLEME) ---
const TOOLS_DATABASE = [
  { 
    category: "Klinik Nütrisyon (Beslenme)", 
    icon: "🍏",
    items: [
      { slug: "nrs-2002", name: "NRS-2002", desc: "Yatan hastalarda beslenme riski taraması" },
      { slug: "mna", name: "MNA® (Kısa Form)", desc: "Geriatrik popülasyon nütrisyonel değerlendirme" },
      { slug: "glim", name: "GLIM Kriterleri", desc: "Küresel malnütrisyon tanı protokolü" },
      { slug: "nutrition-needs", name: "Enerji & Protein Gereksinimi", desc: "Klinik duruma göre kcal/pro hesaplayıcı" },
    ]
  },
  { 
    category: "Nefroloji", 
    icon: "🧪",
    items: [
      { slug: "egfr-ckdepi", name: "eGFR (CKD-EPI 2021)", desc: "Race-free böbrek fonksiyon analizi" },
      { slug: "corrected-calcium", name: "Düzeltilmiş Kalsiyum", desc: "Albumin'e göre Ca+2 hesaplama" },
      { slug: "fena", name: "Fraksiyonel Sodyum Ekskresyonu (FeNa)", desc: "Prerenal - Renal ABH ayrımı" },
    ]
  },
  { 
    category: "Kardiyoloji", 
    icon: "❤️",
    items: [
      { slug: "chads-vasc", name: "CHA₂DS₂-VASc Skoru", desc: "AF'de inme riski hesaplama" },
      { slug: "has-bled", name: "HAS-BLED Skoru", desc: "Antikoagülasyon kanama riski" },
      { slug: "duke-ie", name: "Duke Kriterleri", desc: "Enfektif Endokardit tanı deşifresi" },
    ]
  },
  { 
    category: "Acil & Kritik Bakım", 
    icon: "🚨",
    items: [
      { slug: "wells-pe", name: "Wells Skoru (PE)", desc: "Pulmoner emboli klinik olasılığı" },
      { slug: "perc", name: "PERC Kriterleri", desc: "PE düşük risk dışlama protokolü" },
      { slug: "qsofa", name: "qSOFA Skoru", desc: "Hızlı sepsis yatak başı değerlendirme" },
      { slug: "infusion", name: "İnfüzyon Hesaplama", desc: "IV doz ve damla sayısı asistanı" },
    ]
  },
  { 
    category: "Hepatoloji & Gastroenteroloji", 
    icon: "🍺",
    items: [
      { slug: "meld-na", name: "MELD-Na Skoru", desc: "ESKH mortalite tahmini" },
      { slug: "child-pugh", name: "Child-Pugh Sınıflaması", desc: "Siroz şiddet ve prognozu" },
    ]
  }
];

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = TOOLS_DATABASE.map(cat => ({
    ...cat,
    items: cat.items.filter(it => 
      it.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      it.desc.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      <div className="max-w-7xl mx-auto py-12 px-6 lg:px-8 space-y-12">
        
        {/* BAŞLIK PANELİ */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-slate-100 pb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-500 text-sm animate-pulse">☀️</span>
              <span className="text-[10px] font-black text-blue-900/50 uppercase tracking-[0.3em]">MediSea Karar Destek</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-black text-blue-950 uppercase italic tracking-tighter leading-none">
              Klinik <span className="text-slate-400 not-italic uppercase">Araçlar</span>
            </h1>
            <p className="text-slate-500 font-bold text-sm mt-3 max-w-xl">
              MediSea ekosistemiyle uyumlu, hızlı referans ve güvenilir klinik skorlama modülleri.
            </p>
          </div>

          <div className="relative w-full md:w-96">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input 
              type="text"
              placeholder="Ara (Örn: GFR, Wells, Beslenme...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border-2 border-slate-200 rounded-3xl pl-14 pr-6 py-5 text-sm focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 outline-none transition-all placeholder:text-slate-300 font-bold shadow-inner"
            />
          </div>
        </div>

        {/* ARAÇ KARTLARI GRİD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
          {filteredData.map((cat, idx) => (
            <div key={idx} className="space-y-5">
              <div className="flex items-center gap-3 pl-2">
                <div className="w-9 h-9 rounded-2xl bg-blue-900/5 flex items-center justify-center border border-blue-900/10 shadow-sm text-xl">
                   {cat.icon}
                </div>
                <h2 className="text-xs font-black text-blue-900 uppercase tracking-[0.25em]">{cat.category}</h2>
              </div>

              <div className="grid gap-4">
                {cat.items.map((tool) => (
                  <Link
                    key={tool.slug}
                    href={`/tools/${tool.slug}`}
                    className="group flex items-center justify-between p-7 rounded-[2.5rem] bg-slate-50 border border-slate-100 hover:border-amber-400 hover:bg-white hover:shadow-2xl hover:shadow-amber-900/5 transition-all duration-300"
                  >
                    <div className="space-y-1.5 flex-grow pr-6">
                      <div className="text-base font-black text-blue-950 uppercase italic group-hover:text-blue-700 transition-colors leading-tight">
                        {tool.name}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tight leading-none group-hover:text-slate-600">
                        {tool.desc}
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-white flex items-center justify-center border border-slate-100 group-hover:bg-amber-400 group-hover:border-amber-400 transition-all shadow-sm group-hover:shadow-md">
                      <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-900 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ALT PANEL */}
        <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 shadow-inner space-y-6 mt-16 text-center">
          <div className="flex items-start gap-4 justify-center opacity-60 max-w-2xl mx-auto">
            <span className="text-amber-500 text-xl">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              MediSea araçları sağlık profesyonelleri için karar destek amaçlıdır. Klinik değerlendirmenin yerini alamaz. Veriler tıbbi sorumluluk içermez.
            </p>
          </div>
          <div className="text-[9px] font-black text-blue-900/40 uppercase tracking-[0.4em]">
            © 2026 MediSea Donanması • Klinik Karar Destek Birimi
          </div>
        </div>

      </div>
    </div>
  );
}