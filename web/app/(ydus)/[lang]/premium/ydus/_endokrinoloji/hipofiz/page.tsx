'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, Activity, Brain, 
  Zap, Microscope, Eye, Beaker, ShieldAlert, Thermometer
} from 'lucide-react';

const PITUITARY_DATA = {
  title: "Hipofiz ve Hipotalamus Hastalıkları",
  parent: "Endokrinoloji",
  parentHref: "/premium/ydus/endokrinoloji",
  color: "amber",
  categories: [
    {
      id: "adenom-genel",
      title: "Hipofiz Adenomları: Genel Yaklaşım",
      icon: "🧠",
      desc: "İnsidentaloma, mikroadenom ve makroadenom ayrımı",
      items: [
        { title: "Hipofiz İnsidentalomaları: İzlem Algoritması", href: "#", isReady: true, badges: ["KLİNİK"] },
        { title: "Kavernöz Sinüs İnvazyonu (Knosp Sınıflaması)", href: "#", isReady: false, badges: ["RADYOLOJİ"] }
      ]
    },
    {
      id: "akromegali",
      title: "Akromegali ve Gigantizm",
      icon: "🦴",
      desc: "GH fazlalığı, genetik (AIP/GNAS) ve komplikasyonlar",
      items: [
        { 
          title: "Akromegali", 
          href: "/premium/ydus/endokrinoloji/hipofiz/akromegali", 
          isReady: true, 
          badges: ["BİRİM", "YDUS"] 
        },
        { title: "Tanı Testleri: OGTT'de GH Baskılanmaması", href: "/premium/ydus/endokrinoloji/hipofiz/akromegali", isReady: true, badges: ["TANI"] },
        { title: "Yeni Nesil Tedavi: Pasireotide ve Pegvisomant", href: "/premium/ydus/endokrinoloji/hipofiz/akromegali", isReady: true, badges: ["TEDAVİ"] }
      ]
    },
    {
      id: "prolaktinoma",
      title: "Hiperprolaktinemi ve Prolaktinoma",
      icon: "🍼",
      desc: "Galaktore, hipogonadizm ve Dopamin Agonistleri",
      items: [
        { title: "Hook Etkisi ve Makroprolaktin Ayrımı", href: "#", isReady: true, badges: ["İNCİ", "SINAV"] },
        { title: "Dopamin Agonistleri ve Kalp Kapak Yan Etkileri", href: "#", isReady: false, badges: ["FARMA"] }
      ]
    },
    {
      id: "cushing-hastaligi",
      title: "Cushing Hastalığı (ACTH Adenomu)",
      icon: "🌙",
      desc: "Hipofizer Cushing vs Ektopik ACTH ayrımı",
      items: [
        { title: "Deksametazon Baskılama Testleri (DST)", href: "#", isReady: true, badges: ["TANI"] },
        { title: "İnferior Petrozal Sinüs Örneklemesi (IPSS)", href: "#", isReady: false, badges: ["ZOR"] }
      ]
    },
    {
      id: "hipopituitarizm",
      title: "Hipopituitarizm ve Boş Sella",
      icon: "📉",
      desc: "Hormon eksiklikleri ve replasman sırası",
      items: [
        { title: "Replasman Sırası: Önce Kortizol!", href: "#", isReady: true, badges: ["KRİTİK"] },
        { title: "Sheehan Sendromu ve Lenfositik Hipofizit", href: "#", isReady: false, badges: ["AYIRICI TANI"] }
      ]
    },
    {
      id: "diyabetes-insipidus",
      title: "Su Metabolizması: DI ve SIADH",
      icon: "💧",
      desc: "Vazopressin (ADH) dengesizlikleri",
      items: [
        { title: "Su Kısıtlama Testi ve Desmopressin Yanıtı", href: "#", isReady: true, badges: ["KLİNİK"] },
        { title: "SIADH'ta Tolvaptan ve Tuz Tabletleri", href: "#", isReady: false, badges: ["TEDAVİ"] }
      ]
    }
  ]
};

export default function PituitaryMainPage() {
  const params = useParams();
  const lang = params?.lang || 'tr';
  const [openCategory, setOpenCategory] = useState<string | null>("akromegali");

  return (
    <div className="min-h-screen bg-[#fffbeb] py-8 px-4 sm:px-6 font-sans text-slate-800">
      
      {/* NAVİGASYON */}
      <div className="max-w-5xl mx-auto mb-6">
        <Link 
          href={`/${lang}${PITUITARY_DATA.parentHref}`}
          className="flex items-center gap-2 text-amber-700 font-black text-sm hover:text-amber-900 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:-translate-x-1 transition-transform border border-amber-100">
            <ChevronLeft size={18} />
          </div>
          {PITUITARY_DATA.parent} Ana Karargahına Dön
        </Link>
      </div>

      <main className="max-w-5xl mx-auto">
        
        {/* HEADER */}
        <div className="bg-white rounded-3xl p-8 mb-8 border border-amber-100 relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1 rounded-full border border-amber-200 uppercase tracking-widest">Sella Turcica</span>
              <span className="bg-slate-900 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest italic shadow-sm">Master Gland</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-2 tracking-tight uppercase italic flex items-center gap-3">
               <Brain size={36} className="text-amber-500" /> {PITUITARY_DATA.title}
            </h1>
            <p className="text-slate-500 font-medium max-w-2xl italic text-sm">
              Hipofiz adenomlarının yönetiminden su-elektrolit dengesine, hormon replasmanlarından genetik mutasyonlara kadar en güncel klinik yaklaşım protokolleri.
            </p>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-50 rounded-full blur-3xl opacity-60"></div>
        </div>

        {/* AKORDİYON LİSTESİ */}
        <div className="space-y-4">
          {PITUITARY_DATA.categories.map((cat) => {
            const isOpen = openCategory === cat.id;
            
            return (
              <div 
                key={cat.id} 
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm
                  ${isOpen ? 'border-amber-400 ring-4 ring-amber-50/50' : 'border-slate-100 hover:border-amber-200'}`}
              >
                <button 
                  onClick={() => setOpenCategory(isOpen ? null : cat.id)}
                  className="w-full p-5 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border transition-colors
                      ${isOpen ? 'bg-amber-500 text-white border-amber-400 shadow-md' : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-amber-50 group-hover:text-amber-500'}`}>
                      {cat.icon}
                    </div>
                    <div>
                      <h2 className={`font-black text-lg ${isOpen ? 'text-amber-700' : 'text-slate-800'}`}>{cat.title}</h2>
                      <p className="text-slate-400 text-xs font-medium">{cat.desc}</p>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-90 text-amber-500' : 'text-slate-300'}`} 
                    size={24} 
                  />
                </button>

                {isOpen && (
                  <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3 bg-amber-50/20 border-t border-amber-50">
                    {cat.items.map((item, idx) => (
                      <Link 
                        key={idx} 
                        href={item.isReady ? (item.href.startsWith('/') ? `/${lang}${item.href}` : item.href) : "#"}
                        className={`flex flex-col p-4 rounded-xl border transition-all
                          ${item.isReady 
                            ? 'bg-white border-slate-200 hover:border-amber-400 hover:shadow-md group/item' 
                            : 'bg-slate-100/50 border-transparent opacity-60 cursor-not-allowed'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.isReady ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'}`}></div>
                            <span className={`text-sm font-bold ${item.isReady ? 'text-slate-700 group-hover/item:text-amber-700' : 'text-slate-400'}`}>
                              {item.title}
                            </span>
                          </div>
                          {item.isReady && <Zap size={14} className="text-amber-400" />}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.badges.map((badge, bIdx) => (
                            <span key={bIdx} className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter
                              ${badge === 'BİRİM' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
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