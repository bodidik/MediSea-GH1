// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Asit Sıvısı Analizi — SAAG, asit proteini ve PMN ile",
  description: "Asit Sıvısı Analizi: SAAG, asit proteini ve PMN ile asit nedeni ve SBP. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/asit-analizi" },
  openGraph: {
    type: "website",
    title: "Asit Sıvısı Analizi — SAAG, asit proteini ve PMN ile",
    description: "Asit Sıvısı Analizi: SAAG, asit proteini ve PMN ile asit nedeni ve SBP. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/asit-analizi",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Asit Sıvısı Analizi",
          aciklama: "Asit Sıvısı Analizi: SAAG, asit proteini ve PMN ile asit nedeni ve SBP. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/asit-analizi",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Asit Sıvısı Analizi", yol: "/tools/asit-analizi" },
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
              <Link href="/topics/gastroenteroloji/ascit-sivisi-analizi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Asit Sıvısı Analizi: Parasentez, SAAG ve Ayırıcı Tanı Parametreleri
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Hepatoloji & Gastroenteroloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/bisap" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                BISAP
              </Link>
            </li>
            <li>
              <Link href="/tools/child-pugh" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Child-Pugh Sınıflaması
              </Link>
            </li>
            <li>
              <Link href="/tools/fib-4" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                FIB-4 İndeksi
              </Link>
            </li>
            <li>
              <Link href="/tools/glasgow-blatchford" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Glasgow-Blatchford Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/harvey-bradshaw" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Harvey-Bradshaw İndeksi
              </Link>
            </li>
            <li>
              <Link href="/tools/lille" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Lille Skoru
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
