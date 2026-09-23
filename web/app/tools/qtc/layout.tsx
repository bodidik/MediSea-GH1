// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "QTc Hesaplayıcı — Bazett, Fridericia, Framingham, Hodges",
  description: "QTc Hesaplayıcı: Bazett, Fridericia, Framingham, Hodges — cinsiyete göre uzun QT eşiği. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/qtc" },
  openGraph: {
    type: "website",
    title: "QTc Hesaplayıcı — Bazett, Fridericia, Framingham, Hodges",
    description: "QTc Hesaplayıcı: Bazett, Fridericia, Framingham, Hodges — cinsiyete göre uzun QT eşiği. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/qtc",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "QTc Hesaplayıcı",
          aciklama: "QTc Hesaplayıcı: Bazett, Fridericia, Framingham, Hodges — cinsiyete göre uzun QT eşiği. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/qtc",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "QTc Hesaplayıcı", yol: "/tools/qtc" },
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
              <Link href="/topics/endokrinoloji/cushing-sendromu-genetik-ve-inovasyonlar" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Cushing Sendromu: Genetik, Farmakoloji ve Tanıda Yenilikler
              </Link>
            </li>
            <li>
              <Link href="/topics/onkoloji/metadon-rotasyonu-ve-kardiyak-guvenlik" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Metadon Rotasyonu: 3 Gün Geçiş Yöntemi ve Kardiyak Güvenlik
              </Link>
            </li>
            <li>
              <Link href="/topics/hematoloji/gilteritinib-flt3-aml" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Gilteritinib: Relaps/Refrakter FLT3 Mutasyonlu AML Yönetimi
              </Link>
            </li>
            <li>
              <Link href="/topics/endokrinoloji/men1-hipokalemi-aritmojenik-sinerji" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                MEN1'de Hipokalemi ve Aritmojenik Sinerji: Potasyum 4.5–5.0 mmol/L Kuralı
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Kardiyoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/same-tt2r2" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SAMe-TT₂R₂
              </Link>
            </li>
            <li>
              <Link href="/tools/sgarbossa" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Sgarbossa Kriterleri
              </Link>
            </li>
            <li>
              <Link href="/tools/timi-stemi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                TIMI Risk Skoru (STEMI)
              </Link>
            </li>
            <li>
              <Link href="/tools/timi-ua" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                TIMI Skoru (UA/NSTEMI)
              </Link>
            </li>
            <li>
              <Link href="/tools/chads-vasc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CHA₂DS₂-VASc Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/crusade" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CRUSADE Kanama Skoru
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
