// FILE: web/app/sitemap.ts
import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";
import { isoTarih } from "@/lib/jsonld";
import { yolKodla } from "@/lib/slug";

/**
 * Site haritası dosya sisteminden üretiliyor — sayfaların okuduğu kaynağın
 * aynısından. Önceden elle yazılmış 14 adreslik bir liste vardı ve iki ayrı
 * şekilde yanlıştı: içindeki yolların bir kısmı (sections, programs) zaten
 * 404 veriyordu, 456 konu ve 117 araç sayfasının hiçbiri ise listede yoktu.
 * Yani arama motoruna ölü adresler sunulup asıl içerik saklanıyordu.
 *
 * Elle liste tutmak, içerik büyüdükçe sessizce eskiyor. Diskten okumak
 * bu sınıf hatayı tümden kaldırıyor.
 */

const ICERIK_KOKU = path.join(process.cwd(), "content", "canonical");
/**
 * Araç listesi `app/tools` KLASÖRÜNDEN değil `content/arac-index.json`'dan
 * okunuyor. Klasör taraması bugün doğru sonuç veriyordu çünkü site haritası
 * derleme anında üretiliyor ve kaynak ağacı o an duruyor. Ama sunucusuz
 * ortamda kaynak `app/` yok; harita bir gün istek anında üretilmeye
 * başlarsa (bir `revalidate`, bir dinamik çağrı yeter) 114 araç adresi
 * sessizce düşerdi. Araç sayacı tam olarak bu şekilde bir dönem üretimde
 * sıfır dönmüştü (bkz. CLAUDE.md).
 *
 * İki kaynağın aynı 114 slug'ı verdiği geçiş öncesi karşılaştırmayla
 * doğrulandı; `content/` pakete giriyor, `app/` girmiyor.
 */
const ARAC_INDEKS = path.join(process.cwd(), "content", "arac-index.json");

type Kayit = MetadataRoute.Sitemap[number];

function guvenliOku<T>(is: () => T, yedek: T): T {
  try {
    return is();
  } catch {
    return yedek;
  }
}

/**
 * Konunun son değişiklik tarihi — YALNIZCA içeriğin kendi `meta.updatedAt`
 * değerinden. Alan yoksa `undefined` döner ve çağıran `lastmod`u hiç basmaz.
 *
 * Kaynak bir dönem `mtime` idi, gerekçesi "updatedAt serbest metin,
 * güvenilmez" — o gerekçe geçersiz: `isoTarih()` Türkçe kısa/uzun ve
 * İngilizce kısa ay adlarının hepsini çeviriyor (ölçüldü: 456 konunun
 * 452'si çevriliyor, 4'ünde alan hiç yok, çevrilemeyen 0).
 *
 * `mtime` CI'da ANLAMSIZ: derleme makinesi depoyu sıfırdan çekiyor ve bütün
 * dosyalar checkout anını alıyor. Ölçüldü — o dönem haritadaki 543 girdinin
 * tamamı aynı gün ve yalnızca iki farklı dakika taşıyordu.
 *
 * ⚠ `mtime` YEDEK OLARAK DA KALDIRILDI. Not yukarıda duruyordu ama yedek
 * yerinde kalmıştı ve bedeli ölçüldü: `meta.updatedAt` alanı OLMAYAN dört
 * görünür konu (`endokrinoloji/riedel-tiroiditi`,
 * `hematoloji/hematolojik-maligniteler`, `hematoloji/lenfomalar`,
 * `hematoloji/nhl-genel`) canlıda `mtime`a düşüyor ve CI checkout anını
 * aldığı için "BUGÜN değişti" diyorlardı. Uydurma bir tazelik sinyali,
 * sinyalin yokluğundan daha kötü.
 */
function sonDegisiklik(dosyaYolu: string): Date | undefined {
  const iso = guvenliOku(() => {
    const veri = JSON.parse(fs.readFileSync(dosyaYolu, "utf-8"));
    return isoTarih(veri?.meta?.updatedAt);
  }, undefined);

  return iso ? new Date(`${iso}T00:00:00Z`) : undefined;
}

function branslar(): string[] {
  return guvenliOku(
    () =>
      fs
        .readdirSync(ICERIK_KOKU, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name),
    []
  );
}

function konular(brans: string): { slug: string; dosya: string }[] {
  const dizin = path.join(ICERIK_KOKU, brans);
  return guvenliOku(
    () =>
      fs
        .readdirSync(dizin)
        .filter((f) => f.endsWith(".json"))
        .map((f) => ({ slug: f.replace(/\.json$/, ""), dosya: path.join(dizin, f) }))
        // meta.hidden olan konular sitede de gösterilmiyor, haritaya da girmemeli
        .filter(({ dosya }) =>
          guvenliOku(() => {
            const veri = JSON.parse(fs.readFileSync(dosya, "utf-8"));
            return veri?.meta?.hidden !== true;
          }, true)
        ),
    []
  );
}

function araclar(): string[] {
  return guvenliOku(() => {
    const liste = JSON.parse(fs.readFileSync(ARAC_INDEKS, "utf-8"));
    return Array.isArray(liste)
      ? liste.map((a: { slug?: string }) => a?.slug).filter((s): s is string => Boolean(s))
      : [];
  }, []);
}

/**
 * BİLMEDİĞİMİZ TARİHİ UYDURMUYORUZ.
 *
 * `lastModified` bir dönem bütün konu-dışı adreslerde `new Date()` idi, yani
 * her dağıtım "bu sayfa AZ ÖNCE değişti" diyordu. ÖLÇÜLDÜ (canlı sitemap):
 * 558 adresin **152'si** derleme anının damgasını taşıyordu — 131 araç
 * sayfasının 131'i, 13 branş, `/`, `/topics`, `/tools`, `/uyelik` ve premium
 * tanıtım sayfası. Araç sayfaları arasında BENZERSİZ TARİH SAYISI 1'di.
 *
 * Bu yalnızca gereksiz değil, ZARARLI: arama motoru `lastmod`u ancak
 * "tutarlı ve doğrulanabilir biçimde doğru" olduğunda kullanıyor. Her
 * dağıtımda 131 adresin değiştiğini bildiren bir harita, sinyali sitenin
 * TAMAMI için değersizleştiriyor — yani gerçek tarihini taşıyan 406 konu
 * adresi de zarar görüyor.
 *
 * Aynı ilke bu depoda ZATEN yazılı: `isoTarih()` ayrıştıramadığı değer için
 * alanı HİÇ BASMIYOR ("geçersiz bir tarih basmaktansa sinyali vermemek
 * doğru"). Site haritası o kuralın dışında kalmıştı.
 *
 * Bugün alan yalnızca GERÇEK bir kaynağı olan adreslerde basılıyor:
 *   konu       -> içeriğin kendi `meta.updatedAt` değeri
 *   branş      -> o branştaki konuların EN YENİSİ
 *   /topics    -> bütün konuların en yenisi
 *   ötekiler   -> alan YOK (araç sayfaları, /, /tools, /uyelik, premium)
 *
 * `mtime` yedeği bilerek kullanılmıyor — üstteki nota bak: CI depoyu sıfırdan
 * çekiyor ve bütün dosyalar checkout anını alıyor.
 */
function enYeni(tarihler: Date[]): Date | undefined {
  const gecerli = tarihler.filter((d) => d instanceof Date && !Number.isNaN(d.getTime()));
  if (!gecerli.length) return undefined;
  return new Date(Math.max(...gecerli.map((d) => d.getTime())));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const kayitlar: Kayit[] = [];

  /* Konular ÖNCE toplanıyor: branş ve /topics kayıtlarının tarihi onlardan
     türüyor, yani sıralama zorunlu. */
  const bransKonulari = new Map<string, { slug: string; dosya: string; tarih?: Date }[]>();
  for (const brans of branslar()) {
    bransKonulari.set(
      brans,
      konular(brans).map(({ slug, dosya }) => ({ slug, dosya, tarih: sonDegisiklik(dosya) }))
    );
  }
  const tumTarihler = [...bransKonulari.values()]
    .flat()
    .map((k) => k.tarih)
    .filter((d): d is Date => Boolean(d));

  kayitlar.push({ url: `${base}/`, changeFrequency: "daily", priority: 1 });
  kayitlar.push({
    url: `${base}/topics`,
    lastModified: enYeni(tumTarihler),
    changeFrequency: "daily",
    priority: 0.9,
  });
  kayitlar.push({ url: `${base}/tools`, changeFrequency: "weekly", priority: 0.9 });
  kayitlar.push({ url: `${base}/uyelik`, changeFrequency: "monthly", priority: 0.6 });

  /**
   * YDUS tanıtım sayfası — robots.ts bu adresi bilerek taramaya AÇIK
   * bırakıyor ("satış oradan yapılıyor") ama haritada yoktu, yani iki dosya
   * aynı niyeti taşıyıp farklı davranıyordu. Premium KONU sayfaları hâlâ
   * dışarıda: girişsiz ziyaretçiye erişim kartı döndükleri için haritaya
   * konsalar arama motoruna yüzlerce içeriksiz sayfa sunulurdu.
   */
  kayitlar.push({
    url: `${base}/tr/premium/ydus`,
    changeFrequency: "weekly",
    priority: 0.8,
  });

  /**
   * PREMIUM TANITIM SAYFASI (`/tr/premium`) — kardeşiyle AYNI durumda
   * olmasına rağmen haritada yoktu.
   *
   * Ölçüldü (canlı): `robots.txt` kalıpları `/admin`, `/api`,
   * dil önekli premium-ydus kalıbı ve `/premium`. `/tr/premium` bunların HİÇBİRİNE
   * uymuyor (`/premium` kalıbı yolun BAŞINI eşliyor), yani taranabilir;
   * sayfanın kendi robots meta'sı da `index, follow`. Buna karşılık
   * haritada YOKTU — yukarıdaki `/tr/premium/ydus` kaydının kapattığı
   * "iki dosya aynı niyeti taşıyıp farklı davranıyor" kusurunun ikinci
   * örneği.
   *
   * Sayfa gerçek bir dönüşüm yüzeyi: 43 KB gövde, 7 iç bağlantı,
   * "Neler dahil?" eylemi. Boş bir yer tutucu değil.
   */
  kayitlar.push({
    url: `${base}/tr/premium`,
    changeFrequency: "monthly",
    priority: 0.7,
  });

  // Bilerek DIŞARIDA: /giris ve /kayit (içerik değil, arama değeri yok),
  // /calisma-alanim ve /tekrar (kişisel araçlar; tarayıcıya boş görünürler),
  // /guidelines (henüz yer tutucu — aşağıda dizine kapatıldı).

  for (const [brans, liste] of bransKonulari) {
    kayitlar.push({
      // Branşın tarihi UYDURULMUYOR: içindeki konuların en yenisi. Konu yoksa
      // alan hiç basılmıyor.
      url: `${base}/topics/${brans}`,
      lastModified: enYeni(liste.map((k) => k.tarih).filter((d): d is Date => Boolean(d))),
      changeFrequency: "weekly",
      priority: 0.8,
    });

    for (const { slug, tarih } of liste) {
      kayitlar.push({
        // Adres KODLANIR. Ham hâlinde basılınca `<loc>` içine boşluk giriyordu
        // ("…/topics/nefroloji/FGF-23 vs PTH") — bu geçersiz bir adres ve
        // arama motoru o girdiyi hata olarak işaretler.
        url: `${base}/topics/${yolKodla(brans)}/${yolKodla(slug)}`,
        lastModified: tarih,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  for (const arac of araclar()) {
    // Araç sayfasının GERÇEK bir değişiklik tarihi yok: içeriği koda gömülü ve
    // `mtime` CI'da checkout anını veriyor. Alan basılmıyor.
    kayitlar.push({
      url: `${base}/tools/${arac}`,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return kayitlar;
}
