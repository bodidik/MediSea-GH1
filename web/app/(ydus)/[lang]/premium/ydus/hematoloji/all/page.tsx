import Link from 'next/link';

export default function AllDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <div className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/tr/premium/ydus" className="hover:text-slate-800 transition-colors">🏠 Premium Lobi</Link>
          <span>/</span>
          <Link href="/tr/premium/ydus/hematoloji" className="hover:text-rose-600 transition-colors">Hematoloji</Link>
          <span>/</span>
          <span className="text-slate-800">ALL</span>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-10 mb-10 shadow-lg border border-slate-200 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-purple-900 flex items-center justify-center text-5xl shrink-0 shadow-inner">🧬</div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-purple-100 text-purple-700 text-xs font-black px-2.5 py-1 rounded-md uppercase tracking-wider">B-ALL & T-ALL</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">Akut Lenfoblastik Lösemi (ALL)</h1>
              <p className="text-slate-500 font-medium max-w-2xl text-base sm:text-lg leading-relaxed">
                Yetişkin ALL yönetimi, Ph-like ALL, CAR-T hücre tedavileri ve Blinatumomab/Inotuzumab gibi yeni nesil immünoterapilerin derinlemesine analizi.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/tr/premium/ydus/flashcards?topic=all" className="group bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🃏</div>
            <h3 className="font-bold text-slate-800 text-xl mb-2 group-hover:text-blue-700">ALL Flashcardlar</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 flex-1">İmmünfenotipleme (CD19, CD20, CD3), sitogenetik risk grupları ve L-asparajinaz yan etkilerini tekrarlayın.</p>
            <div className="flex items-center justify-between mt-auto">
              <span className="text-blue-600 font-black text-sm">Hemen Başla</span>
              <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">➡️</span>
            </div>
          </Link>

          {/* Diğer kartlar benzer yapıda (İnciler ve Quiz)... */}
        </div>
      </div>
    </div>
  );
}