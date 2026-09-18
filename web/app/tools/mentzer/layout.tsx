// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Mentzer İndeksi — Mikrositer anemide talasemi",
  description: "Mentzer İndeksi: Mikrositer anemide talasemi taşıyıcılığı ve demir eksikliği ayrımı — MCV / eritrosit. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/mentzer" },
  openGraph: {
    type: "website",
    title: "Mentzer İndeksi — Mikrositer anemide talasemi",
    description: "Mentzer İndeksi: Mikrositer anemide talasemi taşıyıcılığı ve demir eksikliği ayrımı — MCV / eritrosit. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/mentzer",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Mentzer İndeksi",
          aciklama: "Mentzer İndeksi: Mikrositer anemide talasemi taşıyıcılığı ve demir eksikliği ayrımı — MCV / eritrosit. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/mentzer",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Mentzer İndeksi", yol: "/tools/mentzer" },
        ])}
      />
      {children}
      <nav aria-label="Bu aracın geçtiği konular" className="bg-slate-50 px-4 pb-6 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Bu aracın geçtiği konular
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/topics/hematoloji/demir-eksikligi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Demir Eksikliği Anemisi (DEA)
              </Link>
            </li>
            <li>
              <Link href="/topics/hematoloji/demir-eksikligi-anemisi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Demir Eksikliği Anemisi (DEA)
              </Link>
            </li>
            <li>
              <Link href="/topics/hematoloji/mikrositer-anemiler" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Mikrositer Anemiler
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Hematoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/mipi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                MIPI
              </Link>
            </li>
            <li>
              <Link href="/tools/mpn-tromboz" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                MPN Tromboz Riski
              </Link>
            </li>
            <li>
              <Link href="/tools/plasmic" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                PLASMIC Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/r-iss" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                R-ISS
              </Link>
            </li>
            <li>
              <Link href="/tools/retikulosit-indeksi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Retikülosit Üretim İndeksi
              </Link>
            </li>
            <li>
              <Link href="/tools/revize-cenevre" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Revize Cenevre Skoru
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
