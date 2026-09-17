// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Mehran Kontrast Nefropatisi Skoru — Koroner girişim",
  description: "Mehran Kontrast Nefropatisi Skoru: Koroner girişim sonrası kontrast ilişkili AKI ve diyaliz riski. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/mehran-kin" },
  openGraph: {
    type: "website",
    title: "Mehran Kontrast Nefropatisi Skoru — Koroner girişim",
    description: "Mehran Kontrast Nefropatisi Skoru: Koroner girişim sonrası kontrast ilişkili AKI ve diyaliz riski. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/mehran-kin",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Mehran Kontrast Nefropatisi Skoru",
          aciklama: "Mehran Kontrast Nefropatisi Skoru: Koroner girişim sonrası kontrast ilişkili AKI ve diyaliz riski. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/mehran-kin",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Mehran Kontrast Nefropatisi Skoru", yol: "/tools/mehran-kin" },
        ])}
      />
      {children}

      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Nefroloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/osmolal-gap" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Serum Osmolal Gap
              </Link>
            </li>
            <li>
              <Link href="/tools/egfr-sistatin" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Sistatin C ile eGFR
              </Link>
            </li>
            <li>
              <Link href="/tools/sodium" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Sodyum Yönetimi
              </Link>
            </li>
            <li>
              <Link href="/tools/spot-urine" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Spot İdrar Hesaplamaları
              </Link>
            </li>
            <li>
              <Link href="/tools/stone-skoru" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                STONE Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/tmp-gfr" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                TmP/GFR ve FEPO₄
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
