// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\profil\page.tsx"
'use client';
import Link from 'next/link';
import { useUser } from '@/app/(ydus)/context/UserContext';

// --- SABİT KULLANICI BİLGİLERİ (ZIRH: Tailwind renkleri tam string olarak eklendi) ---
const STATIC_USER_DATA = {
  name: "Dr. Kaptan",
  title: "Kıdemli Asistan",
  streak: 12, 
  branches: [
    { name: "Hematoloji", colorText: "text-rose-400", colorBg: "bg-rose-500", progress: 85, icon: "🩸" },
    { name: "Nefroloji", colorText: "text-emerald-400", colorBg: "bg-emerald-500", progress: 40, icon: "🫘" },
    { name: "Gastroenteroloji", colorText: "text-orange-400", colorBg: "bg-orange-500", progress: 60, icon: "🩺" },
    { name: "Endokrinoloji", colorText: "text-purple-400", colorBg: "bg-purple-500", progress: 25, icon: "🦋" },
  ]
};

// --- TÜM ROZETLERİN VERİTABANI (ZIRH: Tam string renk sınıfları eklendi) ---
const ALL_BADGES = {
  'lupus_fatihi': { 
    title: "Lupus Fatihi", desc: "Lupus Nefriti vakasını hatasız çözdü.", icon: "🐺", 
    bgClass: "bg-blue-500/20", borderClass: "border-blue-500/30" 
  },
  'varis_ustasi': { 
    title: "Kanama Ustası", desc: "Varis kanamasını anında durdurdu.", icon: "🩸", 
    bgClass: "bg-red-500/20", borderClass: "border-red-500/30" 
  },
  'dka_kaptani': { 
    title: "DKA Kaptanı", desc: "Asidozu potasyumu düşürmeden yönetti.", icon: "⚖️", 
    bgClass: "bg-purple-500/20", borderClass: "border-purple-500/30" 
  },
};

export default function ProfileDashboard() {
  const { xp, completedModules, badges } = useUser();

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 font-sans text-slate-100">
      <div className="max-w-5xl mx-auto">
        
        {/* Üst Navigasyon */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
            <Link href="/tr/premium/ydus" className="hover:text-blue-400 transition-colors">⚓ Mavi Vatan Lobi</Link>
            <span>/</span>
            <span className="text-slate-200">Kaptan Sicil Kaydı</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Link href="/tr/premium/ydus" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm">
              Köprüüstüne Dön ➡️
            </Link>
            <Link href="/tr/premium/ydus/liderlik" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2">
              <span>🏆</span> Liderlik Tablosu
            </Link>
          </div>
        </div>

        {/* 1. PROFİL HERO KARTI */}
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-10 mb-8 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-8 border border-blue-900/30">
          <div className="relative">
            <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-400 p-1 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-800 rounded-full flex items-center justify-center text-5xl border-4 border-slate-900">
                👨‍⚕️
              </div>
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-slate-900 text-xs font-black px-3 py-1 rounded-full border-2 border-slate-900 shadow-sm">
              LEVEL {Math.floor(xp / 500) + 1}
            </div>
          </div>
          
          <div className="text-center sm:text-left flex-1 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">{STATIC_USER_DATA.name}</h1>
            <p className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-6">{STATIC_USER_DATA.title}</p>
            
            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
              <div className="bg-black/40 px-4 py-3 rounded-2xl border border-white/5">
                <span className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Seyir Mili (XP)</span>
                <span className="text-2xl font-black text-yellow-400">{xp} <span className="text-sm text-slate-500">nm</span></span>
              </div>
              <div className="bg-black/40 px-4 py-3 rounded-2xl border border-white/5">
                <span className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Ateş Serisi</span>
                <span className="text-2xl font-black text-orange-500">{STATIC_USER_DATA.streak} <span className="text-sm text-slate-500">GÜN 🔥</span></span>
              </div>
              <div className="bg-black/40 px-4 py-3 rounded-2xl border border-white/5">
                <span className="block text-slate-400 text-[10px] font-bold uppercase mb-1">Bitirilen Modül</span>
                <span className="text-2xl font-black text-emerald-400">{completedModules.length} <span className="text-sm text-slate-500">ADET 📚</span></span>
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 2. BRANŞ İLERLEME DURUMU */}
          <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-800">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">📈</span> Branş Hakimiyeti
            </h2>
            <div className="flex flex-col gap-6">
              {STATIC_USER_DATA.branches.map((branch, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-end mb-2">
                    <div className="flex items-center gap-2 font-bold text-slate-300">
                      <span>{branch.icon}</span> {branch.name}
                    </div>
                    {/* ZIRH: Dinamik tailwind sorunu çözüldü */}
                    <span className={`text-sm font-black ${branch.colorText}`}>%{branch.progress}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
                    <div 
                      className={`${branch.colorBg} h-full rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${branch.progress}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3. ROZETLER VE BAŞARILAR */}
          <div className="bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-800">
            <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🏆</span> Rozetler
            </h2>
            
            {badges.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl block mb-3 opacity-50">🛡️</span>
                <p className="text-slate-500 text-sm font-medium">Henüz rozet kazanmadınız. Simülasyonları çözerek koleksiyonu tamamlayın!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {badges.map((badgeId) => {
                  const badgeInfo = ALL_BADGES[badgeId as keyof typeof ALL_BADGES];
                  if (!badgeInfo) return null;
                  
                  return (
                    <div key={badgeId} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:shadow-md transition-all group">
                      {/* ZIRH: Rozet renkleri güvenli hale getirildi */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 border group-hover:scale-110 transition-transform ${badgeInfo.bgClass} ${badgeInfo.borderClass}`}>
                        {badgeInfo.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-200 text-sm mb-0.5">{badgeInfo.title}</h3>
                        <p className="text-[10px] text-slate-400 font-medium leading-snug">{badgeInfo.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {badges.length > 0 && (
              <div className="mt-6 text-center">
                <button className="text-xs font-bold text-slate-500 hover:text-slate-300 uppercase tracking-widest transition-colors">
                  Tüm Rozetleri Gör ▾
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}