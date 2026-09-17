// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "CRUSADE Kanama Skoru — NSTEMI'de hastane içi majör",
  description: "CRUSADE Kanama Skoru: NSTEMI'de hastane içi majör kanama riski — 8 değişken. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/crusade" },
  openGraph: {
    type: "website",
    title: "CRUSADE Kanama Skoru — NSTEMI'de hastane içi majör",
    description: "CRUSADE Kanama Skoru: NSTEMI'de hastane içi majör kanama riski — 8 değişken. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/crusade",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "CRUSADE Kanama Skoru",
          aciklama: "CRUSADE Kanama Skoru: NSTEMI'de hastane içi majör kanama riski — 8 değişken. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/crusade",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "CRUSADE Kanama Skoru", yol: "/tools/crusade" },
        ])}
      />
      {children}

      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Kardiyoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/duke-kosu-bandi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Duke Koşu Bandı Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/endocarditis" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Duke Kriterleri
              </Link>
            </li>
            <li>
              <Link href="/tools/grace" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                GRACE Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/h2fpef" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                H₂FPEF Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/has-bled" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HAS-BLED Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/killip" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Killip Sınıflaması
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
