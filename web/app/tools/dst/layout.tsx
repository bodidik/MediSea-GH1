// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Deksametazon Süpresyon Testi (DST) — 1 mg / 2 mg LDDST",
  description: "Deksametazon Süpresyon Testi (DST): 1 mg / 2 mg LDDST / 8 mg HDDST — Cushing tarama & lokalizasyon. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/dst" },
  openGraph: {
    type: "website",
    title: "Deksametazon Süpresyon Testi (DST) — 1 mg / 2 mg LDDST",
    description: "Deksametazon Süpresyon Testi (DST): 1 mg / 2 mg LDDST / 8 mg HDDST — Cushing tarama & lokalizasyon. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/dst",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Deksametazon Süpresyon Testi (DST)",
          aciklama: "Deksametazon Süpresyon Testi (DST): 1 mg / 2 mg LDDST / 8 mg HDDST — Cushing tarama & lokalizasyon. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/dst",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Deksametazon Süpresyon Testi (DST)", yol: "/tools/dst" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Endokrin Testler kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/ogtt" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                OGTT Yorumlama
              </Link>
            </li>
            <li>
              <Link href="/tools/tft" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Tiroid Fonksiyon Testi (TFT)
              </Link>
            </li>
            <li>
              <Link href="/tools/acth-stim" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ACTH Stimülasyon Testi
              </Link>
            </li>
            <li>
              <Link href="/tools/gh-test" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Büyüme Hormonu Testleri
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
