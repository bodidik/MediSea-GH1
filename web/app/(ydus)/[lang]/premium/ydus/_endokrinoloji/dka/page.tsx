import Link from 'next/link';

export default function DkaDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigasyon */}
        <div className="mb-8 flex items-center gap-2 text-sm font-bold text-slate-500 overflow-x-auto whitespace-nowrap pb-2">
          <Link href="/tr/premium/ydus" className="hover:text-slate-800 transition-colors">🏠 Lobi</Link>
          <span>/</span>
          <Link href="/tr/premium/ydus/endokrinoloji" className="hover:text-purple-600 transition-colors">Endokrinoloji</Link>
          <span>/</span>
          <span className="text-slate-800 font-black">DKA</span>
        </div>

        {/* Hero Bölümü */}
        <div className="bg-white rounded-3xl p-8 sm:p-10 mb-10 shadow-lg border border-slate-200 relative overflow-hidden">
          <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-purple-600 flex items-center justify-center text-5xl shrink-0 shadow-inner">🧪</div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">Metabolik Acil</span>
                <span className="bg-red-100 text-red-700 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">Anyon Açığı (+)</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">Diyabetik Ketoasidoz (DKA)</h1>
              <p className="text-slate-500 font-medium max-w-2xl text-base sm:text-lg leading-relaxed">
                ADA ve ISPAD kılavuzlarına göre DKA yönetimi. Sıvı resüsitasyonu, potasyum replasmanı ve insülin infüzyonu arasındaki o hassas dengenin uzmanlık modülü.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-10 pointer-events-none"></div>
        </div>

        {/* Modüller */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Link href="/tr/premium/ydus/endokrinoloji/dka/simulasyon" className="group bg-slate-900 rounded-3xl p-8 border-2 border-slate-800 shadow-xl hover:shadow-purple-900/20 transition-all duration-300 hover:-translate-y-1 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-purple-500 text-white text-[10px] font-black px-4 py-1.5 rounded-bl-xl z-10">VAKA KOKPİTİ</div>
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform relative z-10">⚖️</div>
            <h3 className="font-bold text-white text-xl mb-2 relative z-10">DKA Resüsitasyon Simülatörü</h3>
            <p className="text-slate-400 text-sm font-medium mb-8 flex-1 relative z-10">Potasyum 3.1 mEq/L iken insülin başlanır mı? Kritik kararları verin, hastayı asidozdan çıkarın.</p>
            <div className="flex items-center justify-between mt-auto text-purple-400 font-black text-sm">
              <span>Yönetime Başla</span> <span className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center group-hover:bg-purple-400">➡️</span>
            </div>
          </Link>

          <Link href="/tr/premium/ydus/pearls?topic=dka" className="group bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">💎</div>
            <h3 className="font-bold text-slate-800 text-xl mb-2 group-hover:text-blue-700">Kritik DKA İncileri</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 flex-1">Bikarbonat ne zaman verilir? Serebral ödem riski nasıl azaltılır? "Euglycemic DKA" tetikleyicileri nelerdir?</p>
            <div className="flex items-center justify-between mt-auto text-blue-600 font-black text-sm">
              <span>Spot Notlar</span> <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">➡️</span>
            </div>
          </Link>

          <Link href="/tr/premium/ydus/flashcards?topic=dka" className="group bg-white rounded-3xl p-8 border-2 border-slate-100 shadow-sm hover:border-emerald-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform">🃏</div>
            <h3 className="font-bold text-slate-800 text-xl mb-2 group-hover:text-emerald-700">DKA Kartları</h3>
            <p className="text-slate-500 text-sm font-medium mb-8 flex-1">Tanı kriterleri (pH, HCO3, Anyon açığı) ve düzelme kriterlerini seri şekilde tekrar edin.</p>
            <div className="flex items-center justify-between mt-auto text-emerald-600 font-black text-sm">
              <span>Hızlı Tekrar</span> <span className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">➡️</span>
            </div>
          </Link>

        </div>
      </div>
    </div>
  );
}