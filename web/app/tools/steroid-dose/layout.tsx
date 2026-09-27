// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Steroid Eşdeğer Doz — Kortikosteroid dönüşüm tablosu",
  description: "Steroid Eşdeğer Doz: Kortikosteroid dönüşüm tablosu. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/steroid-dose" },
  openGraph: {
    type: "website",
    title: "Steroid Eşdeğer Doz — Kortikosteroid dönüşüm tablosu",
    description: "Steroid Eşdeğer Doz: Kortikosteroid dönüşüm tablosu. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/steroid-dose",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Steroid Eşdeğer Doz",
          aciklama: "Steroid Eşdeğer Doz: Kortikosteroid dönüşüm tablosu. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/steroid-dose",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Steroid Eşdeğer Doz", yol: "/tools/steroid-dose" },
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
              <Link href="/topics/endokrinoloji/addison" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Addison Hastalığı (Primer Adrenal Yetmezlik)
              </Link>
            </li>
            <li>
              <Link href="/topics/endokrinoloji/adrenal-yetmezlik" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Adrenal Yetmezlik (Addison ve Santral)
              </Link>
            </li>
            <li>
              <Link href="/topics/endokrinoloji/adrenal-yetmezlik-tani" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Adrenal Yetmezlik Tanısı
              </Link>
            </li>
            <li>
              <Link href="/topics/endokrinoloji/hipofiz-yetmezligi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Hipofiz Yetmezliği (Anterior Hipofiz Yetersizliği / Hipopitüitarizm) Klinik ve Akademik Rehberi
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
            <li>
              <Link href="/tools/bmr" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                BMR & TDEE
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
