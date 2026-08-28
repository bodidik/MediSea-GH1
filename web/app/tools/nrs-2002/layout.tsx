// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "NRS-2002 — Yatan hastalarda beslenme riski taraması",
  description: "NRS-2002: Yatan hastalarda beslenme riski taraması. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/nrs-2002" },
  openGraph: {
    type: "website",
    title: "NRS-2002 — Yatan hastalarda beslenme riski taraması",
    description: "NRS-2002: Yatan hastalarda beslenme riski taraması. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/nrs-2002",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "NRS-2002",
          aciklama: "NRS-2002: Yatan hastalarda beslenme riski taraması. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/nrs-2002",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "NRS-2002", yol: "/tools/nrs-2002" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Klinik Nütrisyon (Beslenme) kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/pni" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                PNI
              </Link>
            </li>
            <li>
              <Link href="/tools/refeeding-risk" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Refeeding Sendromu Riski
              </Link>
            </li>
            <li>
              <Link href="/tools/sga" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SGA
              </Link>
            </li>
            <li>
              <Link href="/tools/conut" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CONUT
              </Link>
            </li>
            <li>
              <Link href="/tools/nutrition-needs" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Enerji & Protein Gereksinimi
              </Link>
            </li>
            <li>
              <Link href="/tools/glim" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                GLIM Kriterleri
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
