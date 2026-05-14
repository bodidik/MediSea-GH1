'use client';

import React from 'react';
import Link from 'next/link';
// ZIRH: Kullanıcı yetkisini kontrol etmek için kancayı ekliyoruz
import { useUser } from '@/app/(ydus)/context/UserContext';

type Section = {
  heading?: string;
  text: string;
};

type CanonicalData = {
  title: string;
  meta: {
    updatedAt: string;
    tags: string[];
  };
  sections: Section[];
};

// ZIRH: branch ve id parametrelerini Studio'ya yönlendirme yapabilmek için ekledik
export default function CanonicalViewer({ data, branch, id }: { data: CanonicalData, branch?: string, id?: string }) {
  // ZIRH: Sadece rütbesi uygun olanlara editör kapısını açıyoruz
  const { user } = useUser() || { user: { id: "Misafir" } };
  const isAdmin = user?.id === 'Kaptan' || user?.id === 'admin';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 py-10 px-4 font-sans relative">
      <div className="max-w-4xl mx-auto">
        
        {/* Üst Bilgi Rozeti */}
        <div className="mb-8 border-b border-slate-800 pb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {data.meta.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-widest border border-blue-500/20 rounded-lg">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase italic mb-2">
            {data.title}
          </h1>
          <p className="text-slate-500 text-xs font-bold">Son Güncelleme: {data.meta.updatedAt}</p>
        </div>

        {/* İçerik Bölümleri */}
        <div className="space-y-12">
          {data.sections.map((section, idx) => (
            <section key={idx} className="bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl">
              {section.heading && (
                <h2 className="text-xl font-bold text-blue-400 mb-6 flex items-center gap-3">
                  <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                  {section.heading}
                </h2>
              )}
              <div 
                className="prose prose-invert prose-blue max-w-none text-slate-300 leading-relaxed font-medium"
                dangerouslySetInnerHTML={{ __html: section.text }}
              />
            </section>
          ))}
        </div>

      </div>

      {/* AMİRAL GEMİSİ ÖZEL: SAYFA ALTI HIZLI DÜZELTME PANELİ */}
      {isAdmin && branch && id && (
        <div className="fixed bottom-8 right-8 z-50 animate-in slide-in-from-right-10 duration-500">
          <Link 
            href={`/tr/admin/studio?branch=${branch}&id=${id}`}
            className="flex items-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black shadow-2xl shadow-blue-900/40 border border-blue-400/30 transition-all active:scale-95 group"
          >
            <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-xl group-hover:rotate-12 transition-transform">
              ✍️
            </div>
            <div className="text-left">
              <p className="text-[10px] uppercase tracking-widest opacity-70 leading-none mb-1">Hızlı Müdahale</p>
              <p className="text-xs font-black">STUDIO'DA DÜZELT</p>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}