// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "ASPECTS — Kontrastsız BT'de MCA alanı erken iskemi skoru",
  description: "ASPECTS: Kontrastsız BT'de MCA alanı erken iskemi skoru — 10 bölge, trombektomi değerlendirmesi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/aspects" },
  openGraph: {
    type: "website",
    title: "ASPECTS — Kontrastsız BT'de MCA alanı erken iskemi skoru",
    description: "ASPECTS: Kontrastsız BT'de MCA alanı erken iskemi skoru — 10 bölge, trombektomi değerlendirmesi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/aspects",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "ASPECTS",
          aciklama: "ASPECTS: Kontrastsız BT'de MCA alanı erken iskemi skoru — 10 bölge, trombektomi değerlendirmesi. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/aspects",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "ASPECTS", yol: "/tools/aspects" },
        ])}
      />
      {children}

      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Nöroloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/egris" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                EGRIS
              </Link>
            </li>
            <li>
              <Link href="/tools/fisher" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Fisher Skalası
              </Link>
            </li>
            <li>
              <Link href="/tools/four" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                FOUR Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/hachinski" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Hachinski İskemik Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/hunt-hess" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Hunt-Hess
              </Link>
            </li>
            <li>
              <Link href="/tools/rankin" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Modifiye Rankin (mRS)
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
