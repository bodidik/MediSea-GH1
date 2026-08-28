// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Lipid Emülsiyon (LAST) — Bolus, idame ve kümülatif tavan",
  description: "Lipid Emülsiyon (LAST): Bolus, idame ve kümülatif tavan — idame DAKİKA başına yazılı, pompaya girecek saatlik sayı ayrıca basılıyor. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/lipid-emulsiyon" },
  openGraph: {
    type: "website",
    title: "Lipid Emülsiyon (LAST) — Bolus, idame ve kümülatif tavan",
    description: "Lipid Emülsiyon (LAST): Bolus, idame ve kümülatif tavan — idame DAKİKA başına yazılı, pompaya girecek saatlik sayı ayrıca basılıyor. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/lipid-emulsiyon",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Lipid Emülsiyon (LAST)",
          aciklama: "Lipid Emülsiyon (LAST): Bolus, idame ve kümülatif tavan — idame DAKİKA başına yazılı, pompaya girecek saatlik sayı ayrıca basılıyor. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/lipid-emulsiyon",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Lipid Emülsiyon (LAST)", yol: "/tools/lipid-emulsiyon" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            İlaç İnfüzyonu & Doz Hesabı kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/magnezyum-infuzyon" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Magnezyum İnfüzyonu
              </Link>
            </li>
            <li>
              <Link href="/tools/nac-infuzyon" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                NAC İnfüzyonu
              </Link>
            </li>
            <li>
              <Link href="/tools/naloksan-infuzyon" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Naloksan İnfüzyonu
              </Link>
            </li>
            <li>
              <Link href="/tools/potasyum-replasman" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Potasyum Replasmanı
              </Link>
            </li>
            <li>
              <Link href="/tools/sedasyon-infuzyon" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Sedasyon & Analjezi İnfüzyonu
              </Link>
            </li>
            <li>
              <Link href="/tools/status-epileptikus" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Status Epileptikus
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
