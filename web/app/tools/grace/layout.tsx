// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "GRACE Skoru — AKS/NSTEMI hastane içi mortalite",
  description: "GRACE Skoru: AKS/NSTEMI hastane içi mortalite — toplamsal puan (1.0). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/grace" },
  openGraph: {
    type: "website",
    title: "GRACE Skoru — AKS/NSTEMI hastane içi mortalite",
    description: "GRACE Skoru: AKS/NSTEMI hastane içi mortalite — toplamsal puan (1.0). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/grace",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "GRACE Skoru",
          aciklama: "GRACE Skoru: AKS/NSTEMI hastane içi mortalite — toplamsal puan (1.0). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/grace",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "GRACE Skoru", yol: "/tools/grace" },
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
              <Link href="/tools/has-bled" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HAS-BLED Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/timi-ua" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                TIMI Skoru (UA/NSTEMI)
              </Link>
            </li>
            <li>
              <Link href="/tools/chads-vasc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CHA₂DS₂-VASc Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/endocarditis" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Duke Kriterleri
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
