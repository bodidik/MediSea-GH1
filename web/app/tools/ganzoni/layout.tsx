// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Ganzoni Demir Açığı — Parenteral demir için toplam",
  description: "Ganzoni Demir Açığı: Parenteral demir için toplam demir açığı (mg) — Hb, kilo ve depo demiri. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ganzoni" },
  openGraph: {
    type: "website",
    title: "Ganzoni Demir Açığı — Parenteral demir için toplam",
    description: "Ganzoni Demir Açığı: Parenteral demir için toplam demir açığı (mg) — Hb, kilo ve depo demiri. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ganzoni",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Ganzoni Demir Açığı",
          aciklama: "Ganzoni Demir Açığı: Parenteral demir için toplam demir açığı (mg) — Hb, kilo ve depo demiri. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/ganzoni",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Ganzoni Demir Açığı", yol: "/tools/ganzoni" },
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
              <Link href="/tools/hep-skoru" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HEP Skoru — HIT
              </Link>
            </li>
            <li>
              <Link href="/tools/hodgkin-ips" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Hodgkin IPS
              </Link>
            </li>
            <li>
              <Link href="/tools/hscore" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HScore
              </Link>
            </li>
            <li>
              <Link href="/tools/improve-vte" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                IMPROVE-VTE
              </Link>
            </li>
            <li>
              <Link href="/tools/ipi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                IPI Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/ipss-r" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                IPSS-R
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
