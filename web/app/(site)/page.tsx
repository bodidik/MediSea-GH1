import Link from "next/link";
import { SPECIALTIES, CATEGORY_ORDER, CATEGORY_META } from "@/app/lib/specialties";
import { getTopicCounts, getToolCount } from "@/app/lib/topic-counts";
import StudyStatus from "@/app/components/StudyStatus";
import KurumRozeti from "@/app/components/KurumRozeti";
import { HeroDenizi } from "@/app/components/DenizSusu";
import { kisimAdlari } from "@/lib/icindekiler";

/**
 * ISR: ana sayfa artık istek başına üretilmiyor.
 *
 * Eskiden `force-dynamic`ti ve tek sebebi `auth()` çağrısıydı; o da yalnızca
 * kuruma özel tek bir rozeti göstermek içindi. Sonuç: sitenin en çok istenen
 * sayfası CDN'e hiç girmiyordu (canlıda arka arkaya iki istekte de MISS).
 * Rozet KurumRozeti istemci bileşenine taşındı, sayfa herkes için aynı HTML'i
 * üretiyor ve önbelleklenebiliyor.
 */
export const revalidate = 3600;

const FEATURED_TOOLS = [
  { slug: "wells-pe", name: "Wells PE", icon: "🔍" },
  { slug: "chads-vasc", name: "CHA₂DS₂-VASc", icon: "❤️" },
  { slug: "egfr", name: "eGFR (2021)", icon: "🧪" },
  { slug: "news2", name: "NEWS2", icon: "🚨" },
  { slug: "qsofa", name: "qSOFA", icon: "🩺" },
  { slug: "curb65", name: "CURB-65", icon: "🫁" },
];

export default async function Home() {
  const topicCounts = getTopicCounts();
  const totalTopics = Object.values(topicCounts).reduce((a, b) => a + b, 0);
  const totalBranches = SPECIALTIES.length;
  // Araç sayısı elle "6+" yazılıydı; gerçekte 114. Artık sayılıyor.
  const totalTools = getToolCount();

  // Kök öge div, main DEĞİL: AppShell zaten <main id="icerik"> basıyor.
  // İkincisi sayfada İKİ main landmark'ı üretiyordu — geçersiz, ve ekran
  // okuyucu hangisinin ana içerik olduğunu bilemiyor.
  return (
    <div className="min-h-screen bg-[#F8F9FC] font-sans text-blue-950">

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
          </div>
          {/* Martılar ve dipte iki soluk dalga — eski ızgara deseninin yerine */}
          <HeroDenizi />

          <div className="relative px-6 xl:px-8 py-8 lg:py-10">
            {/* Badge'ler */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="rounded-full bg-white/10 text-white/60 border border-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest">Beta</span>
              <Link href="/tr/premium/ydus" className="rounded-full bg-yellow-400 text-blue-950 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-widest hover:bg-yellow-300 transition-all">
                PREMIUM YDUS ⚓
              </Link>
              <KurumRozeti />
            </div>

            {/* Başlık */}
            {/* Harfler BÜYÜK YAZILIYOR, `uppercase` ile büyütülmüyor: sayfa dili
                Türkçe (lang="tr") olduğu için CSS büyütmesi "i" harfini "İ"ye
                çeviriyor ve marka adı ekranda "MEDİSEA" görünüyordu. */}
            <h1 className="text-4xl xl:text-5xl font-black text-white mb-3 italic tracking-tighter leading-[0.9]">
              MEDI<span className="not-italic">SEA</span>{" "}
              <span className="text-yellow-400 not-italic block">AKADEMİ</span>
            </h1>
            <p className="text-sm leading-relaxed text-blue-200/75 mb-6 font-medium">
              İç hastalıkları asistanları ve uzmanları için klinik karar desteği, güncel konu anlatımları ve YDUS hazırlık platformu.
            </p>

            {/* CTA */}
            <div className="flex flex-col gap-2 mb-7">
              <Link
                href="/tr/premium/ydus"
                className="text-center bg-yellow-400 text-blue-950 text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-full hover:bg-yellow-300 transition-all shadow-lg shadow-yellow-400/20 active:scale-95"
              >
                ⚓ PREMIUM YDUS
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
                <div className="text-[9px] font-bold text-blue-300 uppercase tracking-widest mt-0.5">Branş</div>
              </div>
              <div className="flex-1 text-center py-3">
                <div className="text-xl font-black text-white leading-none">{totalTopics}</div>
                <div className="text-[9px] font-bold text-blue-300 uppercase tracking-widest mt-0.5">Konu</div>
              </div>
              <div className="flex-1 text-center py-3">
                <div className="text-xl font-black text-white leading-none">{totalTools}</div>
                <div className="text-[9px] font-bold text-blue-300 uppercase tracking-widest mt-0.5">Araç</div>
              </div>
            </div>

            {/* Alt özellik linkleri */}
            <div className="mt-5 pt-5 border-t border-white/10 grid grid-cols-3 gap-2">
              {[
                /* Bu satır GEZİNME, sayaç değil. Sayılar hemen üstteki
                   istatistik çubuğunda duruyor; burada tekrar edilince hem
                   "411 konu" iki kez yazılıyor hem de aynı şeye iki ad
                   veriliyordu: üstte "114 ARAÇ", altta "114 skor". */
                { icon: "⚓", label: "YDUS", sub: "Soru & kart", href: "/tr/premium/ydus" },
                { icon: "🧪", label: "Araçlar", sub: "Skor & formül", href: "/tools" },
                { icon: "🗺️", label: "Konular", sub: "Branşa göre", href: "#branslar" },
              ].map((f) => (
                <Link key={f.href} href={f.href} className="group flex flex-col items-center text-center p-2.5 rounded-xl hover:bg-white/10 transition-all">
                  <span aria-hidden="true" className="text-lg mb-1">{f.icon}</span>
                  <span className="text-[10px] font-black text-white uppercase tracking-tight">{f.label}</span>
                  <span className="text-[9px] text-blue-300 mt-0.5">{f.sub}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── SAĞ: BRANŞLAR ───────────────────────────────── */}
        <section id="branslar" className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 lg:py-6">

          {/* Çalışma durumu — veri yoksa hiç görünmez */}
          <StudyStatus />


          {/* KÜTÜPHANEDE ARA — /topics'in kendi aramasına gider (sorgu adreste
              taşınıyor, bkz. KutuphaneArama). Form GET: JavaScript'siz de çalışır. */}
          <form action="/topics" method="get" role="search" className="relative mb-5">
            <label htmlFor="ana-ara" className="sr-only">Kütüphanede konu ara</label>
            <span aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">⌕</span>
            <input
              id="ana-ara"
              name="ara"
              type="search"
              placeholder={`${totalTopics} konu içinde ara — örn. hiponatremi, ITP, Cushing`}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-10 pr-28 text-sm font-semibold text-blue-950 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-900 focus:ring-4 focus:ring-blue-900/5"
            />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-blue-950 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition hover:bg-blue-900">
              Ara
            </button>
          </form>

          {/* Başlık + araç barı tek satırda */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-1 h-7 rounded-full bg-blue-950" />
              <div>
                <h2 className="font-serif text-lg font-bold text-blue-950 tracking-tight leading-none">Kütüphane</h2>
                <p className="text-[12px] font-semibold text-slate-500 mt-1">Ders kitabı düzeninde: kısım → bölüm → konu</p>
              </div>
            </div>
            {/* Hızlı araç chip'leri — desktop'ta burada */}
            <div className="hidden lg:flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {FEATURED_TOOLS.slice(0, 4).map((tool) => (
                <Link key={tool.slug} href={`/tools/${tool.slug}`}
                  className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all text-[11px] font-bold text-blue-950 whitespace-nowrap">
                  <span aria-hidden="true" className="text-xs">{tool.icon}</span>{tool.name}
                </Link>
              ))}
              <Link href="/tools" className="shrink-0 text-[11px] font-black text-blue-600 px-1.5 hover:underline uppercase tracking-tighter whitespace-nowrap">
                Tümü →
              </Link>
            </div>
          </div>

          {/* Branş kartları — her kart branşın KISIMLARINI sayar (İçindekiler'in
              özeti; kaynak content/brans-icindekiler.json). Eski kartlar yalnızca
              10.5px'lik büyük harfli bir ad gösteriyordu ve ziyaretçi bir branşın
              içinde ne olduğunu ancak girince görebiliyordu. Düzeni olmayan
              branşta kartın kendi açıklaması basılır. */}
          <div className="space-y-5">
            {CATEGORY_ORDER.map((catKey) => {
              const items = SPECIALTIES.filter((s) => s.category === catKey && (topicCounts[s.slug] || 0) > 0);
              if (!items.length) return null;
              const meta = CATEGORY_META[catKey];
              return (
                <div key={catKey}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] whitespace-nowrap">{meta.label}</h3>
                    <div className="flex-1 h-px bg-slate-200" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5">
                    {items.map((item) => {
                      const count = topicCounts[item.slug] || 0;
                      const kisimlar = kisimAdlari(item.slug);
                      return (
                        <Link
                          key={item.slug}
                          href={`/topics/${item.slug}`}
                          className={`group flex items-start gap-3 p-3.5 bg-white rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] ${item.color}`}
                        >
                          <div aria-hidden="true" className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${item.bg} shrink-0 group-hover:scale-105 transition-transform`}>
                            {item.icon}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-baseline justify-between gap-2">
                              <h3 className="font-serif text-[15px] font-bold text-blue-950 leading-tight break-words hyphens-auto">
                                {item.title}
                              </h3>
                              <span className="shrink-0 text-[11px] font-bold text-slate-500">{count} konu</span>
                            </div>
                            <p className="mt-1 text-[12px] leading-snug text-slate-600 line-clamp-3">
                              {kisimlar.length ? kisimlar.join(" · ") : item.desc}
                            </p>
                          </div>
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
            <span className="text-[9px] font-black text-blue-900/80 uppercase tracking-[0.2em] pr-3 border-r border-slate-200 shrink-0">Araçlar</span>
            {FEATURED_TOOLS.map((tool) => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50 transition-all whitespace-nowrap">
                <span aria-hidden="true" className="text-sm">{tool.icon}</span>
                <span className="text-[11px] font-bold text-blue-950">{tool.name}</span>
              </Link>
            ))}
            <Link href="/tools" className="shrink-0 inline-block py-1.5 text-[11px] font-black text-blue-600 px-2 hover:underline uppercase tracking-tighter whitespace-nowrap">Tümü →</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
