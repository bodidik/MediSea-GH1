// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Mutlak Eozinofil Sayısı — Lökosit × %",
  description: "Mutlak Eozinofil Sayısı: Lökosit × % — eozinofili şiddeti ve astımda tip 2 eşikleri (150/300). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/eozinofil-sayisi" },
  openGraph: {
    type: "website",
    title: "Mutlak Eozinofil Sayısı — Lökosit × %",
    description: "Mutlak Eozinofil Sayısı: Lökosit × % — eozinofili şiddeti ve astımda tip 2 eşikleri (150/300). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/eozinofil-sayisi",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Mutlak Eozinofil Sayısı",
          aciklama: "Mutlak Eozinofil Sayısı: Lökosit × % — eozinofili şiddeti ve astımda tip 2 eşikleri (150/300). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/eozinofil-sayisi",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Mutlak Eozinofil Sayısı", yol: "/tools/eozinofil-sayisi" },
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
              <Link href="/topics/hematoloji/kronik-eozinofilik-losemi-cel" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Kronik Eozinofilik Lösemi (CEL)
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Allerji & İmmünoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            <li>
              <Link href="/tools/uas7" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                UAS7
              </Link>
            </li>
            <li>
              <Link href="/tools/act" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ACT
              </Link>
            </li>
            <li>
              <Link href="/tools/anaphylaxis" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Anafilaksi Kriterleri
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
