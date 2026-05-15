'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useUser } from '../context/UserContext';

// --- GÜÇLÜ TİP TANIMLAMALARI (Mimarinin Temeli) ---
export type SimOption = {
  id: string;
  text: string;
  nextStepId: string;
  xpAward?: number; // Bu şıkkı seçerse kaç XP kazanacak?
};

export type SimStep = {
  id: string;
  type: 'scenario' | 'success' | 'fatal_error' | 'finish';
  title?: string;
  content: string;
  clinicalData?: string; // TA, Nabız, Lab değerleri için özel kutu
  options?: SimOption[];
  nextStepId?: string; // Başarı/Hata ekranından sonra nereye gidecek?
  buttonText?: string; // İleri/Tekrar Dene butonu metni
};

export type SimData = {
  id: string;
  title: string;
  topic: string;
  badgeId?: string;
  returnUrl: string; // Vaka bitince nereye dönecek?
  initialStepId: string;
  steps: Record<string, SimStep>;
};

export default function SimulatorEngine({ data }: { data: SimData }) {
  const [currentStepId, setCurrentStepId] = useState<string>(data.initialStepId);
  const [score, setScore] = useState(0);
  const { completeModule } = useUser();

  const currentStep = data.steps[currentStepId];

  // Şık Seçimi İşleyicisi
  const handleOptionClick = (option: SimOption) => {
    if (option.xpAward) setScore((prev) => prev + option.xpAward);
    setCurrentStepId(option.nextStepId);
  };

  // Vaka Bitirme İşleyicisi
  const handleFinish = () => {
    completeModule(data.id, score, data.badgeId);
  };

  // Tekrar Başlama
  const handleRestart = () => {
    setScore(0);
    setCurrentStepId(data.initialStepId);
  };

  if (!currentStep) return <div className="text-white">Adım bulunamadı! JSON verinizi kontrol edin.</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 font-sans selection:bg-blue-500/30">
      <div className="max-w-3xl mx-auto">
        
        {/* LÜKS ÜST PANEL */}
        <div className="flex justify-between items-center mb-8 border-b border-slate-700/50 pb-6">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 text-blue-400 font-black text-[10px] tracking-widest uppercase border border-blue-500/20 mb-2 shadow-sm">
              {data.topic} • Premium Vaka
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight">{data.title} 🕹️</h1>
          </div>
          <div className="text-right bg-gradient-to-br from-slate-800 to-slate-900 p-3 rounded-2xl border border-slate-700/50 shadow-inner">
            <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-widest">Klinik Skor</span>
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
              {score}
            </span>
          </div>
        </div>

        {/* MOTORUN EKRANLARI ÇİZDİĞİ YER */}
        <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-700/50 min-h-[450px] flex flex-col justify-center relative overflow-hidden transition-all duration-500">
          
          {/* Arka plan kozmetiği */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-600/10 rounded-full blur-[80px] pointer-events-none"></div>

          {/* 1. SENARYO EKRANI */}
          {currentStep.type === 'scenario' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 relative z-10">
              {currentStep.title && (
                 <h3 className="text-xl font-bold mb-6 text-white text-center">{currentStep.title}</h3>
              )}
              
              <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-2xl mb-8 shadow-inner">
                <p className="text-base leading-relaxed text-slate-300" dangerouslySetInnerHTML={{ __html: currentStep.content }} />
                
                {currentStep.clinicalData && (
                  <div className="mt-4 bg-slate-950/50 p-3 rounded-xl border border-blue-500/20 text-blue-300 text-sm font-mono flex items-center gap-3">
                    <span className="text-lg">📊</span> {currentStep.clinicalData}
                  </div>
                )}
              </div>
              
              <div className="grid gap-4">
                {currentStep.options?.map((opt, idx) => (
                  <button 
                    key={opt.id}
                    onClick={() => handleOptionClick(opt)} 
                    className="w-full text-left p-5 rounded-2xl bg-slate-700/50 hover:bg-blue-600 transition-all duration-300 font-bold border border-slate-600/50 hover:border-blue-400 group shadow-sm hover:shadow-blue-900/50"
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-400 group-hover:bg-blue-700 group-hover:text-white mr-3 transition-colors text-sm">
                      {String.fromCharCode(65 + idx)} {/* A, B, C harfleri */}
                    </span>
                    <span className="text-slate-200 group-hover:text-white">{opt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. BAŞARI EKRANI (Doğru Karar) */}
          {currentStep.type === 'success' && (
            <div className="animate-in fade-in zoom-in-95 text-center relative z-10">
              <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-6 rotate-3 shadow-lg shadow-emerald-500/10 border border-emerald-500/30">✅</div>
              <h3 className="text-2xl font-black text-emerald-400 mb-4">{currentStep.title || "Doğru Karar!"}</h3>
              <p className="text-slate-300 mb-8 text-lg leading-relaxed px-4 max-w-lg mx-auto" dangerouslySetInnerHTML={{ __html: currentStep.content }} />
              <button 
                onClick={() => currentStep.nextStepId && setCurrentStepId(currentStep.nextStepId)} 
                className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black shadow-xl shadow-emerald-900/50 transition-all active:scale-95"
              >
                {currentStep.buttonText || "Vakaya Devam Et ➡️"}
              </button>
            </div>
          )}

          {/* 3. ÖLÜMCÜL HATA EKRANI (Fatal Error) */}
          {currentStep.type === 'fatal_error' && (
            <div className="animate-in zoom-in-95 text-center py-6 relative z-10">
              <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center text-5xl mx-auto mb-6 border-4 border-red-500/20 shadow-2xl shadow-red-900/50 animate-pulse">💀</div>
              <h3 className="text-3xl font-black text-red-500 mb-4 tracking-tight">Klinik Hata!</h3>
              <p className="text-slate-300 mb-8 max-w-md mx-auto text-lg leading-relaxed bg-red-950/30 p-4 rounded-xl border border-red-900/50" dangerouslySetInnerHTML={{ __html: currentStep.content }} />
              <button 
                onClick={handleRestart} 
                className="px-8 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-black transition-all shadow-md"
              >
                {currentStep.buttonText || "Vakayı Yeniden Başlat 🔄"}
              </button>
            </div>
          )}

          {/* 4. FİNAL EKRANI (Tamamlama) */}
          {currentStep.type === 'finish' && (
            <div className="text-center py-6 animate-in fade-in relative z-10">
              <div className="w-28 h-28 bg-gradient-to-tr from-yellow-400 to-amber-600 text-white rounded-full flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl shadow-yellow-600/20 border-4 border-yellow-300/30">🏆</div>
              <h3 className="text-3xl font-black text-white mb-4 tracking-tight">{currentStep.title || "Simülasyon Tamamlandı"}</h3>
              <p className="text-slate-400 mb-8 text-lg max-w-lg mx-auto" dangerouslySetInnerHTML={{ __html: currentStep.content }} />
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleRestart} 
                  className="px-8 py-4 bg-slate-700 hover:bg-slate-600 rounded-xl font-bold transition-all"
                >
                  Tekrar Çöz
                </button>
                <Link 
                  href={data.returnUrl}
                  onClick={handleFinish} 
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black shadow-lg shadow-blue-900/50 transition-all flex items-center justify-center gap-2"
                >
                  Ödülü Al ve Çık 🏁
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}