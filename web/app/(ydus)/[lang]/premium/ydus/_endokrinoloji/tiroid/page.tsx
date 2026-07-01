// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\endokrinoloji\tiroid\page.tsx"
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ChevronLeft, ChevronRight, Activity, Thermometer, 
  Search, AlertCircle, Microscope, Zap, ShieldAlert, Stethoscope
} from 'lucide-react';

const THYROID_DATA = {
  title: "Tiroid Gland Hastalıkları",
  parent: "Endokrinoloji",
  parentHref: "/premium/ydus/endokrinoloji",
  color: "blue", // Tiroid ana sayfası için ferah Ege mavisi
  categories: [
    {
      id: "iyot-eksikligi",
      title: "İyot Eksikliği Hastalıkları",
      icon: "🧂",
      desc: "Endemik guatr, kretinizm ve iyot profilaksisi",
      items: [
        { title: "İyot Metabolizması ve İhtiyacı", href: "#", isReady: true, badges: ["TEMEL"] },
        { title: "Kretinizm: Nörolojik ve Miksödematöz", href: "#", isReady: false, badges: ["AYIRICI TANI"] }
      ]
    },
    {
      id: "otiroid-diffuz-guatr",
      title: "Ötiroid Diffüz Guatr",
      icon: "🫁",
      desc: "Tanı, izlem ve tedavi yaklaşımları",
      items: [
        { title: "Ötiroid Guatrda USG ve İzlem Algoritması", href: "#", isReady: true, badges: ["KLİNİK"] },
        { title: "Baskılama Tedavisi (L-Tiroksin) Endikasyonları", href: "#", isReady: false, badges: ["TEDAVİ"] }
      ]
    },
    {
      id: "hipotiroidi",
      title: "Hipotiroidi (Aşikar ve Subklinik)",
      icon: "❄️",
      desc: "Primer, sekonder hipotiroidi ve L-Tiroksin replasmanı",
      items: [
        { title: "Aşikar Hipotiroidi Replasman Prensipleri", href: "#", isReady: true, badges: ["İNCİ"] },
        { title: "Subklinik Hipotiroidi: Ne Zaman Tedavi Edelim?", href: "#", isReady: true, badges: ["GÜNCEL", "SINAV"] },
        { title: "Santral (Sekonder) Hipotiroidi Tanısı", href: "#", isReady: false, badges: ["ZOR"] }
      ]
    },
    {
      id: "hipertiroidi",
      title: "Hipertiroidi ve Tirotoksikoz",
      icon: "🔥",
      desc: "Aşikar ve subklinik tirotoksikoz ayırıcı tanısı",
      items: [
        { title: "Tirotoksikoz Nedenleri ve Sintigrafi", href: "#", isReady: true, badges: ["RADYOLOJİ"] },
        { title: "Toksik Multinodüler Guatr (TMNG)", href: "#", isReady: true, badges: ["KLİNİK"] },
        { title: "Subklinik Hipertiroidi Yönetimi", href: "#", isReady: false, badges: ["KILAVUZ"] }
      ]
    },
    {
      id: "graves",
      title: "Graves Hastalığı ve Orbitopatisi",
      icon: "👁️",
      desc: "Otoimmün mekanizma, göz bulguları ve antitiroid ilaçlar",
      items: [
        { 
          title: "Graves Hastalığı & Orbitopati Ana Sayfası", 
          href: "/premium/ydus/endokrinoloji/tiroid/graves-hastaligi", 
          isReady: true, 
          badges: ["PREMİUM", "BİRİM"] 
        },
        { 
          title: "Graves Patogenezi ve TRAb (TSH-R Antikoru)", 
          href: "/premium/ydus/endokrinoloji/tiroid/graves-hastaligi", 
          isReady: true, 
          badges: ["TEMEL"] 
        },
        { 
          title: "Antitiroid İlaçlar: Yan Etkiler ve Dozaj", 
          href: "/premium/ydus/endokrinoloji/tiroid/graves-hastaligi", 
          isReady: true, 
          badges: ["FARMA", "KRİTİK"] 
        },
        { 
          title: "Graves Orbitopatisi (GO) Evreleme ve Tedavi", 
          href: "/premium/ydus/endokrinoloji/tiroid/graves-hastaligi", 
          isReady: true, 
          badges: ["UZMANLIK", "GÜNCEL"] 
        }
      ]
    },
    {
      id: "tiroid-nodulleri",
      title: "Tiroid Nodülleri",
      icon: "🔮",
      desc: "USG risk stratifikasyonu (EU-TIRADS) ve İİAB endikasyonları",
      items: [
        { 
          title: "Tiroid Nodülleri Birimi Ana Sayfası", 
          href: "/premium/ydus/endokrinoloji/tiroid/tiroid-nodulleri", // <-- Linki buraya bağladık
          isReady: true, 
          badges: ["BİRİM", "KLİNİK"] 
        }
      ]
    },
    {
      id: "tiroid-kanserleri",
      title: "Tiroid Kanserleri ve Neoplazileri",
      icon: "🔬",
      desc: "Diferansiye, Medüller, Anaplastik kanserler",
      items: [
        { title: "Papiller Tiroid Kanseri ve Varyantları", href: "#", isReady: true, badges: ["POPÜLER"] },
        { title: "Medüller Tiroid Kanseri ve RET Mutasyonu", href: "#", isReady: true, badges: ["GENETİK", "SINAV"] },
        { title: "Diferansiye Kanserlerde RAI Ablasyon Endikasyonları", href: "#", isReady: false, badges: ["GÜNCEL"] },
        { title: "Anaplastik Kanser: Agresif Seyir", href: "#", isReady: false, badges: ["ZOR"] }
      ]
    },
    {
      id: "tiroiditler",
      title: "Tiroiditler",
      icon: "🛡️",
      desc: "Akut, Subakut, Hashimoto, Postpartum, Riedel vb.",
      items: [
        // İŞTE BİR ÖNCEKİ YAZDIĞIMIZ SAYFAYA GİDEN BİRİM LİNKİ:
        { 
          title: "Tiroiditler Birimi Ana Sayfası (TEMD)", 
          href: "/premium/ydus/endokrinoloji/tiroid/tiroiditler", 
          isReady: true, 
          badges: ["BİRİM", "KLİNİK"] 
        },
        { title: "Ağrılı vs Ağrısız Tiroidit Ayırıcı Tanısı", href: "#", isReady: false, badges: ["ÖZET"] }
      ]
    },
    {
      id: "hormon-direnci",
      title: "Tiroid Hormon Direnci",
      icon: "🚧",
      desc: "TR-beta mutasyonları ve Refetoff Sendromu",
      items: [
        { title: "Refetoff Sendromu Tanı Kriterleri", href: "#", isReady: true, badges: ["NADİR VAKA"] },
        { title: "TSHoma ile Hormon Direnci Ayırıcı Tanısı", href: "#", isReady: false, badges: ["TUZAK", "ZOR"] }
      ]
    },
    {
      id: "otiroid-hasta",
      title: "Tiroid Dışı Hastalık Sendromu",
      icon: "📉",
      desc: "Ötiroid Hasta Sendromu (Euthyroid Sick Syndrome)",
      items: [
        { title: "Düşük T3 Sendromu Patofizyolojisi", href: "#", isReady: true, badges: ["YOĞUN BAKIM"] },
        { title: "Kritik Hastalarda Tiroid Fonksiyon Testleri", href: "#", isReady: false, badges: ["İSTİHBARAT"] }
      ]
    },
    {
      id: "gebelik-tiroid",
      title: "Gebelikte Tiroid Hastalıkları",
      icon: "🤰",
      desc: "Gebelikte hipotiroidi, hipertiroidi ve hCG etkisi",
      items: [
        { title: "Gebelikte Değişen TSH Referans Aralıkları", href: "#", isReady: true, badges: ["GÜNCEL"] },
        { title: "Gestasyonel Geçici Tirotoksikoz vs Graves", href: "#", isReady: true, badges: ["AYIRICI TANI"] },
        { title: "Gebelikte Antitiroid İlaç Seçimi (PTU vs MMİ)", href: "#", isReady: false, badges: ["KRİTİK"] }
      ]
    },
    {
      id: "tiroid-acilleri",
      title: "Tiroid Acilleri",
      icon: "🚑",
      desc: "Tiroid Krizi (Fırtınası) ve Miksödem Koması",
      items: [
        { title: "Tiroid Fırtınası Burch-Wartofsky Skoru", href: "#", isReady: true, badges: ["HAYAT KURTARICI"] },
        { title: "Tiroid Fırtınasında Çoklu İlaç Yönetimi", href: "#", isReady: true, badges: ["ACİL"] },
        { title: "Miksödem Koması: Hipotermi ve Hiponatremi", href: "#", isReady: false, badges: ["KOKPİT"] }
      ]
    }
  ]
};

export default function ThyroidMainPage() {
  const params = useParams();
  const lang = params?.lang || 'tr';
  // Sayfa ilk açıldığında "Hipotiroidi" açık gelsin
  const [openCategory, setOpenCategory] = useState<string | null>("hipotiroidi");

  return (
    <div className="min-h-screen bg-[#f0f7ff] py-8 px-4 sm:px-6 font-sans text-slate-800 relative">
      
      {/* 1. ÜST NAVİGASYON (Geri Dönüş) */}
      <div className="max-w-5xl mx-auto mb-6 flex items-center justify-between">
        <Link 
          href={`/${lang}${THYROID_DATA.parentHref}`}
          className="flex items-center gap-2 text-blue-600 font-black text-sm hover:text-blue-800 transition-colors group"
        >
          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:-translate-x-1 transition-transform">
            <ChevronLeft size={18} />
          </div>
          {THYROID_DATA.parent} Ana Karargahına Dön
        </Link>
      </div>

      <main className="max-w-5xl mx-auto">
        
        {/* 2. HEADER KARTI */}
        <div className="bg-white rounded-3xl p-8 mb-8 border border-blue-100 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full border border-blue-200 uppercase tracking-widest shadow-sm">Organ İncelemesi</span>
              <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-200 uppercase tracking-widest shadow-sm">TEMD Kılavuzu</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-2 tracking-tight uppercase italic flex items-center gap-3">
               <Thermometer size={36} className="text-blue-500" /> {THYROID_DATA.title}
            </h1>
            <p className="text-slate-500 font-medium max-w-2xl leading-relaxed italic text-sm">
              Nodüllerden acillere, otoimmüniteden gebelik takibine kadar Türkiye Endokrinoloji ve Metabolizma Derneği standartlarındaki güncel klinik yönetim algoritmaları.
            </p>
          </div>
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-60"></div>
        </div>

        {/* 3. KATEGORİ LİSTESİ (Akordiyon) */}
        <div className="space-y-4">
          {THYROID_DATA.categories.map((cat) => {
            const isOpen = openCategory === cat.id;
            
            return (
              <div 
                key={cat.id} 
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden shadow-sm
                  ${isOpen ? 'border-blue-400 ring-4 ring-blue-50/50' : 'border-slate-100 hover:border-blue-200'}`}
              >
                <button 
                  onClick={() => setOpenCategory(isOpen ? null : cat.id)}
                  className="w-full p-5 flex items-center justify-between text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border transition-colors
                      ${isOpen ? 'bg-blue-500 text-white border-blue-400' : 'bg-slate-50 text-slate-400 border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                      {cat.icon}
                    </div>
                    <div>
                      <h2 className={`font-black text-lg ${isOpen ? 'text-blue-600' : 'text-slate-800'}`}>{cat.title}</h2>
                      <p className="text-slate-400 text-xs font-medium">{cat.desc}</p>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`transition-transform duration-300 ${isOpen ? 'rotate-90 text-blue-500' : 'text-slate-300'}`} 
                    size={24} 
                  />
                </button>

                {isOpen && (
                  <div className="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50/50 border-t border-slate-50">
                    {cat.items.map((item, idx) => (
                      <Link 
                        key={idx} 
                        // Eğer link / ile başlıyorsa dil prefixini ekle, yoksa # olarak bırak
                        href={item.isReady ? (item.href.startsWith('/') ? `/${lang}${item.href}` : item.href) : "#"}
                        className={`flex flex-col p-4 rounded-xl border transition-all
                          ${item.isReady 
                            ? 'bg-white border-slate-200 hover:border-blue-400 hover:shadow-md group/item' 
                            : 'bg-slate-100/50 border-transparent opacity-60 cursor-not-allowed'}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.isReady ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`}></div>
                            <span className={`text-sm font-bold ${item.isReady ? 'text-slate-700 group-hover/item:text-blue-600' : 'text-slate-400'}`}>
                              {item.title}
                            </span>
                          </div>
                          {item.isReady && <Zap size={14} className="text-amber-400 opacity-0 group-hover/item:opacity-100 transition-opacity" />}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {item.badges.map((badge, bIdx) => (
                            <span key={bIdx} className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-tighter
                              ${badge === 'BİRİM' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}>
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