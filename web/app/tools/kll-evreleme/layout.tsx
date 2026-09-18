// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "KLL Evrelemesi (Rai · Binet) — Kronik lenfositik lösemi",
  description: "KLL Evrelemesi (Rai · Binet): Kronik lenfositik lösemi — modifiye Rai ve Binet evresi aynı muayeneden. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/kll-evreleme" },
  openGraph: {
    type: "website",
    title: "KLL Evrelemesi (Rai · Binet) — Kronik lenfositik lösemi",
    description: "KLL Evrelemesi (Rai · Binet): Kronik lenfositik lösemi — modifiye Rai ve Binet evresi aynı muayeneden. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/kll-evreleme",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "KLL Evrelemesi (Rai · Binet)",
          aciklama: "KLL Evrelemesi (Rai · Binet): Kronik lenfositik lösemi — modifiye Rai ve Binet evresi aynı muayeneden. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/kll-evreleme",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "KLL Evrelemesi (Rai · Binet)", yol: "/tools/kll-evreleme" },
        ])}
      />
      {children}

      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Hematoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/kml-risk" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                KML Risk Skoru (ELTS · Sokal)
              </Link>
            </li>
            <li>
              <Link href="/tools/mentzer" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Mentzer İndeksi
              </Link>
            </li>
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
          </ul>
        </div>
      </nav>
    </>
  );
}
