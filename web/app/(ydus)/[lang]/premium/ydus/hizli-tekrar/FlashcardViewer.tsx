'use client';

import { useState } from 'react';
import Link from 'next/link';

// --- TİP TANIMLAMALARI ---
type Card = {
  id: string;
  front: string;
  back: string;
  tag: string;
};

type FlashcardData = {
  id: string;
  topic: string;
  description: string;
  cards: Card[];
};

export default function FlashcardViewer({ data }: { data: FlashcardData }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = data.cards[currentIndex];
  const totalCards = data.cards.length;
  const progress = ((currentIndex + 1) / totalCards) * 100;

  // Sonraki Karta Geç
  const handleNext = () => {
    setIsFlipped(false); // Önce kartı düzelt
    setTimeout(() => {
      if (currentIndex < totalCards - 1) setCurrentIndex(prev => prev + 1);
    }, 200); // Dönme animasyonu bitene kadar bekle
  };

  // Önceki Karta Dön
  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center py-8 px-4 font-sans text-slate-100">
      
      {/* ÜST BİLGİ VE İLERLEME ÇUBUĞU */}
      <div className="w-full max-w-3xl mb-10">
        <div className="flex justify-between items-end mb-4">
          <div>
            <span className="text-blue-500 font-bold text-[10px] tracking-[0.3em] uppercase flex items-center gap-2">
              <span>⚡</span> Taktiksel Hızlı Tekrar
            </span>
            <h1 className="text-3xl font-black text-white leading-tight uppercase italic mt-1 tracking-tighter">
              {data.topic}
            </h1>
          </div>
          <div className="text-right">
            <span className="text-3xl font-black text-blue-400">{currentIndex + 1}</span>
            <span className="text-sm font-bold text-slate-600"> / {totalCards}</span>
          </div>
        </div>
        {/* Progress Bar (Parlayan Lazer Efekti) */}
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* 3D KART ALANI */}
      <div className="w-full max-w-3xl aspect-[4/3] sm:aspect-[16/9] perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          
          {/* KARTIN ÖN YÜZÜ (SORU) */}
          <div className="absolute inset-0 backface-hidden bg-slate-900 border border-slate-800 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col p-8 sm:p-12 hover:border-blue-500/30 transition-colors">
            <div className="flex justify-between items-center mb-auto">
              <span className="bg-blue-900/30 text-blue-400 text-xs font-black px-3 py-1.5 rounded-lg border border-blue-500/30 uppercase tracking-widest">
                {currentCard.tag}
              </span>
              <span className="text-slate-600 text-xs font-black tracking-widest uppercase">ÖN YÜZ (VAKA)</span>
            </div>
            
            <div className="flex-1 flex items-center justify-center text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white leading-snug tracking-tight">
                {currentCard.front}
              </h2>
            </div>
            
            <div className="mt-auto text-center animate-pulse opacity-50">
              <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Cevabı Görmek İçin Tıkla 🔄</span>
            </div>
          </div>

          {/* KARTIN ARKA YÜZÜ (CEVAP) */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-slate-800 border-2 border-blue-500/50 rounded-3xl shadow-[0_0_40px_rgba(59,130,246,0.15)] flex flex-col p-8 sm:p-12">
             <div className="flex justify-between items-center mb-auto">
              <span className="bg-yellow-500/10 text-yellow-500 text-xs font-black px-3 py-1.5 rounded-lg border border-yellow-500/30 uppercase tracking-widest flex items-center gap-2">
                <span>🎯</span> Kaptan Yanıtı
              </span>
              <span className="text-slate-500 text-xs font-black tracking-widest uppercase">ARKA YÜZ (ÇÖZÜM)</span>
            </div>

            <div className="flex-1 flex items-center justify-center text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-medium text-blue-100 leading-relaxed">
                {currentCard.back}
              </p>
            </div>
            
            <div className="mt-auto text-center opacity-50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Ön Yüze Dönmek İçin Tıkla 🔄</span>
            </div>
          </div>

        </div>
      </div>

      {/* KONTROL BUTONLARI */}
      <div className="w-full max-w-3xl flex justify-between items-center mt-10 gap-4">
        <button 
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="px-6 py-4 rounded-2xl font-black text-slate-400 bg-slate-900 border border-slate-800 shadow-sm hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all uppercase tracking-widest text-xs"
        >
          ⬅️ Önceki
        </button>

        <Link 
          href="/tr/premium/ydus"
          className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-blue-400 transition-colors hidden sm:block"
        >
          Köprüüstüne Dön 🏠
        </Link>

        {currentIndex === totalCards - 1 ? (
          <Link 
            href="/tr/premium/ydus"
            className="px-8 py-4 rounded-2xl font-black text-slate-900 bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-400 transition-all animate-[pulse_2s_infinite] uppercase tracking-widest text-xs flex items-center gap-2"
          >
            Seriyi Bitir 🎉
          </Link>
        ) : (
          <button 
            onClick={handleNext}
            className="px-8 py-4 rounded-2xl font-black text-white bg-blue-600 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:bg-blue-500 transition-all uppercase tracking-widest text-xs"
          >
            Sonraki ➡️
          </button>
        )}
      </div>

    </div>
  );
}