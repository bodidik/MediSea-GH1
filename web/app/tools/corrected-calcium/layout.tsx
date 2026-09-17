// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Düzeltilmiş Kalsiyum — Albumin'e göre Ca+2 hesaplama",
  description: "Düzeltilmiş Kalsiyum: Albumin'e göre Ca+2 hesaplama. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/corrected-calcium" },
  openGraph: {
    type: "website",
    title: "Düzeltilmiş Kalsiyum — Albumin'e göre Ca+2 hesaplama",
    description: "Düzeltilmiş Kalsiyum: Albumin'e göre Ca+2 hesaplama. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/corrected-calcium",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Düzeltilmiş Kalsiyum",
          aciklama: "Düzeltilmiş Kalsiyum: Albumin'e göre Ca+2 hesaplama. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/corrected-calcium",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Düzeltilmiş Kalsiyum", yol: "/tools/corrected-calcium" },
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
              <Link href="/topics/endokrinoloji/kalsiyum-homeostazi-fizyoloji" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Kalsiyum Homeostazı: PTH ve Vitamin D Fizyolojisi
              </Link>
            </li>
            <li>
              <Link href="/topics/endokrinoloji/kalsiyum-metabolizmasi-ana" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Kalsiyum Homeostazı: PTH ve Vitamin D Fizyolojisi
              </Link>
            </li>
            <li>
              <Link href="/topics/endokrinoloji/men1-2025-kilavuz-degisimleri" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                MEN1: 2025 Kılavuz Değişimleri ve Yeni Paradigmalar
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Nefroloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/egfr" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                eGFR (CKD-EPI 2021)
              </Link>
            </li>
            <li>
              <Link href="/tools/serbest-su-klirensi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Elektrolitsiz Serbest Su Klirensi
              </Link>
            </li>
            <li>
              <Link href="/tools/fraksiyonel-atilim" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Fraksiyonel Magnezyum ve Ürik Asit Atılımı
              </Link>
            </li>
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
          </ul>
        </div>
      </nav>
    </>
  );
}
