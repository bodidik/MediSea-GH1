// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "BMI & İdeal Vücut Ağırlığı — Vücut kitle indeksi",
  description: "BMI & İdeal Vücut Ağırlığı: Vücut kitle indeksi + Devine / Hamwi formülleri. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/bmi" },
  openGraph: {
    type: "website",
    title: "BMI & İdeal Vücut Ağırlığı — Vücut kitle indeksi",
    description: "BMI & İdeal Vücut Ağırlığı: Vücut kitle indeksi + Devine / Hamwi formülleri. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/bmi",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "BMI & İdeal Vücut Ağırlığı",
          aciklama: "BMI & İdeal Vücut Ağırlığı: Vücut kitle indeksi + Devine / Hamwi formülleri. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/bmi",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "BMI & İdeal Vücut Ağırlığı", yol: "/tools/bmi" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Endokrinoloji & Metabolizma kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/bmr" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                BMR & TDEE
              </Link>
            </li>
            <li>
              <Link href="/tools/corrected-calcium" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Düzeltilmiş Kalsiyum
              </Link>
            </li>
            <li>
              <Link href="/tools/corrected-sodium" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Düzeltilmiş Sodyum
              </Link>
            </li>
            <li>
              <Link href="/tools/findrisc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                FINDRISC
              </Link>
            </li>
            <li>
              <Link href="/tools/hba1c-eag" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HbA1c → Ortalama Glukoz
              </Link>
            </li>
            <li>
              <Link href="/tools/homa-ir" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HOMA-IR
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
