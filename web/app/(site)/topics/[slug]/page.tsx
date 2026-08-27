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
import { ebeveyniCoz } from "@/lib/slug-eslestir";
import { slugCoz } from "@/lib/slug";

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
   *
   * Bu sayı arama sonucu parçacığında görünüyor: ziyaretçiye 132 vaat edip
   * 116 göstermek, `topic-counts.ts` içinde ana sayfa için zaten yazılmış
   * olan kuralın aynısını ihlal ediyordu. O düzeltme bu çağrı yerine
   * uygulanmamıştı.
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

  // 1. Ham dosyaları al
  const files = fs.readdirSync(branchDir).filter((f) => f.endsWith(".json"));

  // 2. Normalizasyon ve ZIRHLI OKUMA (Hata Toleransı)
  const topicList = files
    .map((file) => {
      const filePath = path.join(branchDir, file);

      try {
        const raw = fs.readFileSync(filePath, "utf-8");
        const content = JSON.parse(raw);

        return {
          slug: file.replace(".json", ""),
          title: content.title || file.replace(".json", ""),
          order: Number(content.meta?.order ?? 999),
          parent: content.meta?.parent || null,
          hidden: content.meta?.hidden || false,
        };
      } catch (err) {
        // Bozuk JSON sistemi çökertmez, sadece loglanır ve atlanır
        console.error(`⚠️ Bozuk JSON atlandı: ${filePath}`, err);
        return null;
      }
    })
    .filter(Boolean) as { slug: string; title: string; order: number; parent: string | null; hidden: boolean }[];

  // 2b. Ebeveyn referansındaki YAZIM sapmasını onar.
  //
  // Ölçüldü: bir konu ebeveynini "Ön-hipofiz-hastaliklari-giris" diye
  // yazmış, dosya ise "on-hipofiz-hastaliklari-giris" — fark yalnızca büyük
  // harf ve Ö. Aşağıdaki bütün karşılaştırmalar tam dize eşleşmesi yaptığı
  // için konu hiyerarşiden düşüyor, ebeveyninin sayfasında görünmüyordu.
  //
  // Gerçekten var olmayan bir ebeveyn ham hâliyle kalır; yani bu onarım
  // eksikleri GİZLEMEZ, "Diğer Konular" ve asili-denetim.cjs onları
  // görmeye devam eder.
  const tumSluglar = new Set(topicList.map((t) => t.slug));
  for (const t of topicList) t.parent = ebeveyniCoz(t.parent, tumSluglar);

  // 3. Stabil Sıralama: Önce Order (Sayısal), sonra Alfabetik (Türkçe-Base)
  topicList.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return a.title.localeCompare(b.title, "tr", { sensitivity: "base" });
  });

  // 4. SADECE ANA KONULARI LİSTELE (Alt konular burada görünmesin — onlar konu
  // detay sayfasındaki "Alt Başlıklar" menüsünde / "İleri Okuma"da yer alır)
  const mainTopics = topicList.filter(t => !t.parent && !t.hidden);

  /** Görünen kırıntı yolu ile JSON-LD şeması AYNI diziden üretilir. */
  const kirintiAdimlari = [
    { ad: "MediSea", yol: "/" },
    { ad: "Kütüphane", yol: "/topics" },
    { ad: specialty?.title || slug.replace(/-/g, " "), yol: `/topics/${slug}` },
  ];

  // Her ana konunun kendi alt konusu var mı? (kaç tane) — kompakt kartta rozet olarak gösterilir
  const childCounts: Record<string, number> = {};
  for (const t of topicList) {
    if (t.parent && !t.hidden) {
      childCounts[t.parent] = (childCounts[t.parent] || 0) + 1;
    }
  }

  // ASILI KALAN KONULAR — ebeveyni olarak yazılan konu ya hiç yok ya da gizli.
  //
  // Bunlar hiyerarşiden düşüyordu: ebeveyni olduğu için ana listeye girmiyor,
  // ebeveyninin sayfası da olmadığı için hiçbir yerden bağlantı almıyorlardı.
  // Kütüphanenin %11'i (46 konu) böyleydi ve aralarında "Akut Koroner
  // Sendromlar" gibi temel başlıklar vardı — yalnızca doğrudan adresle ya da
  // arama motorundan bulunabiliyorlardı.
  //
  // İçeriği düzeltmek yerine gezinme kendini onarıyor: ebeveyni bulunamayan
  // konu kaybolmuyor, aşağıda listeleniyor. İçerik düzeldikçe bu bölüm
  // kendiliğinden boşalır.
  const slugKumesi = new Map(topicList.map((t) => [t.slug, t]));
  const asiliKonular = topicList.filter((t) => {
    if (t.hidden || !t.parent) return false;
    const ebeveyn = slugKumesi.get(t.parent);
    return !ebeveyn || ebeveyn.hidden;
  });

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Kırıntı şeması — konu ve araç sayfalarında vardı, branş sayfalarında
          YOKTU. Sayfada görünür kırıntı zaten basılıyordu, yalnızca makine
          okunur karşılığı eksikti; arama sonucunda çıplak adres yerine
          "MediSea › Kütüphane › Hematoloji" yolu görünsün diye eklendi.
          13 branş sayfası site haritasında 0.8 önceliğinde. */}
      <JsonLd
        /* İlk adım "MediSea": şema GÖRÜNEN kırıntı yoluyla aynı olmak
           zorunda ve bu sayfanın görünen yolu "MediSea / Kütüphane / Branş"
           diye başlıyordu; şema ise MediSea adımını atlıyordu. Ölçüldü —
           şema [Kütüphane, Hematoloji], görünen [MediSea, Kütüphane,
           Hematoloji]. Konu sayfasıyla da tutarlı: orada da aynı kök var. */
        veri={kirintiSemasi(kirintiAdimlari)}
      />

      {/* --- BRANŞ HERO (branşın kendi renk/ikon kimliğiyle) --- */}
      <div className={`relative overflow-hidden border-b-4 border-slate-100 ${specialty.bg}`}>
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-8 sm:py-10">

          {/* Breadcrumb */}
          {/* flex-wrap: konu sayfasındaki kırıntı yolu uzun başlıklarda 375px'te
              yatay kaydırma üretiyordu; aynı kalıp burada da var, aynı çare. */}
          {/* Konu sayfasıyla AYNI kalıp: gezinme landmark'ı + liste +
              aria-current. İkisi ayrışırsa aynı rol iki sayfada farklı
              duyurulur; ölçüldü — konu sayfası landmark'a alındığında bu
              sayfa düz <div> olarak kalmıştı. */}
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
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl sm:text-4xl shrink-0">
              {specialty.icon}
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-4xl font-black text-blue-950 uppercase italic tracking-tighter leading-none truncate">
                {specialty.title}
              </h1>
              {specialty.desc && (
                <p className="text-xs sm:text-sm font-bold text-slate-500 mt-1.5">{specialty.desc}</p>
              )}
            </div>
            <div className="ml-auto hidden sm:block text-right shrink-0">
              <div className="text-2xl font-black text-blue-950 leading-none">{mainTopics.length}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Ana Konu</div>
            </div>
          </div>
        </div>
      </div>

      {/* --- KONU GRID (kompakt, ana sayfayla aynı kart dili) --- */}
      <div className="max-w-5xl mx-auto px-5 sm:px-6 py-6 sm:py-8">
        {mainTopics.length > 0 ? (
          <>
            {/*
              Görünmez bölüm başlığı — yalnızca başlık hiyerarşisi için.

              Ölçüldü: sayfa H1'den doğrudan kart başlıklarının H3'üne
              atlıyordu. Aşağıdaki "Diğer Konular" bölümü H2 → H3 diye
              doğru kurulmuş; ana liste ise başlıksız olduğu için ekran
              okuyucuda köksüz kalıyordu.

              Görünür başlık EKLENMEDİ: tasarımda H1'in hemen altında kart
              ızgarası var ve araya metin koymak düzeni değiştirirdi.
              `sr-only` bu depoda zaten kullanılan kalıp (atlama bağlantısı,
              durum bölgeleri).
            */}
            <h2 className="sr-only">{specialty.title} konuları</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
            {mainTopics.map((topic, i) => {
              const subCount = childCounts[topic.slug] || 0;
              return (
                <Link
                  key={topic.slug}
                  href={`/topics/${slug}/${topic.slug}`}
                  className={`group flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] ${specialty.color}`}
                >
                  {/*
                    ROZET SIRA NUMARASI, SIRALAMA ANAHTARI DEĞİL.

                    Bir dönem ham `meta.order` basılıyordu ve bir dizi GİBİ
                    görünüyordu — oysa o anahtar branştaki BÜTÜN konuları
                    (çocuklar dahil) numaralıyor, bu sayfa ise yalnızca üst
                    düzeyi listeliyor. Ölçüldü:

                      endokrinoloji  0,1,1,2,3,4,4,5,6,10   (iki 1, iki 4)
                      hematoloji     1,4,5,5,6,13,29        (boşluk + tekrar)
                      nefroloji      1,1,2,2,4,5,6,6,7

                    Yani okuyucu tekrar eden ve atlayan bir "sıra" görüyor,
                    üstelik iki branşta 0'dan başlıyor. Sıralama HÂLÂ
                    `order` ile yapılıyor; ekrana basılan şey artık listedeki
                    gerçek konum.

                    Yetim ("Diğer Konular") bölümü "•" basmaya devam ediyor:
                    onlar küratörlü sıranın parçası değil ve bu ayrım zaten
                    oradaydı.
                  */}
                  <span className="text-[10px] font-black text-slate-300 group-hover:text-slate-400 transition-colors italic shrink-0 w-6 text-center">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-black text-blue-950 uppercase italic tracking-tight leading-tight truncate">
                      {topic.title}
                    </h3>
                    {subCount > 0 && (
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {subCount} alt başlık
                      </p>
                    )}
                  </div>
                  <svg className={`w-4 h-4 shrink-0 text-slate-300 group-hover:translate-x-0.5 transition-all ${specialty.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              );
            })}
          </div>
          </>
        ) : (
          <div className="p-16 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
            <p className="text-slate-400 font-black uppercase tracking-widest">
              Bu branşta henüz geçerli/kayıtlı konu yok.
            </p>
          </div>
        )}

        {/* --- DİĞER KONULAR (ebeveyni bulunamayanlar) --- */}
        {asiliKonular.length > 0 && (
          <div className="mt-8">
            <div className="flex items-baseline gap-3 mb-3">
              <h2 className="text-[10px] font-black text-blue-900/80 uppercase tracking-[0.25em]">
                Diğer Konular
              </h2>
              <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">
                {asiliKonular.length} başlık
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {asiliKonular.map((topic) => {
                /* Yetimin de çocuğu olabilir ve rozet YOKTU: küratörlü kart
                   "N alt başlık" derken aynı veriye sahip yetim kart susuyordu.
                   Ölçüldü: 45 yetimin 2'si 6 çocuk taşıyor (diüretikler 4,
                   trombosit hastalıkları 2). Aynı `childCounts`, aynı gösterim. */
                const subCount = childCounts[topic.slug] || 0;
                return (
                <Link
                  key={topic.slug}
                  href={`/topics/${slug}/${topic.slug}`}
                  className={`group flex items-center gap-3 p-3 bg-white border border-slate-100 rounded-xl transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98] ${specialty.color}`}
                >
                  <span className="text-[10px] font-black text-slate-300 group-hover:text-slate-400 transition-colors italic shrink-0 w-6 text-center">
                    •
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[13px] font-black text-blue-950 uppercase italic tracking-tight leading-tight truncate">
                      {topic.title}
                    </h3>
                    {subCount > 0 && (
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {subCount} alt başlık
                      </p>
                    )}
                  </div>
                  <svg className={`w-4 h-4 shrink-0 text-slate-300 group-hover:translate-x-0.5 transition-all ${specialty.text}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* İLGİLİ HESAPLAYICILAR (branşla eşleşen varsa) — ana sayfadaki Hızlı Erişim ile aynı dil */}
        {branchTools.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <div className="bg-slate-50/50 backdrop-blur-sm rounded-2xl p-2.5 border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar sm:flex-wrap">
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
