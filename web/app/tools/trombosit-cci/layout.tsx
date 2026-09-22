// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Trombosit Transfüzyonu CCI — Düzeltilmiş sayım artışı",
  description: "Trombosit Transfüzyonu CCI: Düzeltilmiş sayım artışı — trombosit transfüzyonuna refrakterlik. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/trombosit-cci" },
  openGraph: {
    type: "website",
    title: "Trombosit Transfüzyonu CCI — Düzeltilmiş sayım artışı",
    description: "Trombosit Transfüzyonu CCI: Düzeltilmiş sayım artışı — trombosit transfüzyonuna refrakterlik. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/trombosit-cci",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Trombosit Transfüzyonu CCI",
          aciklama: "Trombosit Transfüzyonu CCI: Düzeltilmiş sayım artışı — trombosit transfüzyonuna refrakterlik. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/trombosit-cci",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Trombosit Transfüzyonu CCI", yol: "/tools/trombosit-cci" },
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
              <Link href="/tools/vte-bleed" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                VTE-BLEED
              </Link>
            </li>
            <li>
              <Link href="/tools/who-kanama" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                WHO Kanama Ölçeği
              </Link>
            </li>
            <li>
              <Link href="/tools/4t-hit" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                4T Skoru — HIT
              </Link>
            </li>
            <li>
              <Link href="/tools/ann-arbor-lugano" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Ann Arbor / Lugano Evrelemesi
              </Link>
            </li>
            <li>
              <Link href="/tools/cll-ipi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CLL-IPI
              </Link>
            </li>
            <li>
              <Link href="/tools/cns-ipi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CNS-IPI
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
