// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Ülseratif Kolit Mayo Skoru — Tam (endoskopili) ya da",
  description: "Ülseratif Kolit Mayo Skoru: Tam (endoskopili) ya da parsiyel Mayo — hastalık aktivitesi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/mayo-uc" },
  openGraph: {
    type: "website",
    title: "Ülseratif Kolit Mayo Skoru — Tam (endoskopili) ya da",
    description: "Ülseratif Kolit Mayo Skoru: Tam (endoskopili) ya da parsiyel Mayo — hastalık aktivitesi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/mayo-uc",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Ülseratif Kolit Mayo Skoru",
          aciklama: "Ülseratif Kolit Mayo Skoru: Tam (endoskopili) ya da parsiyel Mayo — hastalık aktivitesi. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/mayo-uc",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Ülseratif Kolit Mayo Skoru", yol: "/tools/mayo-uc" },
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
              <Link href="/tools/aims65" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                AIMS65
              </Link>
            </li>
            <li>
              <Link href="/tools/apri" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                APRI
              </Link>
            </li>
            <li>
              <Link href="/tools/asit-analizi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Asit Sıvısı Analizi
              </Link>
            </li>
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
          </ul>
        </div>
      </nav>
    </>
  );
}
