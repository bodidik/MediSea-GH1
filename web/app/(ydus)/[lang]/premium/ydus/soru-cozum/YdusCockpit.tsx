'use client';

import { useState } from 'react';
import Link from 'next/link';

// --- ZIRH EKLENTİLERİ ---
import { useUser } from '../context/UserContext';
import LiteProtected from '@/components/LiteProtected';

// --- TİP TANIMLAMALARI ---
type Option = { id: string; text: string };

type Pearl = {
  title: string;
  text: string;
};

type NavigationConfig = {
  nextCase?: { title: string; url: string };
  pearls?: { title: string; url: string };
  exit?: { title: string; url: string };
};

type Stage = {
  step: number;
  type: string;
  content: string;
  question: string;
  options: Option[];
  correctAnswer: string;
  pearl?: Pearl | string;
  explanation?: string;
};

type CaseData = {
  id: string;
  title: string;
  stages: Stage[];
  navigation?: NavigationConfig;
};

// --- BİLEŞEN: DARK MODE SİMÜLATÖR ---
export default function YdusCockpit({ data }: { data: CaseData }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  // ZIRH: Kullanıcı bilgisini filigran için çekiyoruz
  const { user } = useUser() || { user: { id: "Premium Kaptan" } };

  const currentStage = data.stages[currentStageIndex];
  const isCorrect = selectedOption === currentStage.correctAnswer;
  const isLastStage = currentStageIndex === data.stages.length - 1;

  const pearlData = currentStage.pearl 
    ? (typeof currentStage.pearl === 'string' 
        ? { title: "Donanma İpucu", text: currentStage.pearl } 
        : currentStage.pearl)
    : null;

  const handleNextStep = () => {
    setCurrentStageIndex(prev => prev + 1);
    setSelectedOption(null);
    setShowResult(false);
  };

  return (
    // ANA KAPLAYICI: Mavi Vatan Karanlığı + ZIRH (Mobil Esneklik min-h eklendi)
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-50px)] lg:h-[calc(100vh-50px)] gap-2 p-2 bg-slate-950 overflow-hidden text-xs text-slate-100">
      
      {/* --- SOL PANEL (Vaka & Sorular) --- */}
      <div className="flex-[2] flex flex-col gap-2 bg-slate-900 p-3 rounded-lg shadow-2xl border border-blue-900/20 overflow-hidden">
        
        {/* Başlık */}
        <div className="flex justify-between items-center border-b border-slate-800 pb-1.5 shrink-0">
          <div>
            <h2 className="text-base font-black text-white leading-tight uppercase italic tracking-tighter">
              {data.title}
            </h2>
          </div>
          <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded border border-blue-500/30 uppercase tracking-widest">
            ADIM {currentStage.step}/{data.stages.length}
          </span>
        </div>

        {/* Vaka Metni (Karanlık Tema ve Maksimum Yükseklik) */}
        <div className="overflow-y-auto pr-2 custom-scrollbar shrink-0 max-h-[20vh] lg:max-h-[25vh] bg-black/30 p-2.5 rounded-lg border border-white/5 shadow-inner">
          {/* ZIRH: Vaka metni LiteProtected Kalkanı içine alındı */}
          <LiteProtected userId={user?.id || "Premium Üye"}>
            <div className="prose prose-sm prose-invert prose-blue max-w-none text-slate-300 leading-relaxed font-medium">
              <p>{currentStage.content}</p>
            </div>
          </LiteProtected>
        </div>

        {/* Soru ve Şıklar (Esnek Alan) */}
        <div className="flex flex-col gap-2.5 mt-auto pt-3 border-t border-slate-800 h-full overflow-y-auto">
          <h3 className="font-bold text-white flex items-start gap-2 text-sm leading-snug">
            <span className="text-blue-400">❓</span>
            {currentStage.question}
          </h3>
          
          <div className="grid gap-1.5">
            {currentStage.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => !showResult && setSelectedOption(opt.id)}
                disabled={showResult}
                className={`group relative w-full text-left p-2.5 rounded border transition-all duration-150
                  ${
                    showResult
                      ? opt.id === currentStage.correctAnswer
                        ? 'bg-green-900/30 border-green-500 text-green-300 ring-1 ring-green-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' // Doğru
                        : opt.id === selectedOption
                        ? 'bg-red-900/30 border-red-500 text-red-300 ring-1 ring-red-500 opacity-70' // Yanlış
                        : 'bg-slate-950/50 border-slate-800 text-slate-600 opacity-50 grayscale'
                      : selectedOption === opt.id
                      ? 'bg-blue-900/40 border-blue-500 ring-1 ring-blue-500 text-white shadow-lg' // Seçili
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-blue-500/50'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`flex items-center justify-center w-5 h-5 rounded text-[10px] font-black transition-colors border
                    ${selectedOption === opt.id ? 'bg-blue-600 text-white border-blue-500 shadow-md' : 'bg-black/30 text-slate-500 border-white/5 group-hover:bg-black/50 group-hover:text-blue-400'}
                  `}>
                    {opt.id}
                  </span>
                  <span className="font-medium">{opt.text}</span>
                </div>
                
                {showResult && opt.id === currentStage.correctAnswer && <span className="absolute right-2.5 top-2.5 text-green-500 text-base">✓</span>}
                {showResult && opt.id === selectedOption && opt.id !== currentStage.correctAnswer && <span className="absolute right-2.5 top-2.5 text-red-500 text-base">✖</span>}
              </button>
            ))}
          </div>

          {/* Aksiyon Alanı */}
          <div className="mt-auto shrink-0 pb-1">
            {!showResult ? (
              <button
                onClick={() => selectedOption && setShowResult(true)}
                disabled={!selectedOption}
                className="w-full py-2.5 rounded-lg font-black text-white text-sm bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20 uppercase tracking-widest"
              >
                Kararı Onayla
              </button>
            ) : (
              <div className="space-y-2">
                
                {/* SONRAKİ AŞAMA BUTONU (Lazer Efektli) */}
                {!isLastStage && (
                  <button
                    onClick={handleNextStep}
                    className="w-full py-2.5 rounded-lg font-black text-white text-sm bg-slate-800 hover:bg-slate-700 flex items-center justify-center gap-2 animate-pulse uppercase tracking-widest border border-slate-700 shadow-lg"
                  >
                    <span>Sonraki Aşamaya İlerle ➡️</span>
                  </button>
                )}

                {/* VAKA BİTİŞ PANELİ (Donanma Mavisi) */}
                {isLastStage && (
                  <div className="bg-slate-950 text-white p-2 rounded-lg shadow-2xl border border-blue-900/30">
                    <div className="flex items-center justify-between mb-2 border-b border-slate-800 pb-1.5">
                      <span className="text-xs font-black text-green-400 uppercase tracking-widest flex items-center gap-2">
                        <span>🎉</span> Vaka Tamamlandı
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Link href={data.navigation?.nextCase?.url || '#'} className="py-2.5 px-1 bg-slate-900 hover:bg-blue-600 rounded-lg text-center border border-slate-800 hover:border-blue-500/50 transition-all group">
                        <div className="text-base group-hover:scale-110 transition-transform">➡️</div>
                        <div className="text-[9px] text-slate-400 group-hover:text-blue-100 mt-1 font-bold uppercase tracking-widest">Sıradaki</div>
                      </Link>
                      <Link href={data.navigation?.pearls?.url || '#'} className="py-2.5 px-1 bg-slate-900 hover:bg-yellow-600 rounded-lg text-center border border-slate-800 hover:border-yellow-500/50 transition-all group">
                        <div className="text-base group-hover:scale-110 transition-transform">💎</div>
                        <div className="text-[9px] text-slate-400 group-hover:text-yellow-100 mt-1 font-bold uppercase tracking-widest">Notlar</div>
                      </Link>
                      <Link href={data.navigation?.exit?.url || '#'} className="py-2.5 px-1 bg-slate-900 hover:bg-red-600 rounded-lg text-center border border-slate-800 hover:border-red-500/50 transition-all group">
                        <div className="text-base group-hover:scale-110 transition-transform">🏠</div>
                        <div className="text-[9px] text-slate-400 group-hover:text-red-100 mt-1 font-bold uppercase tracking-widest">Çıkış</div>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- SAĞ PANEL (Analiz & Feedback) --- */}
      <div className="flex-1 flex flex-col gap-2 h-full min-w-[280px] overflow-hidden">
        
        {/* Durum Kutusu (Neon Renkler) */}
        <div className={`p-3 rounded-lg shadow-2xl text-white shrink-0 transition-colors duration-300 border-b-2
          ${!showResult ? 'bg-slate-900 border-slate-700' : isCorrect ? 'bg-green-900 border-green-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'bg-red-900 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)]'}
        `}>
          <h4 className="text-[9px] font-black uppercase opacity-60 tracking-widest">Karar Analizi</h4>
          <div className={`text-base font-black leading-tight mt-0.5 ${!showResult ? 'text-slate-300' : isCorrect ? 'text-green-300' : 'text-red-300'}`}>
            {!showResult ? 'BEKLENİYOR...' : isCorrect ? 'DOĞRU YAKLAŞIM ✓' : 'HATALI YAKLAŞIM ⚠️'}
          </div>
        </div>

        {/* İçerik (Custom Scrollbar) */}
        <div className="flex-1 overflow-y-auto pr-1.5 custom-scrollbar space-y-2.5 pb-2">
          
          {/* Donanma İpucu (Pearl) */}
          {showResult && pearlData && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 p-2.5 rounded-lg shadow-inner">
              <div className="flex items-center gap-1.5 mb-1.5 border-b border-yellow-500/20 pb-1">
                <span className="text-base">💎</span>
                <h4 className="font-black text-yellow-400 text-[10px] uppercase tracking-widest">{pearlData.title}</h4>
              </div>
              <p className="text-yellow-100 text-[11px] leading-relaxed font-medium">
                {pearlData.text}
              </p>
            </div>
          )}

          {/* Uzman Açıklaması */}
          {showResult && currentStage.explanation && (
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 shadow-xl">
              <h4 className="font-black text-white text-xs mb-2 pb-1.5 border-b border-slate-800 uppercase tracking-widest flex items-center gap-2">
                <span>🩺</span> Uzman Görüşü
              </h4>
              <div 
                className="text-[11px] text-slate-300 space-y-1.5 prose prose-sm prose-invert prose-blue leading-relaxed font-medium"
                dangerouslySetInnerHTML={{ __html: currentStage.explanation }} 
              />
            </div>
          )}
          
          {/* Placeholder */}
          {showResult && !currentStage.explanation && (
            <div className="text-center text-slate-600 text-xs mt-6 italic bg-slate-900 p-4 rounded-xl border border-slate-800 border-dashed">
              Sonraki aşamaya geçebilirsiniz kaptan...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}