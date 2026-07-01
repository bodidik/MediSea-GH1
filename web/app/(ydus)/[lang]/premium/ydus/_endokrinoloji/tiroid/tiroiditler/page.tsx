'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, ShieldAlert, Zap
} from 'lucide-react';

const THYROIDITIS_DATA = {
  title: "Tiroiditler",
  parent: "Tiroid Hastalıkları",
  parentHref: "/premium/ydus/endokrinoloji/tiroid",
  color: "teal", 
  categories: [
    {
      id: "akut-tiroidit",
      title: "Akut Tiroidit",
      icon: "🦠",
      desc: "Bakteriyel ve infeksiyöz (süpüratif) tiroid bezi iltihapları",
      items: [
        { title: "Akut Süpüratif Tiroidit Algoritması", href: "#", isReady: false, badges: ["ACİL", "KLİNİK"] },
        { title: "Piriform Sinüs Fistülü ve Pediatrik Vakalar", href: "#", isReady: false, badges: ["İSTİHBARAT"] }
      ]
    },
    {
      id: "subakut-tiroidit",
      title: "Subakut Granülomatöz Tiroidit",
      icon: "🔥",
      desc: "De Quervain (Ağrılı) tiroidit klinik yönetimi",
      items: [
        { 
          title: "Subakut Tiroidit Detaylı Konu Anlatımı 🏁", 
          href: "/premium/ydus/endokrinoloji/tiroid/tiroiditler/subakut-tiroidit", 
          isReady: true, 
          badges: ["MAKALE", "ÖNEMLİ"] 
        },
        { title: "Viral Etyoloji ve Klinik Fazlar", href: "#", isReady: false, badges: ["VAKA"] }
      ]
    },
    {
      id: "sessiz-tiroidit",
      title: "Sessiz Tiroidit",
      icon: "🤫",
      desc: "Ağrısız, Postpartum (Doğum sonrası) tiroid disfonksiyonları",
      items: [
        { 
          title: "Sessiz/Postpartum Tiroidit Detaylı Konu Anlatımı 🏁", 
          href: "/premium/ydus/endokrinoloji/tiroid/tiroiditler/sessiz-tiroidit", 
          isReady: true, 
          badges: ["GEBELİK", "SINAV", "PREMIUM"] 
        },
        { title: "Postpartum Tiroidit İzlem ve Yönetimi", href: "#", isReady: false, badges: ["ZOR"] }
      ]
    },
    {
      id: "kronik-tiroidit",
      title: "Kronik Tiroidit (Hashimoto)",
      icon: "🛡️",
      desc: "Otoimmün lenfositik tiroidit ve hipotiroidi süreci",
      items: [
        { 
          title: "Kronik Tiroidit (Hashimoto) Detaylı Konu Anlatımı 🏁", 
          href: "/premium/ydus/endokrinoloji/tiroid/tiroiditler/kronik-tiroidit", 
          isReady: true, 
          badges: ["MAKALE", "PREMIUM"] 
        },
        { title: "Ötiroid Hashimoto İzlemi ve L-Tiroksin", href: "#", isReady: false, badges: ["KLİNİK"] }
      ]
    },
    {
      id: "riedel-tiroidit",
      title: "Riedel Tiroiditi",
      icon: "🗿",
      desc: "İnvaziv fibrozis ve IgG4 aracılı sistemik hastalık",
      items: [
        { 
          title: "Riedel Tiroiditi Detaylı Konu Anlatımı 🏁", 
          href: "/premium/ydus/endokrinoloji/tiroid/tiroiditler/riedel-tiroiditi", 
          isReady: true, 
          badges: ["MAKALE", "İNCİ"] 
        },
        { title: "IgG4 İlişkili Hastalıklar ve Ayırıcı Tanı", href: "#", isReady: false, badges: ["TEORİ"] }
      ]
    },
    {
      id: "diger-tiroiditler",
      title: "Diğer Tiroiditler",
      icon: "💊",
      desc: "İlaç, radyasyon, travma ve sitokin kaynaklı tiroiditler",
      items: [
        { title: "Amiodaron İlişkili Tiroidit (Tip 1 vs Tip 2)", href: "#", isReady: false, badges: ["KRİTİK", "ZOR"] },
        { title: "Lityum ve İmmün Kontrol Noktası İnhibitörleri", href: "#", isReady: false, badges: ["GÜNCEL"] }
      ]
    }
  ]
};

export default function ThyroiditisIndexPage() {
  const params = useParams();
  const lang = params?.lang || 'tr';
  const [openCategory, setOpenCategory] = useState<string | null>("subakut-tiroidit");

  return (
    <div className="min-h-screen bg-[#f0f7ff] py-8 px-4 sm:px-6 font-sans text-slate-800 relative">
      
      {/* 1. ÜST NAVİGASYON */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <Link 
          href={`/${lang}${THYROIDITIS_DATA.parentHref}`}
          className="flex items-center gap-2 text-teal-600 font-black text-sm hover:text-teal-800 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            <ChevronLeft size={18} />
          </div>
          {THYROIDITIS_DATA.parent} Bölümüne Dön
        </Link>
      </div>

      <main className="max-w-5xl mx-auto">
        
        {/* 2. HEADER KARTI */}
        <div className="bg-white rounded-3xl p-8 mb-8 border border-teal-100 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-teal-50 text-teal-600 text-[10px] font-black px-3 py-1 rounded-full border border-teal-200 uppercase tracking-widest shadow-sm">Enflamatuar Spektrum</span>
              <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1 rounded-full border border-amber-200 uppercase tracking-widest shadow-sm">TEMD Kılavuzu</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-2 tracking-tight uppercase italic flex items-center gap-3">
               <ShieldAlert size={36} className="text-teal-500" /> {THYROIDITIS_DATA.title} İndeksi
            </h1>
            <p className="text-slate-500 font-medium max-w-2xl leading-relaxed italic text-sm">
              Akut, subakut ve kronik seyirli tiroid enflamasyonları; klinik yönetim algoritmaları ve hastalık bazlı detaylı konu anlatımları.
            </p>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-teal-50 rounded-full blur-3xl opacity-60"></div>
        </div>

        {/* 3. KATEGORİ LİSTESİ */}
        <div className="space-y-4">
          {THYROIDITIS_DATA.categories.map((cat, catIndex) => {
            const isOpen = openCategory === cat.id;
            
            return (
              <div 
                key={`category-${cat.id}-${catIndex}`} 
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm
                  ${isOpen ? 'border-teal-400 ring-4 ring-teal-50/50' : 'border-slate-100 hover:border-teal-200'}`}
              >
                <button 
                  onClick={() => setOpenCategory(isOpen ? null : cat.id)}
                  className="w-full p-5 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border transition-colors
                      ${isOpen ? 'bg-teal-500 text-white border-teal-400' : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-teal-50 group-hover:text-teal-500'}`}>
                      {cat.icon}
                    </div>
                    <div>
                      <h2 className={`font-black text-lg ${isOpen ? 'text-teal-600' : 'text-slate-800'}`}>{cat.title}</h2>
                      <p className="text-slate-400 text-xs font-medium">{cat.desc}</p>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-90 text-teal-500' : 'text-slate-300'}`} 
                    size={24} 
                  />
                </button>

                {isOpen && (
                  <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/50 border-t border-slate-50">
                    {cat.items.map((item, itemIdx) => (
                      <Link 
                        key={`item-${cat.id}-${itemIdx}`} 
                        href={item.isReady ? (item.href.startsWith('/') ? `/${lang}${item.href}` : item.href) : "#"}
                        className={`flex flex-col p-4 rounded-xl border transition-all
                          ${item.isReady 
                            ? 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-md group/item cursor-pointer' 
                            : 'bg-slate-100/50 border-transparent opacity-60 cursor-not-allowed'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.isReady ? 'bg-teal-500 animate-pulse' : 'bg-slate-300'}`}></div>
                            <span className={`text-sm font-bold ${item.isReady ? 'text-slate-700 group-hover/item:text-teal-600' : 'text-slate-400'}`}>
                              {item.title}
                            </span>
                          </div>
                          {item.isReady && <Zap size={14} className="text-amber-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.badges.map((badge, bIdx) => (
                            <span 
                              key={`badge-${cat.id}-${itemIdx}-${bIdx}`} 
                              className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter
                              ${badge === 'MAKALE' ? 'bg-teal-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
                              {badge}
                            </span>
                          ))}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}