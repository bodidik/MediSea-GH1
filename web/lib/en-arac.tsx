import type { Metadata } from "next";
import Link from "next/link";
import aracEn from "@/content/arac-en.json";
import { rotaMeta } from "@/lib/site";
import { cevrilmisSayfalar } from "@/lib/dil";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

/**
 * İngilizce araç sayfalarının künyesi — ad ve açıklama `content/arac-en.json`
 * içinde TEK yerde; sayfa metadata'sı, JSON-LD ve `/en/tools` dizini hepsi
 * buradan okur. `scripts/dil-denetim.cjs` dosyadaki İngilizce metni ve
 * çevrilmiş her aracın kaydı olduğunu denetler.
 *
 * Kayıt yoksa FIRLATIR: derleme düşer. Adsız bir İngilizce sayfa kök
 * başlığını miras alır ve arama motoruna "ana sayfanın kopyasıyım" der —
 * sessizce yayına girmesindense derlemenin düşmesi doğru.
 */
type Kunye = { ad: string; aciklama: string };
const KUNYE: Record<string, Kunye> = aracEn;

export function enAracKunye(slug: string): Kunye {
  const k = KUNYE[slug];
  if (!k) throw new Error(`content/arac-en.json: "${slug}" için İngilizce künye yok`);
  return k;
}

/**
 * Çevrilmiş araçların listesi — dil indeksindeki `/tools/<slug>` yolları
 * (yani GERÇEKTEN çevrilmiş araçlar), ada göre sıralı. Liste ELLE yazılmaz:
 * yeni bir araç çevrildiğinde dizine ve ana sayfaya kendiliğinden girer.
 */
export function enAraclar(): ({ slug: string } & Kunye)[] {
  return cevrilmisSayfalar()
    .filter((y) => y.startsWith("/tools/"))
    .map((y) => y.slice("/tools/".length))
    .map((slug) => ({ slug, ...enAracKunye(slug) }))
    .sort((a, b) => a.ad.localeCompare(b.ad, "en"));
}

/** Dizin ve İngilizce ana sayfa AYNI kartları çizer. */
export function EnAracListesi() {
  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {enAraclar().map((a) => (
        <li key={a.slug}>
          <Link
            href={`/en/tools/${a.slug}`}
            className="block h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-900/30"
          >
            <span className="block text-sm font-black text-blue-900">{a.ad}</span>
            <span className="mt-1 block text-xs font-semibold leading-relaxed text-slate-600">{a.aciklama}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function enAracMeta(slug: string): Metadata {
  const { ad, aciklama } = enAracKunye(slug);
  return rotaMeta({
    /* Başlık açıklamanın İLK parçasıyla sınırlı — Türkçe layout'la aynı kural
       (`arac-metadata.cjs` → baslikUret): uzun açıklama başlığa taşmasın. */
    baslik: `${ad} — ${aciklama.split(" — ")[0]}`,
    aciklama: `${ad}: ${aciklama}. Free clinical calculator — MediSea.`,
    yol: `/tools/${slug}`,
    dil: "en",
  });
}

/** Araç sayfasının şemaları — Türkçedeki `arac-metadata.cjs` layout'unun karşılığı. */
export function EnAracSemasi({ slug }: { slug: string }) {
  const { ad, aciklama } = enAracKunye(slug);
  const yol = `/en/tools/${slug}`;
  return (
    <>
      <JsonLd veri={aracSemasi({ ad, aciklama, yol, dil: "en" })} />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea Clinical Calculators", yol: "/en/tools" },
          { ad, yol },
        ])}
      />
    </>
  );
}
