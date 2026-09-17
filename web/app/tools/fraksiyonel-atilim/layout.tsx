// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Fraksiyonel Magnezyum ve Ürik Asit Atılımı",
  description: "Fraksiyonel Magnezyum ve Ürik Asit Atılımı: FEMg (renal/böbrek dışı Mg kaybı) ve FEUA (hiponatremide SIADH). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/fraksiyonel-atilim" },
  openGraph: {
    type: "website",
    title: "Fraksiyonel Magnezyum ve Ürik Asit Atılımı",
    description: "Fraksiyonel Magnezyum ve Ürik Asit Atılımı: FEMg (renal/böbrek dışı Mg kaybı) ve FEUA (hiponatremide SIADH). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/fraksiyonel-atilim",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Fraksiyonel Magnezyum ve Ürik Asit Atılımı",
          aciklama: "Fraksiyonel Magnezyum ve Ürik Asit Atılımı: FEMg (renal/böbrek dışı Mg kaybı) ve FEUA (hiponatremide SIADH). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/fraksiyonel-atilim",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Fraksiyonel Magnezyum ve Ürik Asit Atılımı", yol: "/tools/fraksiyonel-atilim" },
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
              <Link href="/tools/hrs-aki" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Hepatorenal Sendrom (HRS-AKI)
              </Link>
            </li>
            <li>
              <Link href="/tools/hiponatremi-algoritma" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Hiponatremi Tanı Algoritması
              </Link>
            </li>
            <li>
              <Link href="/tools/kdigo-aki" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                KDIGO AKI Evrelemesi
              </Link>
            </li>
            <li>
              <Link href="/tools/kdigo-kbh" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                KDIGO KBH Sınıflaması
              </Link>
            </li>
            <li>
              <Link href="/tools/ktv" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Kt/V — Daugirdas II
              </Link>
            </li>
            <li>
              <Link href="/tools/mehran-kin" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Mehran Kontrast Nefropatisi Skoru
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
