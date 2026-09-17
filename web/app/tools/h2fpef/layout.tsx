// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "H₂FPEF Skoru — Korunmuş EF'li kalp yetmezliği (HFpEF)",
  description: "H₂FPEF Skoru: Korunmuş EF'li kalp yetmezliği (HFpEF) olasılığı — 0–9. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/h2fpef" },
  openGraph: {
    type: "website",
    title: "H₂FPEF Skoru — Korunmuş EF'li kalp yetmezliği (HFpEF)",
    description: "H₂FPEF Skoru: Korunmuş EF'li kalp yetmezliği (HFpEF) olasılığı — 0–9. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/h2fpef",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "H₂FPEF Skoru",
          aciklama: "H₂FPEF Skoru: Korunmuş EF'li kalp yetmezliği (HFpEF) olasılığı — 0–9. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/h2fpef",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "H₂FPEF Skoru", yol: "/tools/h2fpef" },
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
              <Link href="/topics/kardiyoloji/kalp-yetmezligi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Kalp Yetersizliği: Kapsamlı Tanı ve Yönetim
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
              <Link href="/tools/has-bled" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HAS-BLED Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/killip" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Killip Sınıflaması
              </Link>
            </li>
            <li>
              <Link href="/tools/ldl-hesaplama" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                LDL Kolesterol Hesaplama
              </Link>
            </li>
            <li>
              <Link href="/tools/orbit" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ORBIT Kanama Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/qtc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                QTc Hesaplayıcı
              </Link>
            </li>
            <li>
              <Link href="/tools/same-tt2r2" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SAMe-TT₂R₂
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
