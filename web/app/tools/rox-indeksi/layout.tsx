// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "ROX İndeksi — Yüksek akımlı nazal oksijende entübasyon",
  description: "ROX İndeksi: Yüksek akımlı nazal oksijende entübasyon riski — 2/6/12. saat eşikleri. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/rox-indeksi" },
  openGraph: {
    type: "website",
    title: "ROX İndeksi — Yüksek akımlı nazal oksijende entübasyon",
    description: "ROX İndeksi: Yüksek akımlı nazal oksijende entübasyon riski — 2/6/12. saat eşikleri. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/rox-indeksi",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "ROX İndeksi",
          aciklama: "ROX İndeksi: Yüksek akımlı nazal oksijende entübasyon riski — 2/6/12. saat eşikleri. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/rox-indeksi",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "ROX İndeksi", yol: "/tools/rox-indeksi" },
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
              <Link href="/tools/stop-bang" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                STOP-Bang
              </Link>
            </li>
            <li>
              <Link href="/tools/act" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ACT
              </Link>
            </li>
            <li>
              <Link href="/tools/ariscat" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ARISCAT
              </Link>
            </li>
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
          </ul>
        </div>
      </nav>
    </>
  );
}
