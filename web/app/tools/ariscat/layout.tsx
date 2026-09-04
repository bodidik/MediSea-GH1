// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "ARISCAT — Preoperatif pulmoner komplikasyon riski",
  description: "ARISCAT: Preoperatif pulmoner komplikasyon riski — 7 değişken, düzeltilebilir yük okuması. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ariscat" },
  openGraph: {
    type: "website",
    title: "ARISCAT — Preoperatif pulmoner komplikasyon riski",
    description: "ARISCAT: Preoperatif pulmoner komplikasyon riski — 7 değişken, düzeltilebilir yük okuması. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ariscat",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "ARISCAT",
          aciklama: "ARISCAT: Preoperatif pulmoner komplikasyon riski — 7 değişken, düzeltilebilir yük okuması. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/ariscat",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "ARISCAT", yol: "/tools/ariscat" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Göğüs Hastalıkları & Enfeksiyon kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/bap65" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                BAP-65
              </Link>
            </li>
            <li>
              <Link href="/tools/berlin-ards" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Berlin ARDS Kriterleri
              </Link>
            </li>
            <li>
              <Link href="/tools/bode" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                BODE İndeksi
              </Link>
            </li>
            <li>
              <Link href="/tools/cat-copd" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CAT Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/curb65" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CURB-65 Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/mmrc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                mMRC Dispne
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
