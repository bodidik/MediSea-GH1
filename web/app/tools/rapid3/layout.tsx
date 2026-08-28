// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "RAPID3 — Rutin Değerlendirme 3 Hasta Ölçütü",
  description: "RAPID3: Rutin Değerlendirme 3 Hasta Ölçütü — HAQ-DI + ağrı + global. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/rapid3" },
  openGraph: {
    type: "website",
    title: "RAPID3 — Rutin Değerlendirme 3 Hasta Ölçütü",
    description: "RAPID3: Rutin Değerlendirme 3 Hasta Ölçütü — HAQ-DI + ağrı + global. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/rapid3",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "RAPID3",
          aciklama: "RAPID3: Rutin Değerlendirme 3 Hasta Ölçütü — HAQ-DI + ağrı + global. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/rapid3",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "RAPID3", yol: "/tools/rapid3" },
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
              <Link href="/tools/sdai" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SDAI
              </Link>
            </li>
            <li>
              <Link href="/tools/sle" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SLEDAI-2K
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
            <li>
              <Link href="/tools/cdai" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CDAI
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
