// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "STONE Skoru — Yan ağrısında üreter taşı olasılığı",
  description: "STONE Skoru: Yan ağrısında üreter taşı olasılığı — 0–13. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/stone-skoru" },
  openGraph: {
    type: "website",
    title: "STONE Skoru — Yan ağrısında üreter taşı olasılığı",
    description: "STONE Skoru: Yan ağrısında üreter taşı olasılığı — 0–13. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/stone-skoru",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "STONE Skoru",
          aciklama: "STONE Skoru: Yan ağrısında üreter taşı olasılığı — 0–13. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/stone-skoru",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "STONE Skoru", yol: "/tools/stone-skoru" },
        ])}
      />
      {children}

      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Nefroloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/tmp-gfr" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                TmP/GFR ve FEPO₄
              </Link>
            </li>
            <li>
              <Link href="/tools/kreatinin-klirensi-24s" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                24 Saatlik Kreatinin Klirensi
              </Link>
            </li>
            <li>
              <Link href="/tools/anion-gap" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Anyon Açığı
              </Link>
            </li>
            <li>
              <Link href="/tools/abg" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Asit-Baz Analizi (ABG)
              </Link>
            </li>
            <li>
              <Link href="/tools/cockcroft-gault" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Cockcroft-Gault Kreatinin Klirensi
              </Link>
            </li>
            <li>
              <Link href="/tools/corrected-calcium" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Düzeltilmiş Kalsiyum
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
