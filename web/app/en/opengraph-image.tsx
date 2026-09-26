import { SITE_ADI } from "@/lib/site";
import { KART_BOYUTU, siteKarti } from "@/lib/site-karti";

/**
 * İngilizce sayfaların paylaşım görseli — kökteki Türkçe kartın aynı
 * tasarımı. Bu dosya olmasaydı `/en` sayfaları Türkçe kartı miras alırdı;
 * üstelik `app/en/layout.tsx` `openGraph` tanımladığı için (og:locale)
 * kökteki dosya tabanlı görsel mirası ZATEN kesilirdi (bkz. lib/site.ts,
 * `rotaMeta` notu). Aynı segmentteki dosya o mirası geri kuruyor.
 */

export const alt = `${SITE_ADI} — Clinical calculators for internal medicine`;
export const size = KART_BOYUTU;
export const contentType = "image/png";

export default async function Image() {
  return siteKarti({
    baslik: "Clinical calculators for internal medicine",
    alt: "Free · no sign-up",
  });
}
