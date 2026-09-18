// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "MPN Tromboz Riski — Polisitemia vera (ELN) ve esansiyel",
  description: "MPN Tromboz Riski: Polisitemia vera (ELN) ve esansiyel trombositemi (revize IPSET) risk grupları. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/mpn-tromboz" },
  openGraph: {
    type: "website",
    title: "MPN Tromboz Riski — Polisitemia vera (ELN) ve esansiyel",
    description: "MPN Tromboz Riski: Polisitemia vera (ELN) ve esansiyel trombositemi (revize IPSET) risk grupları. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/mpn-tromboz",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "MPN Tromboz Riski",
          aciklama: "MPN Tromboz Riski: Polisitemia vera (ELN) ve esansiyel trombositemi (revize IPSET) risk grupları. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/mpn-tromboz",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "MPN Tromboz Riski", yol: "/tools/mpn-tromboz" },
        ])}
      />
      {children}

      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Hematoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/plasmic" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                PLASMIC Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/r-iss" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                R-ISS
              </Link>
            </li>
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
          </ul>
        </div>
      </nav>
    </>
  );
}
