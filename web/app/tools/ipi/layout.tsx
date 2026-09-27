// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "IPI Skoru — Uluslararası Prognostik İndeks",
  description: "IPI Skoru: Uluslararası Prognostik İndeks — agresif NHL / DLBCL (0–5 puan, 5 yıllık OS). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ipi" },
  manifest: "/manifest/arac/ipi",
  openGraph: {
    type: "website",
    title: "IPI Skoru — Uluslararası Prognostik İndeks",
    description: "IPI Skoru: Uluslararası Prognostik İndeks — agresif NHL / DLBCL (0–5 puan, 5 yıllık OS). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ipi",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "IPI Skoru",
          aciklama: "IPI Skoru: Uluslararası Prognostik İndeks — agresif NHL / DLBCL (0–5 puan, 5 yıllık OS). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/ipi",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "IPI Skoru", yol: "/tools/ipi" },
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
              <Link href="/topics/hematoloji/dlbcl" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Diffüz Büyük B Hücreli Lenfoma (DLBCL)
              </Link>
            </li>
            <li>
              <Link href="/topics/hematoloji/nhl-genel" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Non-Hodgkin Lenfomalar (NHL)
              </Link>
            </li>
            <li>
              <Link href="/topics/hematoloji/periferik-t-hucreli-lenfomalar" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Periferik T-Hücreli Lenfomalar (PTCL)
              </Link>
            </li>
            <li>
              <Link href="/topics/hematoloji/lenfomalar" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Lenfomalar (Hodgkin ve NHL)
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Onkoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/khorana" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Khorana Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/mascc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                MASCC Risk İndeksi
              </Link>
            </li>
            <li>
              <Link href="/tools/recist" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                RECIST 1.1 Yanıt Değerlendirmesi
              </Link>
            </li>
            <li>
              <Link href="/tools/sins" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SINS Spinal İnstabilite Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/tumor-lizis" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Tümör Lizis Sendromu
              </Link>
            </li>
            <li>
              <Link href="/tools/bsa" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Vücut Yüzey Alanı (BSA)
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
