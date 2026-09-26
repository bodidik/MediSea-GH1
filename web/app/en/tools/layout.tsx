import type { ReactNode } from "react";
import Link from "next/link";
import KaydirDurumu from "@/app/components/KaydirDurumu";
import { getTopicCounts, getToolCount } from "@/app/lib/topic-counts";
import { SPECIALTIES } from "@/app/lib/specialties";
import { cevrilmisSayfalar } from "@/lib/dil";

/**
 * İngilizce araç kabuğu — `app/tools/layout.tsx`in karşılığı.
 *
 * `/en/tools/*` Türkçe araç ağacının DIŞINDA olduğu için oradaki `<main>`,
 * JS'siz uyarı şeridi ve altbilgi buraya miras gelmiyor; burada İngilizce
 * olarak yeniden kuruluyor. Sayılar SAYDIRILIYOR (Türkçe kabukla aynı
 * kaynak); İngilizce araç sayısı dil indeksinden.
 *
 * Türkçe yüzeylere giden her bağ `lang="tr"` + `hrefLang="tr"` taşır ve
 * hedefin Türkçe olduğunu söyler — okuyucu habersiz Türkçe sayfaya düşmesin.
 */
export default function IngilizceAracDuzen({ children }: { children: ReactNode }) {
  const konu = Object.values(getTopicCounts()).reduce((a, b) => a + b, 0);
  const brans = SPECIALTIES.length;
  const arac = getToolCount();
  const enArac = cevrilmisSayfalar().filter((y) => y.startsWith("/tools/")).length;

  return (
    <>
      <main>
        <KaydirDurumu />
        <noscript>
          <div className="mx-auto max-w-3xl px-4 pt-6">
            <div className="rounded-2xl border-2 border-amber-600 bg-amber-50 p-5 text-blue-950">
              <p className="text-sm font-black uppercase tracking-widest text-amber-800">
                Calculation is not working right now
              </p>
              <p className="mt-2 text-sm font-bold leading-relaxed">
                The calculations on this page run in your browser; because JavaScript is
                disabled or failed to load, the values you enter will not change the result.
                If you see a result on screen, it belongs to the STARTING values — not yours.
              </p>
            </div>
          </div>
        </noscript>
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
            <Link
              href="/"
              hrefLang="tr"
              lang="tr"
              className="inline-flex min-h-[44px] items-center rounded-xl border border-blue-300/40 px-4 text-sm font-black text-white hover:bg-blue-900"
            >
              MediSea (Türkçe)
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
