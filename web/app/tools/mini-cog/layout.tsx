// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Mini-Cog — Bilişsel tarama",
  description: "Mini-Cog: Bilişsel tarama — üç kelime hatırlama + saat çizme (0–5). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/mini-cog" },
  openGraph: {
    type: "website",
    title: "Mini-Cog — Bilişsel tarama",
    description: "Mini-Cog: Bilişsel tarama — üç kelime hatırlama + saat çizme (0–5). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/mini-cog",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Mini-Cog",
          aciklama: "Mini-Cog: Bilişsel tarama — üç kelime hatırlama + saat çizme (0–5). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/mini-cog",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Mini-Cog", yol: "/tools/mini-cog" },
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
              <Link href="/topics/hematoloji/hct-ci-geriatrik-degerlendirme" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HCT-CI ve Kapsamlı Geriatrik Değerlendirme: Allo-HCT'de Hasta Seçimi
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Geriatri kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/morse-fall" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Morse Düşme Riski
              </Link>
            </li>
            <li>
              <Link href="/tools/prisma-7" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                PRISMA-7
              </Link>
            </li>
            <li>
              <Link href="/tools/sarc-f" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SARC-F
              </Link>
            </li>
            <li>
              <Link href="/tools/sof-kirilganlik" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SOF Kırılganlık İndeksi
              </Link>
            </li>
            <li>
              <Link href="/tools/tilburg-kirilganlik" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Tilburg Kırılganlık Göstergesi (TFI)
              </Link>
            </li>
            <li>
              <Link href="/tools/tinetti" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Tinetti POMA
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
