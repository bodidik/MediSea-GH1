// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Anyon Açığı — Metabolik asidoz ayırıcı tanısı",
  description: "Anyon Açığı: Metabolik asidoz ayırıcı tanısı (± albumin düzeltmesi). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/anion-gap" },
  openGraph: {
    type: "website",
    title: "Anyon Açığı — Metabolik asidoz ayırıcı tanısı",
    description: "Anyon Açığı: Metabolik asidoz ayırıcı tanısı (± albumin düzeltmesi). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/anion-gap",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Anyon Açığı",
          aciklama: "Anyon Açığı: Metabolik asidoz ayırıcı tanısı (± albumin düzeltmesi). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/anion-gap",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Anyon Açığı", yol: "/tools/anion-gap" },
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
              <Link href="/tools/abg" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Asit-Baz Analizi (ABG)
              </Link>
            </li>
            <li>
              <Link href="/tools/corrected-calcium" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Düzeltilmiş Kalsiyum
              </Link>
            </li>
            <li>
              <Link href="/tools/egfr" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                eGFR (CKD-EPI 2021)
              </Link>
            </li>
            <li>
              <Link href="/tools/kdigo-aki" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                KDIGO AKI Evrelemesi
              </Link>
            </li>
            <li>
              <Link href="/tools/ktv" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Kt/V — Daugirdas II
              </Link>
            </li>
            <li>
              <Link href="/tools/osmolal-gap" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Serum Osmolal Gap
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
