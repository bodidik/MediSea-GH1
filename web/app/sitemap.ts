// FILE: web/app/sitemap.ts
import fs from "fs";
import path from "path";
import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

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

/** Dosyanın son değişiklik tarihi — meta.updatedAt serbest metin olduğu için güvenilmez. */
function sonDegisiklik(dosyaYolu: string): Date {
  return guvenliOku(() => fs.statSync(dosyaYolu).mtime, new Date());
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const simdi = new Date();
  const kayitlar: Kayit[] = [];

  kayitlar.push({ url: `${base}/`, lastModified: simdi, changeFrequency: "daily", priority: 1 });
  kayitlar.push({ url: `${base}/topics`, lastModified: simdi, changeFrequency: "daily", priority: 0.9 });
  kayitlar.push({ url: `${base}/tools`, lastModified: simdi, changeFrequency: "weekly", priority: 0.9 });
  kayitlar.push({ url: `${base}/uyelik`, lastModified: simdi, changeFrequency: "monthly", priority: 0.6 });

  /**
   * YDUS tanıtım sayfası — robots.ts bu adresi bilerek taramaya AÇIK
   * bırakıyor ("satış oradan yapılıyor") ama haritada yoktu, yani iki dosya
   * aynı niyeti taşıyıp farklı davranıyordu. Premium KONU sayfaları hâlâ
   * dışarıda: girişsiz ziyaretçiye erişim kartı döndükleri için haritaya
   * konsalar arama motoruna yüzlerce içeriksiz sayfa sunulurdu.
   */
  kayitlar.push({
    url: `${base}/tr/premium/ydus`,
    lastModified: simdi,
    changeFrequency: "weekly",
    priority: 0.8,
  });

  // Bilerek DIŞARIDA: /giris ve /kayit (içerik değil, arama değeri yok),
  // /calisma-alanim ve /tekrar (kişisel araçlar; tarayıcıya boş görünürler),
  // /guidelines (henüz yer tutucu — aşağıda dizine kapatıldı).

  for (const brans of branslar()) {
    kayitlar.push({
      url: `${base}/topics/${brans}`,
      lastModified: simdi,
      changeFrequency: "weekly",
      priority: 0.8,
    });

    for (const { slug, dosya } of konular(brans)) {
      kayitlar.push({
        url: `${base}/topics/${brans}/${slug}`,
        lastModified: sonDegisiklik(dosya),
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  for (const arac of araclar()) {
    kayitlar.push({
      url: `${base}/tools/${arac}`,
      lastModified: simdi,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return kayitlar;
}
