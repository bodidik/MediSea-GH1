import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { SITE_ADI } from "@/lib/site";
import { OG_YEREL, cevrilmisSayfalar } from "@/lib/dil";
import { DilSaglayici } from "@/app/components/DilBaglami";
import DilDegistir from "@/app/components/DilDegistir";
import { getTopicCounts, getToolCount } from "@/app/lib/topic-counts";
import { SPECIALTIES } from "@/app/lib/specialties";

/**
 * İNGİLİZCE SİTE — `/en/...`. Kendi içinde kapalı bir ikiz (kullanıcı kararı,
 * 27 Eyl 2026): İngilizce okuyucu Türkçe sayfa görmeden dolaşabilmeli. Bu
 * yüzden buradaki HİÇBİR bağlantı Türkçe sayfaya gitmez; tek istisna dil
 * değiştirici — açık bir seçim, `lang="tr"` beyanlı ve çereze yazılı.
 *
 * Kural (bkz. lib/dil.ts): buraya yalnızca GERÇEKTEN çevrilmiş sayfa girer
 * ve her sayfanın bir Türkçe karşılığı olmalı. `scripts/dil-index.cjs`
 * ikisini de denetler; `scripts/dil-denetim.cjs --cikti` derlenmiş HTML'de
 * Türkçe metin, eksik `lang`, yanlış canonical ve eksik `hreflang` arar.
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
  /* Sayılar SAYDIRILIYOR (Türkçe kabukla aynı kaynak); İngilizce araç sayısı
     dil indeksinden. Elle yazılan sayı bu depoda tur tur yalana döndü. */
  const konu = Object.values(getTopicCounts()).reduce((a, b) => a + b, 0);
  const brans = SPECIALTIES.length;
  const arac = getToolCount();
  const enArac = cevrilmisSayfalar().filter((y) => y.startsWith("/tools/")).length;

  /* `lang="en"` SUNUCU HTML'inde: kök `<html>` "tr" basıyor (bkz.
     DilDegistir.tsx → DilEsitle), içerik dili bu kaptan okunuyor.
     `DilSaglayici`: Türkçe aracın AYNI bileşeni burada İngilizce çizilir. */
  return (
    <div lang="en" className="flex min-h-screen flex-col bg-slate-50 font-sans">
      <DilSaglayici dil="en">
        <a
          href="#en-icerik"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-blue-950 focus:px-4 focus:py-2.5 focus:text-sm focus:font-bold focus:text-white"
        >
          Skip to content
        </a>
        <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-4">
            <Link href="/en" className="mr-auto inline-flex min-h-[44px] items-center text-sm font-black tracking-[0.2em] text-blue-950">
              MEDISEA
            </Link>
            <nav aria-label="Main">
              <Link
                href="/en/tools"
                className="inline-flex min-h-[44px] items-center rounded-full px-3 text-sm font-bold text-slate-700 hover:text-blue-800"
              >
                Calculators
              </Link>
            </nav>
            <DilDegistir className="inline-flex h-9 items-center rounded-full border border-slate-200 px-3 text-xs font-black tracking-widest text-slate-700 hover:border-blue-300 hover:text-blue-800 transition-colors" />
          </div>
        </header>

        <main id="en-icerik" tabIndex={-1} className="flex-1 focus:outline-none">
          {children}
        </main>

        <footer className="border-t-4 border-blue-900 bg-blue-950 px-4 py-10 text-blue-100">
          <div className="mx-auto max-w-3xl">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">MEDISEA</p>
            <h2 className="mt-2 font-sans text-xl font-black leading-tight tracking-tight text-white">
              About MediSea
            </h2>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-blue-100/90">
              {`MediSea is a clinical reference for internal medicine residents and specialists, written in Turkish: ${konu} topic reviews across ${brans} specialties and ${arac} calculators, ${enArac} of which are available in English. Free, no sign-up.`}
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/en/tools"
                className="inline-flex min-h-[44px] items-center rounded-xl bg-white px-4 text-sm font-black text-blue-950 hover:bg-blue-100"
              >
                All calculators in English
              </Link>
              <DilDegistir className="inline-flex min-h-[44px] items-center rounded-xl border border-blue-300/40 px-4 text-sm font-black text-white hover:bg-blue-900" />
            </div>
          </div>
        </footer>
      </DilSaglayici>
    </div>
  );
}
