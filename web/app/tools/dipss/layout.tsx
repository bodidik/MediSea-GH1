// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "DIPSS — Primer miyelofibrozda dinamik prognostik skor",
  description: "DIPSS: Primer miyelofibrozda dinamik prognostik skor — medyan sağkalım. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/dipss" },
  openGraph: {
    type: "website",
    title: "DIPSS — Primer miyelofibrozda dinamik prognostik skor",
    description: "DIPSS: Primer miyelofibrozda dinamik prognostik skor — medyan sağkalım. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/dipss",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "DIPSS",
          aciklama: "DIPSS: Primer miyelofibrozda dinamik prognostik skor — medyan sağkalım. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/dipss",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "DIPSS", yol: "/tools/dipss" },
        ])}
      />
      {children}
      <nav aria-label="Bu aracın geçtiği konular" className="bg-slate-50 px-4 pb-6 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Bu aracın geçtiği konular
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/topics/hematoloji/primer-miyelofibrozis" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Primer Miyelofibrozis (PMF)
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Hematoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            <li>
              <Link href="/tools/ganzoni" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Ganzoni Demir Açığı
              </Link>
            </li>
            <li>
              <Link href="/tools/hep-skoru" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HEP Skoru — HIT
              </Link>
            </li>
            <li>
              <Link href="/tools/hodgkin-ips" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Hodgkin IPS
              </Link>
            </li>
            <li>
              <Link href="/tools/hscore" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HScore
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
