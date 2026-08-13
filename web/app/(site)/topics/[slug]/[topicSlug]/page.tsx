//"C:\Users\hucig\Medknowledge\web\app\(site)\topics\[slug]\[topicSlug]\page.tsx"
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import YoneticiDuzenleyici from "@/components/topics/YoneticiDuzenleyici";
import { JsonLd, konuSemasi, kirintiSemasi } from "@/lib/jsonld";
import { getSpecialty } from "@/app/lib/specialties";
import ilgiliIndex from "@/content/ilgili-index.json";

/**
 * force-dynamic KALDIRILDI, yerine ISR.
 *
 * Konu içeriği dosya sisteminden geliyor ve yalnızca dağıtımda ya da yönetici
 * düzenlemesiyle değişiyor; her istekte yeniden üretmenin karşılığı yok.
 * Dinamikken 411 konu sayfasının hiçbiri CDN'e girmiyordu (x-vercel-cache hep
 * MISS). Sayfa hızı arama sıralamasına giren bir etken, üstelik açık taraf
 * huninin girişi.
 *
 * Düzenleme sonrası anında tazeleme için /api/revalidate ucu zaten var
 * (REVALIDATE_SECRET ile korunuyor); süre dolmasını beklemeye gerek yok.
 *
 * Sayfanın oturuma bağlı hiçbir parçası kalmadı: yönetici düzenleyicisi
 * istemcide yetki sorup kendini gösteriyor.
 */
export const revalidate = 3600;

/**
 * Yalnızca `revalidate` vermek yetmedi: dinamik segment derlemede önceden
 * üretilmediği sürece Vercel sayfayı CDN'e almıyor, ölçümde x-vercel-cache
 * hep MISS kalıyordu. Görünür konular derlemede üretiliyor.
 *
 * Gizli konular listeye alınmıyor — sayfaları hâlâ adresle açılabilir, sadece
 * ilk istekte üretilirler (dynamicParams varsayılanı). Aynı şekilde sonradan
 * eklenen bir konu da derlemeyi beklemez.
 */
export async function generateStaticParams() {
  const cikti: { slug: string; topicSlug: string }[] = [];
  try {
    const kok = path.join(process.cwd(), "content", "canonical");
    for (const brans of fs
      .readdirSync(kok, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)) {
      const dizin = path.join(kok, brans);
      for (const dosya of fs.readdirSync(dizin).filter((f) => f.endsWith(".json"))) {
        try {
          const veri = JSON.parse(fs.readFileSync(path.join(dizin, dosya), "utf-8"));
          if (veri?.meta?.hidden === true) continue;
          cikti.push({ slug: brans, topicSlug: dosya.replace(/\.json$/, "") });
        } catch {
          // Bozuk dosya derlemeyi düşürmesin; o sayfa istek anında üretilir.
        }
      }
    }
  } catch {
    // İçerik okunamazsa hiçbir sayfa önceden üretilmez, hepsi istek anında.
  }
  return cikti;
}

function konuOku(slug: string, topicSlug: string): any | null {
  try {
    const yol = path.join(process.cwd(), "content", "canonical", slug, `${topicSlug}.json`);
    return JSON.parse(fs.readFileSync(yol, "utf-8"));
  } catch {
    return null;
  }
}

/** HTML'i düz metne indirger; arama sonucunda görünecek özet buradan çıkıyor. */
function ozetCikar(veri: any, sinir = 155): string {
  const hazir = veri?.summary || veri?.meta?.summary;
  const kaynak =
    hazir ||
    (Array.isArray(veri?.sections)
      ? veri.sections.map((s: any) => s?.text || s?.html || "").join(" ")
      : "");

  const duz = String(kaynak)
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (duz.length <= sinir) return duz;
  // Kelimenin ortasında kesme: son boşluktan kırp.
  const kirpik = duz.slice(0, sinir);
  return kirpik.slice(0, kirpik.lastIndexOf(" ")).trimEnd() + "…";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; topicSlug: string }>;
}): Promise<Metadata> {
  const { slug, topicSlug } = await params;
  const veri = konuOku(slug, topicSlug);

  if (!veri) return { title: "Konu bulunamadı", robots: { index: false, follow: false } };

  const baslik = veri.title || topicSlug.replace(/-/g, " ");
  const aciklama = ozetCikar(veri);
  const yol = `/topics/${slug}/${topicSlug}`;

  return {
    title: baslik,
    description: aciklama || undefined,
    keywords: Array.isArray(veri?.meta?.tags) ? veri.meta.tags : undefined,
    alternates: { canonical: yol },
    openGraph: {
      type: "article",
      title: baslik,
      description: aciklama || undefined,
      url: yol,
    },
  };
}

export default async function TopicDetailPage({ 
  params 
}: { 
  params: Promise<{ slug: string; topicSlug: string }> 
}) {
  const { slug, topicSlug } = await params;
  const branchDir = path.join(process.cwd(), "content", "canonical", slug);
  const filePath = path.join(branchDir, `${topicSlug}.json`);

  if (!fs.existsSync(filePath)) return notFound();

  // 1. Ana Dosyayı Oku
  // Bozuk TEK bir içerik dosyası bütün rotayı 500'e düşürmemeli. Ayrıştırma
  // düşerse sayfa ayakta kalır: künye, alt başlıklar ve kenar çubuğu çalışmaya
  // devam eder, içerik yerine dürüst bir hata kartı gösterilir.
  let rawData: any = {};
  let okumaHatasi: string | null = null;
  try {
    rawData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  } catch (e) {
    okumaHatasi = e instanceof Error ? e.message : String(e);
    console.error(`[konu] ${slug}/${topicSlug}.json ayrıştırılamadı:`, okumaHatasi);
  }

  const topicItem = {
    slug: topicSlug,
    branch: slug,
    title: rawData.title || topicSlug.replace(/-/g, " "),
    summary: rawData.summary || rawData.meta?.summary || "",
    parent: rawData.meta?.parent || null,
    sections: Array.isArray(rawData.sections)
      ? rawData.sections.map((s: any) => ({
          heading: s.heading || s.title || "Başlıksız Blok",
          html: s.text || s.html || "",
          visibility: s.visibility || "V"
        }))
      : []
  };

  // 2. OTOMATİK AĞAÇ YAPISI (Çocuklar ve Torunlar)
  const allFiles = fs.readdirSync(branchDir).filter(f => f.endsWith(".json"));
  
  // Önce klasördeki tüm dosyaların künyesini çıkar
  const allTopics = allFiles.map(file => {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(branchDir, file), "utf-8"));
      return { 
        slug: file.replace(".json", ""), 
        title: content.title, 
        parent: content.meta?.parent || null,
        hidden: content.meta?.hidden || false,
        order: content.meta?.order || 99
      };
    } catch (e) { return null; }
  }).filter(Boolean) as {slug: string, title: string, parent: string | null, hidden: boolean, order: number}[];

  // Doğrudan çocukları bul ve sıraya (order) göre diz
  const childTopics = allTopics
    .filter(t => t.parent === topicSlug && !t.hidden)
    .sort((a, b) => a.order - b.order);

  // Her çocuğun KENDİ çocuğu var mı diye bak (dinamik: parent-child grafiğinden çıkarılır)
  // - Kendi çocuğu OLAN bir alt konu = "hub" (menü) -> Menü ızgarasında gösterilir, tıklanınca kendi menüsünü/içeriğini açar
  // - Kendi çocuğu OLMAYAN bir alt konu = "kılcal" (leaf) -> İleri Okuma listesinde gösterilir
  const childrenWithDepth = childTopics.map(child => ({
    ...child,
    hasOwnChildren: allTopics.some(t => t.parent === child.slug && !t.hidden)
  }));

  const hubChildren = childrenWithDepth.filter(c => c.hasOwnChildren);
  const leafChildren = childrenWithDepth.filter(c => !c.hasOwnChildren);

  const bransAdi = getSpecialty(slug)?.title || slug;

  // İlgili konular: etiket akrabalığından önceden üretiliyor
  // (scripts/ilgili-index.cjs). Ebeveyn ve çocuklar dizinde zaten elenmiş
  // olduğu için burada tekrar bağlantı çıkmaz.
  const ilgililer =
    (ilgiliIndex as Record<string, { brans: string; slug: string; baslik: string }[]>)[
      `${slug}/${topicSlug}`
    ] ?? [];

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-sans">
      <JsonLd
        veri={konuSemasi({
          baslik: topicItem.title,
          aciklama: ozetCikar(rawData),
          yol: `/topics/${slug}/${topicSlug}`,
          guncelleme: rawData?.meta?.updatedAt,
          etiketler: Array.isArray(rawData?.meta?.tags) ? rawData.meta.tags : undefined,
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Kütüphane", yol: "/topics" },
          { ad: bransAdi, yol: `/topics/${slug}` },
          { ad: topicItem.title, yol: `/topics/${slug}/${topicSlug}` },
        ])}
      />
      <div className="max-w-[1400px] mx-auto">

        {/* Üst Yönlendirme Çubuğu */}
        <div className="mb-8 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400">
          {/* py-1.5: kırıntı yolu bağlantıları mobilde 16px yüksekliğindeydi,
              yani dokunma hedefi olarak WCAG asgarisinin (24px) altında. */}
          <Link href="/topics" className="py-1.5 hover:text-blue-600 transition-colors">Kütüphane</Link>
          <span>/</span>
          <Link href={`/topics/${slug}`} className="py-1.5 hover:text-blue-600 transition-colors">{bransAdi}</Link>
          <span>/</span>
          <span className="text-blue-900">{topicItem.title}</span>
        </div>

        {/* Ana Izgara */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* --- SOL KOLON: İÇERİK --- */}
          <div className="lg:col-span-8 space-y-8">
            <div className="border-l-8 border-blue-900 pl-6 py-2">
              <h1 className="text-4xl md:text-5xl font-black text-blue-950 uppercase italic tracking-tighter leading-none mb-3">
                {topicItem.title}
              </h1>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Güncelleme: {rawData.meta?.updatedAt || "06 MAR 2026"}
              </div>
            </div>

            {/* Alt Başlıklar Menüsü (Hub Çocukları) — konuyu bulana kadar menü açılmaya devam eder */}
            {hubChildren.length > 0 && (
              <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 md:p-8">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-xs font-black text-blue-950 uppercase tracking-[0.2em]">
                    Alt Başlıklar
                  </h2>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {hubChildren.length} kategori
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {hubChildren.map(child => (
                    <Link
                      key={child.slug}
                      href={`/topics/${slug}/${child.slug}`}
                      className="group p-3 bg-slate-50 border border-slate-100 rounded-[1.75rem] hover:border-blue-900 hover:bg-white hover:shadow-xl transition-all duration-300 flex justify-between items-center"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-black text-blue-900/20 group-hover:text-blue-900/40 transition-colors italic">
                          #{child.order < 99 ? child.order : "•"}
                        </span>
                        <h3 className="text-base font-black text-blue-950 uppercase italic group-hover:text-blue-700">
                          {child.title}
                        </h3>
                      </div>
                      <div className="text-blue-900 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* data-readable: ReadingTools bu konteyner içindeki seçimleri
                vurgulanabilir kabul eder (yönetici editörü hariç tutulur) */}
            <div data-readable className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden p-8 md:p-12 space-y-10">
              {okumaHatasi && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6">
                  <h2 className="text-base font-black text-amber-900 uppercase tracking-wide mb-2">
                    Bu konunun içeriği okunamadı
                  </h2>
                  <p className="text-sm text-amber-900/80 font-medium leading-relaxed mb-3">
                    <code className="font-mono">{slug}/{topicSlug}.json</code> dosyası geçerli
                    bir JSON değil, bu yüzden metin gösterilemiyor. Dosya düzeltilene kadar
                    düzenleyici de kapalı — boş bir kayıt yazıp mevcut içeriğin üzerine
                    gitmemesi için.
                  </p>
                  <p className="text-[11px] font-mono text-amber-900/60 break-all">{okumaHatasi}</p>
                </div>
              )}

              {topicItem.summary && (
                <div className="text-lg text-slate-700 font-medium leading-relaxed bg-blue-50/40 p-6 rounded-3xl border-l-4 border-blue-300">
                  <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-[0.3em] block mb-2">Hızlı Özet</span>
                  <div className="whitespace-pre-wrap">{topicItem.summary}</div>
                </div>
              )}

              {topicItem.sections.length > 0 && (
                <div className="space-y-12">
                  {topicItem.sections.map((section: any, idx: number) => (
                    <section key={idx} className="relative group">
                      {section.visibility !== 'V' && (
                        <span className="absolute -top-4 right-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-amber-100 text-amber-800">
                          {section.visibility === 'M' ? 'Sadece Hekim' : 'Taslak'}
                        </span>
                      )}
                      <h2 className="text-2xl font-black text-blue-950 mb-5 border-b-2 border-slate-100 pb-3 flex items-center gap-3">
                        <span className="text-blue-200">#</span>{section.heading}
                      </h2>
                      <div 
                        className="text-slate-600 leading-relaxed [&>p]:mb-4 [&>ul]:list-disc [&>ul]:pl-5 [&>ul>li]:mb-2 [&>strong]:text-blue-950 [&>strong]:font-black"
                        dangerouslySetInnerHTML={{ __html: section.html }}
                      />
                    </section>
                  ))}
                </div>
              )}
            </div>

            {/* İçerik Editörü — YALNIZCA YÖNETİCİYE. Kapı istemcide kuruluyor
                (bkz. YoneticiDuzenleyici): sunucuda oturuma göre farklı HTML
                üretmek sayfayı önbelleğe alınamaz hâle getirirdi.
                Dosya ayrıştırılamadıysa GÖSTERİLMEZ: editör elindeki `item`'ı
                geri yazar, o da boş olduğu için kaydetmek diskteki asıl içeriği
                silerdi. */}
            {!okumaHatasi && <YoneticiDuzenleyici item={topicItem} />}
          </div>

          {/* --- SAĞ KOLON: DİNAMİK SİDEBAR --- */}
          <div className="lg:col-span-4">
            
            <div className="sticky top-32 space-y-8">
              
              {/* İleri Okuma: SADECE kılcal (kendi çocuğu olmayan) alt konular */}
              {leafChildren.length > 0 && (
                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-blue-950 uppercase tracking-widest border-b-2 border-slate-100 pb-4 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    İleri Okuma
                  </h3>

                  <ul className="space-y-4">
                    {leafChildren.map(child => (
                      <li key={child.slug}>
                        <Link
                          href={`/topics/${slug}/${child.slug}`}
                          className="group flex items-start gap-3 text-sm font-bold text-slate-700 hover:text-blue-700 transition-colors"
                        >
                          <span className="text-blue-300 group-hover:text-blue-500 mt-0.5">↳</span>
                          <span className="leading-tight">{child.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>

                </div>
              )}

              {/* İlgili Konular — etiket akrabalığından, branş sınırı gözetmeden */}
              {ilgililer.length > 0 && (
                <div className="bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm">
                  <h3 className="text-sm font-black text-blue-950 uppercase tracking-widest border-b-2 border-slate-100 pb-4 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    İlgili Konular
                  </h3>

                  <ul className="space-y-4">
                    {ilgililer.map((k) => (
                      <li key={`${k.brans}/${k.slug}`}>
                        <Link
                          href={`/topics/${k.brans}/${k.slug}`}
                          className="group flex items-start gap-3 text-sm font-bold text-slate-700 hover:text-blue-700 transition-colors"
                        >
                          <span className="text-blue-300 group-hover:text-blue-500 mt-0.5">→</span>
                          <span className="leading-tight">
                            {k.baslik}
                            {k.brans !== slug && (
                              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                                {getSpecialty(k.brans)?.title || k.brans}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Dinamik YDUS-Premium Tanıtımı */}
             	      <Link href={`/tr/premium/ydus/${slug}`} className="block bg-gradient-to-br from-blue-950 to-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl text-white relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">
                	      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>
                
              	       <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-4 block">
               	          MediSea Premium
                       </span>
                
                       <h4 className="text-xl font-black italic uppercase leading-tight mb-3">
                          YDUS {slug.replace(/-/g, ' ')} 
      	           </h4>
                
         	          <p className="text-sm text-slate-400 font-medium mb-6 leading-relaxed">
                		 Bu branşla ilgili çıkmış tüm YDUS soruları ve çözümlü vaka analizleri Premium abonelere özel.
                	      </p>
                
                       <div className="inline-block bg-amber-500 text-slate-900 text-xs font-black uppercase tracking-widest px-5 py-3 rounded-full group-hover:bg-white transition-colors">
                          İncele →
           	         </div>
                    </Link>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
}