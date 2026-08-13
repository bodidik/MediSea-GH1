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
const ARAC_KOKU = path.join(process.cwd(), "app", "tools");

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

/** app/tools altındaki her klasör bir araç sayfası; components/lib gibi yardımcılar hariç. */
function araclar(): string[] {
  return guvenliOku(
    () =>
      fs
        .readdirSync(ARAC_KOKU, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .filter((ad) => !["components", "lib"].includes(ad))
        .filter((ad) => fs.existsSync(path.join(ARAC_KOKU, ad, "page.tsx"))),
    []
  );
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const simdi = new Date();
  const kayitlar: Kayit[] = [];

  kayitlar.push({ url: `${base}/`, lastModified: simdi, changeFrequency: "daily", priority: 1 });
  kayitlar.push({ url: `${base}/topics`, lastModified: simdi, changeFrequency: "daily", priority: 0.9 });
  kayitlar.push({ url: `${base}/tools`, lastModified: simdi, changeFrequency: "weekly", priority: 0.9 });
  kayitlar.push({ url: `${base}/uyelik`, lastModified: simdi, changeFrequency: "monthly", priority: 0.6 });

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
