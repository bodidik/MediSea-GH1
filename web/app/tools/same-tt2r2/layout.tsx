// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "SAMe-TT₂R₂ — AF'de varfarinle iyi INR kontrolü olasılığı",
  description: "SAMe-TT₂R₂: AF'de varfarinle iyi INR kontrolü olasılığı — VKA ya da DOAK seçimi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/same-tt2r2" },
  openGraph: {
    type: "website",
    title: "SAMe-TT₂R₂ — AF'de varfarinle iyi INR kontrolü olasılığı",
    description: "SAMe-TT₂R₂: AF'de varfarinle iyi INR kontrolü olasılığı — VKA ya da DOAK seçimi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/same-tt2r2",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "SAMe-TT₂R₂",
          aciklama: "SAMe-TT₂R₂: AF'de varfarinle iyi INR kontrolü olasılığı — VKA ya da DOAK seçimi. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/same-tt2r2",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "SAMe-TT₂R₂", yol: "/tools/same-tt2r2" },
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
            <li>
              <Link href="/tools/duke-kosu-bandi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Duke Koşu Bandı Skoru
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
