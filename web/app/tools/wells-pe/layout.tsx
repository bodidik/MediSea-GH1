// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Wells Skoru (PE) — Pulmoner emboli klinik olasılığı",
  description: "Wells Skoru (PE): Pulmoner emboli klinik olasılığı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/wells-pe" },
  openGraph: {
    type: "website",
    title: "Wells Skoru (PE) — Pulmoner emboli klinik olasılığı",
    description: "Wells Skoru (PE): Pulmoner emboli klinik olasılığı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/wells-pe",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Wells Skoru (PE)",
          aciklama: "Wells Skoru (PE): Pulmoner emboli klinik olasılığı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/wells-pe",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Wells Skoru (PE)", yol: "/tools/wells-pe" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Acil & Kritik Bakım kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/4t-hit" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                4T Skoru — HIT
              </Link>
            </li>
            <li>
              <Link href="/tools/ciwa-ar" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CIWA-Ar
              </Link>
            </li>
            <li>
              <Link href="/tools/gcs" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Glasgow Koma Skalası
              </Link>
            </li>
            <li>
              <Link href="/tools/heart" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HEART Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/canadian-ct" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Kanada BT Kural
              </Link>
            </li>
            <li>
              <Link href="/tools/news2" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                NEWS2 Skoru
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
