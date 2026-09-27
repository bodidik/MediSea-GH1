import Link from "next/link";
import { SPECIALTIES, CATEGORY_ORDER, CATEGORY_META } from "@/app/lib/specialties";
import { getTopicCounts, getToolCount } from "@/app/lib/topic-counts";
import StudyStatus from "@/app/components/StudyStatus";
import KurumRozeti from "@/app/components/KurumRozeti";
import { SabahDenizi } from "@/app/components/DenizSusu";
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
        {/* SABAH DENİZİ (27 Eyl 2026, kullanıcı kararı): bir dönem lacivert
            "gece" paneliydi. Kullanıcı "sabah güneşli, gece ya da derin değil"
            dedi; zemin açık gökyüzünden ufuktaki ılık tona iniyor, dipte
            pastel deniz bandı. Açık zemin olduğu için yazılar lacivert ve
            ikincil metin slate-600 — kontrast tabanı açık zemini varsayıyor. */}
        <section className="hero-sabah relative overflow-hidden bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50 border-b border-sky-100 lg:border-b-0 lg:border-r lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col justify-center">
          {/* sabah güneşinin ılık ışığı — sağ altta, ufkun üstünde */}
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
            <div className="absolute -bottom-10 -right-16 w-72 h-72 rounded-full bg-amber-200/40 blur-3xl" />
          </div>
          <SabahDenizi />

          <div className="relative px-6 xl:px-8 pt-8 pb-28 lg:pt-8 lg:pb-24">
            {/* Rozetler. Bir dönem burada bir "Premium YDUS" bağlantısı daha vardı
                ve altta üçlü bir bağlantı ızgarası duruyordu: aynı panelde
                premium ÜÇ, araçlar İKİ kez bağlanıyordu (kullanıcı: "ana sayfa
                kafa karıştırıcı"). Her hedefe tek bağlantı: aşağıdaki düğmeler. */}
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="rounded-full bg-white/80 text-slate-600 border border-slate-200 px-2.5 py-1 text-[11px] font-black uppercase tracking-widest">Beta</span>
              <KurumRozeti />
            </div>

            {/* Başlık */}
            {/* Harfler BÜYÜK YAZILIYOR, `uppercase` ile büyütülmüyor: sayfa dili
                Türkçe (lang="tr") olduğu için CSS büyütmesi "i" harfini "İ"ye
                çeviriyor ve marka adı ekranda "MEDİSEA" görünüyordu. */}
            <h1 className="text-4xl xl:text-5xl font-black text-blue-950 mb-3 italic tracking-tighter leading-[0.9]">
              <span className="text-blue-700">MEDI</span><span className="not-italic">SEA</span>{" "}
              <span className="text-amber-700 not-italic block">AKADEMİ</span>
            </h1>
            <p className="text-[15px] leading-relaxed text-slate-700 mb-6 font-medium">
              İç hastalıkları asistanları ve uzmanları için klinik karar desteği, güncel konu anlatımları ve YDUS hazırlık platformu.
            </p>

            {/* CTA */}
            <div className="flex flex-col gap-2 mb-7">
              <Link
                href="/tr/premium/ydus"
                className="text-center bg-yellow-400 text-blue-950 border border-yellow-500 text-xs font-black uppercase tracking-widest px-6 py-3 rounded-full hover:bg-yellow-300 transition-all shadow-md shadow-amber-300/30 active:scale-95"
              >
                ⚓ PREMIUM YDUS
              </Link>
              <div className="flex gap-2">
                <Link
                  href="/tools"
                  className="flex-1 text-center bg-white/80 border border-blue-900/20 text-blue-950 text-xs font-black uppercase tracking-widest px-4 py-3 rounded-full hover:bg-white transition-all active:scale-95"
                >
                  Hesaplayıcılar
                </Link>
                <Link
                  href="#branslar"
                  className="flex-1 text-center bg-white/80 border border-blue-900/20 text-blue-950 text-xs font-black uppercase tracking-widest px-4 py-3 rounded-full hover:bg-white transition-all active:scale-95 lg:hidden"
                >
                  Branşlar ↓
                </Link>
              </div>
            </div>

            {/* İstatistik barı */}
            <div className="flex items-center divide-x divide-sky-100 bg-white/75 border border-sky-100 rounded-xl overflow-hidden">
              <div className="flex-1 text-center py-3">
                <div className="text-xl font-black text-blue-950 leading-none">{totalBranches}</div>
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-1">Branş</div>
              </div>
              <div className="flex-1 text-center py-3">
                <div className="text-xl font-black text-blue-950 leading-none">{totalTopics}</div>
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-1">Konu</div>
              </div>
              <div className="flex-1 text-center py-3">
                <div className="text-xl font-black text-blue-950 leading-none">{totalTools}</div>
                <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mt-1">Araç</div>
              </div>
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
