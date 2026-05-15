import Link from 'next/link';

// --- BU KISMI HER SAYFA İÇİN DEĞİŞTİR ---
const CONFIG = {
  title: "Kronik Lenfoblastik Lösemi (ALL)", // KLL için bunu değiştir
  slug: "kll",                             // kll yap
  icon: "🧬",                              // 🧬 yap
  difficulty: "Orta - Zor",
  isReady: false,                          // İçerik (JSON) hazır olunca true yap
};

export default function SpecialtyDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Breadcrumb - Sabit Navigasyon */}
        <div className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/tr/premium/ydus" className="hover:text-slate-800 transition-colors">🏠 Lobi</Link>
          <span>/</span>
          <Link href="/tr/premium/ydus/hematoloji" className="hover:text-rose-600 transition-colors">Hematoloji</Link>
          <span>/</span>
          <span className="text-slate-800">{CONFIG.slug.toUpperCase()}</span>
        </div>

        {/* Hero Kartı */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200 relative overflow-hidden mb-10">
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-5xl shrink-0 shadow-inner">
              {CONFIG.icon}
            </div>
            <div className="text-center sm:text-left">
              <div className="flex justify-center sm:justify-start gap-2 mb-2">
                <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider">
                  Zorluk: {CONFIG.difficulty}
                </span>
                {!CONFIG.isReady && (
                  <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded uppercase tracking-wider animate-pulse">
                    İçerik Hazırlanıyor
                  </span>
                )}
              </div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">{CONFIG.title}</h1>
              <p className="text-slate-500 font-medium text-sm sm:text-base max-w-2xl leading-relaxed">
                YDUS ve yan dal sınavlarına yönelik güncel tanı ve tedavi protokolleri, genetik belirteçler ve klinik simülasyonlar.
              </p>
            </div>
          </div>
        </div>

        {/* Modül Kutuları */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${!CONFIG.isReady ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
          
          {/* Flashcard */}
          <Link href={`/tr/premium/ydus/flashcards?topic=${CONFIG.slug}`} className="bg-white p-6 rounded-3xl border-2 border-slate-100 hover:border-blue-300 transition-all group">
            <span className="text-3xl block mb-4 group-hover:scale-110 transition-transform">🃏</span>
            <h3 className="font-bold text-slate-800">Flashcards</h3>
            <p className="text-xs text-slate-500 mt-2">Hızlı tekrar modülleri</p>
          </Link>

          {/* İnciler */}
          <Link href={`/tr/premium/ydus/pearls?topic=${CONFIG.slug}`} className="bg-white p-6 rounded-3xl border-2 border-slate-100 hover:border-purple-300 transition-all group">
            <span className="text-3xl block mb-4 group-hover:scale-110 transition-transform">💎</span>
            <h3 className="font-bold text-slate-800">Klinik İnciler</h3>
            <p className="text-xs text-slate-500 mt-2">Spot ve kritik bilgiler</p>
          </Link>

          {/* Sınav */}
          <Link href={`/tr/premium/ydus/quiz?topic=${CONFIG.slug}`} className="bg-white p-6 rounded-3xl border-2 border-slate-100 hover:border-green-300 transition-all group">
            <span className="text-3xl block mb-4 group-hover:scale-110 transition-transform">📝</span>
            <h3 className="font-bold text-slate-800">Deneme Sınavı</h3>
            <p className="text-xs text-slate-500 mt-2">Board tipi testler</p>
          </Link>

        </div>

        {!CONFIG.isReady && (
          <div className="mt-8 bg-slate-100 border-2 border-dashed border-slate-300 rounded-3xl p-12 text-center">
            <p className="font-bold text-slate-400">Bu konu için içerikler şu an uzman ekibimiz tarafından hazırlanmaktadır. 🚧</p>
          </div>
        )}
      </div>
    </div>
  );
}