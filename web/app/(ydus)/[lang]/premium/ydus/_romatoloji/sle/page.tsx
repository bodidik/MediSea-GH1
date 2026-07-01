import Link from 'next/link';

export default function SleDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Üst Navigasyon */}
        <div className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 overflow-x-auto whitespace-nowrap pb-2 text-slate-500">
          <Link href="/tr/premium/ydus" className="hover:text-slate-800 transition-colors">🏠 Lobi</Link>
          <span>/</span>
          <Link href="/tr/premium/ydus/romatoloji" className="hover:text-blue-600 transition-colors">Romatoloji</Link>
          <span>/</span>
          <span className="text-slate-800 font-black">SLE</span>
        </div>

        {/* SLE Hero Bölümü */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 mb-10 shadow-lg border border-slate-200 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-blue-900 flex items-center justify-center text-5xl shrink-0 shadow-inner">🦋</div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">Multisistemik</span>
                <span className="bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">Kritik Otoimmünite</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">Sistemik Lupus Eritematozus (SLE)</h1>
              <p className="text-slate-500 font-medium max-w-2xl text-base sm:text-lg leading-relaxed">
                2019 EULAR/ACR sınıflama kriterleri, antikor profili (Anti-dsDNA, Anti-Smith) ve organ tutulumuna göre güncel tedavi algoritmaları.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-900 rounded-full blur-3xl opacity-5 pointer-events-none"></div>
        </div>

        {/* Çalışma Modülleri */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/tr/premium/ydus/flashcards?topic=sle" className="group bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🃏</div>
            <h3 className="font-bold text-slate-800 text-xl mb-2 group-hover:text-blue-700">SLE Flashcards</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 flex-1">Tanı kriterleri puanlaması, spesifik antikorlar ve ilaçla ilişkili Lupus (Anti-Histon) bilgilerini tazeleyin.</p>
            <div className="flex items-center justify-between mt-auto text-blue-600 font-black text-sm">
              <span>Hemen Başla</span> <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">➡️</span>
            </div>
          </Link>

          <Link href="/tr/premium/ydus/pearls?topic=sle" className="group bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm hover:border-purple-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">💎</div>
            <h3 className="font-bold text-slate-800 text-xl mb-2 group-hover:text-purple-700">Klinik İnciler</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 flex-1">Gebelik ve SLE yönetimi, APS eşlikçiliği ve Libman-Sacks endokarditi gibi YDUS'un sevdiği "uç" bilgiler.</p>
            <div className="flex items-center justify-between mt-auto text-purple-600 font-black text-sm">
              <span>Notları Oku</span> <span className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">➡️</span>
            </div>
          </Link>

          <Link href="/tr/premium/ydus/nefroloji/lupus-nefriti" className="group bg-slate-900 rounded-3xl p-8 border-2 border-slate-800 shadow-lg hover:shadow-blue-900/20 transition-all duration-300 hover:-translate-y-1 flex flex-col relative overflow-hidden">
             <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl z-10 uppercase">Simülasyon</div>
             <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl mb-6 relative z-10">🔬</div>
             <h3 className="font-bold text-white text-xl mb-2 relative z-10">Nefroloji Ortak Modülü</h3>
             <p className="text-slate-400 text-sm font-medium mb-8 flex-1 relative z-10">SLE'nin en ağır komplikasyonu: Lupus Nefriti vakasını yönetin.</p>
             <div className="flex items-center justify-between mt-auto text-blue-400 font-black text-sm relative z-10">
              <span>Vakaya Git</span> <span className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">➡️</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}