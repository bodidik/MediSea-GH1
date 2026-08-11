import Link from "next/link";
import { auth } from "@/auth";
import { SPECIALTIES, CATEGORY_ORDER, CATEGORY_META } from "@/app/lib/specialties";
import { getTopicCounts } from "@/app/lib/topic-counts";
import StudyStatus from "@/app/components/StudyStatus";

export const dynamic = "force-dynamic";

const FEATURED_TOOLS = [
  { slug: "wells-pe", name: "Wells PE", icon: "🔍" },
  { slug: "chads-vasc", name: "CHA₂DS₂-VASc", icon: "❤️" },
  { slug: "egfr", name: "eGFR (2021)", icon: "🧪" },
  { slug: "news2", name: "NEWS2", icon: "🚨" },
  { slug: "qsofa", name: "qSOFA", icon: "🩺" },
  { slug: "curb65", name: "CURB-65", icon: "🫁" },
];

export default async function Home() {
  const session = await auth();
  const user = session?.user as any;
  const ktKullanici = user?.institution === 'kayseritip' || user?.email === process.env.ADMIN_EMAIL;

  const topicCounts = getTopicCounts();
  const totalTopics = Object.values(topicCounts).reduce((a, b) => a + b, 0);
  const totalBranches = SPECIALTIES.length;

  return (
    <main className="min-h-screen bg-[#F8F9FC] font-sans text-blue-950">

      {/* ══════════════════════════════════════════════════════
          DESKTOP: 2 sütun — sol hero, sağ branşlar
          MOBİL: dikey yığın — önce hero, sonra branşlar
      ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:min-h-[calc(100vh-64px)]">

        {/* ── SOL: HERO ───────────────────────────────────── */}
        <section className="relative overflow-hidden bg-blue-950 lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col justify-center">
          {/* Dekoratif glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-indigo-700/40 blur-3xl" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-blue-900/60 blur-3xl" />
            <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative px-6 xl:px-8 py-8 lg:py-10">
            {/* Badge'ler */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="rounded-full bg-white/10 text-white/60 border border-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest">Beta</span>
              <Link href="/tr/premium/ydus" className="rounded-full bg-yellow-400 text-blue-950 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-all">
                Premium YDUS ⚓
              </Link>
              {ktKullanici && (
                <Link href="/kayseritip" className="rounded-full bg-indigo-500 text-white px-2.5 py-1 text-[9px] font-black uppercase tracking-widest hover:bg-indigo-400 transition-all">
                  🎓 KayseriTıp
                </Link>
              )}
            </div>

            {/* Başlık */}
            <h1 className="text-4xl xl:text-5xl font-black text-white mb-3 italic uppercase tracking-tighter leading-[0.9]">
              Medi<span className="not-italic">Sea</span>{" "}
              <span className="text-yellow-400 not-italic block">Akademi</span>
            </h1>
            <p className="text-sm leading-relaxed text-blue-200/75 mb-6 font-medium">
              Dahiliye asistanları ve uzmanları için klinik karar desteği, güncel konu anlatımları ve YDUS hazırlık platformu.
            </p>

            {/* CTA */}
            <div className="flex flex-col gap-2 mb-7">
              <Link
                href="/tr/premium/ydus"
                className="text-center bg-yellow-400 text-blue-950 text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/20 active:scale-95"
              >
                ⚓ Premium YDUS
              </Link>
              <div className="flex gap-2">
                <Link
                  href="/tools"
                  className="flex-1 text-center bg-white/10 border border-white/20 text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-full hover:bg-white/20 transition-all active:scale-95"
                >
                  Hesaplayıcılar
                </Link>
                <Link
                  href="#branslar"
                  className="flex-1 text-center bg-white/10 border border-white/20 text-white text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-full hover:bg-white/20 transition-all active:scale-95 lg:hidden"
                >
                  Branşlar ↓
                </Link>
              </div>
            </div>

            {/* İstatistik barı */}
            <div className="flex items-center divide-x divide-white/10 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="flex-1 text-center py-3">
                <div className="text-xl font-black text-white leading-none">{totalBranches}</div>
                <div className="text-[9px] font-bold text-blue-300/60 uppercase tracking-widest mt-0.5">Branş</div>
              </div>
              <div className="flex-1 text-center py-3">
                <div className="text-xl font-black text-white leading-none">{totalTopics}+</div>
                <div className="text-[9px] font-bold text-blue-300/60 uppercase tracking-widest mt-0.5">Konu</div>
              </div>
              <div className="flex-1 text-center py-3">
                <div className="text-xl font-black text-white leading-none">6+</div>
                <div className="text-[9px] font-bold text-blue-300/60 uppercase tracking-widest mt-0.5">Araç</div>
              </div>
            </div>

            {/* Alt özellik linkleri */}
            <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-3 gap-2">
              {[
                { icon: "⚓", label: "YDUS", sub: "Soru & kart", href: "/tr/premium/ydus" },
                { icon: "🧪", label: "Hesap.", sub: "50+ skor", href: "/tools" },
                { icon: "📚", label: "Konular", sub: `${totalTopics}+ konu`, href: "#branslar" },
              ].map((f) => (
                <Link key={f.href} href={f.href} className="group flex flex-col items-center text-center p-2.5 rounded-xl hover:bg-white/10 transition-all">
                  <span className="text-lg mb-1">{f.icon}</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-tight">{f.label}</span>
                  <span className="text-[9px] text-blue-300/60 mt-0.5">{f.sub}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── SAĞ: BRANŞLAR ───────────────────────────────── */}
        <section id="branslar" className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 lg:py-6 scroll-mt-16">

          {/* Çalışma durumu — veri yoksa hiç görünmez */}
          <StudyStatus />


          {/* Başlık + araç barı tek satırda */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-6 rounded-full bg-blue-950" />
              <div>
                <h2 className="text-sm font-black text-blue-950 uppercase italic tracking-tighter leading-none">Klinik Branşlar</h2>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Uzmanlık düzeyinde güncel anlatımlar</p>
              </div>
            </div>
            {/* Hızlı araç chip'leri — desktop'ta burada */}
            <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {FEATURED_TOOLS.slice(0, 4).map((tool) => (
                <Link key={tool.slug} href={`/tools/${tool.slug}`}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all text-[10px] font-bold text-blue-950 whitespace-nowrap">
                  <span className="text-xs">{tool.icon}</span>{tool.name}
                </Link>
              ))}
              <Link href="/tools" className="shrink-0 text-[10px] font-black text-blue-600 px-1.5 hover:underline uppercase tracking-tighter whitespace-nowrap">
                Tümü →
              </Link>
            </div>
          </div>

          {/* Branş grid */}
          <div className="space-y-4">
            {CATEGORY_ORDER.map((catKey) => {
              const items = SPECIALTIES.filter((s) => s.category === catKey);
              if (!items.length) return null;
              const meta = CATEGORY_META[catKey];
              return (
                <div key={catKey} className="bg-white/70 rounded-2xl border border-slate-100 px-3 pt-3 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">{meta.label}</h3>
                    <div className="flex-1 h-px bg-slate-100" />
                    <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest whitespace-nowrap">{items.length} branş</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {items.map((item) => {
                      const count = topicCounts[item.slug] || 0;
                      return (
                        <Link
                          key={item.slug}
                          href={`/topics/${item.slug}`}
                          title={item.desc}
                          className={`group flex items-center gap-2 p-2.5 bg-white rounded-xl border shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98] ${item.color}`}
                          style={{ borderColor: '#e8eaf0' }}
                        >
                          <div className={`w-8 h-8 lg:w-9 lg:h-9 rounded-xl flex items-center justify-center text-sm lg:text-base ${item.bg} shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                            {item.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-[10.5px] font-black text-blue-950 uppercase italic tracking-tight leading-tight truncate">
                              {item.title}
                            </h3>
                            {count > 0 && (
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate mt-0.5">
                                {count} konu
                              </p>
                            )}
                          </div>
                          <svg className={`w-3 h-3 shrink-0 text-slate-300 group-hover:translate-x-0.5 transition-all ${item.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
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

          {/* Mobil hızlı araçlar (lg'de gizli, yukarıda gösteriliyor) */}
          <div className="mt-5 lg:hidden bg-white rounded-2xl border border-slate-200 shadow-sm p-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[9px] font-black text-blue-900/40 uppercase tracking-[0.2em] pr-3 border-r border-slate-200 shrink-0">Araçlar</span>
            {FEATURED_TOOLS.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all whitespace-nowrap">
                <span className="text-sm">{tool.icon}</span>
                <span className="text-[11px] font-bold text-blue-950">{tool.name}</span>
              </Link>
            ))}
            <Link href="/tools" className="shrink-0 text-[11px] font-black text-blue-600 px-2 hover:underline uppercase tracking-tighter whitespace-nowrap">Tümü →</Link>
          </div>
        </section>
      </div>
    </main>
  );
}
