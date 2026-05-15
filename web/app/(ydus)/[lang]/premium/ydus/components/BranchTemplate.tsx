// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\components\BranchTemplate.tsx"
'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function BranchTemplate({ data }: { data: any }) {
  // Akordiyonun durumunu doğrudan bileşen içinde yönetiyoruz
  const [openCategory, setOpenCategory] = useState<string | null>(
    data.categories.length > 0 ? data.categories[0].id : null
  );

  const toggleCategory = (id: string) => {
    setOpenCategory(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 font-sans text-slate-100">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigasyon */}
        <div className="mb-6 flex items-center gap-2 text-sm font-bold text-slate-400">
          <Link href="/tr/premium/ydus" className="hover:text-blue-400 transition-colors">
            🏠 Premium Lobi
          </Link>
          <span>/</span>
          <span className={`text-${data.color}-400`}>{data.title}</span>
        </div>

        {/* Hero Bölümü */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 mb-8 shadow-2xl border border-slate-800 relative overflow-hidden flex items-center gap-5">
          <div className={`w-16 h-16 rounded-2xl bg-${data.color}-500/10 flex items-center justify-center text-4xl shrink-0 border border-${data.color}-500/20 shadow-inner`}>
            {data.icon}
          </div>
          <div className="relative z-10">
            <h1 className="text-2xl sm:text-3xl font-black text-white mb-1">
              {data.title} İndeksi
            </h1>
            <p className="text-slate-400 font-medium text-sm sm:text-base max-w-2xl">
              İlgilendiğiniz hastalık grubunu seçerek alt başlıkları görüntüleyin.
            </p>
          </div>
          {/* Neon Parlama Efekti */}
          <div className={`absolute -bottom-10 -right-10 w-48 h-48 bg-${data.color}-500 rounded-full blur-[80px] opacity-20 pointer-events-none`}></div>
        </div>

        {/* Akordiyon Listesi */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.categories.map((cat: any) => {
            const isOpen = openCategory === cat.id;
            
            return (
              <div 
                key={cat.id} 
                className={`bg-slate-900 rounded-2xl border-2 transition-all duration-300 overflow-hidden flex flex-col
                  ${isOpen ? `border-${data.color}-500/50 shadow-lg shadow-${data.color}-900/20 ring-1 ring-${data.color}-500/30` : 'border-slate-800 shadow-sm hover:border-slate-700 hover:bg-slate-800/50'}
                `}
              >
                <div 
                  onClick={() => toggleCategory(cat.id)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors
                      ${isOpen ? `bg-${data.color}-500/20 border border-${data.color}-500/30` : 'bg-slate-950 border border-slate-800 group-hover:bg-slate-800'}
                    `}>
                      {cat.icon}
                    </div>
                    <div>
                      <h2 className={`font-black text-lg transition-colors ${isOpen ? `text-${data.color}-400` : 'text-slate-200 group-hover:text-white'}`}>
                        {cat.title}
                      </h2>
                      <p className="text-slate-400 text-xs font-medium mt-0.5">{cat.desc}</p>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 
                    ${isOpen ? `bg-${data.color}-500/20 text-${data.color}-400 rotate-180` : 'bg-slate-950 text-slate-500 border border-slate-800 group-hover:bg-slate-800 group-hover:text-slate-300'}
                  `}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className={`transition-all duration-300 ease-in-out bg-slate-950/50 ${isOpen ? 'max-h-[500px] opacity-100 border-t border-slate-800/80' : 'max-h-0 opacity-0'}`}>
                  <div className="p-4 flex flex-col gap-2">
                    {cat.items.map((item: any, idx: number) => (
                      <Link 
                        key={idx}
                        href={item.href}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all
                          ${item.isReady 
                            ? `bg-slate-900 border-slate-700 hover:border-${data.color}-500/50 hover:bg-slate-800 group cursor-pointer shadow-sm` 
                            : 'bg-transparent border-transparent opacity-40 cursor-not-allowed'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          {/* Hazır olanlar için neon yeşil puls, olmayanlar için mat gri */}
                          <span className={`w-2 h-2 rounded-full ${item.isReady ? 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-slate-600'}`}></span>
                          <span className={`font-bold text-sm ${item.isReady ? `text-slate-200 group-hover:text-${data.color}-400 transition-colors` : 'text-slate-500'}`}>
                            {item.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badges.map((badge: string, bIdx: number) => (
                            <span 
                              key={bIdx} 
                              className={`text-[10px] font-black px-2 py-0.5 rounded border shadow-sm tracking-widest
                                ${badge === 'POPÜLER' ? 'bg-blue-900/30 text-blue-400 border-blue-500/30' : ''}
                                ${badge === 'ZOR' ? 'bg-rose-900/30 text-rose-400 border-rose-500/30' : ''}
                                ${badge === 'YAKINDA' || badge === 'HAZIRLANIYOR' ? 'bg-slate-800 text-slate-500 border-slate-700' : ''}
                              `}
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}