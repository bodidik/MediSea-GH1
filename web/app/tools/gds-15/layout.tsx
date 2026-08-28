// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "GDS-15 — Geriatrik Depresyon Ölçeği kısa form",
  description: "GDS-15: Geriatrik Depresyon Ölçeği kısa form — 15 madde tarama aracı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/gds-15" },
  openGraph: {
    type: "website",
    title: "GDS-15 — Geriatrik Depresyon Ölçeği kısa form",
    description: "GDS-15: Geriatrik Depresyon Ölçeği kısa form — 15 madde tarama aracı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/gds-15",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "GDS-15",
          aciklama: "GDS-15: Geriatrik Depresyon Ölçeği kısa form — 15 madde tarama aracı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/gds-15",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "GDS-15", yol: "/tools/gds-15" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Geriatri kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/lawton-iadl" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Lawton IADL
              </Link>
            </li>
            <li>
              <Link href="/tools/morse-fall" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Morse Düşme Riski
              </Link>
            </li>
            <li>
              <Link href="/tools/barthel" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Barthel ADL İndeksi
              </Link>
            </li>
            <li>
              <Link href="/tools/frail" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                FRAIL Skalası
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
