// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "ORBIT Kanama Skoru — AF'de antikoagülasyon altında",
  description: "ORBIT Kanama Skoru: AF'de antikoagülasyon altında majör kanama riski — 0–7. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/orbit" },
  manifest: "/manifest/arac/orbit",
  openGraph: {
    type: "website",
    title: "ORBIT Kanama Skoru — AF'de antikoagülasyon altında",
    description: "ORBIT Kanama Skoru: AF'de antikoagülasyon altında majör kanama riski — 0–7. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/orbit",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "ORBIT Kanama Skoru",
          aciklama: "ORBIT Kanama Skoru: AF'de antikoagülasyon altında majör kanama riski — 0–7. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/orbit",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "ORBIT Kanama Skoru", yol: "/tools/orbit" },
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
              <Link href="/topics/hematoloji/chase-less-skoru" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CHASE-LESS Skoru: İnme Sonrası Okült Atriyal Fibrilasyon Öngörü Modeli
              </Link>
            </li>
            <li>
              <Link href="/topics/kardiyoloji/aritmiler-af-vt-vf" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Aritmiler (Atriyal Fibrilasyon, VT/VF)
              </Link>
            </li>
            <li>
              <Link href="/topics/hematoloji/inme-sonrasi-gizli-af" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                İnme Sonrası Gizli Atriyal Fibrilasyon: Saptama ve Antikoagülasyon Yönetimi
              </Link>
            </li>
            <li>
              <Link href="/topics/kardiyoloji/aks-oac-antitrombotik-yonetim" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                AKS + Oral Antikoagülan: Üçlü Antitrombotik Tedavi Şeması
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
              <Link href="/tools/qtc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                QTc Hesaplayıcı
              </Link>
            </li>
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
          </ul>
        </div>
      </nav>
    </>
  );
}
