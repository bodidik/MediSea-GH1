// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "ARIA Rinit Sınıflaması — Allerjik rinit",
  description: "ARIA Rinit Sınıflaması: Allerjik rinit — intermitan/persistan × hafif/orta-ağır. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/aria-rinit" },
  openGraph: {
    type: "website",
    title: "ARIA Rinit Sınıflaması — Allerjik rinit",
    description: "ARIA Rinit Sınıflaması: Allerjik rinit — intermitan/persistan × hafif/orta-ağır. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/aria-rinit",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "ARIA Rinit Sınıflaması",
          aciklama: "ARIA Rinit Sınıflaması: Allerjik rinit — intermitan/persistan × hafif/orta-ağır. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/aria-rinit",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "ARIA Rinit Sınıflaması", yol: "/tools/aria-rinit" },
        ])}
      />
      {children}

      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Allerji & İmmünoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/deri-prick-testi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Deri Prick Testi
              </Link>
            </li>
            <li>
              <Link href="/tools/dlqi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                DLQI
              </Link>
            </li>
            <li>
              <Link href="/tools/eozinofil-sayisi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Mutlak Eozinofil Sayısı
              </Link>
            </li>
            <li>
              <Link href="/tools/scorad" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SCORAD
              </Link>
            </li>
            <li>
              <Link href="/tools/spesifik-ige" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Spesifik IgE Sınıfı
              </Link>
            </li>
            <li>
              <Link href="/tools/tnss" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                TNSS
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
