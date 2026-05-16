import Link from 'next/link';
import { FLEET_STATUS } from "../(ydus)/config/fleet";

export default function StrategyMap() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {FLEET_STATUS.map((ship) => (
        <div 
          key={ship.id} 
          className="group relative bg-slate-900/80 border border-blue-500/10 hover:border-blue-500/40 p-6 rounded-3xl backdrop-blur-md transition-all duration-500 hover:shadow-[0_20px_50px_rgba(8,_112,_184,_0.1)]"
        >
          {/* Üst Bilgi Hattı */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">
                {ship.name.toUpperCase()}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase mt-1">
                {ship.shipType} SINIFI
              </p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                {ship.status}
              </span>
            </div>
          </div>

          {/* Seyir Raporu - Telsiz Mesajı Tarzında */}
          <div className="mb-6 p-3 bg-black/40 rounded-xl border-l-2 border-blue-500/50">
            <p className="text-[11px] leading-relaxed text-slate-400 italic font-serif">
              <span className="text-blue-500 font-bold mr-1">SON RAPOR:</span> 
              "{ship.lastReport}"
            </p>
          </div>

          {/* Ana Rota Çizelgesi */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <span className="text-xs font-bold text-slate-300">
                📍 {ship.currentPort}
              </span>
              <span className="text-xl font-mono font-black text-blue-500">
                %{ship.progress}
              </span>
            </div>
            
            <div className="relative h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 via-cyan-400 to-blue-400 shadow-[0_0_15px_rgba(34,197,94,0.2)] transition-all duration-1000 ease-out"
                style={{ width: `${ship.progress}%` }}
              />
            </div>

            <div className="flex justify-between text-[9px] font-black text-slate-600 tracking-widest uppercase">
              <span className={ship.progress >= 0 ? "text-blue-900" : ""}>HOPA</span>
              <span className={ship.progress >= 50 ? "text-blue-800" : ""}>İSTANBUL</span>
              <span className={ship.progress >= 100 ? "text-blue-700" : ""}>İSKENDERUN</span>
            </div>
          </div>

          {/* KABLOLAR BAĞLANDI: Artık bu bir Link! */}
          <Link 
            href={`/tr/premium/ydus/${ship.id}`}
            className="mt-8 block w-full group/btn relative overflow-hidden py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xs transition-all active:scale-95 shadow-lg shadow-blue-900/20 text-center cursor-pointer"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              KÖPRÜÜSTÜNE GEÇ <span className="text-lg">→</span>
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
          </Link>
        </div>
      ))}
    </div>
  );
}