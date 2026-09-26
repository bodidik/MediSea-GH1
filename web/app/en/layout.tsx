import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_ADI } from "@/lib/site";
import { OG_YEREL } from "@/lib/dil";
import { DilSaglayici } from "@/app/components/DilBaglami";

/**
 * İNGİLİZCE AĞAÇ — `/en/...`.
 *
 * Kural (bkz. lib/dil.ts): buraya yalnızca GERÇEKTEN çevrilmiş sayfa girer
 * ve her sayfanın bir Türkçe karşılığı olmalı. `scripts/dil-index.cjs`
 * ikisini de denetler; `scripts/dil-denetim.cjs --cikti` derlenmiş
 * HTML'de Türkçe metin, eksik `lang`, yanlış canonical ve eksik `hreflang`
 * arar.
 *
 * `canonical` BURADA VERİLMEZ: layout'ta verilen değer bütün alt sayfalara
 * miras kalır ve her biri kendini tek bir adresin kopyası ilan eder (kökteki
 * `canonical: "/"` bu depoda o yüzden defalarca kusur üretti). Her sayfa
 * kendi adresini `rotaMeta({ ..., dil: "en" })` ile beyan eder.
 *
 * Dil değiştirici BURADA değil, her yüzeyin kendi gezinmesinde (araçlarda
 * `ToolTopNav`): layout'ta bir kez daha çizilince araç sayfasında iki
 * değiştirici üst üste duruyordu.
 */
export const metadata: Metadata = {
  /* `absolute`, `default` DEĞİL: kökün şablonu (`%s · MEDISEA`) bu segmentin
     varsayılanına da uygulanıyor. Ölçüldü (derlenmiş HTML, başlığı olmayan
     sayfa): "MEDISEA — Clinical calculators … · MEDISEA" — ad iki kez. */
  title: {
    absolute: `${SITE_ADI} — Clinical calculators for internal medicine`,
    template: `%s · ${SITE_ADI}`,
  },
  description: "Clinical calculators and scores for internal medicine. Free, no sign-up.",
  openGraph: {
    type: "website",
    siteName: SITE_ADI,
    locale: OG_YEREL.en,
    alternateLocale: [OG_YEREL.tr],
  },
};

export default function IngilizceDuzen({ children }: { children: ReactNode }) {
  /* `lang="en"` SUNUCU HTML'inde: kök `<html>` "tr" basıyor (bkz.
     DilDegistir.tsx → DilEsitle), içerik dili bu kaptan okunuyor.
     `DilSaglayici`: Türkçe aracın AYNI bileşeni burada İngilizce çizilir. */
  return (
    <div lang="en">
      <DilSaglayici dil="en">{children}</DilSaglayici>
    </div>
  );
}
