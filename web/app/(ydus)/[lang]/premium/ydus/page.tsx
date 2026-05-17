// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\page.tsx"
'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation'; // Link hatasını çözmek için eklendi
import { 
  Anchor, Target, ChevronRight, Navigation, Zap, Layers, Ship, MapPin 
} from 'lucide-react';
import PlanBadge from "@/components/PlanBadge";

import { useUser } from "@/app/(ydus)/context/UserContext";

// --- YDUS FİLO VERİTABANI ---
const FLEET_STATUS = [
  { 
    id: 'endokrinoloji', 
    name: 'Endokrinoloji', 
    shipType: 'Galleon', 
    currentPort: 'İzmir', 
    lastReport: 'Diyabet ve Tiroid ikmali tamamlandı.',
    progress: 65,
    status: 'HAZIR'
  },
  { 
    id: 'hematoloji', 
    name: 'Hematoloji', 
    shipType: 'Sandal', 
    currentPort: 'Hopa', 
    lastReport: 'Anemiler için demir alındı, rota Trabzon.',
    progress: 5,
    status: 'HAZIR'
  },
  { 
    id: 'gastroenteroloji', 
    name: 'Gastroenteroloji', 
    shipType: 'Fırkateyn', 
    currentPort: 'İstanbul', 
    lastReport: 'İstihbarat henüz toplanmadı.',
    progress: 0,
    status: 'İKMAL BEKLENİYOR'
  },
  { 
    id: 'kardiyoloji', 
    name: 'Kardiyoloji', 
    shipType: 'Fırkateyn', 
    currentPort: 'Samsun', 
    lastReport: 'İstihbarat henüz toplanmadı.',
    progress: 0,
    status: 'İKMAL BEKLENİYOR'
  },
  { 
    id: 'romatoloji', 
    name: 'Romatoloji', 
    shipType: 'Galleon', 
    currentPort: 'Akdeniz Suları', 
    lastReport: 'Vakalar Mersin\'e sevk edildi.',
    progress: 0,
    status: 'HAZIRLANIYOR'
  },
  { 
    id: 'tibbi_onkoloji', 
    name: 'Tıbbi Onkoloji', 
    shipType: 'Kruvazör', 
    currentPort: 'Yunan Adaları', 
    lastReport: 'İlaç ikmali yapılıyor.',
    progress: 0,
    status: 'HAZIRLANIYOR'
  },
  { 
    id: 'enfeksiyon', 
    name: 'Enfeksiyon Hastalıkları', 
    shipType: 'Korvet', 
    currentPort: 'Boğaz Girişi', 
    lastReport: 'Sınır kontrolleri yapılıyor.',
    progress: 0,
    status: 'İKMAL BEKLENİYOR'
  },
  { 
    id: 'gogus_hastaliklari', 
    name: 'Göğüs Hastalıkları', 
    shipType: 'Devriye Gemisi', 
    currentPort: 'Ege Denizi', 
    lastReport: 'Hava sahası temiz.',
    progress: 0,
    status: 'İKMAL BEKLENİYOR'
  }
];

export default function YdusMainDashboard() {
  const { user } = useUser() as any;
  const params = useParams();
  const lang = params?.lang || 'tr'; // Mevcut dili alıyoruz (tr, en vs.)
  const plan = (user?.plan ?? "free") as "free" | "member" | "premium";
  
  const READY_BRANCHES = ['hematoloji', 'endokrinoloji', 'romatoloji'];

  const branchColorMap: Record<string, string> = {
    endokrinoloji: 'orange', // Gün Batımı Turuncusu
    hematoloji: 'rose',      // Gül Kurusu
    romatoloji: 'emerald',   // Ferah Yeşillik
    tibbi_onkoloji: 'violet', 
    enfeksiyon: 'teal',      
    gogus_hastaliklari: 'cyan', 
    slate: 'slate' 
  };

  return (
    <div className="min-h-screen bg-[#f0f7ff] py-8 px-4 sm:px-6 font-sans text-slate-800 selection:bg-blue-200 overflow-x-hidden relative">
      
      {/* 1. ÜST HEADER PANELİ */}
      <div className="border-b border-blue-100 bg-white/70 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-[0_4px_10px_rgba(59,130,246,0.3)]">
              <Anchor size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-black tracking-tighter text-slate-800 uppercase italic leading-none">Deniz</h1>
              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-1">Komuta Merkezi</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <PlanBadge plan={plan} />
            <Link href={`/${lang}/premium/ydus/profil`} className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center hover:bg-blue-100 transition-all shadow-sm group">
              <span className="group-hover:scale-110 transition-transform text-lg">👨‍⚕️</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-8 z-10 relative">
        
        {/* 2. PREMIUM HERO BÖLÜMÜ */}
        <div className="bg-white rounded-3xl p-8 mb-8 border border-blue-100 relative overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full border border-blue-200 uppercase tracking-[0.2em] shadow-sm">YDUS İstihbarat</span>
              <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1 rounded-full border border-amber-200 uppercase tracking-[0.2em] shadow-sm">Açık Deniz Seferi</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 mb-2 tracking-tight uppercase italic flex items-center gap-2">
               HEKİM <span className="text-blue-600">Komuta</span> Merkezi
            </h1>
            <p className="text-slate-500 font-medium max-w-2xl leading-relaxed italic text-sm sm:text-base">
              Hoş geldin Kaptan. YDUS seferi için filolar açık denizde. İstihbarat dosyalarını ve vaka simülasyonlarını güverteden yönetebilirsin.
            </p>
          </div>
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-gradient-to-tl from-cyan-400 to-blue-600 rounded-full blur-[80px] opacity-70 pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-amber-200 rounded-full blur-[60px] opacity-30 pointer-events-none" />
        </div>

        {/* 3. STRATEJİ HARİTASI (FLEET STATUS) */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6 border-l-4 border-blue-500 pl-4">
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Aktif Konu Durumu</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Branş Bazlı İlerleme Raporu</p>
            </div>
            <Link href={`/${lang}/premium/ydus/liderlik`} className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-black text-[10px] transition-all border border-slate-200 shadow-sm uppercase tracking-[0.2em] flex items-center gap-2">
              Liderlik Tablosu <span className="text-sm">🏆</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FLEET_STATUS.map((ship) => {
              const isReady = READY_BRANCHES.includes(ship.id);
              const branchColor = branchColorMap[ship.id] || branchColorMap.slate;
              
              return (
                <div key={ship.id} className={`group ${!isReady ? 'grayscale-[40%] opacity-70' : ''}`}>
                  {/* Kart Yüksekliği h-[310px] yapıldı ki buton ferahlasın */}
                  <div className={`relative overflow-hidden rounded-3xl transition-all duration-500 flex flex-col h-[310px] shadow-[0_8px_30px_rgba(0,0,0,0.04)] border bg-white
                    ${isReady 
                        ? `border-${branchColor}-200 bg-gradient-to-t from-${branchColor}-50 via-white to-white hover:border-${branchColor}-400 hover:shadow-[0_15px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1` 
                        : 'border-slate-200 bg-gradient-to-t from-slate-50 via-white to-white'}`}>
                    
                    <div className={`h-2 w-full transition-colors ${isReady ? `bg-${branchColor}-500` : 'bg-slate-300'}`}></div>

                    <div className={`absolute -bottom-4 -right-4 pointer-events-none transform -rotate-12 transition-transform duration-700 group-hover:scale-110
                      ${isReady ? `opacity-[0.05] text-${branchColor}-900` : 'opacity-[0.03] text-slate-900'}`}>
                      <Ship size={140} />
                    </div>

                    <div className="p-5 flex flex-col h-full relative z-10">
                      
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm border
                            ${isReady ? `bg-${branchColor}-50 text-${branchColor}-600 border-${branchColor}-100` : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                            {isReady ? <Navigation size={22} /> : <Anchor size={22} />}
                          </div>
                          <div>
                            <h3 className={`text-lg font-black ${isReady ? 'text-slate-800' : 'text-slate-500'} leading-tight`}>{ship.name}</h3>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{ship.shipType}</span>
                          </div>
                        </div>
                        <div className={`px-3 py-1.5 rounded-xl text-xs font-black border shadow-sm
                          ${isReady ? `bg-${branchColor}-50 text-${branchColor}-700 border-${branchColor}-200` : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          %{isReady ? ship.progress : 0}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={14} className={isReady ? `text-${branchColor}-500` : 'text-slate-400'} />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Liman: <span className="text-slate-700">{ship.currentPort}</span></span>
                        </div>
                        <div className="bg-slate-50/80 backdrop-blur-sm p-3 rounded-xl border border-slate-100 shadow-sm min-h-[60px]">
                          <p className="text-[10px] font-medium text-slate-600 line-clamp-2 italic">
                            {isReady ? `"${ship.lastReport}"` : "İstihbarat henüz toplanmadı."}
                          </p>
                        </div>
                      </div>

                      {/* BUTON: Kartın en dibine mt-auto ile sabitlendi */}
                      <div className="mt-auto pt-4 border-t border-slate-100/80">
                        {isReady ? (
                          <Link 
                            href={`/${lang}/premium/ydus/${ship.id}`}
                            className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-${branchColor}-500 hover:bg-${branchColor}-600 text-white text-[10px] font-black transition-all uppercase tracking-[0.2em] shadow-md hover:shadow-lg`}
                          >
                            Konuya Gir 🏁
                          </Link>
                        ) : (
                          <button disabled className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border border-slate-200 cursor-not-allowed">
                            Yakında Açılacak <Anchor size={14} />
                          </button>
                        )}
                      </div>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. HIZLI ERİŞİM */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative">
           
           <div className="bg-white rounded-3xl p-8 border border-blue-100 relative overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(59,130,246,0.1)] transition-all">
              <div className="absolute -top-4 -right-4 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <span className="text-9xl">💎</span>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-[50px] opacity-50 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight italic">Tıbbi İstihbarat</h3>
                  <p className="text-slate-500 text-sm mb-8 max-w-sm leading-relaxed font-medium prose-strong:text-slate-800 prose-strong:font-black">En güncel YDUS kılavuzları, klinik inciler ve <strong>çelişkili konularla</strong> donanımınızı artırın.</p>
                </div>
                <Link href={`/${lang}/premium/ydus/inciler?branch=hematoloji&id=aml`} className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-[0.2em] hover:text-blue-800 transition-colors bg-blue-50 self-start px-4 py-2 rounded-lg border border-blue-100">
                  İncileri Keşfet <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
           </div>

           <div className="bg-gradient-to-br from-cyan-50 to-white rounded-3xl p-8 border border-cyan-100 relative overflow-hidden group shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(6,182,212,0.15)] transition-all">
              <div className="absolute -top-4 -right-4 p-8 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                <span className="text-9xl">🕹️</span>
              </div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-200 rounded-full blur-[50px] opacity-30 pointer-events-none"></div>

              <div className="relative z-10 flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight italic">Vaka Simülasyonu</h3>
                  <p className="text-slate-500 text-sm mb-8 max-w-sm leading-relaxed font-medium">Gerçek klinik senaryolarda hayat kurtaran kararlar verin ve krizleri yönetin.</p>
                </div>
                <Link href={`/${lang}/premium/ydus/soru-cozum?branch=hematoloji&id=case-aml-fit`} className="inline-flex items-center gap-2 text-cyan-700 font-bold text-xs uppercase tracking-[0.2em] hover:text-cyan-900 transition-colors bg-cyan-100/50 self-start px-4 py-2 rounded-lg border border-cyan-200">
                  Simülasyona Başla <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
           </div>

        </div>

      </main>
    </div>
  );
}