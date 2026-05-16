// "app/admin/studio/page.tsx"
'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@/app/(ydus)/context/UserContext';

// --- TİP TANIMLAMALARI (Hematopoez.json yapısına uyumlu) ---
type Section = { heading?: string; text: string };
type ContentFile = {
  title: string;
  meta: { updatedAt: string; tags: string[]; order: number };
  sections: Section[];
};

export default function ContentStudio() {
  const [content, setContent] = useState<ContentFile | null>(null);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle');
  
  // Örnek: Hematoloji / Hematopoez dosyasını yüklüyoruz
  useEffect(() => {
    // Burada normalde bir fetch(/api/admin/content?path=hematoloji/hematopoez) olur
    // Şimdilik sistemin nasıl görüneceğini simüle ediyoruz
    setContent({
      title: "Hematopoez ve Kanın Biyolojisi",
      meta: { updatedAt: "10 Mar 2026", tags: ["Hematoloji", "Harrison"], order: 1 },
      sections: [{ heading: "Bölüm Özeti", text: "<p>Kan yapımı prensipleri...</p>" }]
    });
  }, []);

  const handleSave = async () => {
    setStatus('saving');
    // API'ye kaydetme simülasyonu
    setTimeout(() => setStatus('success'), 1000);
    setTimeout(() => setStatus('idle'), 3000);
  };

  if (!content) return null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Üst Bar: Kaydetme Kontrolleri */}
        <div className="flex items-center justify-between mb-8 bg-slate-900 p-4 rounded-2xl border border-blue-900/30 sticky top-4 z-50 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl">✍️</div>
            <div>
              <h1 className="text-sm font-black uppercase tracking-widest text-white">İçerik Stüdyosu</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase italic">Dosya: canonical/hematoloji/hematopoez.json</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <span className={`text-[10px] font-black transition-all ${status === 'success' ? 'text-emerald-400 opacity-100' : 'opacity-0'}`}>
              DEĞİŞİKLİKLER KAYDEDİLDİ ✓
            </span>
            <button 
              onClick={handleSave}
              className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all
                ${status === 'saving' ? 'bg-slate-800 text-slate-500' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-900/20'}
              `}
            >
              {status === 'saving' ? 'Güncelleniyor...' : 'Veritabanına Yaz 💾'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* SOL PANEL: EDİTÖR (Kullanıcının düzelteceği yer) */}
          <div className="space-y-6">
            <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
              <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Başlık</label>
              <input 
                value={content.title}
                onChange={(e) => setContent({...content, title: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-bold focus:ring-1 focus:ring-blue-500 outline-none"
              />
            </div>

            {content.sections.map((sec, idx) => (
              <div key={idx} className="bg-slate-900 p-6 rounded-3xl border border-slate-800">
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Bölüm {idx + 1} Başlığı</label>
                <input 
                  value={sec.heading}
                  onChange={(e) => {
                    const newSecs = [...content.sections];
                    newSecs[idx].heading = e.target.value;
                    setContent({...content, sections: newSecs});
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 font-bold mb-4 outline-none"
                />
                
                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2 tracking-widest">Bölüm İçeriği (HTML)</label>
                <textarea 
                  value={sec.text}
                  rows={8}
                  onChange={(e) => {
                    const newSecs = [...content.sections];
                    newSecs[idx].text = e.target.value;
                    setContent({...content, sections: newSecs});
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-400 font-mono text-xs focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
            ))}
          </div>

          {/* SAĞ PANEL: CANLI ÖNİZLEME (CanonicalViewer simülasyonu) */}
          <div className="sticky top-28 h-[calc(100vh-140px)] overflow-y-auto custom-scrollbar bg-slate-900/50 rounded-3xl border border-slate-800 p-8 shadow-inner">
             <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Canlı Önizleme (Kullanıcı Görünümü)</span>
             </div>
             
             <h1 className="text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">
                {content.title}
             </h1>
             
             <div className="space-y-8">
               {content.sections.map((sec, idx) => (
                 <div key={idx} className="prose prose-invert prose-blue max-w-none">
                   {sec.heading && <h2 className="text-blue-400 font-black uppercase text-lg">{sec.heading}</h2>}
                   <div className="text-slate-300 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: sec.text }} />
                 </div>
               ))}
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}