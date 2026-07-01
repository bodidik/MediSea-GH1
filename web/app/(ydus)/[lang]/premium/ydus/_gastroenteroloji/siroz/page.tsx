import Link from 'next/link';

export default function SirozDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/tr/premium/ydus" className="hover:text-slate-800 transition-colors">🏠 Lobi</Link>
          <span>/</span>
          <Link href="/tr/premium/ydus/gastroenteroloji" className="hover:text-orange-600 transition-colors">Gastroenteroloji</Link>
          <span>/</span>
          <span className="text-slate-800 font-black">Siroz</span>
        </div>

        {/* Siroz Hero Bölümü */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 mb-10 shadow-lg border border-slate-200 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-orange-600 flex items-center justify-center text-5xl shrink-0 shadow-inner">🧪</div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">Portal Hipertansiyon</span>
                <span className="bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">Kritik Yönetim</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">Karaciğer Sirozu ve Komplikasyonları</h1>
              <p className="text-slate-500 font-medium max-w-2xl text-base sm:text-lg leading-relaxed">
                Child-Pugh ve MELD skorlamasından, özofagus varis kanaması, asit, SBP ve hepatorenal sendrom (HRS) yönetimine kadar tüm kritik basamaklar.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-orange-500 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
        </div>

        {/* Çalışma Modülleri */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Vaka Simülatörü - Yeni Nesil Modül */}
          <Link href="/tr/premium/ydus/gastroenteroloji/siroz/vaka-kokpiti" className="group bg-slate-900 rounded-3xl p-8 border-2 border-slate-800 shadow-xl hover:shadow-orange-900/20 transition-all duration-300 hover:-translate-y-1 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl z-10">İNTERAKTİF</div>
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform relative z-10 text-white">🕹️</div>
            <h3 className="font-bold text-white text-xl mb-2 relative z-10">Varis Kanaması Kokpiti</h3>
            <p className="text-slate-400 text-sm font-medium mb-8 flex-1 relative z-10">Hematemez ile gelen sirotik hastayı acil serviste yönetin. Terlipressin mi, Bant ligasyonu mu? Karar sizin.</p>
            <div className="flex items-center justify-between mt-auto relative z-10 text-orange-400 font-black text-sm">
              <span>Simülasyonu Başlat</span> <span className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center group-hover:bg-orange-400 transition-colors">➡️</span>
            </div>
          </Link>

          {/* İnciler Kartı */}
          <Link href="/tr/premium/ydus/pearls?topic=siroz" className="group bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm hover:border-purple-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform text-white">💎</div>
            <h3 className="font-bold text-slate-800 text-xl mb-2 group-hover:text-purple-700">Hepatoloji İncileri</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 flex-1">SAAG gradyenti, SBP tanı kriterleri ve HRS'de albumin-terlipressin kullanımı üzerine spot bilgiler.</p>
            <div className="flex items-center justify-between mt-auto text-purple-600 font-black text-sm">
              <span>Notları Oku</span> <span className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">➡️</span>
            </div>
          </Link>

          {/* Flashcard Kartı */}
          <Link href="/tr/premium/ydus/flashcards?topic=siroz" className="group bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🃏</div>
            <h3 className="font-bold text-slate-800 text-xl mb-2 group-hover:text-blue-700">Siroz Flashcards</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 flex-1">Skorlama sistemleri (Child-Pugh) ve portal hipertansiyon ilaç dozajlarını hızlıca tekrar edin.</p>
            <div className="flex items-center justify-between mt-auto text-blue-600 font-black text-sm">
              <span>Hemen Başla</span> <span className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">➡️</span>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}