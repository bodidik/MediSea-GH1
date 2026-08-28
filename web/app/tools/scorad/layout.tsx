// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "SCORAD — Atopik dermatit şiddet skoru",
  description: "SCORAD: Atopik dermatit şiddet skoru — alan + yoğunluk + subjektif. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/scorad" },
  openGraph: {
    type: "website",
    title: "SCORAD — Atopik dermatit şiddet skoru",
    description: "SCORAD: Atopik dermatit şiddet skoru — alan + yoğunluk + subjektif. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/scorad",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "SCORAD",
          aciklama: "SCORAD: Atopik dermatit şiddet skoru — alan + yoğunluk + subjektif. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/scorad",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "SCORAD", yol: "/tools/scorad" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Allerji & İmmünoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/tnss" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                TNSS
              </Link>
            </li>
            <li>
              <Link href="/tools/uas7" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                UAS7
              </Link>
            </li>
            <li>
              <Link href="/tools/anaphylaxis" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Anafilaksi Kriterleri
              </Link>
            </li>
            <li>
              <Link href="/tools/dlqi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                DLQI
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
