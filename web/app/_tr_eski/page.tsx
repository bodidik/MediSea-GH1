//"C:\Users\hucig\Medknowledge\web\app\tr\page.tsx"
import Link from "next/link";

// BRANŞ VERİLERİ
const SPECIALTIES = [
  { title: "Gastroenteroloji", slug: "gastroenteroloji", desc: "GİS kanamaları, Hepatoloji", icon: "🫁", color: "from-orange-400 to-orange-600", bg: "bg-orange-50", border: "group-hover:border-orange-500" },
  { title: "Kardiyoloji", slug: "kardiyoloji", desc: "AKS, Kalp Yetersizliği", icon: "❤️", color: "from-red-400 to-red-600", bg: "bg-red-50", border: "group-hover:border-red-500" },
  { title: "Endokrinoloji", slug: "endokrinoloji", desc: "Diyabet, Tiroid", icon: "🦋", color: "from-purple-400 to-purple-600", bg: "bg-purple-50", border: "group-hover:border-purple-500" },
  { title: "Nefroloji", slug: "nefroloji", desc: "ABH, Elektrolitler", icon: "💧", color: "from-emerald-400 to-emerald-600", bg: "bg-emerald-50", border: "group-hover:border-emerald-500" },
  { title: "Hematoloji", slug: "hematoloji", desc: "Anemiler, Lösemiler", icon: "🩸", color: "from-rose-400 to-rose-600", bg: "bg-rose-50", border: "group-hover:border-rose-500" },
  { title: "Romatoloji", slug: "romatoloji", desc: "Artritler, SLE", icon: "🦴", color: "from-blue-400 to-blue-600", bg: "bg-blue-50", border: "group-hover:border-blue-500" },
  { title: "Enfeksiyon", slug: "infeksiyon", desc: "Sepsis, Antibiyotikler", icon: "🦠", color: "from-teal-400 to-teal-600", bg: "bg-teal-50", border: "group-hover:border-teal-500" },
  { title: "Göğüs Hast.", slug: "gogus", desc: "KOAH, Astım, Pnömoni", icon: "🫁", color: "from-cyan-400 to-cyan-600", bg: "bg-cyan-50", border: "group-hover:border-cyan-500" },
  { title: "Onkoloji", slug: "onkoloji", desc: "Tümörler, Aciller", icon: "🎗️", color: "from-amber-400 to-amber-600", bg: "bg-amber-50", border: "group-hover:border-amber-500" },
];

// TREND ETİKETLER (Gençlerin ilgisini çekecek hızlı hap bilgiler)
const TRENDING = [
  "🔥 Sepsis Protokolü", "⚡️ Hiperkalemi", "💊 Antibiyotik Seçimi", "🫀 EKG Yorumlama", "🩸 DKA Yönetimi"
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      
      {/* --- HERO BÖLÜMÜ (Giriş) --- */}
      <div className="relative pt-20 pb-12 sm:pt-32 sm:pb-24 overflow-hidden">
        
        {/* Arka Plan Efekti (Buzlu Cam / Aurora) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-[-10%] right-[20%] w-[500px] h-[500px] bg-cyan-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-[40%] w-[500px] h-[500px] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 text-center">
          
          {/* Üst Bilgi Rozetleri ve VIP Giriş */}
          <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            
            {/* Orijinal Rozet */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              v1.0 Beta Yayında
            </div>

            {/* YDUS PREMIUM VIP BUTONU */}
            <Link 
              href="/tr/premium/ydus" 
              className="inline-flex items-center justify-center gap-2 px-5 py-1.5 bg-gradient-to-r from-slate-900 to-slate-800 text-yellow-400 font-black rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all border border-slate-700/50 group"
            >
              <span className="text-base group-hover:rotate-12 transition-transform">💎</span>
              <span className="tracking-wide text-sm">YDUS PREMIUM</span>
              <span className="text-white bg-red-600 text-[10px] px-2 py-0.5 rounded-full animate-pulse ml-1 shadow-sm">YENİ</span>
            </Link>

          </div>

          {/* Ana Başlık */}
          <h1 className="text-5xl font-black tracking-tight text-slate-900 sm:text-7xl mb-6">
            Tıbbın <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Dijital Asistanı.</span>
          </h1>
          
          <p className="text-xl leading-8 text-slate-600 max-w-2xl mx-auto mb-10 font-medium">
            Nöbette, poliklinikte veya vizitte. <br/>
            <span className="text-slate-900 font-semibold">TUS derecesi yaptıran</span> değil, <span className="text-slate-900 font-semibold">hayat kurtaran</span> pratik bilgiler.
          </p>

          {/* Modern Arama Çubuğu (Apple Spotlight Tarzı) */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative group cursor-not-allowed">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                <svg width="20" height="20" className="text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                disabled
                className="block w-full rounded-2xl border-0 py-4 pl-12 pr-12 text-slate-900 shadow-lg shadow-indigo-100 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 bg-white focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all"
                placeholder="Hastalık, semptom veya ilaç ara..."
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <kbd className="inline-flex items-center rounded border border-slate-200 px-1 font-sans text-xs text-slate-400">⌘K</kbd>
              </div>
            </div>
            
            {/* Trend Etiketler */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-2 pt-1">Popüler:</span>
              {TRENDING.map((tag, i) => (
                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-white text-slate-600 border border-slate-200 shadow-sm cursor-pointer hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                  {tag}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* --- KOKPİT (Bento Grid) --- */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SPECIALTIES.map((item) => (
            <Link 
              key={item.slug} 
              href={`/tr/topics/${item.slug}`}
              className={`group relative overflow-hidden bg-white p-6 rounded-3xl border border-slate-200 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${item.border}`}
            >
              {/* Kart Arka Plan Hover Efekti */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 bg-gradient-to-br ${item.color}`}></div>

              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl ${item.bg} group-hover:scale-110 transition-transform duration-300`}>
                  {item.icon}
                </div>
                {/* Arrow Icon */}
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-slate-900 group-hover:text-white transition-all duration-300">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-500 text-sm font-medium">
                {item.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* --- FOOTER BANNER (CTA) --- */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8 pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-6 py-10 shadow-2xl sm:px-12 sm:py-16">
          <div className="absolute top-0 left-0 w-full h-full opacity-30">
             <div className="absolute right-0 top-0 -mt-20 -mr-20 w-[400px] h-[400px] bg-indigo-500 rounded-full blur-3xl"></div>
             <div className="absolute left-0 bottom-0 -mb-20 -ml-20 w-[400px] h-[400px] bg-blue-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Sınav Moduna Hazır mısın?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
                TUS, YDUS ve USMLE için özel hazırlanmış "MediSea Academy" yakında açılıyor.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
               <button className="rounded-full bg-white px-8 py-3.5 text-sm font-bold text-slate-900 shadow-sm hover:bg-slate-100 transition-all">
                Erken Erişim Listesi 🚀
               </button>
            </div>
          </div>
        </div>
      </div>

    </main>
  );
}