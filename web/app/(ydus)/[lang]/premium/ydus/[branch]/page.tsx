// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\[branch]\page.tsx"
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

// --- HASTALIK ODAKLI BRANŞ VERİTABANI ---
const BRANCH_DATA: Record<string, any> = {
  hematoloji: {
    title: "Hematoloji",
    shipClass: "Amiral Gemisi",
    port: "Karadeniz Suları",
    color: "rose",
    icon: "🩸",
    categories: [
      {
        id: "cat_losemiler",
        title: "Lösemiler",
        desc: "Akut ve Kronik Lösemiler, Blastik Kriz",
        icon: "🧬",
        items: [
          { title: "AML Mega Deneme Sınavı", href: "/tr/premium/ydus/quiz-coz?branch=hematoloji&id=aml-quiz-1", isReady: true, badges: ["POPÜLER", "ZOR"] },
          { title: "AML Klinik Vaka Simülasyonu", href: "/tr/premium/ydus/soru-cozum?branch=hematoloji&id=case-aml-fit", isReady: true, badges: ["KOKPİT"] },
          { title: "AML Tıbbi İstihbarat (İnciler)", href: "/tr/premium/ydus/inciler?branch=hematoloji&id=aml", isReady: true, badges: ["HAYAT KURTARICI"] },
          { title: "AML Taktiksel Hızlı Tekrar", href: "/tr/premium/ydus/hizli-tekrar?branch=hematoloji&id=aml", isReady: true, badges: ["3D KART"] },
          { title: "Kronik Miyeloid Lösemi (KML)", href: "/tr/premium/ydus/hematoloji/kml", isReady: true, badges: ["YENİ", "İSTİHBARAT"] },
          { title: "Akut Lenfoblastik Lösemi (ALL)", href: "#", isReady: false, badges: ["YENİ"] },
          { title: "Kronik Lenfositik Lösemi (KLL)", href: "#", isReady: false, badges: ["YENİ"] }
        ]
      },
      {
        id: "cat_lenfomalar",
        title: "Lenfomalar",
        desc: "Hodgkin, Non-Hodgkin ve Evreleme Sistemleri",
        icon: "🦠",
        items: [
          { title: "Lenfoma Karma Deneme Sınavı", href: "#", isReady: false, badges: ["YAKINDA"] }
        ]
      },
      {
        id: "cat_kanama",
        title: "Kanama ve Pıhtılaşma Bozuklukları",
        desc: "ITP, TTP, Hemofili ve Tromboz Yönetimi",
        icon: "💉",
        items: [
          { title: "DİC ve Koagülopati Vakaları", href: "#", isReady: false, badges: ["HAZIRLANIYOR"] }
        ]
      }
    ]
  },
  romatoloji: {
    title: "Romatoloji",
    shipClass: "Fırkateyn",
    port: "Akdeniz Suları",
    color: "emerald",
    icon: "🦴",
    categories: [
      {
        id: "cat_otoenflamatuar",
        title: "Otoenflamatuar Sendromlar",
        desc: "FMF, TRAPS ve Periyodik Ateş Sendromları",
        icon: "🔥",
        items: [
          { title: "Ailesel Akdeniz Ateşi (FMF)", href: "/tr/premium/ydus/romatoloji/fmf", isReady: true, badges: ["POPÜLER", "İSTİHBARAT"] },
          { title: "FMF Klinik Vaka Simülasyonu", href: "#", isReady: false, badges: ["KOKPİT"] },
          { title: "FMF İncileri", href: "/tr/premium/ydus/inciler?branch=romatoloji&id=fmf", isReady: true, badges: ["HAYAT KURTARICI"] }
        ]
      },
      {
        id: "cat_vaskulitler",
        title: "Sistemik Vaskülitler",
        desc: "Büyük, Orta ve Küçük Damar Vaskülitleri",
        icon: "🩸",
        items: [
          { title: "ANCA İlişkili Vaskülitler", href: "#", isReady: false, badges: ["HAZIRLANIYOR"] }
        ]
      }
    ]
  }
};

export default function BranchDeck() {
  const params = useParams();
  const branchSlug = (params.branch as string) || '';
  
  // Branş bulunamadıysa gösterilecek özel radar ekranı
  if (!BRANCH_DATA[branchSlug]) {
    return (
      <div className="min-h-[80vh] bg-[#0a0f1c] flex flex-col items-center justify-center p-6 text-slate-100 font-sans">
        <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-slate-700 rounded-full animate-ping opacity-30"></div>
          <div className="absolute inset-4 border-2 border-slate-600 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.1)]"></div>
          <div className="text-5xl z-10">🧭</div>
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-3">Bilinmeyen Sular</h1>
        <p className="text-slate-300 font-medium mb-8 text-center max-w-md text-sm">
          <span className="text-blue-400 font-mono font-bold tracking-widest">[{branchSlug}]</span> rotasında herhangi bir tıbbi birlik tespit edilemedi. Seyir defterini kontrol edin.
        </p>
        <Link href="/tr/premium/ydus" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] uppercase tracking-[0.2em] text-xs">
          Ana Üsse Dön ⚓
        </Link>
      </div>
    );
  }

  const data = BRANCH_DATA[branchSlug];

  const [openCategory, setOpenCategory] = useState<string | null>(
    data.categories.length > 0 ? data.categories[0].id : null
  );

  const toggleCategory = (id: string) => {
    setOpenCategory(prev => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-[#0a0f1c] py-8 px-4 sm:px-6 font-sans text-slate-100 selection:bg-blue-500/30">
      <div className="max-w-5xl mx-auto">
        
        {/* Üst Navigasyon (Yüksek Kontrast) */}
        <div className="mb-8 flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-2 text-xs font-black text-slate-500 tracking-widest uppercase">
            <Link href="/tr/premium/ydus" className="hover:text-blue-400 transition-colors">⚓ Lobi</Link>
            <span>/</span>
            <span className={`text-${data.color}-400`}>{data.title}</span>
          </div>
          <Link href="/tr/premium/ydus" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-black text-[10px] transition-all border border-slate-700 shadow-lg uppercase tracking-[0.2em]">
            Açık Denize Dön ↩
          </Link>
        </div>

        {/* HERO BÖLÜMÜ (Neon Gölgeli ve Berrak) */}
        <div className={`bg-slate-900 rounded-3xl p-6 sm:p-10 mb-8 shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-${data.color}-900/50 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center gap-6`}>
          <div className={`w-20 h-20 rounded-2xl bg-slate-950 flex items-center justify-center text-5xl shrink-0 border border-slate-800 shadow-[0_0_15px_rgba(255,255,255,0.05)] z-10`}>
            {data.icon}
          </div>
          <div className="relative z-10 flex-1">
            <span className={`inline-block px-3 py-1 mb-3 text-[10px] font-black tracking-[0.3em] uppercase bg-${data.color}-900/20 text-${data.color}-400 border border-${data.color}-500/30 rounded-lg shadow-sm`}>
              {data.shipClass} SINIFI
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight italic uppercase">
              {data.title} İndeksi
            </h1>
            <p className="text-slate-300 font-medium text-sm sm:text-base max-w-2xl">
              İlgilendiğiniz hastalık grubunu seçerek görevleri ve istihbarat dosyalarını görüntüleyin.
            </p>
          </div>
          <div className={`absolute -bottom-16 -right-16 w-64 h-64 bg-${data.color}-600 rounded-full blur-[100px] opacity-15 pointer-events-none`}></div>
        </div>

        {/* AKORDİYON LİSTESİ (Berrak Yazılar ve Net Sınırlar) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.categories.map((cat: any) => {
            const isOpen = openCategory === cat.id;
            
            return (
              <div 
                key={cat.id} 
                className={`bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col shadow-lg
                  ${isOpen ? `border-${data.color}-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)] ring-1 ring-${data.color}-500/20` : 'border-slate-800 hover:border-slate-700'}
                `}
              >
                <div 
                  onClick={() => toggleCategory(cat.id)}
                  className="p-5 flex items-center justify-between cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-colors border
                      ${isOpen ? `bg-${data.color}-900/30 border-${data.color}-500/30` : 'bg-slate-950 border-slate-800 group-hover:bg-slate-800'}
                    `}>
                      {cat.icon}
                    </div>
                    <div>
                      <h2 className={`font-black text-lg transition-colors ${isOpen ? `text-${data.color}-400` : 'text-slate-200 group-hover:text-white'}`}>
                        {cat.title}
                      </h2>
                      <p className="text-slate-400 text-[11px] font-medium mt-0.5">{cat.desc}</p>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 
                    ${isOpen ? `bg-${data.color}-900/30 text-${data.color}-400 rotate-180 border border-${data.color}-500/30` : 'bg-slate-950 text-slate-500 border border-slate-800 group-hover:text-slate-300'}
                  `}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Kusursuz Esneyen Akordiyon İçeriği */}
                <div 
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                >
                  <div className="overflow-hidden">
                    <div className="p-4 pt-0 flex flex-col gap-3 bg-slate-950 border-t border-slate-800 mt-1">
                      {cat.items.map((item: any, idx: number) => (
                        <Link 
                          key={idx}
                          href={item.href}
                          className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all mt-2
                            ${item.isReady 
                              ? `bg-slate-900 border-slate-800 hover:border-${data.color}-500/50 hover:bg-slate-800 group cursor-pointer shadow-sm` 
                              : 'bg-transparent border-slate-900 opacity-60 cursor-not-allowed'}
                          `}
                        >
                          <div className="flex items-center gap-3 mb-3 sm:mb-0">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${item.isReady ? `bg-${data.color}-500 text-${data.color}-500 shadow-[0_0_10px_currentColor] animate-pulse` : 'bg-slate-600'}`}></span>
                            <span className={`font-black text-xs uppercase tracking-tight ${item.isReady ? `text-slate-200 group-hover:text-white` : 'text-slate-500'}`}>
                              {item.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 pl-5 sm:pl-0 flex-wrap">
                            {item.badges.map((badge: string, bIdx: number) => {
                              let badgeStyle = "bg-slate-900 text-slate-400 border-slate-800";
                              if (badge === 'POPÜLER') badgeStyle = "bg-blue-900/30 text-blue-400 border-blue-500/30";
                              if (badge === 'ZOR' || badge === 'KOKPİT') badgeStyle = "bg-red-900/30 text-red-400 border-red-500/30";
                              if (badge === 'HAYAT KURTARICI' || badge === 'İSTİHBARAT') badgeStyle = "bg-yellow-900/30 text-yellow-400 border-yellow-500/30";
                              if (badge === '3D KART') badgeStyle = "bg-purple-900/30 text-purple-400 border-purple-500/30";
                              if (badge === 'YENİ') badgeStyle = "bg-emerald-900/30 text-emerald-400 border-emerald-500/30";
                              
                              return (
                                <span 
                                  key={bIdx} 
                                  className={`text-[9px] font-black px-2.5 py-1 rounded border tracking-widest uppercase ${badgeStyle}`}
                                >
                                  {badge}
                                </span>
                              );
                            })}
                          </div>
                        </Link>
                      ))}
                    </div>
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