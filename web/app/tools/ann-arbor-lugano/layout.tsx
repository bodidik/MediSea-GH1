// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Ann Arbor / Lugano Evrelemesi — Hodgkin ve non-Hodgkin",
  description: "Ann Arbor / Lugano Evrelemesi: Hodgkin ve non-Hodgkin lenfoma evresi — E eki, bulky, B semptomları. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ann-arbor-lugano" },
  openGraph: {
    type: "website",
    title: "Ann Arbor / Lugano Evrelemesi — Hodgkin ve non-Hodgkin",
    description: "Ann Arbor / Lugano Evrelemesi: Hodgkin ve non-Hodgkin lenfoma evresi — E eki, bulky, B semptomları. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ann-arbor-lugano",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Ann Arbor / Lugano Evrelemesi",
          aciklama: "Ann Arbor / Lugano Evrelemesi: Hodgkin ve non-Hodgkin lenfoma evresi — E eki, bulky, B semptomları. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/ann-arbor-lugano",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Ann Arbor / Lugano Evrelemesi", yol: "/tools/ann-arbor-lugano" },
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
              <Link href="/tools/cll-ipi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CLL-IPI
              </Link>
            </li>
            <li>
              <Link href="/tools/cns-ipi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CNS-IPI
              </Link>
            </li>
            <li>
              <Link href="/tools/demir-parametreleri" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Demir Parametreleri
              </Link>
            </li>
            <li>
              <Link href="/tools/dipss" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                DIPSS
              </Link>
            </li>
            <li>
              <Link href="/tools/eln-2022-aml" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ELN 2022 AML Genetik Riski
              </Link>
            </li>
            <li>
              <Link href="/tools/flipi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                FLIPI
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
