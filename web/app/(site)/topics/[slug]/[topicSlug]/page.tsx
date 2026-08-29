//"C:\Users\hucig\Medknowledge\web\app\(site)\topics\[slug]\[topicSlug]\page.tsx"
import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import YoneticiDuzenleyici from "@/components/topics/YoneticiDuzenleyici";
import { JsonLd, konuSemasi, kirintiSemasi, isoTarih } from "@/lib/jsonld";
import { tarihYazisi } from "@/app/lib/tarih";
import { slugCoz } from "@/lib/slug";
import { basliklariDuzenle, bolumKimlikleri } from "@/app/lib/baslik";
import { tabloKaydir } from "@/app/lib/tablo";
import { gorunurlukRozeti } from "@/app/lib/gorunurluk";
import { premiumBransSlug } from "@/lib/premium-brans";
import { kisaltmaAc } from "@/app/lib/kisaltma";
import { getSpecialty } from "@/app/lib/specialties";
import ilgiliIndex from "@/content/ilgili-index.json";
import { ebeveynleriCoz } from "@/lib/slug-eslestir";

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
/**
 * Arama sonucunda görünecek özeti çıkarır.
 *
 * Uyarı/künye bölümleri ATLANIR. Ölçüldü: 11 konu sayfası arama sonucunda
 * birebir aynı açıklamayı gösteriyordu ve o açıklama konuyu değil, sayfanın
 * taslak olduğunu anlatan uyarıyı içeriyordu ("⚠️ Klinik Uyarı: Bu modül…").
 * Yani o sayfalar Google'da kendilerini tıbbi konuyla değil, taslak
 * uyarısıyla tanıtıyordu — hem birbirinin kopyası hem de yanlış vaat.
 *
 * Bölümün KENDİSİNE dokunulmuyor; sayfada olduğu gibi duruyor. Yalnızca
 * özet üretiminden çıkarılıyor.
 */
function uyariBolumuMu(bolum: any): boolean {
  const baslik = String(bolum?.heading ?? bolum?.title ?? "");
  // 🤖 ile başlayan bölümler taslak künyesi; ⚠️ olanlar klinik uyarı kartı.
  return /^\s*(🤖|⚠️|⚠)/u.test(baslik);
}

/**
 * HTML VARLIKLARINI ÇÖZ — bir dönem hepsi BOŞLUKLA değiştiriliyordu.
 *
 * `&[a-z]+;` → " " kuralı iki şeyi birden bozuyordu: karakteri siliyor
 * (`&ge;` → " ", yani "kalsiyum ≥ 12" → "kalsiyum   12") ve kelimeyi
 * ikiye bölüyordu (`hasta&apos;nın` → "hasta nın"). Sayısal varlıklar
 * (`&#60;`) ise hiç ele alınmıyordu.
 *
 * İçerikte ölçüldü: **1195 adlı, 10 sayısal** varlık — en sıkları
 * `&apos;` 263 · `&quot;` 208 · `&lt;` 167 · `&ge;` 161.
 *
 * Gövde `dangerouslySetInnerHTML` ile basıldığı için EKRANDA doğru
 * görünüyordu; kusur yalnızca buradan üretilen meta açıklamada — yani
 * arama sonucunda görünen metinde.
 *
 * Tanınmayan adlı varlık BOŞLUKLA değil KALDIRILARAK atılıyor: boşluk
 * kelimeyi ikiye bölüyor, kaldırma en fazla bir karakter eksiltiyor.
 */
const VARLIK: Record<string, string> = {
  apos: "'", quot: '"', amp: "&", lt: "<", gt: ">", nbsp: " ",
  ge: "≥", le: "≤", plusmn: "±", times: "×", cong: "≅", plus: "+",
  percnt: "%", deg: "°", micro: "µ", mu: "μ",
  alpha: "α", beta: "β", gamma: "γ", kappa: "κ",
  bull: "•", middot: "·", rarr: "→", ndash: "–", mdash: "—",
};

function varlikCoz(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-zA-Z]+);/g, (_, ad) => VARLIK[ad.toLowerCase()] ?? "");
}

function ozetCikar(veri: any, sinir = 155): string {
  const hazir = veri?.summary || veri?.meta?.summary;
  const kaynak =
    hazir ||
    (Array.isArray(veri?.sections)
      ? veri.sections
          .filter((s: any) => !uyariBolumuMu(s))
          .map((s: any) => s?.text || s?.html || "")
          .join(" ")
      : "");

  /*
   * SIRA ÖNEMLİ: önce ETİKET, sonra VARLIK.
   *
   * Ters sırada `&lt;` önce "<" olur ve etiket süzgeci ondan sonraki metni
   * yer. İçerikte 167 `&lt;` ve 139 `&gt;` var, yani bu kuramsal değil.
   */
  const duz = varlikCoz(String(kaynak).replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    /*
     * ETİKET BOŞLUKLA DEĞİŞTİRİLİYOR ve noktalamadan önce boşluk bırakıyor.
     *
     * Ölçüldü (canlı, 25 konu): açıklamaların **5'i** böyleydi —
     * "Primer Adrenal Yetmezlik (Addison Hastalığı) , adrenal korteksin…"
     * Kaynak `<strong>…</strong>, adrenal` ve süzgeç etiketin yerine boşluk
     * koyuyor. Arama sonucunda görünen metin bu.
     *
     * Yalnızca Türkçede ÖNÜNE boşluk almayan işaretler düzeltiliyor; `%`
     * bilerek DIŞARIDA (Türkçede sayıdan önce gelir: "%20").
     */
    .replace(/\s+([,.;:!?)])/g, "$1")
    .replace(/(\()\s+/g, "$1")
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
  // Parametre yüzde-kodlu geliyor; dosya adına çevrilmeden okunamaz (lib/slug.ts).
  const { slug: hamSlug, topicSlug: hamKonu } = await params;
  const slug = slugCoz(hamSlug);
  const topicSlug = slugCoz(hamKonu);
  const veri = konuOku(slug, topicSlug);

  if (!veri) return { title: "Konu bulunamadı", robots: { index: false, follow: false } };

  const baslik = veri.title || topicSlug.replace(/-/g, " ");
  const aciklama = ozetCikar(veri);
  const yol = `/topics/${slug}/${topicSlug}`;

  /**
   * GİZLİ KONU ARAMA MOTORUNA KAPALI — iki mekanizma aynı niyeti taşımalı.
   *
   * `meta.hidden` bugüne kadar ÜÇ yerde uygulanıyordu: site haritası,
   * `generateStaticParams` ve branş listeleri. Dördüncü yerde — robots
   * meta'sında — UYGULANMIYORDU.
   *
   * ÖLÇÜLDÜ (canlı, değişiklikten önce): 46 gizli konunun sayfaları
   * `index, follow` ile ve TAM GÖVDEYLE basılıyordu
   * (`feokromositoma-ve-paraganglioma` 45 KB, `hipertiroidi-ve-graves-
   * hastaligi` 20 KB). Kıyas: `/guidelines` haritadan çıkarılmış VE
   * `noindex, follow` — deponun kendi emsali.
   *
   * "Nasıl bulunur ki" savunması ölçümle çürüdü: GÖRÜNÜR bir konunun
   * içeriğinden gizli bir konuya bağlantı VAR
   * (`subklinik-tiroid-hastaliklari` -> `hipertiroidi-ve-graves-hastaligi`),
   * yani taranabilir bir yol açık.
   *
   * Bedeli ÇİFT İÇERİK: gizli başlıklarla görünür başlıklar arasında 14
   * örtüşme ölçüldü (`adrenal-medulla-hastaliklari` [gizli] ~
   * `adrenal-bez-hastaliklari` / `adrenal-korteks-hastaliklari`). Yani
   * yayımlanmamış sayfalar kanonik sayfalarla yarışıyordu.
   *
   * `follow` bilerek korunuyor (`/guidelines` de öyle): sayfa dizine
   * girmiyor ama içindeki bağlantılar izlenmeye devam ediyor. Sayfa
   * 404'e ÇEVRİLMİYOR — adresle erişim bilinçli bir karar (bkz.
   * `generateStaticParams` notu) ve paylaşılmış bağlantılar kırılmamalı.
   */
  const gizli = veri?.meta?.hidden === true;

  return {
    title: baslik,
    description: aciklama || undefined,
    keywords: Array.isArray(veri?.meta?.tags) ? veri.meta.tags : undefined,
    /**
     * KOŞULLU YAYILIM ŞART — `robots: undefined` yazmak MİRASI SİLİYOR.
     *
     * İlk denemede `robots: gizli ? {...} : undefined` yazıldı ve A/B ölçümü
     * yakaladı: değişiklikten ÖNCE görünür konu sayfasında robots meta'sı
     * VARDI (kök düzenden gelen `index, follow`), SONRA hiç yoktu.
     * Next, anahtarı `undefined` değerle görünce "miras al" değil "bu alanı
     * kaldır" diye yorumluyor.
     *
     * Davranışsal etkisi küçüktü (meta yoksa tarayıcı zaten indeksler) ama
     * niyet edilmemiş bir değişiklikti. Anahtar artık YALNIZCA gizli konuda
     * ekleniyor; görünür konular kökün varsayılanını miras almaya devam
     * ediyor.
     */
    ...(gizli ? { robots: { index: false, follow: true } } : {}),
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
  const { slug: hamSlug, topicSlug: hamKonu } = await params;
  const slug = slugCoz(hamSlug);
  const topicSlug = slugCoz(hamKonu);
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

  /**
   * Kısaltmalar ilk kullanımda açılımıyla veriliyor (app/lib/kisaltma.ts).
   *
   * Küme burada kuruluyor ve ÖZETTEN başlayıp bölümlere taşınıyor, çünkü
   * "ilk kullanım" okuma sırasına göre olmalı: sayfada özet bölümlerin
   * ÜSTÜNDE basılıyor. Küme bölüm başına kurulsaydı aynı açılım her blokta
   * tekrar çıkardı.
   *
   * Başlık (`title`) bilerek DIŞARIDA: sayfa başlığını yeniden yazmak
   * künyeyi, sekme adını ve paylaşım kartını da değiştirirdi.
   */
  const gorulenKisaltmalar = new Set<string>();

  const topicItem = {
    slug: topicSlug,
    branch: slug,
    title: rawData.title || topicSlug.replace(/-/g, " "),
    summary: kisaltmaAc(rawData.summary || rawData.meta?.summary || "", gorulenKisaltmalar),
    parent: rawData.meta?.parent || null,
    sections: Array.isArray(rawData.sections)
      ? rawData.sections.map((s: any) => ({
          heading: s.heading || s.title || "Başlıksız Blok",
          // basliklariDuzenle: icerik HTML'i h4 ile basliyor ama bolum
          // basligi h2 -- araya h3 girmedigi icin 240 konuda 907 duzey
          // atlamasi olusuyordu (bkz. app/lib/baslik.ts).
          // tabloKaydir: icerikteki tablolar klavyeyle kaydirilamiyordu;
          // sarmalayicisi olmayan 14 tablo ise okuma kartinda KIRPILIYOR
          // ve kolonlari hicbir girdi kipiyle ulasilamiyordu
          // (bkz. app/lib/tablo.ts). Yalnizca NITELIK ekliyor, metni
          // degistirmiyor -- vurgu ofsetleri bu yuzden kaymiyor.
          html: tabloKaydir(
            basliklariDuzenle(
              kisaltmaAc(s.text || s.html || "", gorulenKisaltmalar)
            )
          ),
          visibility: s.visibility || "V"
        }))
      : []
  };

  /**
   * SAYFA İÇİ GEZİNME — uzun konularda.
   *
   * ÖLÇÜLDÜ (canlı, 390px genişlik, en uzun konu): belge yüksekliği
   * 26 803px = **31.8 ekran**, 15 `h2` + 17 `h3`, sayfa içi çapa **SIFIR** ve
   * başlıkların hiçbirinde `id` YOK. "Tedavi" bölümünü arayan okuyucu 30 ekran
   * kaydırmak zorundaydı; bir bölüme bağlantı vermek ya da yer imi koymak
   * imkânsızdı. (`TableOfContents.tsx` depoda duruyor ama ölü kod — sıfır içe
   * aktaran, belgede kayıtlı.)
   *
   * Kimlikler HER konuda basılıyor: nitelik eklemek `textContent`i
   * DEĞİŞTİRMEZ, yani bedava ve derin bağlantıyı her yerde açıyor.
   *
   * İÇİNDEKİLER ise eşiğe bağlı. Eşik veriden seçildi, uydurulmadı:
   *
   *   >=4 bölüm         366 konu   -- çoğunluk, kısa konuda gürültü olur
   *   >=6000 karakter    50 konu   -- ~7+ ekran, kaydırma gerçekten acıtıyor
   *   ikisi birden       50 konu   (%12)
   *
   * ⚠ İÇİNDEKİLER `[data-readable]` KONTEYNERİNİN DIŞINDA duruyor ve bu
   * ZORUNLU: vurgular konteyner metnindeki KARAKTER OFSETİYLE saklanıyor.
   * İçeri konsaydı ondan sonraki bütün ofsetler kayardı ve deponun kuralı
   * gereği "ofset çözülüyor ama metin tutmuyor" olan vurgular SİLİNİR —
   * yani kullanıcıların kayıtlı vurguları sessizce yok olurdu.
   */
  const bolumKimligi = bolumKimlikleri(topicItem.sections.map((s) => s.heading));
  const govdeUzunlugu = topicItem.sections
    .map((s) => s.html.replace(/<[^>]*>/g, " "))
    .join(" ")
    .replace(/\s+/g, " ")
    .trim().length;
  const icindekilerGoster = topicItem.sections.length >= 4 && govdeUzunlugu >= 6000;

  /* Premium tanıtım şeridinin hedefi — dosyadan doğrulanıyor, açık branş
     slug'ından türetilmiyor (bkz. premiumBransSlug: 24 sayfa 404 veriyordu). */
  const premiumBrans = premiumBransSlug(slug);
  const premiumHedef = premiumBrans ? `/tr/premium/ydus/${premiumBrans}` : "/tr/premium/ydus";

  // 2. OTOMATİK AĞAÇ YAPISI (Çocuklar ve Torunlar)
  const allFiles = fs.readdirSync(branchDir).filter(f => f.endsWith(".json"));
  
  // Önce klasördeki tüm dosyaların künyesini çıkar
  const allTopics = allFiles.map(file => {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(branchDir, file), "utf-8"));
      return { 
        slug: file.replace(".json", ""), 
        title: content.title, 
        hamParent: content.meta?.parent ?? null,
        parentler: [] as string[],
        hidden: content.meta?.hidden || false,
        order: content.meta?.order || 99
      };
    } catch (e) { return null; }
  }).filter(Boolean) as {slug: string, title: string, hamParent: unknown, parentler: string[], hidden: boolean, order: number}[];

  // Ebeveyn referansındaki yazım sapmasını onar — branş sayfasıyla AYNI
  // onarım. İkisi farklı davranırsa bir konu branş sayfasında bir başlığın
  // altında görünüp o başlığın kendi sayfasında görünmez; ölçümde tam olarak
  // bu oluyordu (akromegali, "Ön-" ve "on-" farkı yüzünden).
  const tumSluglar = new Set(allTopics.map(t => t.slug));
  for (const t of allTopics) t.parentler = ebeveynleriCoz(t.hamParent, tumSluglar, t.slug);

  // Doğrudan çocukları bul ve sıraya (order) göre diz
  const childTopics = allTopics
    .filter(t => t.parentler.includes(topicSlug) && !t.hidden)
    /* BERABERLİK BOZUCU ŞART — yoksa sıra `readdirSync`e düşer ve PLATFORMA
       BAĞLI olur. Ölçüldü: journal-club'da iki konu da `order: 2` ve
       Linux (Vercel) ile Windows (yerel) FARKLI sıra üretiyordu. Bu, CI'ı
       97 koşum kırmış olan sınıfın ta kendisi (bkz. CLAUDE.md). Branş
       sayfası zaten başlığa göre kırıyordu; buna slug da eklendi, çünkü
       `sensitivity: "base"` iki başlığı eşit sayabiliyor. */
    .sort((a, b) =>
      a.order - b.order ||
      a.title.localeCompare(b.title, "tr", { sensitivity: "base" }) ||
      (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0)
    );

  // Her çocuğun KENDİ çocuğu var mı diye bak (dinamik: parent-child grafiğinden çıkarılır)
  // - Kendi çocuğu OLAN bir alt konu = "hub" (menü) -> Menü ızgarasında gösterilir, tıklanınca kendi menüsünü/içeriğini açar
  // - Kendi çocuğu OLMAYAN bir alt konu = "kılcal" (leaf) -> İleri Okuma listesinde gösterilir
  const childrenWithDepth = childTopics.map(child => ({
    ...child,
    hasOwnChildren: allTopics.some(t => t.parentler.includes(child.slug) && !t.hidden)
  }));

  const hubChildren = childrenWithDepth.filter(c => c.hasOwnChildren);
  const leafChildren = childrenWithDepth.filter(c => !c.hasOwnChildren);

  const bransAdi = getSpecialty(slug)?.title || slug;

  /**
   * ATA ZİNCİRİ — kırıntı yolunun eksik halkası.
   *
   * Ölçüldü: 410 görünür konunun 310'u görünür bir ebeveynin altında
   * duruyor (181'inde İKİ ya da daha fazla ata var) ama kırıntı yolu
   * branştan doğrudan konuya atlıyordu. Okuyucu `addison` sayfasında üç
   * kat yukarıdaki "Adrenal Yetmezlik" hub'ının varlığını hiçbir yerden
   * göremiyor ve ona çıkamıyordu: hiyerarşi tek yönlüydü — aşağı
   * bağlanıyor, yukarı bağlanmıyordu.
   *
   * GİZLİ ATADA DURULUR: gizli konular listelerden ve site haritasından
   * çıkarılmış, `noindex` taşıyor; görünür bir sayfadan oraya bağlanmak
   * o kararı delerdi.
   */
  const atalar: { slug: string; title: string }[] = [];
  {
    const slugHarita = new Map(allTopics.map((t) => [t.slug, t]));
    const gorulen = new Set<string>([topicSlug]);
    // ÇOK EBEVEYNLİDE TEK BİR ZİNCİR izlenir: bir konunun tek kanonik
    // kırıntı yolu olmalı. İki zinciri birden yürüseydik aynı sayfa iki
    // farklı atayla görünür ve JSON-LD şeması da (görünen yolla AYNI
    // diziden üretildiği için) çelişirdi.
    //
    // Zincir İLK GÖRÜNÜR ebeveynden gider, körü körüne `parentler[0]`dan
    // değil: birincil ebeveyn GİZLİYSE `[0]`da durmak, görünür bir ikinci
    // ebeveyn varken kırıntıyı boş bırakırdı — oysa konu o hub'ın çocuk
    // listesinde görünüyor. Tek ebeveynli konularda ikisi AYNI şeydir
    // (tek aday ya görünür ya değil), yani bugünkü davranış değişmiyor.
    let cur = slugHarita.get(topicSlug);
    while (cur?.parentler.length) {
      const e = cur.parentler
        .map((x) => slugHarita.get(x))
        .find((k) => k && !k.hidden && !gorulen.has(k.slug));
      // gorulen: ölçümde döngü YOK ama veri içerikten geliyor; sonsuz
      // döngüyü veriye bırakmıyoruz (süzgeç yukarıda, burada son kontrol).
      if (!e) break;
      atalar.unshift({ slug: e.slug, title: e.title });
      gorulen.add(e.slug);
      cur = e;
    }
  }

  /**
   * Görünen kırıntı yolu ile JSON-LD şeması AYNI diziden üretilir.
   *
   * YALNIZCA EN YAKIN ATA gösteriliyor ve bu ÖLÇÜMLE seçildi. 375px'te,
   * üç atası olan bir konuda (addison) kırıntı yüksekliği:
   *
   *   ata yok (eski hâli) : 55px  · h1 224px'te
   *   YALNIZ EBEVEYN      : 91px  · h1 260px'te   <- seçilen
   *   en yakın iki ata    : 126px · h1 295px'te
   *   tam zincir          : 162px · h1 331px'te
   *
   * Tam zincir 107px'e mal oluyor ve başlığı ilk ekranın %40'ına itiyor.
   * Ebeveyn tek başına eksik olan YETENEĞİ (yukarı çıkmak) veriyor;
   * üstelik her sayfa KENDİ ebeveynini gösterdiği için hiyerarşi tek tek
   * yürünebiliyor — zinciri her sayfada tekrarlamak fazlalık olurdu.
   */
  const kirintiAdimlari = [
    { ad: "MediSea", yol: "/" },
    { ad: "Kütüphane", yol: "/topics" },
    { ad: bransAdi, yol: `/topics/${slug}` },
    ...atalar.slice(-1).map((a) => ({ ad: a.title, yol: `/topics/${slug}/${a.slug}` })),
    { ad: topicItem.title, yol: `/topics/${slug}/${topicSlug}` },
  ];

  // İlgili konular: etiket akrabalığından önceden üretiliyor
  // (scripts/ilgili-index.cjs). Ebeveyn ve çocuklar dizinde zaten elenmiş
  // olduğu için burada tekrar bağlantı çıkmaz.
  const ilgililer =
    (ilgiliIndex as Record<string, { brans: string; slug: string; baslik: string }[]>)[
      `${slug}/${topicSlug}`
    ] ?? [];

  /**
   * GÖRÜNÜR AD ÇAKIŞMASI — aynı adlı iki bağlantı, farklı hedef.
   *
   * Bağlantının görünür adı `başlık` + (branş farklıysa) branş etiketi.
   * İki kayıt bu adı PAYLAŞIYORSA kullanıcı onları ayırt edemiyor ve
   * ekran okuyucuda AYNI ADLI iki bağlantı farklı yere gidiyor.
   *
   * Ölçüldü (canlı, 408 ilgili listesi): çakışma 4 listede — hepsi
   * hematolojide ve kökleri SENDE-KALANLAR listesindeki içerik kayıtları
   * (MDS başlıklı iki dosya, iki ayrı "Demir Eksikliği" slug). İÇERİĞE
   * DOKUNULMUYOR; ayrım sunum tarafında slug ile veriliyor.
   *
   * ÇAPRAZ BRANŞ vakası zaten ayrışıyor (branş etiketi basılıyor), o
   * yüzden burada yakalanmıyor ve görünümü DEĞİŞMİYOR.
   */
  const ilgiliGorunurAd = (k: { baslik: string; brans: string }) =>
    k.baslik + (k.brans !== slug ? "|" + k.brans : "");
  const ilgiliAdSayaci = new Map<string, number>();
  for (const k of ilgililer) {
    const ad = ilgiliGorunurAd(k);
    ilgiliAdSayaci.set(ad, (ilgiliAdSayaci.get(ad) ?? 0) + 1);
  }
  const ilgiliAdCakisiyor = (k: { baslik: string; brans: string }) =>
    (ilgiliAdSayaci.get(ilgiliGorunurAd(k)) ?? 0) > 1;

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
        /* İlk adım "MediSea" — hem görünen yolla hem branş sayfasıyla
           aynı kök. Ölçüldü: branş sayfasının şeması Kütüphane'den,
           görüneni MediSea'den başlıyordu; iki sayfa türü de artık
           "MediSea / Kütüphane / …" izini paylaşıyor. */
        veri={kirintiSemasi(kirintiAdimlari)}
      />
      <div className="max-w-[1400px] mx-auto">

        {/* Kırıntı yolu bir GEZİNME landmark'ı: kardeş branş şeridi
            (`aria-label="Branşlar"`) zaten öyle. Düz bir <div> ekran
            okuyucuda "kırıntı yolu" diye duyurulmuyor ve listelenmiyordu. */}
        <nav aria-label="Kırıntı yolu" className="mb-8">
          {/* py-1.5: bağlantılar mobilde 16px yüksekliğindeydi, yani dokunma
              hedefi WCAG asgarisinin (24px) altında.
              flex-wrap: uzun konu başlıkları 375px'te sayfayı yatay
              kaydırtıyordu (ölçüldü: scrollWidth 406). */}
          <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13px] font-semibold text-slate-500">
            {kirintiAdimlari.map((a, i) => {
              const son = i === kirintiAdimlari.length - 1;
              return (
                <li key={a.yol} className="flex items-center gap-x-2">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {son ? (
                    <span className="text-blue-900" aria-current="page">{a.ad}</span>
                  ) : (
                    <Link href={a.yol} className="py-1.5 hover:text-blue-600 transition-colors">
                      {a.ad}
                    </Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* Ana Izgara */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* --- SOL KOLON: İÇERİK --- */}
          <div className="lg:col-span-8 space-y-8">
            <div className="border-l-8 border-blue-900 pl-6 py-2">
              {/* break-words: başlık 36px ve tıbbi terimler uzun. Ölçüldü —
                  H1'in KUTUSU 296px (sınır içinde) ama scrollWidth 353, yani
                  metin kutuyu taşıyor ve SAYFAYI yatay kaydırıyordu. Öge
                  kutularını tarayan ölçüm bunu göremez; ölçüt öge başına
                  scrollWidth > clientWidth. 137 konudan 26'sı bu yüzden
                  kayıyordu (7-62px, kayma başlık uzunluğuyla artıyor). */}
              <h1 className="text-4xl md:text-5xl font-black text-blue-950 uppercase italic tracking-tighter leading-none mb-3 break-words hyphens-auto">
                {topicItem.title}
              </h1>
              {/* TARİH UYDURULMAZ. Burada bir dönem `|| "06 MAR 2026"`
                  yedeği vardı ve `meta.updatedAt` taşımayan 4 görünür konu
                  CANLIDA o uydurma tarihi basıyordu (ölçüldü: lenfomalar,
                  nhl-genel, riedel-tiroiditi, hematolojik-maligniteler).
                  Aynı ilkenin site haritası tarafı `app/sitemap.ts`te
                  kayıtlı: tarih bilinmiyorsa alan HİÇ basılmıyor —
                  uydurma bir tazelik sinyali vermektense sinyal vermemek
                  doğru. `isoTarih()` de ayrıştıramadığında undefined döner. */}
              {/*
                YUKARIDAKİ İLKE UYGULANIYOR — bir dönem YALNIZCA YAZILIYDI.
                Kapı `updatedAt` DOLU MU diye bakıyordu, `isoTarih()` hiç
                çağrılmıyordu ve ham dize basılıyordu.

                Bedeli ölçüldü: 410 görünür konunun 29'u Türkçe sayfada
                İNGİLİZCE ay adı gösteriyordu ("Güncelleme: 10 Jun 2026").
                Kaynağı `toLocaleDateString('tr-TR', …)` — çıktısı çalışma
                ortamının ICU verisine bağlı; dar ICU'da Türkçe adlar
                İngilizceye düşüyor.

                `isoTarih` iki biçimi de ayrıştırıyor (`AY_NO` Türkçe kısa/
                uzun ve İngilizce kısaltmaları kapsıyor), `tarihYazisi` de
                tek biçimde Türkçe basıyor. Öğlen saati bilerek: ISO gün
                UTC gece yarısı olarak ayrıştırılıyor ve saat dilimi günü
                bir geri kaydırabilir.
              */}
              {(() => {
                const iso = isoTarih(rawData.meta?.updatedAt);
                const yazi = tarihYazisi(iso ? `${iso}T12:00:00` : null, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                return yazi ? (
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Güncelleme: {yazi}
                  </div>
                ) : null;
              })()}
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
                        <span className="text-xs font-black text-blue-900/80 group-hover:text-blue-900/80 transition-colors italic">
                          #{child.order < 99 ? child.order : "•"}
                        </span>
                        <h3 className="text-base font-black text-blue-950 uppercase italic group-hover:text-blue-700">
                          {child.title}
                        </h3>
                      </div>
                      {/* Hover ile beliren her şeyin focus karşılığı olmalı: yoksa klavyeyle
                          gezen kullanıcı kartın tıklanabilir olduğunu gösteren tek işareti
                          hiç görmüyor. Ok süsleme olduğu için aria-hidden. */}
                      <div className="text-blue-900 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
                        <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* İÇİNDEKİLER — `[data-readable]` KONTEYNERİNİN DIŞINDA.
                Gerekçesi yukarıda `icindekilerGoster` başlığında: içeri
                konsaydı vurguların karakter ofsetleri kayar ve kayıtlı
                vurgular silinirdi. */}
            {icindekilerGoster && (
              <nav
                aria-labelledby="icindekiler-basligi"
                data-baskida-goster
                className="mb-5 bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 md:p-8"
              >
                <h2
                  id="icindekiler-basligi"
                  className="font-sans mt-0 text-[10px] font-black text-blue-900/80 uppercase tracking-[0.2em] mb-3"
                >
                  Bu sayfada
                </h2>
                <ol className="grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                  {topicItem.sections.map((section: any, idx: number) => (
                    <li key={idx} className="flex gap-2 text-sm leading-snug">
                      <span aria-hidden="true" className="text-blue-300 font-black tabular-nums">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <a
                        href={`#${bolumKimligi[idx]}`}
                        className="text-blue-800 hover:text-blue-950 hover:underline py-0.5"
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            {/* data-readable: ReadingTools bu konteyner içindeki seçimleri
                vurgulanabilir kabul eder (yönetici editörü hariç tutulur) */}
            <div data-readable className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden p-8 md:p-12 space-y-10">
              {/* Ziyaretçiye görünen hata kartı.
                  Eskiden site SAHİBİNE yazılmıştı: dosya yolu, "geçerli bir
                  JSON değil", "düzenleyici de kapalı" ve ham ayrıştırıcı
                  mesajı. Google'dan gelen bir okuyucu için hiçbiri anlamlı
                  değil, üstelik burası açık taraf — huninin ortası.
                  Teknik ayrıntı zaten sunucu günlüğüne yazılıyor (yukarıdaki
                  console.error), yani buradan kaldırmak tanı gücünü
                  azaltmıyor. */}
              {okumaHatasi && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-3xl p-6">
                  <h2 className="text-base font-black text-amber-900 uppercase tracking-wide mb-2">
                    Bu konu şu an görüntülenemiyor
                  </h2>
                  <p className="text-sm text-amber-900/80 font-medium leading-relaxed mb-4">
                    İçerikte bir sorun var ve metni gösteremiyoruz. Sorun bize iletildi.
                    Bu arada aynı branştaki diğer başlıklara göz atabilirsin.
                  </p>
                  <Link
                    href={`/topics/${slug}`}
                    className="inline-block rounded-full bg-amber-900 px-5 py-2.5 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-amber-800"
                  >
                    {bransAdi} başlıklarına dön
                  </Link>
                </div>
              )}

              {topicItem.summary && (
                <div className="text-lg text-slate-700 font-medium leading-relaxed bg-blue-50/40 p-6 rounded-3xl border-l-4 border-blue-300">
                  <span className="text-[10px] font-black text-blue-900/80 uppercase tracking-[0.3em] block mb-2">Hızlı Özet</span>
                  <div className="whitespace-pre-wrap">{topicItem.summary}</div>
                </div>
              )}

              {topicItem.sections.length > 0 && (
                <div className="space-y-12">
                  {topicItem.sections.map((section: any, idx: number) => (
                    <section key={idx} className="relative group">
                      {section.visibility !== 'V' && (
                        <span className="absolute -top-4 right-0 text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded bg-amber-100 text-amber-800">
                          {/* Eşleme `app/lib/gorunurluk.ts`te tek kaynakta:
                              yönetim editörü de aynı sözlükten etiketleniyor.
                              Eskiden burada satır içi yazılıydı ve editör
                              çıplak harf gösterdiği için operatör hangi kodun
                              hangi rozeti bastığını göremiyordu. */}
                          {gorunurlukRozeti(section.visibility)}
                        </span>
                      )}
                      {/**
                       * `tabIndex={-1}` — içindekiler bağlantısının hedefi
                       * ODAKLANABİLİR olmalı. Belgede kayıtlı kural:
                       * odaklanabilir olmayan bir ögeye atlandığında tarayıcı
                       * görünümü kaydırır ama odağı taşımaz.
                       *
                       * ÖLÇÜLDÜ (canlı, eklemeden önce): içindekiler
                       * bağlantısına tıklandığında sayfa kayıyor ama odak
                       * **BODY'ye** düşüyordu — yani ekran okuyucu varış
                       * noktasını duyurmuyor ve klavye kullanıcısı nerede
                       * olduğunu bilmiyordu.
                       *
                       * `focus:outline-none`: başlık bir gezinme hedefi,
                       * etkileşimli bir denetim değil; halka görsel gürültü
                       * olurdu. `scroll-mt-24` yapışkan başlığın altına
                       * hizalıyor (ölçüldü: başlık 96px, çubuk 65px).
                       */}
                      <h2
                        id={bolumKimligi[idx]}
                        tabIndex={-1}
                        className="scroll-mt-24 focus:outline-none text-2xl font-black text-blue-950 mb-5 border-b-2 border-slate-100 pb-3 flex items-center gap-3"
                      >
                        {/*
                          Süsleme: ekran okuyucu bunu "kare" diye okuyup her
                          bölüm başlığının önüne gürültü koyuyordu. `aria-hidden`
                          hem o gürültüyü kaldırıyor hem de kontrast kuralının
                          kapsamından çıkarıyor (ölçüldü: 1.42 — ama işaret
                          bilgi taşımadığı için doğru çare renk değil, gizlemek).
                        */}
                        <span className="text-blue-200" aria-hidden="true">#</span>{section.heading}
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
                  {/* h2, h3 DEĞİL: "Alt Başlıklar" ve içerik bölümleri de h2.
                      h3 kalınca taslakta bu bölüm son klinik bölümün ALT
                      başlığı gibi görünüyordu — düzey atlaması yok ama
                      yuvalama yanlıştı. Görünüm değişmiyor: globals.css
                      h1,h2,h3'e aynı kuralı veriyor (ölçüldü, mt 24px). */}
                  <h2 className="text-sm font-black text-blue-950 uppercase tracking-widest border-b-2 border-slate-100 pb-4 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    İleri Okuma
                  </h2>

                  <ul className="space-y-4">
                    {leafChildren.map(child => (
                      <li key={child.slug}>
                        <Link
                          href={`/topics/${slug}/${child.slug}`}
                          className="group flex items-start gap-3 py-1 text-sm font-bold text-slate-700 hover:text-blue-700 transition-colors"
                        >
                          {/* Süsleme oku — bağlantının adı yanındaki başlık. */}
                          <span className="text-blue-300 group-hover:text-blue-500 mt-0.5" aria-hidden="true">↳</span>
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
                  <h2 className="text-sm font-black text-blue-950 uppercase tracking-widest border-b-2 border-slate-100 pb-4 mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                    İlgili Konular
                  </h2>

                  <ul className="space-y-4">
                    {ilgililer.map((k) => (
                      <li key={`${k.brans}/${k.slug}`}>
                        <Link
                          href={`/topics/${k.brans}/${k.slug}`}
                          className="group flex items-start gap-3 py-1 text-sm font-bold text-slate-700 hover:text-blue-700 transition-colors"
                        >
                          {/* Süsleme oku — bağlantının adı yanındaki başlık. */}
                          <span className="text-blue-300 group-hover:text-blue-500 mt-0.5" aria-hidden="true">→</span>
                          <span className="leading-tight">
                            {k.baslik}
                            {k.brans !== slug && (
                              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                                {getSpecialty(k.brans)?.title || k.brans}
                              </span>
                            )}
                            {ilgiliAdCakisiyor(k) && (
                              <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
                                {k.slug}
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/**
                * YDUS-Premium tanıtımı.
                *
                * Bağlantı bir dönem `/tr/premium/ydus/${slug}` diye AÇIK branş
                * slug'ıyla kuruluyordu. İki taraf aynı kümeyi taşımıyor (açık 13,
                * premium 9 branş; "gogus" premium tarafta "gogus-hastaliklari")
                * ve canlıda ölçüldü: **24 konu sayfası 404 veren bir bağlantı**
                * gösteriyordu. Hedef artık dosyadan doğrulanıyor.
                *
                * Karşılığı olmayan branşta kart KALDIRILMIYOR, premium ana
                * sayfasına gidiyor ve metin branşa özgü iddiada BULUNMUYOR —
                * çıkmaz bir bağlantı ile sessizce kaybolan bir dönüşüm yüzeyi
                * arasındaki üçüncü yol.
                */}
              <Link href={premiumHedef} data-baskida-gizle className="block bg-gradient-to-br from-blue-950 to-slate-900 rounded-[2rem] p-8 border border-slate-800 shadow-xl text-white relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/20 transition-all"></div>

                <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.3em] mb-4 block">
                  MediSea Premium
                </span>

                {/* Başlık ham slug'dan DEĞİL branş künyesinden geliyor:
                    "klinik-nutrisyon" -> "KLİNİK NUTRİSYON" yazıyordu,
                    doğrusu "KLİNİK NÜTRİSYON". */}
                {/* h3, h4 DEĞİL: komşu bölümler h2'ye çıkınca h4 kalması
                    h2 -> h4 ATLAMASI üretiyordu. `mt-4` şart — globals.css
                    h4'e 1rem, h3'e 1.5rem üst boşluk veriyor; sınıf olmadan
                    tanıtım kartının başlığı 16px'ten 24px'e kayardı. */}
                <h3 className="text-xl font-black italic uppercase leading-tight mb-3 mt-4">
                  {premiumBrans ? `YDUS ${getSpecialty(slug).title}` : "YDUS Hazırlık"}
                </h3>

                <p className="text-sm text-blue-200 font-medium mb-6 leading-relaxed">
                  {premiumBrans
                    ? "Bu branşla ilgili çıkmış tüm YDUS soruları ve çözümlü vaka analizleri Premium abonelere özel."
                    : "Çıkmış YDUS soruları, çözümlü vaka analizleri ve klinik inciler Premium abonelere özel. Bu branşın modülü henüz hazırlanıyor."}
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