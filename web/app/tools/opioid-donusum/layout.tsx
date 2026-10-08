// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Opioid Eşdeğer Doz — Günlük oral morfin eşdeğeri (OME)",
  description: "Opioid Eşdeğer Doz: Günlük oral morfin eşdeğeri (OME) ve opioid değişiminde hedef + kurtarma dozu. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/opioid-donusum" },
  manifest: "/manifest/arac/opioid-donusum",
  openGraph: {
    type: "website",
    title: "Opioid Eşdeğer Doz — Günlük oral morfin eşdeğeri (OME)",
    description: "Opioid Eşdeğer Doz: Günlük oral morfin eşdeğeri (OME) ve opioid değişiminde hedef + kurtarma dozu. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/opioid-donusum",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Opioid Eşdeğer Doz",
          aciklama: "Opioid Eşdeğer Doz: Günlük oral morfin eşdeğeri (OME) ve opioid değişiminde hedef + kurtarma dozu. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/opioid-donusum",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Opioid Eşdeğer Doz", yol: "/tools/opioid-donusum" },
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
              <Link href="/topics/onkoloji/opioid-rotasyonu-2025-konsensus" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Kanser Ağrısında Opioid Rotasyonu: 2025 Uluslararası Konsensüs
              </Link>
            </li>
            <li>
              <Link href="/topics/palyatif/opioid-rotasyonu-ilkeleri" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                İleri Okuma: Opioid Rotasyonu ve Eşdeğer Doz Hesaplamaları
              </Link>
            </li>
            <li>
              <Link href="/topics/onkoloji/kanser-agrisi-yonetimi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Kanser Ağrısı Yönetimi
              </Link>
            </li>
            <li>
              <Link href="/topics/palyatif/noropatik-agrida-koadjuvan-tedavi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Kanser Ağrısında Nöropatik Koadjuvan Tedavi
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Palyatif Bakım kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/painad" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                PAINAD
              </Link>
            </li>
            <li>
              <Link href="/tools/pps" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Palliative Performance Scale
              </Link>
            </li>
            <li>
              <Link href="/tools/ppi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Palyatif Prognostik İndeks (PPI)
              </Link>
            </li>
            <li>
              <Link href="/tools/pap-score" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                PaP Score
              </Link>
            </li>
            <li>
              <Link href="/tools/rdos" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                RDOS
              </Link>
            </li>
            <li>
              <Link href="/tools/spict" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SPICT
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
