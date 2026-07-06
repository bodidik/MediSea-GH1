import fs from "fs";
import path from "path";
import Link from "next/link";
import { SPECIALTIES, CATEGORY_ORDER, CATEGORY_META } from "@/app/lib/specialties";

export const dynamic = "force-dynamic";

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

      {/* --- HERO SECTION (kompakt) --- */}
      <div className="relative pt-5 pb-5 sm:pt-7 sm:pb-6 overflow-hidden border-b-4 border-blue-900/10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-r from-blue-50 via-indigo-50 to-yellow-50 rounded-full blur-3xl -z-10 opacity-70"></div>

        <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 text-center">
          <div className="mb-3 flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar -mx-5 px-5 sm:mx-0 sm:px-0">
            <span className="shrink-0 rounded-full bg-blue-50 text-blue-900 border border-blue-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest whitespace-nowrap">
              Beta
            </span>
            <Link href="/tr/premium/ydus" className="shrink-0 rounded-full bg-yellow-400 text-blue-950 px-3 py-1 text-[9px] font-black uppercase tracking-widest hover:bg-yellow-500 transition-all shadow-md whitespace-nowrap">
              Premium YDUS ⚓
            </Link>
            <Link href="/tools" className="shrink-0 rounded-full bg-white border border-slate-200 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-blue-900 hover:border-blue-900 transition-all whitespace-nowrap">
              🧪 Klinik Hesaplayıcılar
            </Link>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-950 mb-2 italic uppercase tracking-tighter leading-[0.95]">
            MediSea{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-900 to-indigo-700 not-italic uppercase">
              Akademi
            </span>
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-slate-500 max-w-2xl mx-auto mb-4 font-medium px-2">
            Klinik karar destek mekanizmaları, güncel ve uzman düzeyinde tıp eğitimi.
          </p>

          {/* CTA + İstatistikler tek satırda (kompakt) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <Link
                href="#branslar"
                className="w-full sm:w-auto text-center bg-blue-950 text-white text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full hover:bg-blue-800 hover:shadow-xl transition-all active:scale-95"
              >
                Branşları Keşfet
              </Link>
              <Link
                href="/tools"
                className="w-full sm:w-auto text-center bg-white border border-slate-200 text-blue-950 text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full hover:border-blue-900 hover:shadow-lg transition-all active:scale-95"
              >
                Hesaplayıcılara Git
              </Link>
            </div>

            <div className="hidden sm:block w-px h-8 bg-slate-200"></div>

            <div className="flex items-center justify-center gap-5">
              <div className="text-center">
                <div className="text-lg font-black text-blue-950 leading-none">{totalBranches}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Branş</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-blue-950 leading-none">{totalTopics}+</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Konu</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-black text-blue-950 leading-none">{FEATURED_TOOLS.length}+</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Hesaplayıcı</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- BRANŞLAR VE ALTINDAKİ ARAÇLAR (kompakt) --- */}
      <div id="branslar" className="max-w-7xl mx-auto px-4 lg:px-4 py-6 sm:py-7 scroll-mt-20">

        {/* Başlık Bölümü */}
        <div className="flex items-center justify-between gap-4 mb-3 border-l-8 border-blue-900 pl-3 sm:pl-2">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-blue-950 uppercase italic tracking-tighter leading-none">Klinik Branşlar</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Uzmanlık Düzeyinde Güncel Anlatımlar</p>
          </div>
        </div>

        {/* Branş Grid — kategoriye göre gruplanmış, tek satır kompakt kartlar */}
        <div className="mb-6">
          {CATEGORY_ORDER.map((catKey) => {
            const items = SPECIALTIES.filter((s) => s.category === catKey);
            if (!items.length) return null;
            const meta = CATEGORY_META[catKey];
            return (
              <div key={catKey} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">
                    {meta.label}
                  </h3>
                  <div className="flex-1 h-px bg-slate-100"></div>
                  <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">
                    {items.length} branş
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5">
                  {items.map((item) => {
                    const count = topicCounts[item.slug] || 0;
                    return (
                      <Link
                        key={item.slug}
                        href={`/topics/${item.slug}`}
                        title={item.desc}
                        className={`group flex items-center gap-2.5 p-2.5 sm:p-3 bg-white rounded-xl border border-slate-100 transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] ${item.color}`}
                      >
                        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-base sm:text-lg ${item.bg} shrink-0 group-hover:scale-110 transition-transform`}>
                          {item.icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-[11.5px] sm:text-xs font-black text-blue-950 uppercase italic tracking-tight leading-tight truncate">
                            {item.title}
                          </h3>
                          {count > 0 && (
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">
                              {count} konu
                            </p>
                          )}
                        </div>
                        <svg className={`w-3.5 h-3.5 shrink-0 text-slate-300 group-hover:translate-x-0.5 transition-all ${item.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
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
          <div className="bg-slate-50/50 backdrop-blur-sm rounded-2xl p-2.5 border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar sm:flex-wrap sm:justify-center">
            <span className="text-[9px] font-black text-blue-900/40 uppercase tracking-[0.2em] px-3 border-r border-slate-200 hidden md:block shrink-0">Hızlı Erişim</span>
            {FEATURED_TOOLS.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl border border-slate-100 hover:border-yellow-400 hover:shadow-lg hover:-translate-y-0.5 transition-all group whitespace-nowrap">
                <span className="text-sm">{tool.icon}</span>
                <span className="text-[11px] font-bold text-blue-950">{tool.name}</span>
              </Link>
            ))}
            <Link href="/tools" className="shrink-0 text-[11px] font-black text-blue-600 px-3 hover:underline uppercase tracking-tighter whitespace-nowrap">Tümü →</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
