// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Adrenal Kitle BT Yıkanma Hesabı — Kontrastsız HU",
  description: "Adrenal Kitle BT Yıkanma Hesabı: Kontrastsız HU, mutlak ve göreli kontrast yıkanması — adenom ayrımı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/adrenal-yikanma" },
  openGraph: {
    type: "website",
    title: "Adrenal Kitle BT Yıkanma Hesabı — Kontrastsız HU",
    description: "Adrenal Kitle BT Yıkanma Hesabı: Kontrastsız HU, mutlak ve göreli kontrast yıkanması — adenom ayrımı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/adrenal-yikanma",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Adrenal Kitle BT Yıkanma Hesabı",
          aciklama: "Adrenal Kitle BT Yıkanma Hesabı: Kontrastsız HU, mutlak ve göreli kontrast yıkanması — adenom ayrımı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/adrenal-yikanma",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Adrenal Kitle BT Yıkanma Hesabı", yol: "/tools/adrenal-yikanma" },
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
              <Link href="/tools/aldosteron-renin" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Aldosteron/Renin Oranı
              </Link>
            </li>
            <li>
              <Link href="/tools/bazal-bolus-insulin" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Bazal-Bolus İnsülin Başlangıcı
              </Link>
            </li>
            <li>
              <Link href="/tools/bmi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                BMI & İdeal Vücut Ağırlığı
              </Link>
            </li>
            <li>
              <Link href="/tools/bmr" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                BMR & TDEE
              </Link>
            </li>
            <li>
              <Link href="/tools/burch-wartofsky" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Burch-Wartofsky Skalası
              </Link>
            </li>
            <li>
              <Link href="/tools/diyabetik-ayak" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Diyabetik Ayak Enfeksiyonu (IWGDF/IDSA)
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
