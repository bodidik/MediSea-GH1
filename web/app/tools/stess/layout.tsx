// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "STESS — Status epileptikus şiddet skoru",
  description: "STESS: Status epileptikus şiddet skoru — hastanede ölüm öngörüsü (≥ 3 olumsuz). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/stess" },
  openGraph: {
    type: "website",
    title: "STESS — Status epileptikus şiddet skoru",
    description: "STESS: Status epileptikus şiddet skoru — hastanede ölüm öngörüsü (≥ 3 olumsuz). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/stess",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "STESS",
          aciklama: "STESS: Status epileptikus şiddet skoru — hastanede ölüm öngörüsü (≥ 3 olumsuz). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/stess",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "STESS", yol: "/tools/stess" },
        ])}
      />
      {children}

      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Nöroloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/wfns" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                WFNS SAK Derecesi
              </Link>
            </li>
            <li>
              <Link href="/tools/abc2-hematom" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ABC/2 Hematom Hacmi
              </Link>
            </li>
            <li>
              <Link href="/tools/abcd2" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ABCD² Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/aspects" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ASPECTS
              </Link>
            </li>
            <li>
              <Link href="/tools/egris" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                EGRIS
              </Link>
            </li>
            <li>
              <Link href="/tools/fisher" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Fisher Skalası
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
