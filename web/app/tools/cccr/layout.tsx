// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Kalsiyum/Kreatinin Klirens Oranı — FHH ile primer",
  description: "Kalsiyum/Kreatinin Klirens Oranı: FHH ile primer hiperparatiroidi ayrımı — CCCR. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/cccr" },
  manifest: "/manifest/arac/cccr",
  openGraph: {
    type: "website",
    title: "Kalsiyum/Kreatinin Klirens Oranı — FHH ile primer",
    description: "Kalsiyum/Kreatinin Klirens Oranı: FHH ile primer hiperparatiroidi ayrımı — CCCR. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/cccr",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Kalsiyum/Kreatinin Klirens Oranı",
          aciklama: "Kalsiyum/Kreatinin Klirens Oranı: FHH ile primer hiperparatiroidi ayrımı — CCCR. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/cccr",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Kalsiyum/Kreatinin Klirens Oranı", yol: "/tools/cccr" },
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
              <Link href="/topics/endokrinoloji/hiperparatiroidizm" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Hiperparatiroidizm ve Kalsiyum Metabolizması Bozuklukları
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
              <Link href="/tools/makroprolaktin" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Makroprolaktin (PEG Geri Kazanımı)
              </Link>
            </li>
            <li>
              <Link href="/tools/metabolik-sendrom" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Metabolik Sendrom
              </Link>
            </li>
            <li>
              <Link href="/tools/osta" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                OSTA
              </Link>
            </li>
            <li>
              <Link href="/tools/temd-kirik-riski" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Osteoporoz Kırık Riski Kategorisi (TEMD)
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
          </ul>
        </div>
      </nav>
    </>
  );
}
