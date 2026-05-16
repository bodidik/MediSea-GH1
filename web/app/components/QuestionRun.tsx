// C:\Users\hucig\Medknowledge\web\app\components\QuestionRun.tsx
"use client";
import React from "react";

export default function QuestionRun() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-700 bg-slate-800/50 p-12 text-center shadow-inner min-h-[300px]">
      
      {/* Radar / Yükleniyor Animasyonu İkonu */}
      <div className="relative flex items-center justify-center w-16 h-16 mb-6">
        <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-2 border-emerald-500 animate-spin animation-delay-150"></div>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" x2="12" y1="15" y2="3"/>
        </svg>
      </div>

      <h3 className="text-lg font-bold text-slate-200 mb-2">Soru Motoru Hazırlanıyor</h3>
      <p className="text-sm text-slate-400 max-w-sm">
        Gelişmiş test motoru modülümüzün entegrasyonu devam ediyor. Çok yakında burada dinamik denemeler çözebileceksiniz.
      </p>
    </div>
  );
}