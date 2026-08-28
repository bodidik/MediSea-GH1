// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Behçet — ICBD 2014 — Behçet hastalığı tanı kriterleri",
  description: "Behçet — ICBD 2014: Behçet hastalığı tanı kriterleri — ağırlıklı puanlama (≥ 4 puan). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/behcet" },
  openGraph: {
    type: "website",
    title: "Behçet — ICBD 2014 — Behçet hastalığı tanı kriterleri",
    description: "Behçet — ICBD 2014: Behçet hastalığı tanı kriterleri — ağırlıklı puanlama (≥ 4 puan). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/behcet",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Behçet — ICBD 2014",
          aciklama: "Behçet — ICBD 2014: Behçet hastalığı tanı kriterleri — ağırlıklı puanlama (≥ 4 puan). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/behcet",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Behçet — ICBD 2014", yol: "/tools/behcet" },
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
              <Link href="/tools/cdai" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CDAI
              </Link>
            </li>
            <li>
              <Link href="/tools/dapsa" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                DAPSA
              </Link>
            </li>
            <li>
              <Link href="/tools/das28" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                DAS28 (ESR/CRP)
              </Link>
            </li>
            <li>
              <Link href="/tools/essdai" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ESSDAI
              </Link>
            </li>
            <li>
              <Link href="/tools/fibromiyalji" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Fibromiyalji 2016
              </Link>
            </li>
            <li>
              <Link href="/tools/gout-acr" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Gut ACR 2015
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
