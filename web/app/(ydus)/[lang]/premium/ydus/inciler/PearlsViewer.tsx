'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

// --- TİP TANIMLAMALARI ---
type Pearl = {
  id: string;
  level: string;
  title: string;
  content: string;
  trigger: string;
};

type PearlsData = {
  id: string;
  topic: string;
  pearls: Pearl[];
};

export default function PearlsViewer({ data }: { data: PearlsData }) {
  const [searchTerm, setSearchTerm] = useState('');

  // 100k Trafik Optimizasyonu: Canlı Arama Filtresi (useMemo ile zırhlandı)
  // Bu sayede kullanıcı her harf yazdığında tüm listeyi baştan hesaplamak yerine,
  // sadece arama terimi değiştiğinde filtreleme yapar. Telefon işlemcilerini yormaz.
  const filteredPearls = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return data.pearls.filter(pearl => 
      pearl.title.toLowerCase().includes(term) ||
      pearl.content.toLowerCase().includes(term) ||
      pearl.trigger.toLowerCase().includes(term) ||
      pearl.level.toLowerCase().includes(term)
    );
  }, [searchTerm, data.pearls]);

  // Kategoriye Göre Güvenli Tailwind Renk Objesi (Replace Hack'i kaldırıldı)
  const getThemeByLevel = (level: string) => {
    const l = level.toLowerCase();
    if (l.includes('acil') || l.includes('hayat')) {
      return { border: 'border-rose-500', bg: 'bg-rose-900/10', text: 'text-rose-400', badgeBorder: 'border-rose-500/30', badgeBg: 'bg-rose-500/10' };
    }
    if (l.includes('kılavuz') || l.includes('prognostik')) {
      return { border: 'border-blue-500', bg: 'bg-blue-900/10', text: 'text-blue-400', badgeBorder: 'border-blue-500/30', badgeBg: 'bg-blue-500/10' };
    }
    if (l.includes('farmakoloji') || l.includes('tedavi')) {
      return { border: 'border-purple-500', bg: 'bg-purple-900/10', text: 'text-purple-400', badgeBorder: 'border-purple-500/30', badgeBg: 'bg-purple-500/10' };
    }
    if (l.includes('hardcore') || l.includes('expert')) {
      return { border: 'border-slate-500', bg: 'bg-slate-800/30', text: 'text-slate-300', badgeBorder: 'border-slate-500/30', badgeBg: 'bg-slate-700/50' };
    }
    // Default (Sarı/Uyarı)
    return { border: 'border-amber-500', bg: 'bg-amber-900/10', text: 'text-amber-400', badgeBorder: 'border-amber-500/30', badgeBg: 'bg-amber-500/10' };
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-8 font-sans text-slate-100">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        
        {/* ÜST BİLGİ VE ARAMA ÇUBUĞU */}
        <div className="bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-800 relative overflow-hidden">
          {/* Kozmetik Parlama */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[80px] pointer-events-none"></div>

          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-slate-800/80 pb-6">
            <div>
              <span className="text-blue-500 font-black text-[10px] tracking-widest uppercase flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Tıbbi İstihbarat Notları
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight uppercase tracking-tight">
                {data.topic}
              </h1>
            </div>
            <Link 
              href="/tr/premium/ydus"
              className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl font-bold transition-all border border-slate-800 hover:border-blue-500/30 shadow-sm flex items-center gap-2"
            >
              Köprüüstüne Dön
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          </div>

          <div className="relative z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input 
              type="text" 
              placeholder="Sızdırılan notlarda ara (Örn: Acil, ATRA, Diferansiyasyon...)" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-slate-950/50 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-slate-200 font-medium placeholder-slate-500 shadow-inner"
            />
          </div>
        </div>

        {/* İNCİLER LİSTESİ */}
        <div className="grid gap-5">
          {filteredPearls.length > 0 ? (
            filteredPearls.map((pearl) => {
              const theme = getThemeByLevel(pearl.level);
              
              return (
                <div 
                  key={pearl.id} 
                  className={`bg-slate-900/80 rounded-2xl shadow-lg border border-slate-800 overflow-hidden hover:border-slate-700 transition-all group relative`}
                >
                  {/* Sol Kalın Çizgi */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${theme.bg.replace('/10', '')} ${theme.border}`}></div>
                  
                  <div className={`pl-6 p-5 sm:p-6 flex flex-col gap-4 h-full ${theme.bg}`}>
                    <div className="flex justify-between items-start sm:items-center flex-col sm:flex-row gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${theme.badgeBorder} ${theme.badgeBg} ${theme.text} shadow-sm`}>
                        {pearl.level}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1.5 bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>
                        {pearl.trigger}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors leading-snug">
                        {pearl.title}
                      </h3>
                      <div 
                        className="text-sm text-slate-300/90 leading-relaxed font-medium prose prose-invert prose-p:mb-2 last:prose-p:mb-0 max-w-none"
                        dangerouslySetInnerHTML={{ __html: pearl.content }}
                      />
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 bg-slate-900/50 rounded-3xl border border-slate-800 border-dashed">
              <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
              </div>
              <h3 className="text-lg font-black text-slate-300 uppercase tracking-widest mb-1">İstihbarat Bulunamadı</h3>
              <p className="text-slate-500 text-sm font-medium">Farklı bir anahtar kelime ile veritabanını tekrar tarayın.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}