// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Makroprolaktin (PEG Geri Kazanımı) — Hiperprolaktinemide",
  description: "Makroprolaktin (PEG Geri Kazanımı): Hiperprolaktinemide makroprolaktin ve monomerik prolaktin ayrımı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/makroprolaktin" },
  manifest: "/manifest/arac/makroprolaktin",
  openGraph: {
    type: "website",
    title: "Makroprolaktin (PEG Geri Kazanımı) — Hiperprolaktinemide",
    description: "Makroprolaktin (PEG Geri Kazanımı): Hiperprolaktinemide makroprolaktin ve monomerik prolaktin ayrımı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/makroprolaktin",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Makroprolaktin (PEG Geri Kazanımı)",
          aciklama: "Makroprolaktin (PEG Geri Kazanımı): Hiperprolaktinemide makroprolaktin ve monomerik prolaktin ayrımı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/makroprolaktin",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Makroprolaktin (PEG Geri Kazanımı)", yol: "/tools/makroprolaktin" },
        ])}
      />
      {children}
      <nav aria-label="Bu araçla ilgili konular" className="bg-slate-50 px-4 pb-6 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Bu araçla ilgili konular
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/topics/endokrinoloji/prolaktinoma-yeni-biyobelirtecler" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Prolaktinoma: Yeni Moleküler ve Genetik Biyobelirteçler
              </Link>
            </li>
            <li>
              <Link href="/topics/endokrinoloji/hipofiz-adenomlari" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Hipofiz Nöroendokrin Tümörleri
              </Link>
            </li>
            <li>
              <Link href="/topics/endokrinoloji/hiperprolaktinemi-ve-prolaktinoma" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Hiperprolaktinemi ve Prolaktinoma
              </Link>
            </li>
            <li>
              <Link href="/topics/endokrinoloji/sf3b1-mutasyonu-metastatik-prolaktinoma" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SF3B1 Mutasyonu: Agresif ve Metastatik Prolaktinomalar
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Endokrinoloji & Metabolizma kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/metabolik-sendrom" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Metabolik Sendrom
              </Link>
            </li>
            <li>
              <Link href="/tools/steroid-dose" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Steroid Eşdeğer Doz
              </Link>
            </li>
            <li>
              <Link href="/tools/tirads" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ACR TI-RADS
              </Link>
            </li>
            <li>
              <Link href="/tools/adrenal-yikanma" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Adrenal Kitle BT Yıkanma Hesabı
              </Link>
            </li>
            <li>
              <Link href="/tools/aldosteron-renin" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Aldosteron/Renin Oranı
              </Link>
            </li>
            <li>
              <Link href="/tools/bazal-bolus-insulin" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Bazal-Bolus İnsülin Başlangıcı
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
