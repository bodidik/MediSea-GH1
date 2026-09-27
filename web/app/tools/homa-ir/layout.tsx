// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "HOMA-IR — İnsülin direnci indeksi",
  description: "HOMA-IR: İnsülin direnci indeksi (açlık glukoz × insülin). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/homa-ir" },
  manifest: "/manifest/arac/homa-ir",
  openGraph: {
    type: "website",
    title: "HOMA-IR — İnsülin direnci indeksi",
    description: "HOMA-IR: İnsülin direnci indeksi (açlık glukoz × insülin). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/homa-ir",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "HOMA-IR",
          aciklama: "HOMA-IR: İnsülin direnci indeksi (açlık glukoz × insülin). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/homa-ir",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "HOMA-IR", yol: "/tools/homa-ir" },
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
              <Link href="/topics/endokrinoloji/polikistik-over-sendromu-pcos" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Polikistik Over Sendromu (PCOS)
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
              <Link href="/tools/cccr" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Kalsiyum/Kreatinin Klirens Oranı
              </Link>
            </li>
            <li>
              <Link href="/tools/makroprolaktin" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Makroprolaktin (PEG Geri Kazanımı)
              </Link>
            </li>
            <li>
              <Link href="/tools/metabolik-sendrom" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Metabolik Sendrom
              </Link>
            </li>
            <li>
              <Link href="/tools/steroid-dose" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Steroid Eşdeğer Doz
              </Link>
            </li>
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
          </ul>
        </div>
      </nav>
    </>
  );
}
