// C:\Users\hucig\Medknowledge\web\app\(site)\topics\[slug]\page.tsx"
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSpecialty } from "@/app/lib/specialties";
import { getTopicCounts } from "@/app/lib/topic-counts";
import { getBranchTools, getBranchToolCategory } from "@/app/lib/tools";
import { JsonLd, kirintiSemasi } from "@/lib/jsonld";
import { slugCoz } from "@/lib/slug";
import { bransIcindekiler, roma, type TocBolum } from "@/lib/icindekiler";
import BransArama from "./BransArama";
import { DalgaCizgisi, DumenSimgesi } from "@/app/components/DenizSusu";

// Branş listesi de dosya sisteminden geliyor ve oturuma bağlı değil.
// force-dynamic yüzünden CDN'e hiç girmiyordu; ISR ile önbelleğe alınıyor,
// /api/revalidate ile anında tazelenebiliyor.
export const revalidate = 3600;

/**
 * Yalnızca `revalidate` vermek yetmedi: dinamik segment derlemede önceden
 * üretilmediği sürece Vercel sayfayı CDN'e almıyor, ölçümde x-vercel-cache
 * hep MISS kalıyordu. Branşlar derlemede üretiliyor.
 *
 * Listede olmayan bir slug yine istek anında üretilir (dynamicParams
 * varsayılanı), yani içerik eklemek derlemeyi beklemez.
 */
export async function generateStaticParams() {
  try {
    const kok = path.join(process.cwd(), "content", "canonical");
    return fs
      .readdirSync(kok, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => ({ slug: d.name }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug: hamSlug } = await params;
  const slug = slugCoz(hamSlug);
  const brans = getSpecialty(slug);
  const dizin = path.join(process.cwd(), "content", "canonical", slug);

  if (!fs.existsSync(dizin)) {
    return { title: "Branş bulunamadı", robots: { index: false, follow: false } };
  }

  /**
   * SAYIYI SAYDIR, DOSYA SAYMA — `getTopicCounts()` gizli konuları eler.
   *
   * Burada dizindeki her `.json` sayılıyordu ve `meta.hidden` işaretliler de
   * toplama giriyordu. Ölçüldü (canlı, meta açıklamalar): endokrinoloji
   * **132** diyordu ama sayfada 116 konu var; nefroloji 52/47; romatoloji
   * 19/11. Hematoloji ve kardiyoloji tesadüfen tutuyordu — o iki branşta
   * gizli konu yok.
   */
  const konuSayisi = getTopicCounts()[slug] ?? 0;

  const baslik = brans?.title || slug.replace(/-/g, " ");
  const aciklama = brans?.desc
    ? `${brans.desc}. ${konuSayisi} konu başlığıyla güncel Türkçe ${baslik.toLowerCase()} kaynağı.`
    : `${konuSayisi} konu başlığıyla güncel Türkçe ${baslik.toLowerCase()} kaynağı.`;

  return {
    title: baslik,
    description: aciklama,
    alternates: { canonical: `/topics/${slug}` },
    openGraph: { type: "website", title: baslik, description: aciklama, url: `/topics/${slug}` },
  };
}

/** Açık site branşı → premium branş adresi (yalnızca premiumda karşılığı olanlar). */
const PREMIUM_BRANS: Record<string, string> = {
  endokrinoloji: "endokrinoloji",
  enfeksiyon: "enfeksiyon",
  gastroenteroloji: "gastroenteroloji",
  "genel-dahiliye": "genel-dahiliye",
  gogus: "gogus-hastaliklari",
  hematoloji: "hematoloji",
  kardiyoloji: "kardiyoloji",
  nefroloji: "nefroloji",
  onkoloji: "onkoloji",
  romatoloji: "romatoloji",
};

/** Bölümün doğrudan alt başlıkları bu sayıyı aşarsa kalanı katlanır. */
const GORUNUR_ALT = 7;

export default async function BranchListPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug: hamSlug } = await params;
  const slug = slugCoz(hamSlug);
  const branchDir = path.join(process.cwd(), "content", "canonical", slug);

  if (!fs.existsSync(branchDir)) return notFound();

  // Branşın kimlik bilgisi (başlık, ikon, renk) — ana sayfayla aynı ortak kaynaktan
  const specialty = getSpecialty(slug);
  /* Bu branşla ilişkili klinik hesaplayıcılar (varsa).
   *
   * Liste `content/brans-arac.json`'dan geliyor ve o dosya hub'ın kendi
   * kategori verisinden ÜRETİLİYOR — elle tutulan eski eşleme iki branşta
   * hub'la hiç örtüşmüyordu (bkz. app/lib/tools.ts başlığı).
   *
   * Şerit kırpılıyor: türetilen liste bazı branşlarda 14-36 araç veriyor ve
   * hepsini yatay bir şeride basmak okunmaz. Kırpma GİZLEMİYOR — "Tümü"
   * bağlantısı gerçek sayıyı yazıyor ve SÜZÜLMÜŞ hub'a gidiyor. */
  const branchTools = getBranchTools(slug);
  const seritAraclar = branchTools.slice(0, 8);
  const aracKategorisi = getBranchToolCategory(slug);

  /* İÇİNDEKİLER — ders kitabı düzeni (bkz. lib/icindekiler.ts).
   *
   * Eski sayfa yalnızca üst düzey konuları basıyordu; alt başlıklar ancak
   * konuya girince görünüyordu ve ebeveyni bulunamayanlar sayfanın dibinde
   * "Diğer Konular" kovasına düşüyordu. Artık her bölüm alt başlıklarıyla
   * birlikte, kısımlara ayrılmış olarak basılıyor; asılı konular kendi
   * gruplarında (ör. "Viral Hepatitler") toplanıyor. */
  const toc = bransIcindekiler(slug);
  const bolumSayisi = toc.kisimlar.reduce((t, k) => t + k.bolumler.length, 0);
  const premiumBrans = PREMIUM_BRANS[slug];

  /** Görünen kırıntı yolu ile JSON-LD şeması AYNI diziden üretilir. */
  const kirintiAdimlari = [
    { ad: "MediSea", yol: "/" },
    { ad: "Kütüphane", yol: "/topics" },
    { ad: specialty?.title || slug.replace(/-/g, " "), yol: `/topics/${slug}` },
  ];

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Kırıntı şeması — görünen kırıntı yoluyla aynı diziden. */}
      <JsonLd veri={kirintiSemasi(kirintiAdimlari)} />

      {/* --- BRANŞ HERO (branşın kendi renk/ikon kimliğiyle) --- */}
      <div className={`relative overflow-hidden border-b border-slate-200 ${specialty.bg}`}>
        <div className="max-w-5xl mx-auto px-5 sm:px-6 pt-7 pb-6 sm:pt-9 sm:pb-8">

          {/* flex-wrap: uzun kırıntı 375px'te yatay kaydırma üretmesin. Konu
              sayfasıyla AYNI kalıp: gezinme landmark'ı + liste + aria-current. */}
          <nav aria-label="Kırıntı yolu" className="mb-4">
            <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] font-semibold text-slate-500">
              {kirintiAdimlari.map((a, i) => {
                const sonAdim = i === kirintiAdimlari.length - 1;
                return (
                  <li key={a.yol} className="flex items-center gap-x-1.5">
                    {i > 0 && <span aria-hidden="true">/</span>}
                    {sonAdim ? (
                      <span className="text-blue-900" aria-current="page">{a.ad}</span>
                    ) : (
                      <Link href={a.yol} className="inline-block py-1.5 hover:text-blue-700 transition-colors">
                        {a.ad}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          <div className="flex items-center gap-4 sm:gap-5">
            <div aria-hidden="true" className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl sm:text-4xl shrink-0">
              {specialty.icon}
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-2xl sm:text-4xl font-black text-blue-950 tracking-tight leading-tight">
                {specialty.title}
              </h1>
              <p className="text-[13px] sm:text-sm font-semibold text-slate-600 mt-1">
                {toc.kisimlar.length > 1 ? `${toc.kisimlar.length} kısım · ` : ""}
                {bolumSayisi} bölüm · {toc.konuSayisi} konu
              </p>
            </div>
          </div>

          <div className="mt-5 max-w-xl">
            <BransArama konular={toc.duz} brans={slug} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
        {bolumSayisi === 0 ? (
          <div className="p-16 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
            <p className="text-slate-500 font-black uppercase tracking-widest">
              Bu branşta henüz geçerli/kayıtlı konu yok.
            </p>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-[210px_1fr] lg:gap-10">

            {/* KISIM DİZİNİ — masaüstünde yapışkan yan sütun, mobilde yatay çipler.
                Tek kısımlı branşta basılmaz (gezinecek bir şey yok). */}
            {toc.kisimlar.length > 1 ? (
              <nav aria-label="Kısımlar" className="mb-6 lg:mb-0">
                <div className="lg:sticky lg:top-24">
                  <h2 className="mb-2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-slate-500"><DumenSimgesi className="h-4 w-4 text-blue-900" />İçindekiler</h2>
                  <ol className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:gap-0.5 lg:overflow-visible">
                    {toc.kisimlar.map((k) => (
                      <li key={k.no} className="shrink-0">
                        <a
                          href={`#kisim-${k.no}`}
                          className="flex items-baseline gap-2 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-3 py-2 text-[13px] font-bold text-blue-950 transition hover:border-blue-900/30 hover:bg-slate-50 lg:whitespace-normal lg:border-transparent lg:bg-transparent lg:px-2 lg:py-1.5"
                        >
                          <span className="font-serif text-[12px] text-slate-500">{roma(k.no)}.</span>
                          <span>{k.baslik}</span>
                        </a>
                      </li>
                    ))}
                  </ol>
                  {premiumBrans && (
                    <Link
                      href={`/tr/premium/ydus/${premiumBrans}`}
                      className="mt-4 hidden rounded-2xl bg-blue-950 p-4 text-white transition hover:bg-blue-900 lg:block"
                    >
                      <span className="block text-[11px] font-black uppercase tracking-widest text-yellow-300">Premium ⚓</span>
                      <span className="mt-1 block text-[13px] font-semibold leading-snug text-blue-100">
                        Bu branşın soru bankası, vakaları ve tekrar kartları
                      </span>
                    </Link>
                  )}
                </div>
              </nav>
            ) : (
              <div className="hidden lg:block" />
            )}

            <div className="min-w-0 space-y-10">
              {toc.kisimlar.map((kisim) => (
                <section key={kisim.no} id={`kisim-${kisim.no}`} aria-labelledby={`kisim-${kisim.no}-baslik`}>
                  <div className="mb-1 flex items-baseline gap-3">
                    {toc.kisimlar.length > 1 && (
                      <span className="font-serif text-lg font-black text-slate-500">{roma(kisim.no)}</span>
                    )}
                    <h2 id={`kisim-${kisim.no}-baslik`} className="font-serif text-xl sm:text-2xl font-bold text-blue-950 tracking-tight">
                      {kisim.baslik}
                    </h2>
                  </div>
                  <DalgaCizgisi className="mb-3 text-sky-300" />
                  <ol className="space-y-3">
                    {kisim.bolumler.map((b) => (
                      <BolumKarti key={b.no} bolum={b} brans={slug} renk={specialty.color} />
                    ))}
                  </ol>
                </section>
              ))}
            </div>
          </div>
        )}

        {/* Premium çağrısı mobilde (masaüstünde yan sütunda). */}
        {premiumBrans && bolumSayisi > 0 && (
          <Link
            href={`/tr/premium/ydus/${premiumBrans}`}
            className="mt-8 flex items-center justify-between gap-3 rounded-2xl bg-blue-950 px-5 py-4 text-white transition hover:bg-blue-900 lg:hidden"
          >
            <span>
              <span className="block text-[11px] font-black uppercase tracking-widest text-yellow-300">Premium ⚓</span>
              <span className="mt-0.5 block text-[13px] font-semibold text-blue-100">Soru bankası, vakalar ve tekrar kartları</span>
            </span>
            <span aria-hidden="true" className="text-yellow-300">→</span>
          </Link>
        )}

        {/* İLGİLİ HESAPLAYICILAR (branşla eşleşen varsa) */}
        {branchTools.length > 0 && (
          <div className="mt-8 sm:mt-10">
            <div className="bg-slate-50/50 rounded-2xl p-2.5 border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar sm:flex-wrap">
              <span className="text-[9px] font-black text-blue-900/80 uppercase tracking-[0.2em] px-3 border-r border-slate-200 hidden md:block shrink-0">
                İlgili Hesaplayıcılar
              </span>
              {seritAraclar.map((tool) => (
                <Link
                  key={tool.slug}
                  href={`/tools/${tool.slug}`}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl border border-slate-100 hover:border-yellow-400 hover:shadow-lg hover:-translate-y-0.5 transition-all group whitespace-nowrap"
                >
                  <span aria-hidden="true" className="text-sm">{tool.icon}</span>
                  <span className="text-[11px] font-bold text-blue-950">{tool.name}</span>
                </Link>
              ))}
              <Link
                href={aracKategorisi ? `/tools?kategori=${aracKategorisi}` : "/tools"}
                className="shrink-0 inline-block py-1.5 text-[11px] font-black text-blue-600 px-3 hover:underline uppercase tracking-tighter whitespace-nowrap"
              >
                {branchTools.length > seritAraclar.length
                  ? `Tümü (${branchTools.length}) →`
                  : "Tümü →"}
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Tek bölüm kartı: başlık + doğrudan alt başlıklar.
 *
 * Modül düzeyinde tanımlı (render içinde DEĞİL — ic-bilesen-denetim).
 * Alt başlıklar GORUNUR_ALT'ı aşarsa kalanı yerel `<details>` içinde:
 * JavaScript'siz açılır, klavyeyle erişilir, arama motoru metni görür.
 */
function BolumKarti({ bolum, brans, renk }: { bolum: TocBolum; brans: string; renk: string }) {
  const ilk = bolum.cocuklar.slice(0, GORUNUR_ALT);
  const kalan = bolum.cocuklar.slice(GORUNUR_ALT);
  const baslikIc = (
    <>
      <span className="font-serif text-[12px] font-bold text-slate-500">Bölüm {bolum.no}</span>
      <span className="mt-0.5 block font-serif text-[17px] font-bold leading-snug text-blue-950">
        {bolum.baslik}
      </span>
    </>
  );
  return (
    <li className={`rounded-2xl border border-slate-200 bg-white transition hover:shadow-md ${renk}`}>
      {bolum.slug ? (
        <Link href={`/topics/${brans}/${bolum.slug}`} className="group flex items-start justify-between gap-3 px-4 pt-3.5 pb-2.5">
          <span className="min-w-0">{baslikIc}</span>
          <span aria-hidden="true" className="mt-4 shrink-0 text-slate-400 transition group-hover:translate-x-0.5">→</span>
        </Link>
      ) : (
        <div className="px-4 pt-3.5 pb-2.5">{baslikIc}</div>
      )}
      {bolum.cocuklar.length > 0 && (
        <div className="border-t border-slate-100 px-2 pb-2 pt-1">
          <ul className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-3">
            {ilk.map((c) => (
              <AltSatir key={c.slug} slug={c.slug} baslik={c.baslik} alt={c.altToplam} brans={brans} />
            ))}
          </ul>
          {kalan.length > 0 && (
            <details className="group/d">
              <summary className="mx-2 mt-1 cursor-pointer list-none py-1.5 text-[13px] font-bold text-blue-700 hover:underline">
                <span className="group-open/d:hidden">+{kalan.length} alt başlık daha</span>
                <span className="hidden group-open/d:inline">Daha az göster</span>
              </summary>
              <ul className="grid grid-cols-1 sm:grid-cols-2 sm:gap-x-3">
                {kalan.map((c) => (
                  <AltSatir key={c.slug} slug={c.slug} baslik={c.baslik} alt={c.altToplam} brans={brans} />
                ))}
              </ul>
            </details>
          )}
        </div>
      )}
    </li>
  );
}

function AltSatir({ slug, baslik, alt, brans }: { slug: string; baslik: string; alt: number; brans: string }) {
  return (
    <li>
      <Link
        href={`/topics/${brans}/${slug}`}
        className="flex items-baseline gap-2 rounded-lg px-2 py-1.5 text-[14px] leading-snug text-slate-700 transition hover:bg-slate-50 hover:text-blue-900"
      >
        <span aria-hidden="true" className="text-slate-400">·</span>
        <span className="min-w-0 flex-1">{baslik}</span>
        {alt > 0 && (
          <span className="shrink-0 rounded-full bg-slate-100 px-1.5 text-[11px] font-bold text-slate-600" title={`${alt} ileri okuma`}>
            +{alt}
          </span>
        )}
      </Link>
    </li>
  );
}
