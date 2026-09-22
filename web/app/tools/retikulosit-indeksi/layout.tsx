// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Retikülosit Üretim İndeksi — Anemide kemik iliği yanıtı",
  description: "Retikülosit Üretim İndeksi: Anemide kemik iliği yanıtı — hematokrit ve olgunlaşma düzeltmeli (RPI). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/retikulosit-indeksi" },
  openGraph: {
    type: "website",
    title: "Retikülosit Üretim İndeksi — Anemide kemik iliği yanıtı",
    description: "Retikülosit Üretim İndeksi: Anemide kemik iliği yanıtı — hematokrit ve olgunlaşma düzeltmeli (RPI). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/retikulosit-indeksi",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Retikülosit Üretim İndeksi",
          aciklama: "Retikülosit Üretim İndeksi: Anemide kemik iliği yanıtı — hematokrit ve olgunlaşma düzeltmeli (RPI). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/retikulosit-indeksi",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Retikülosit Üretim İndeksi", yol: "/tools/retikulosit-indeksi" },
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
              <Link href="/topics/hematoloji/anemiler" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Anemiler
              </Link>
            </li>
            <li>
              <Link href="/topics/hematoloji/hemolitik-anemiler-genel-bakis" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Hemolitik Anemiler
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Hematoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/revize-cenevre" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Revize Cenevre Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/trombosit-cci" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Trombosit Transfüzyonu CCI
              </Link>
            </li>
            <li>
              <Link href="/tools/vte-bleed" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                VTE-BLEED
              </Link>
            </li>
            <li>
              <Link href="/tools/who-kanama" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                WHO Kanama Ölçeği
              </Link>
            </li>
            <li>
              <Link href="/tools/ann-arbor-lugano" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Ann Arbor / Lugano Evrelemesi
              </Link>
            </li>
            <li>
              <Link href="/tools/cll-ipi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CLL-IPI
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
