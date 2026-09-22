// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "R-ISS — Multipl miyelom revize uluslararası evreleme",
  description: "R-ISS: Multipl miyelom revize uluslararası evreleme — β2M, albümin, LDH, FISH. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/r-iss" },
  openGraph: {
    type: "website",
    title: "R-ISS — Multipl miyelom revize uluslararası evreleme",
    description: "R-ISS: Multipl miyelom revize uluslararası evreleme — β2M, albümin, LDH, FISH. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/r-iss",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "R-ISS",
          aciklama: "R-ISS: Multipl miyelom revize uluslararası evreleme — β2M, albümin, LDH, FISH. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/r-iss",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "R-ISS", yol: "/tools/r-iss" },
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
              <Link href="/topics/hematoloji/multiple-myelom" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Multipl Miyelom (MM)
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
              <Link href="/tools/retikulosit-indeksi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Retikülosit Üretim İndeksi
              </Link>
            </li>
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
              <Link href="/tools/4t-hit" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                4T Skoru — HIT
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
