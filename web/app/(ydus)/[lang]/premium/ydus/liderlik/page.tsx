// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\liderlik\page.tsx"
'use client';
import Link from 'next/link';
import { useUser } from '@/app/(ydus)/context/UserContext';
import { useMemo } from 'react';

// --- MOCK VERİTABANI (ZIRH: Statik veriler render dışında tutuldu) ---
const MOCK_LEADERS = [
  { id: '1', name: 'Dr. Barbaros', title: 'Büyük Amiral', xp: 12500, avatar: '🧔🏻‍♂️' },
  { id: '2', name: 'Dr. Piri', title: 'Koramiral', xp: 10200, avatar: '🗺️' },
  { id: '3', name: 'Dr. Turgut', title: 'Tümamiral', xp: 8900, avatar: '⚔️' },
  { id: '4', name: 'Dr. Çaka', title: 'Tuğamiral', xp: 7500, avatar: '🦅' },
  { id: '5', name: 'Dr. Salih', title: 'Kıdemli Albay', xp: 6200, avatar: '🚢' },
  { id: '6', name: 'Dr. Seydi', title: 'Yarbay', xp: 4800, avatar: '🌊' },
];

export default function LeadershipBoard() {
  const { xp } = useUser();

  // ZIRH: Sıralama işlemini useMemo ile optimize ettik (Performans zırhı)
  const allUsers = useMemo(() => {
    return [
      ...MOCK_LEADERS,
      { id: 'me', name: 'Dr. Kaptan (Sen)', title: 'Gemi Kaptanı', xp: xp, avatar: '👨‍⚕️', isMe: true }
    ].sort((a, b) => b.xp - a.xp);
  }, [xp]);

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4 sm:px-6 font-sans text-slate-100">
      <div className="max-w-4xl mx-auto">
        
        {/* Üst Navigasyon */}
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-blue-900/30 pb-6">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
            <Link href="/tr/premium/ydus" className="hover:text-blue-400 transition-colors">⚓ Mavi Vatan Lobi</Link>
            <span>/</span>
            <span className="text-slate-200">Amirallik Divanı</span>
          </div>
          
          <Link href="/tr/premium/ydus/profil" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-bold text-sm transition-all shadow-sm">
            Kaptan Siciline Dön ➡️
          </Link>
        </div>

        {/* BAŞLIK ALANI */}
        <div className="text-center mb-12 relative">
          {/* Kozmetik arka plan parlaması */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/5 blur-[100px] pointer-events-none"></div>
          
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4 uppercase tracking-tighter italic relative z-10">
            Donanma <span className="text-blue-500">Liderlik Tablosu</span>
          </h1>
          <p className="text-slate-400 font-medium relative z-10">Mavi Vatan'ın en seçkin hekimleri. Simülasyonları çöz, XP kazan, amiralliğe yüksel.</p>
        </div>

        {/* LİDERLİK LİSTESİ */}
        <div className="bg-slate-900 rounded-3xl p-4 sm:p-8 shadow-2xl border border-slate-800 relative overflow-hidden">
          
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-blue-600/10 blur-[80px] pointer-events-none"></div>

          <div className="flex flex-col gap-3 relative z-10">
            {allUsers.map((user, index) => {
              const rank = index + 1;
              
              // ZIRH: Dinamik tailwind sınıflarını güvenli objelere çevirdik
              const getRankStyles = (rankNum: number) => {
                if (rankNum === 1) return "bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]";
                if (rankNum === 2) return "bg-slate-300/10 border-slate-300/30 text-slate-300";
                if (rankNum === 3) return "bg-orange-700/10 border-orange-700/30 text-orange-500";
                return "bg-slate-800/50 text-slate-400 border-slate-700/50";
              };

              const medal = rank === 1 ? "🥇 1." : rank === 2 ? "🥈 2." : rank === 3 ? "🥉 3." : `#${rank}`;
              const rankClass = getRankStyles(rank);

              return (
                <div 
                  key={user.id} 
                  className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    user.isMe 
                      ? "border-blue-500 bg-blue-900/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] scale-[1.02] z-20" 
                      : "border-slate-800/50 hover:bg-slate-800 hover:border-slate-700"
                  }`}
                >
                  {/* Sıra / Madalya */}
                  <div className={`w-14 h-14 flex items-center justify-center font-black rounded-xl border shrink-0 ${rankClass}`}>
                    {medal}
                  </div>

                  {/* Avatar & İsim */}
                  <div className="flex-1 flex items-center gap-4 overflow-hidden">
                    <div className="w-12 h-12 rounded-full bg-slate-850 border border-slate-700 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {user.avatar}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className={`font-black text-lg truncate ${user.isMe ? 'text-blue-400' : 'text-white'}`}>
                        {user.name}
                      </h3>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest truncate">
                        {user.title}
                      </p>
                    </div>
                  </div>

                  {/* XP Puanı */}
                  <div className="text-right shrink-0">
                    <div className={`font-black text-2xl tracking-tighter ${user.isMe ? 'text-blue-400' : 'text-slate-300'}`}>
                      {user.xp.toLocaleString()}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Seyir Mili
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}