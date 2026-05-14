import Link from 'next/link';

export default function FebrileNeutropeniaDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 overflow-x-auto whitespace-nowrap pb-2 text-slate-500">
          <Link href="/tr/premium/ydus" className="hover:text-slate-800 transition-colors">🏠 Lobi</Link>
          <span>/</span>
          <Link href="/tr/premium/ydus/onkoloji" className="hover:text-slate-800 transition-colors">Onkoloji</Link>
          <span>/</span>
          <span className="text-slate-800 font-black">Febril Nötropeni</span>
        </div>

        {/* Hero Bölümü */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 mb-10 shadow-lg border border-slate-200 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-slate-900 flex items-center justify-center text-5xl shrink-0 shadow-inner">🌡️</div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">Onkolojik Acil</span>
                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">IDSA Kılavuzu</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 text-slate-900">Febril Nötropeni Yönetimi</h1>
              <p className="text-slate-500 font-medium max-w-2xl text-base sm:text-lg leading-relaxed">
                Nötropeni tanımı, MASCC skoru ile risk analizi ve ampirik antibiyotik seçiminde (Psödomonas kapsamı) hayati basamaklar.
              </p>
            </div>
          </div>
        </div>

        {/* Çalışma Modülleri */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/tr/premium/ydus/flashcards?topic=febril" className="group bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm hover:border-red-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🃏</div>
            <h3 className="font-bold text-slate-800 text-xl mb-2 group-hover:text-red-700">Tanı Kartları</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 flex-1">ANC hesabı, ateş tanımı ve yüksek/düşük risk ayrımı kriterleri.</p>
            <div className="flex items-center justify-between mt-auto text-red-600 font-black text-sm">
              <span>Hemen Başla</span> <span className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">➡️</span>
            </div>
          </Link>

          <Link href="/tr/premium/ydus/pearls?topic=febril" className="group bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm hover:border-purple-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">💎</div>
            <h3 className="font-bold text-slate-800 text-xl mb-2 group-hover:text-purple-700">Antibiyotik İncileri</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 flex-1">Piperasilin/Tazobaktam mı, Karbapenem mi? Antifungal ekleme zamanlaması ve G-CSF kullanımı.</p>
            <div className="flex items-center justify-between mt-auto text-purple-600 font-black text-sm">
              <span>Notları Oku</span> <span className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">➡️</span>
            </div>
          </Link>
          
          <div className="bg-slate-100 border-2 border-dashed border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center opacity-60">
            <span className="text-3xl mb-2">🧪</span>
            <p className="text-xs font-bold text-slate-500 uppercase">Vaka Simülasyonu Yakında</p>
          </div>
        </div>
      </div>
    </div>
  );
}