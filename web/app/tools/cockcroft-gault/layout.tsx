// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Cockcroft-Gault Kreatinin Klirensi — İlaç doz ayarı",
  description: "Cockcroft-Gault Kreatinin Klirensi: İlaç doz ayarı için CrCl — gerçek, ideal ve ayarlanmış ağırlıkla. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/cockcroft-gault" },
  manifest: "/manifest/arac/cockcroft-gault",
  openGraph: {
    type: "website",
    title: "Cockcroft-Gault Kreatinin Klirensi — İlaç doz ayarı",
    description: "Cockcroft-Gault Kreatinin Klirensi: İlaç doz ayarı için CrCl — gerçek, ideal ve ayarlanmış ağırlıkla. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/cockcroft-gault",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Cockcroft-Gault Kreatinin Klirensi",
          aciklama: "Cockcroft-Gault Kreatinin Klirensi: İlaç doz ayarı için CrCl — gerçek, ideal ve ayarlanmış ağırlıkla. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/cockcroft-gault",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Cockcroft-Gault Kreatinin Klirensi", yol: "/tools/cockcroft-gault" },
        ])}
      />
      {children}
      <nav aria-label="Bu araçla ilgili konular" className="bg-slate-50 px-4 pb-6 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Bu araçla ilgili konular
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/topics/enfeksiyon/glikopeptit-antibiyotikler" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Glikopeptit ve Lipoglikopeptit Antibiyotikler
              </Link>
            </li>
            <li>
              <Link href="/topics/hematoloji/doac-warfarin-patofizyolojik-karsilastirma" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Doğrudan Oral Antikoagülanlar (DOAC/NOAC) ve Warfarin’in Patofizyolojik, Farmakolojik ve Klinik Karşılaştırması
              </Link>
            </li>
            <li>
              <Link href="/topics/enfeksiyon/vanco-bobrek" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Vankomisin: Eliminasyon, Nefrotoksisite ve AUC Kılavuzluğunda Dozlama
              </Link>
            </li>
            <li>
              <Link href="/topics/hematoloji/vka-doac-karsilastirma" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Vitamin K Antagonistleri ve DOAC'ların Karşılaştırması ve Geçiş Protokolleri
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
          </ul>
        </div>
      </nav>
    </>
  );
}
