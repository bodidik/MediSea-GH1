import fs from "fs";
import path from "path";
import Link from "next/link";

export const dynamic = "force-dynamic";

// --- MEDISEA BRANŞ DÜZENLEMESİ ---
// category: "dahili" (organ/sistem branşları) veya "destek" (multidisipliner / özel içerik)
// Her kategori kendi içinde alfabetik sırada — grid daha derli toplu görünsün diye.
const SPECIALTIES = [

  {
    title: "Endokrinoloji",
    slug: "endokrinoloji",
    desc: "Diyabet, Tiroid, Adrenal",
    icon: "🦋",
    color: "hover:border-purple-500 hover:shadow-purple-100",
    bg: "bg-purple-50",
    text: "text-purple-600",
    category: "dahili",
  },
  {
    title: "Enfeksiyon",
    slug: "enfeksiyon",
    desc: "Sepsis, Menenjit, Antibiyotikler",
    icon: "🦠",
    color: "hover:border-teal-500 hover:shadow-teal-100",
    bg: "bg-teal-50",
    text: "text-teal-600",
    category: "dahili",
  },
  {
    title: "Gastroenteroloji",
    slug: "gastroenteroloji",
    desc: "Konu anlatımları, Hepatoloji, İBH",
    icon: "🍎",
    color: "hover:border-orange-500 hover:shadow-orange-100",
    bg: "bg-orange-50",
    text: "text-orange-600",
    category: "dahili",
  },
  {
    title: "Genel Dahiliye",
    slug: "genel-dahiliye",
    desc: "İç hastalıkları, tanı ve tedavi süreçleri",
    icon: "⚕️",
    color: "hover:border-blue-500 hover:shadow-blue-100",
    bg: "bg-blue-50",
    text: "text-blue-600",
    category: "dahili",
  },
  {
    title: "Göğüs Hast.",
    slug: "gogus",
    desc: "KOAH, Astım, Pnömoni",
    icon: "🫁",
    color: "hover:border-cyan-500 hover:shadow-cyan-100",
    bg: "bg-cyan-50",
    text: "text-cyan-600",
    category: "dahili",
  },
  {
    title: "Hematoloji",
    slug: "hematoloji",
    desc: "Anemiler, Lösemiler, Pıhtılaşma",
    icon: "🩸",
    color: "hover:border-rose-500 hover:shadow-rose-100",
    bg: "bg-rose-50",
    text: "text-rose-600",
    category: "dahili",
  },
  {
    title: "Kardiyoloji",
    slug: "kardiyoloji",
    desc: "AKS, Kalp Yetersizliği, Aritmiler",
    icon: "❤️",
    color: "hover:border-red-500 hover:shadow-red-100",
    bg: "bg-red-50",
    text: "text-red-600",
    category: "dahili",
  },
  {
    title: "Nefroloji",
    slug: "nefroloji",
    desc: "ABH, KBH, Elektrolitler",
    icon: "💧",
    color: "hover:border-emerald-500 hover:shadow-emerald-100",
    bg: "bg-emerald-50",
    text: "text-emerald-500",
    category: "dahili",
  },
  {
    title: "Onkoloji",
    slug: "onkoloji",
    desc: "Solid Tümörler, Aciller",
    icon: "🎗️",
    color: "hover:border-yellow-500 hover:shadow-yellow-100",
    bg: "bg-amber-50",
    text: "text-amber-600",
    category: "dahili",
  },
  {
    title: "Romatoloji",
    slug: "romatoloji",
    desc: "Artritler, Vaskülitler, SLE",
    icon: "🦴",
    color: "hover:border-blue-500 hover:shadow-blue-100",
    bg: "bg-blue-50",
    text: "text-blue-600",
    category: "dahili",
  },
  {
    title: "Klinik Nütrisyon",
    slug: "klinik-nutrisyon",
    desc: "Enteral ve Parenteral Nütrisyon, ESPEN/ASPEN Kılavuzları, Malnütrisyon Yönetimi, PEG ve Refeeding Sendromu",
    icon: "🍏",
    color: "hover:border-emerald-500 hover:shadow-emerald-100",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    category: "destek",
  },
  {
    title: "Literatür & Journal Club",
    icon: "📰",
    desc: "En güncel Faz 3 çalışmaları ve literatür özetleri",
    slug: "journal-club",
    color: "hover:border-blue-500 hover:shadow-blue-100",
    bg: "bg-blue-50",
    text: "text-blue-600",
    category: "destek",
  },
  {
    title: "Palyatif",
    slug: "palyatif",
    icon: "🕊️",
    desc: "Ağrı yönetimi, semptom kontrolü, yaşam sonu bakımı",
    color: "hover:border-teal-500 hover:shadow-teal-100",
    bg: "bg-teal-50",
    text: "text-teal-600",
    category: "destek",
  },
];

const CATEGORY_ORDER = ["dahili", "destek"] as const;
const CATEGORY_META: Record<string, { label: string; hint: string }> = {
  dahili: { label: "Dahili Branşlar", hint: "Organ ve sistemlere göre uzmanlık anlatımları" },
  destek: { label: "Destek & Özel İçerik", hint: "Multidisipliner ve tamamlayıcı kaynaklar" },
};

const FEATURED_TOOLS = [
  { slug: "wells-pe", name: "Wells PE", icon: "🔍" },
  { slug: "chads-vasc", name: "CHA₂DS₂-VASc", icon: "❤️" },
  { slug: "egfr", name: "eGFR (2021)", icon: "🧪" },
  { slug: "news2", name: "NEWS2", icon: "🚨" },
  { slug: "qsofa", name: "qSOFA", icon: "🩺" },
  { slug: "curb65", name: "CURB-65", icon: "🫁" },
];

// Her branşın gerçek konu sayısını content/canonical klasöründen okur (dinamik, hardcode yok)
function getTopicCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  try {
    const root = path.join(process.cwd(), "content", "canonical");
    if (!fs.existsSync(root)) return counts;
    const branches = fs.readdirSync(root).filter((d) =>
      fs.statSync(path.join(root, d)).isDirectory()
    );
    for (const b of branches) {
      const files = fs.readdirSync(path.join(root, b)).filter((f) => f.endsWith(".json"));
      counts[b] = files.length;
    }
  } catch {
    // sessizce geç — sayaçlar dekoratif, sayfa yine de çalışmalı
  }
  return counts;
}

export default function Home() {
  const topicCounts = getTopicCounts();
  const totalTopics = Object.values(topicCounts).reduce((a, b) => a + b, 0);
  const totalBranches = SPECIALTIES.length;

  return (
    <main className="min-h-screen bg-white font-sans text-blue-950">

      {/* --- HERO SECTION --- */}
      <div className="relative pt-8 pb-8 sm:pt-16 sm:pb-20 overflow-hidden border-b-4 border-blue-900/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-r from-blue-50 via-indigo-50 to-yellow-50 rounded-full blur-3xl -z-10 opacity-70"></div>

        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <div className="mb-6 sm:mb-8 flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-2.5 sm:gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0">
            <span className="shrink-0 rounded-full bg-blue-50 text-blue-900 border border-blue-100 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
              Beta
            </span>
            <Link href="/tr/premium/ydus" className="shrink-0 rounded-full bg-yellow-400 text-blue-950 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-md whitespace-nowrap">
              Premium YDUS ⚓
            </Link>
            <Link href="/tools" className="shrink-0 rounded-full bg-white border border-slate-200 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-900 hover:border-blue-900 transition-all whitespace-nowrap">
              🧪 Klinik Hesaplayıcılar
            </Link>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-blue-950 mb-4 italic uppercase tracking-tighter leading-[0.95]">
            MediSea <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-700 not-italic uppercase">
              Akademi
            </span>
          </h1>
          <p className="text-base sm:text-xl leading-relaxed text-slate-500 max-w-3xl mx-auto mb-8 font-medium px-2">
            Klinik karar destek mekanizmaları, güncel ve uzman düzeyinde tıp eğitimi.
          </p>

          {/* CTA Butonları */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 sm:mb-2">
            <Link
              href="#branslar"
              className="w-full sm:w-auto text-center bg-blue-950 text-white text-sm font-black uppercase tracking-widest px-8 py-3.5 rounded-full hover:bg-blue-800 hover:shadow-xl transition-all active:scale-95"
            >
              Branşları Keşfet
            </Link>
            <Link
              href="/tools"
              className="w-full sm:w-auto text-center bg-white border border-slate-200 text-blue-950 text-sm font-black uppercase tracking-widest px-8 py-3.5 rounded-full hover:border-blue-900 hover:shadow-lg transition-all active:scale-95"
            >
              Hesaplayıcılara Git
            </Link>
          </div>

          {/* İstatistik Şeridi (gerçek verilerden) */}
          <div className="flex items-center justify-center gap-6 sm:gap-12 flex-wrap">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-blue-950">{totalBranches}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Branş</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-blue-950">{totalTopics}+</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Konu Başlığı</div>
            </div>
            <div className="w-px h-8 bg-slate-200"></div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-blue-950">{FEATURED_TOOLS.length}+</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Hesaplayıcı</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BRANŞLAR VE ALTINDAKİ ARAÇLAR --- */}
      <div id="branslar" className="max-w-7xl mx-auto px-4 lg:px-4 py-10 sm:py-12 scroll-mt-20">

        {/* Başlık Bölümü */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5 sm:mb-6 border-l-8 border-blue-900 pl-3 sm:pl-2">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-blue-950 uppercase italic tracking-tighter">Klinik Branşlar</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Uzmanlık Düzeyinde Güncel Anlatımlar</p>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase max-w-xs text-right hidden md:block">
            Hekimlere yönelik eğitsel bilgi içerir
          </p>
        </div>

        {/* Branş Grid — kategoriye göre gruplanmış (Dahili / Destek) */}
        <div className="mb-10">
          {CATEGORY_ORDER.map((catKey) => {
            const items = SPECIALTIES.filter((s) => s.category === catKey);
            if (!items.length) return null;
            const meta = CATEGORY_META[catKey];
            return (
              <div key={catKey} className="mb-8 last:mb-0">
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                    {meta.label}
                  </h3>
                  <div className="flex-1 h-px bg-slate-100"></div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap hidden sm:inline">
                    {meta.hint}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
                    {items.length} branş
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {items.map((item) => {
                    const count = topicCounts[item.slug] || 0;
                    return (
                      <Link
                        key={item.slug}
                        href={`/topics/${item.slug}`}
                        className={`group relative flex flex-col p-6 sm:p-7 bg-white rounded-[2rem] sm:rounded-[3rem] border border-slate-100 transition-all duration-500 hover:-translate-y-2 sm:hover:-translate-y-3 hover:shadow-2xl active:scale-[0.98] ${item.color}`}
                      >
                        {count > 0 && (
                          <span className="absolute top-5 right-6 text-[10px] font-black text-slate-300 group-hover:text-slate-400 uppercase tracking-widest transition-colors">
                            {count} konu
                          </span>
                        )}
                        <div className="flex items-center gap-4 sm:gap-5 mb-4">
                          <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-[1.25rem] sm:rounded-[1.5rem] flex items-center justify-center text-2xl sm:text-3xl ${item.bg} group-hover:rotate-12 transition-all shadow-inner shrink-0`}>
                            {item.icon}
                          </div>
                          <h3 className="text-xl sm:text-2xl font-black text-blue-950 uppercase italic tracking-tighter leading-tight">
                            {item.title}
                          </h3>
                        </div>

                        <p className="text-slate-500 text-sm font-medium mb-3 flex-grow leading-relaxed">
                          {item.desc}
                        </p>

                        <div className={`mt-auto flex items-center text-[10px] font-black uppercase tracking-widest ${item.text}`}>
                          Konulara git
                          <svg className="w-5 h-5 ml-3 transition-transform group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* HIZLI HESAPLAYICI BARI (Branşların Altında) */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-50/50 backdrop-blur-sm rounded-[2rem] sm:rounded-[2.5rem] p-3 border border-slate-200 shadow-sm flex items-center gap-3 overflow-x-auto no-scrollbar sm:flex-wrap sm:justify-center">
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-[0.2em] px-4 border-r border-slate-200 hidden md:block shrink-0">Hızlı Erişim</span>
            {FEATURED_TOOLS.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-white rounded-2xl border border-slate-100 hover:border-yellow-400 hover:shadow-xl hover:-translate-y-0.5 transition-all group whitespace-nowrap">
                <span className="text-base">{tool.icon}</span>
                <span className="text-xs font-bold text-blue-950">{tool.name}</span>
              </Link>
            ))}
            <Link href="/tools" className="shrink-0 text-xs font-black text-blue-600 px-4 hover:underline uppercase tracking-tighter whitespace-nowrap">Tümü →</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
