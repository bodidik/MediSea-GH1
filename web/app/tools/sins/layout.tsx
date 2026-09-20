// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "SINS Spinal İnstabilite Skoru — Neoplastik omurga",
  description: "SINS Spinal İnstabilite Skoru: Neoplastik omurga tutulumunda mekanik instabilite — 0–18. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/sins" },
  openGraph: {
    type: "website",
    title: "SINS Spinal İnstabilite Skoru — Neoplastik omurga",
    description: "SINS Spinal İnstabilite Skoru: Neoplastik omurga tutulumunda mekanik instabilite — 0–18. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/sins",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "SINS Spinal İnstabilite Skoru",
          aciklama: "SINS Spinal İnstabilite Skoru: Neoplastik omurga tutulumunda mekanik instabilite — 0–18. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/sins",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "SINS Spinal İnstabilite Skoru", yol: "/tools/sins" },
        ])}
      />
      {children}

      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Onkoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/tumor-lizis" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Tümör Lizis Sendromu
              </Link>
            </li>
            <li>
              <Link href="/tools/bsa" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Vücut Yüzey Alanı (BSA)
              </Link>
            </li>
            <li>
              <Link href="/tools/anc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ANC Hesaplama
              </Link>
            </li>
            <li>
              <Link href="/tools/calvert" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Calvert Formülü
              </Link>
            </li>
            <li>
              <Link href="/tools/cisne" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CISNE Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/ctcae-laboratuvar" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CTCAE Laboratuvar Derecelendirme
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
