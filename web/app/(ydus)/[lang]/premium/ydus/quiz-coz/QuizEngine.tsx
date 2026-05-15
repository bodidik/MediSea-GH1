'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// --- TİP TANIMLAMALARI ---
type Option = { id: string; text: string };
type Question = {
  id: string;
  text: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
};
type QuizData = {
  id: string;
  title: string;
  description: string;
  timeLimitSeconds: number;
  questions: Question[];
};

export default function QuizEngine({ data }: { data: QuizData }) {
  const [hasStarted, setHasStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(data.timeLimitSeconds);
  const [reviewMode, setReviewMode] = useState(false); // Sınav bittikten sonraki inceleme modu

  const currentQ = data.questions[currentQIndex];
  const totalQ = data.questions.length;

  // Zamanlayıcı (Timer)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (hasStarted && !isFinished && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && !isFinished) {
      setIsFinished(true);
    }
    return () => clearInterval(timer);
  }, [hasStarted, isFinished, timeLeft]);

  // YENİ EKLENEN KISIM: Soru Değiştiğinde veya İnceleme Moduna Geçildiğinde Otomatik Yukarı Kaydır
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentQIndex, reviewMode]);

  // Süre Formatlayıcı (MM:SS)
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Skor Hesaplama
  const calculateScore = () => {
    let correct = 0;
    data.questions.forEach((q) => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return correct;
  };

  // Sınavı Bitir
  const handleFinish = () => {
    if (window.confirm("Sınavı bitirmek istediğinize emin misiniz?")) {
      setIsFinished(true);
    }
  };

  // --- EKRAN 1: BAŞLANGIÇ ---
  if (!hasStarted) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-xl text-center">
          <span className="text-4xl block mb-4">⏱️</span>
          <h1 className="text-2xl font-black text-slate-800 mb-2">{data.title}</h1>
          <p className="text-slate-600 mb-6">{data.description}</p>
          <div className="flex justify-center gap-6 mb-8 text-sm font-bold text-slate-500 bg-slate-50 py-3 rounded-lg">
            <span>📝 Soru: {totalQ}</span>
            <span>⏳ Süre: {data.timeLimitSeconds / 60} Dk</span>
          </div>
          <button 
            onClick={() => setHasStarted(true)}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all text-lg"
          >
            Sınavı Başlat
          </button>
        </div>
      </div>
    );
  }

  // --- EKRAN 2: SONUÇ (KARNE) VE İNCELEME MODU ---
  if (isFinished) {
    const score = calculateScore();
    const isSuccess = score >= totalQ / 2;

    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-8">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          
          {/* Karne Başlığı */}
          {!reviewMode ? (
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center animate-in fade-in slide-in-from-bottom-5">
              <span className="text-6xl block mb-4">{isSuccess ? '🏆' : '📚'}</span>
              <h2 className="text-3xl font-black text-slate-800 mb-2">Sınav Tamamlandı</h2>
              <p className="text-lg text-slate-600 mb-8">
                {totalQ} soruda <span className="font-bold text-blue-600">{score} doğru</span> yaptınız.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => { setReviewMode(true); setCurrentQIndex(0); }}
                  className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors"
                >
                  Cevapları ve Analizleri İncele 🔍
                </button>
                <Link 
                  href="/tr/premium/ydus"
                  className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 hover:bg-slate-50 font-bold rounded-xl transition-colors"
                >
                  Ana Menüye Dön
                </Link>
              </div>
            </div>
          ) : (
            // REVIEW (İNCELEME) MODU
            <div className="flex flex-col gap-6">
              
              {/* Review Üst Bar */}
              <div className="bg-slate-900 text-white p-4 rounded-xl flex justify-between items-center shadow-lg">
                <span className="font-bold text-sm">Cevap Analizi: Soru {currentQIndex + 1} / {totalQ}</span>
                <button onClick={() => setReviewMode(false)} className="text-xs bg-slate-800 px-3 py-1 rounded hover:bg-slate-700">Geri Dön</button>
              </div>

              {/* Soru Gövdesi */}
              <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-medium mb-8 whitespace-pre-wrap">
                  {currentQ.text}
                </div>
                
                {/* Şıklar (Doğru/Yanlış Renklendirmeli) */}
                <div className="grid gap-3 mb-8">
                  {currentQ.options.map(opt => {
                    const isUserAnswer = answers[currentQ.id] === opt.id;
                    const isCorrectAnswer = currentQ.correctAnswer === opt.id;
                    
                    let bgClass = "bg-white border-slate-200 opacity-60";
                    if (isCorrectAnswer) bgClass = "bg-green-50 border-green-500 text-green-900 ring-2 ring-green-500/50";
                    else if (isUserAnswer && !isCorrectAnswer) bgClass = "bg-red-50 border-red-500 text-red-900";

                    return (
                      <div key={opt.id} className={`p-4 rounded-xl border-2 flex items-center gap-3 ${bgClass}`}>
                        <span className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm shrink-0
                          ${isCorrectAnswer ? 'bg-green-500 text-white' : isUserAnswer ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'}
                        `}>
                          {opt.id}
                        </span>
                        <span className="font-medium text-sm sm:text-base">{opt.text}</span>
                        {isCorrectAnswer && <span className="ml-auto text-xl">✅</span>}
                        {isUserAnswer && !isCorrectAnswer && <span className="ml-auto text-xl">❌</span>}
                      </div>
                    );
                  })}
                </div>

                {/* Uzman Açıklaması */}
                <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2 border-b border-blue-200 pb-2">
                    <span>🩺</span> YDUS Uzman Analizi
                  </h4>
                  <div 
                    className="prose prose-sm sm:prose-base prose-blue max-w-none text-slate-700"
                    dangerouslySetInnerHTML={{ __html: currentQ.explanation }}
                  />
                </div>
              </div>

              {/* Review Alt Navigasyon (Evrensel Çıkış Özellikli) */}
              <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-slate-200 shadow-sm gap-4">
                 <button 
                  onClick={() => setCurrentQIndex(prev => prev - 1)} disabled={currentQIndex === 0}
                  className="px-6 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-50 w-full sm:w-auto transition-colors"
                >
                  ⬅️ Önceki
                </button>

                 {/* Merkezi Çıkış Butonu */}
                 <Link 
                   href="/tr/premium/ydus" 
                   className="px-6 py-3 font-bold text-slate-700 bg-white border-2 border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 w-full sm:w-auto text-center transition-all flex items-center justify-center gap-2"
                 >
                   <span>🏠</span> Ana Menüye Çık
                 </Link>

                 {currentQIndex === totalQ - 1 ? (
                   <button 
                    onClick={() => setReviewMode(false)}
                    className="px-6 py-3 font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 w-full sm:w-auto transition-colors shadow-md"
                  >
                    İncelemeyi Bitir 🏁
                  </button>
                 ) : (
                   <button 
                    onClick={() => setCurrentQIndex(prev => prev + 1)}
                    className="px-8 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 w-full sm:w-auto transition-colors shadow-md"
                  >
                    Sonraki ➡️
                  </button>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- EKRAN 3: SINAV MODU ---
  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-8 flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col gap-4">
        
        {/* Üst Bilgi Barı */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 shrink-0">
          <div className="flex items-center gap-3">
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-md">
              Soru {currentQIndex + 1} / {totalQ}
            </span>
          </div>
          <div className={`font-mono text-xl font-black flex items-center gap-2 ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
            <span>⏳</span> {formatTime(timeLeft)}
          </div>
        </div>

        {/* Soru ve Şıklar */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
          
          <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed font-medium mb-8 whitespace-pre-wrap flex-1">
            {currentQ.text}
          </div>

          <div className="grid gap-3 shrink-0">
            {currentQ.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setAnswers({ ...answers, [currentQ.id]: opt.id })}
                className={`text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 group
                  ${answers[currentQ.id] === opt.id 
                    ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/30' 
                    : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'}
                `}
              >
                <span className={`flex items-center justify-center w-8 h-8 rounded-lg font-bold text-sm transition-colors shrink-0
                  ${answers[currentQ.id] === opt.id ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'}
                `}>
                  {opt.id}
                </span>
                <span className="font-medium text-sm sm:text-base text-slate-700">{opt.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Alt Navigasyon */}
        <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 shrink-0">
          <button 
            onClick={() => setCurrentQIndex(prev => prev - 1)}
            disabled={currentQIndex === 0}
            className="px-6 py-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-50 transition-colors"
          >
            ⬅️ Önceki
          </button>
          
          {currentQIndex === totalQ - 1 ? (
            <button 
              onClick={handleFinish}
              className="px-8 py-3 font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-all animate-pulse"
            >
              Sınavı Bitir 🏁
            </button>
          ) : (
            <button 
              onClick={() => setCurrentQIndex(prev => prev + 1)}
              className="px-8 py-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all"
            >
              Sonraki ➡️
            </button>
          )}
        </div>

      </div>
    </div>
  );
}