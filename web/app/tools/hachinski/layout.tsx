// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Hachinski İskemik Skoru — Vasküler ve dejeneratif",
  description: "Hachinski İskemik Skoru: Vasküler ve dejeneratif demans ayrımı — 13 madde, 0–18. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/hachinski" },
  openGraph: {
    type: "website",
    title: "Hachinski İskemik Skoru — Vasküler ve dejeneratif",
    description: "Hachinski İskemik Skoru: Vasküler ve dejeneratif demans ayrımı — 13 madde, 0–18. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/hachinski",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Hachinski İskemik Skoru",
          aciklama: "Hachinski İskemik Skoru: Vasküler ve dejeneratif demans ayrımı — 13 madde, 0–18. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/hachinski",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Hachinski İskemik Skoru", yol: "/tools/hachinski" },
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
              <Link href="/tools/hunt-hess" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Hunt-Hess
              </Link>
            </li>
            <li>
              <Link href="/tools/rankin" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Modifiye Rankin (mRS)
              </Link>
            </li>
            <li>
              <Link href="/tools/mrc-kas-gucu" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                MRC Toplam Kas Gücü
              </Link>
            </li>
            <li>
              <Link href="/tools/nihss" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                NIHSS
              </Link>
            </li>
            <li>
              <Link href="/tools/ottawa-sak" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Ottawa SAK Kuralı
              </Link>
            </li>
            <li>
              <Link href="/tools/rosier" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ROSIER
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
