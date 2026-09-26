import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SITE_ADI } from "@/lib/site";
import { OG_YEREL } from "@/lib/dil";
import DilDegistir from "@/app/components/DilDegistir";

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
     DilDegistir.tsx → DilEsitle), içerik dili bu kaptan okunuyor. */
  return (
    <div lang="en">
      <div className="flex justify-end px-4 pt-2">
        <DilDegistir />
      </div>
      {children}
    </div>
  );
}
