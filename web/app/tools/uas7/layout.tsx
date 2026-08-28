// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "UAS7 — Ürtikar Aktivite Skoru (7 gün)",
  description: "UAS7: Ürtikar Aktivite Skoru (7 gün) — 0–42, omalizumab eşiği. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/uas7" },
  openGraph: {
    type: "website",
    title: "UAS7 — Ürtikar Aktivite Skoru (7 gün)",
    description: "UAS7: Ürtikar Aktivite Skoru (7 gün) — 0–42, omalizumab eşiği. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/uas7",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "UAS7",
          aciklama: "UAS7: Ürtikar Aktivite Skoru (7 gün) — 0–42, omalizumab eşiği. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/uas7",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "UAS7", yol: "/tools/uas7" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Allerji & İmmünoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/anaphylaxis" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Anafilaksi Kriterleri
              </Link>
            </li>
            <li>
              <Link href="/tools/dlqi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                DLQI
              </Link>
            </li>
            <li>
              <Link href="/tools/scorad" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SCORAD
              </Link>
            </li>
            <li>
              <Link href="/tools/tnss" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                TNSS
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
