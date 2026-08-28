// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "mRSS — Modifiye Rodnan Deri Skoru",
  description: "mRSS: Modifiye Rodnan Deri Skoru — sistemik skleroz deri fibrozisi (17 bölge). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/mrss" },
  openGraph: {
    type: "website",
    title: "mRSS — Modifiye Rodnan Deri Skoru",
    description: "mRSS: Modifiye Rodnan Deri Skoru — sistemik skleroz deri fibrozisi (17 bölge). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/mrss",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "mRSS",
          aciklama: "mRSS: Modifiye Rodnan Deri Skoru — sistemik skleroz deri fibrozisi (17 bölge). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/mrss",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "mRSS", yol: "/tools/mrss" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Romatoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/rapid3" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                RAPID3
              </Link>
            </li>
            <li>
              <Link href="/tools/sdai" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SDAI
              </Link>
            </li>
            <li>
              <Link href="/tools/sle" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SLEDAI-2K
              </Link>
            </li>
            <li>
              <Link href="/tools/asdas" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ASDAS-CRP/ESR
              </Link>
            </li>
            <li>
              <Link href="/tools/basdai" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                BASDAI
              </Link>
            </li>
            <li>
              <Link href="/tools/behcet" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Behçet — ICBD 2014
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
