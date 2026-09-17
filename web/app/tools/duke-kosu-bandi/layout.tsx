// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Duke Koşu Bandı Skoru — Egzersiz EKG testinde prognoz",
  description: "Duke Koşu Bandı Skoru: Egzersiz EKG testinde prognoz — süre, ST sapması, angina indeksi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/duke-kosu-bandi" },
  openGraph: {
    type: "website",
    title: "Duke Koşu Bandı Skoru — Egzersiz EKG testinde prognoz",
    description: "Duke Koşu Bandı Skoru: Egzersiz EKG testinde prognoz — süre, ST sapması, angina indeksi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/duke-kosu-bandi",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Duke Koşu Bandı Skoru",
          aciklama: "Duke Koşu Bandı Skoru: Egzersiz EKG testinde prognoz — süre, ST sapması, angina indeksi. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/duke-kosu-bandi",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Duke Koşu Bandı Skoru", yol: "/tools/duke-kosu-bandi" },
        ])}
      />
      {children}

      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Kardiyoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/endocarditis" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Duke Kriterleri
              </Link>
            </li>
            <li>
              <Link href="/tools/grace" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                GRACE Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/h2fpef" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                H₂FPEF Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/has-bled" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HAS-BLED Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/killip" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Killip Sınıflaması
              </Link>
            </li>
            <li>
              <Link href="/tools/ldl-hesaplama" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                LDL Kolesterol Hesaplama
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
