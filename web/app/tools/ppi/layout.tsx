// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Palyatif Prognostik İndeks (PPI) — Terminal kanserde",
  description: "Palyatif Prognostik İndeks (PPI): Terminal kanserde hayatta kalma tahmini (<3 / <6 hafta). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ppi" },
  openGraph: {
    type: "website",
    title: "Palyatif Prognostik İndeks (PPI) — Terminal kanserde",
    description: "Palyatif Prognostik İndeks (PPI): Terminal kanserde hayatta kalma tahmini (<3 / <6 hafta). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ppi",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Palyatif Prognostik İndeks (PPI)",
          aciklama: "Palyatif Prognostik İndeks (PPI): Terminal kanserde hayatta kalma tahmini (<3 / <6 hafta). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/ppi",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Palyatif Prognostik İndeks (PPI)", yol: "/tools/ppi" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Palyatif Bakım kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/pap-score" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                PaP Score
              </Link>
            </li>
            <li>
              <Link href="/tools/esas" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ESAS
              </Link>
            </li>
            <li>
              <Link href="/tools/karnofsky" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Karnofsky (KPS)
              </Link>
            </li>
            <li>
              <Link href="/tools/pps" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Palliative Performance Scale
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
