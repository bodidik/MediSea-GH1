// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Karnofsky (KPS) — 0–100 performans skalası",
  description: "Karnofsky (KPS): 0–100 performans skalası — fonksiyonel kapasite ve prognoz. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/karnofsky" },
  openGraph: {
    type: "website",
    title: "Karnofsky (KPS) — 0–100 performans skalası",
    description: "Karnofsky (KPS): 0–100 performans skalası — fonksiyonel kapasite ve prognoz. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/karnofsky",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Karnofsky (KPS)",
          aciklama: "Karnofsky (KPS): 0–100 performans skalası — fonksiyonel kapasite ve prognoz. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/karnofsky",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Karnofsky (KPS)", yol: "/tools/karnofsky" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Palyatif Bakım kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              <Link href="/tools/esas" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ESAS
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
