// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Metabolik Sendrom — NCEP ATP III ve IDF tanımları yan",
  description: "Metabolik Sendrom: NCEP ATP III ve IDF tanımları yan yana — bel çevresi, lipit, KB, glukoz. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/metabolik-sendrom" },
  openGraph: {
    type: "website",
    title: "Metabolik Sendrom — NCEP ATP III ve IDF tanımları yan",
    description: "Metabolik Sendrom: NCEP ATP III ve IDF tanımları yan yana — bel çevresi, lipit, KB, glukoz. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/metabolik-sendrom",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Metabolik Sendrom",
          aciklama: "Metabolik Sendrom: NCEP ATP III ve IDF tanımları yan yana — bel çevresi, lipit, KB, glukoz. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/metabolik-sendrom",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Metabolik Sendrom", yol: "/tools/metabolik-sendrom" },
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
              <Link href="/topics/gastroenteroloji/colyak-akdeniz-beslenme" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Çölyak Hastalığında Akdeniz Tipi Glutensiz Beslenme
              </Link>
            </li>
            <li>
              <Link href="/topics/endokrinoloji/subklinik-tiroid-hastaliklari" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Subklinik Tiroid Hastalıkları (Giriş Ünitesi)
              </Link>
            </li>
            <li>
              <Link href="/topics/kardiyoloji/statin-intolerans-ezetimibe" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Statin İntoleransı (SAMS) Yönetimi ve Non-Statin Lipid Düşürücü Ajanlar
              </Link>
            </li>
            <li>
              <Link href="/topics/klinik-nutrisyon/obezite" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Ch 329: Obezite ve Metabolik Sendrom
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Endokrinoloji & Metabolizma kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/steroid-dose" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Steroid Eşdeğer Doz
              </Link>
            </li>
            <li>
              <Link href="/tools/tirads" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ACR TI-RADS
              </Link>
            </li>
            <li>
              <Link href="/tools/adrenal-yikanma" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Adrenal Kitle BT Yıkanma Hesabı
              </Link>
            </li>
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
          </ul>
        </div>
      </nav>
    </>
  );
}
