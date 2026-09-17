// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "ACR/EULAR 2016 Sjögren Kriterleri — Primer Sjögren",
  description: "ACR/EULAR 2016 Sjögren Kriterleri: Primer Sjögren sınıflaması — biyopsi, anti-SSA, kuruluk testleri (≥ 4). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/sjogren-2016" },
  openGraph: {
    type: "website",
    title: "ACR/EULAR 2016 Sjögren Kriterleri — Primer Sjögren",
    description: "ACR/EULAR 2016 Sjögren Kriterleri: Primer Sjögren sınıflaması — biyopsi, anti-SSA, kuruluk testleri (≥ 4). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/sjogren-2016",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "ACR/EULAR 2016 Sjögren Kriterleri",
          aciklama: "ACR/EULAR 2016 Sjögren Kriterleri: Primer Sjögren sınıflaması — biyopsi, anti-SSA, kuruluk testleri (≥ 4). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/sjogren-2016",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "ACR/EULAR 2016 Sjögren Kriterleri", yol: "/tools/sjogren-2016" },
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
              <Link href="/tools/anca-vaskulit" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ACR/EULAR 2022 ANCA Vaskülitleri
              </Link>
            </li>
            <li>
              <Link href="/tools/dev-hucreli-arterit" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ACR/EULAR 2022 Dev Hücreli Arterit
              </Link>
            </li>
            <li>
              <Link href="/tools/asas-axspa" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ASAS Aksiyel SpA Kriterleri
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
