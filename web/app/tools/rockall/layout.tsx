// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Rockall Skoru — Üst GİS kanaması",
  description: "Rockall Skoru: Üst GİS kanaması — yeniden kanama ve mortalite. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/rockall" },
  openGraph: {
    type: "website",
    title: "Rockall Skoru — Üst GİS kanaması",
    description: "Rockall Skoru: Üst GİS kanaması — yeniden kanama ve mortalite. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/rockall",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Rockall Skoru",
          aciklama: "Rockall Skoru: Üst GİS kanaması — yeniden kanama ve mortalite. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/rockall",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Rockall Skoru", yol: "/tools/rockall" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Hepatoloji & Gastroenteroloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/child-pugh" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Child-Pugh Sınıflaması
              </Link>
            </li>
            <li>
              <Link href="/tools/glasgow-blatchford" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Glasgow-Blatchford Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/meld-na" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                MELD-Na Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/ranson" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Ranson Kriterleri
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
