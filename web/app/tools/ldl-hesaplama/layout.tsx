// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "LDL Kolesterol Hesaplama — Friedewald ve Sampson (NIH)",
  description: "LDL Kolesterol Hesaplama: Friedewald ve Sampson (NIH) denklemleri, non-HDL ve ESC hedefleri. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ldl-hesaplama" },
  openGraph: {
    type: "website",
    title: "LDL Kolesterol Hesaplama — Friedewald ve Sampson (NIH)",
    description: "LDL Kolesterol Hesaplama: Friedewald ve Sampson (NIH) denklemleri, non-HDL ve ESC hedefleri. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ldl-hesaplama",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "LDL Kolesterol Hesaplama",
          aciklama: "LDL Kolesterol Hesaplama: Friedewald ve Sampson (NIH) denklemleri, non-HDL ve ESC hedefleri. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/ldl-hesaplama",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "LDL Kolesterol Hesaplama", yol: "/tools/ldl-hesaplama" },
        ])}
      />
      {children}

      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Kardiyoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          </ul>
        </div>
      </nav>
    </>
  );
}
