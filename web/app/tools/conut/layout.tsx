// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "CONUT — Controlling Nutritional Status",
  description: "CONUT: Controlling Nutritional Status — albumin + kolesterol + lenfosit. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/conut" },
  openGraph: {
    type: "website",
    title: "CONUT — Controlling Nutritional Status",
    description: "CONUT: Controlling Nutritional Status — albumin + kolesterol + lenfosit. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/conut",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "CONUT",
          aciklama: "CONUT: Controlling Nutritional Status — albumin + kolesterol + lenfosit. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/conut",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "CONUT", yol: "/tools/conut" },
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
              <Link href="/tools/nutrition-needs" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Enerji & Protein Gereksinimi
              </Link>
            </li>
            <li>
              <Link href="/tools/glim" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                GLIM Kriterleri
              </Link>
            </li>
            <li>
              <Link href="/tools/gnri" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                GNRI
              </Link>
            </li>
            <li>
              <Link href="/tools/mna" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                MNA® (Kısa Form)
              </Link>
            </li>
            <li>
              <Link href="/tools/must" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                MUST
              </Link>
            </li>
            <li>
              <Link href="/tools/nrs-2002" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                NRS-2002
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
