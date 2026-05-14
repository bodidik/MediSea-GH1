import React from "react";
import Link from "next/link";

// --- TİP TANIMLAMALARI ---
type Item = { title: string; section: string; url: string; duration?: number; score?: number };
type VideoData = { locked: boolean; reason?: string; items?: Item[]; lastUpdatedISO?: string; error?: string };

// DİKKAT: 'use client', useState, useEffect tamamen kaldırıldı! 
// Bu artık %100 Server-Side Statik bir bileşen. Hızı ışık hızında! ⚡
export default function PremiumVideoRecommendations({ data }: { data: VideoData }) {
  
  // PREMIUM DEĞİLSE (KİLİTLİ)
  if (data.locked) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl text-center shadow-lg">
        <span className="text-3xl block mb-2 opacity-50">🔒</span>
        <h4 className="text-slate-300 font-bold text-sm mb-1">Video Radarı Kilitli</h4>
        <p className="text-xs text-slate-500">Premium erişim gerektirir.</p>
      </div>
    );
  }

  const items = data.items || [];
  
  // VERİ YOKSA
  if (!items.length) return (
    <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl text-center border-dashed">
      <span className="text-2xl block mb-2 opacity-30">📡</span>
      <p className="text-xs text-slate-500 font-medium tracking-widest uppercase">Şu an için öneri bulunamadı.</p>
    </div>
  );

  // PREMIUM VİDEO LİSTESİ (KARANLIK TEMA)
  return (
    <ul className="space-y-3">
      {items.map((x, i) => (
        <li 
          key={`${x.title}-${i}`} 
          className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between hover:border-indigo-500/50 hover:bg-slate-800 transition-all group shadow-sm"
        >
          <div className="flex items-center gap-4 overflow-hidden pr-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-900/30 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shrink-0 group-hover:scale-110 transition-transform">
              ▶️
            </div>
            <div className="truncate">
              <div className="text-[10px] font-black text-indigo-400 tracking-widest uppercase mb-0.5">
                {x.section}
              </div>
              <div className="text-sm font-bold text-slate-200 truncate group-hover:text-white transition-colors">
                {x.title}
              </div>
              {!!x.duration && (
                <div className="text-[10px] font-medium text-slate-500 mt-0.5 flex items-center gap-1">
                  <span>⏱️</span> {Math.round(x.duration)} Dk.
                </div>
              )}
            </div>
          </div>

          {x.url ? (
            <Link 
              href={x.url} 
              className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black rounded-lg uppercase tracking-widest shadow-lg shadow-indigo-900/20 transition-all"
            >
              İzle
            </Link>
          ) : (
            <span className="shrink-0 text-[10px] font-bold text-slate-600 bg-slate-950 px-3 py-1.5 rounded-md uppercase tracking-widest border border-slate-800">
              Kayıt Yok
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}