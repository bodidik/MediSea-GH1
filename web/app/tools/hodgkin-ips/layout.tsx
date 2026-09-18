// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Hodgkin IPS — İleri evre Hodgkin lenfomada Hasenclever",
  description: "Hodgkin IPS: İleri evre Hodgkin lenfomada Hasenclever skoru — 5 yıllık progresyonsuz sağkalım. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/hodgkin-ips" },
  openGraph: {
    type: "website",
    title: "Hodgkin IPS — İleri evre Hodgkin lenfomada Hasenclever",
    description: "Hodgkin IPS: İleri evre Hodgkin lenfomada Hasenclever skoru — 5 yıllık progresyonsuz sağkalım. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/hodgkin-ips",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Hodgkin IPS",
          aciklama: "Hodgkin IPS: İleri evre Hodgkin lenfomada Hasenclever skoru — 5 yıllık progresyonsuz sağkalım. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/hodgkin-ips",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Hodgkin IPS", yol: "/tools/hodgkin-ips" },
        ])}
      />
      {children}

      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Hematoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/hscore" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HScore
              </Link>
            </li>
            <li>
              <Link href="/tools/improve-vte" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                IMPROVE-VTE
              </Link>
            </li>
            <li>
              <Link href="/tools/ipi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                IPI Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/ipss-r" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                IPSS-R
              </Link>
            </li>
            <li>
              <Link href="/tools/isth-dic" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ISTH DIC Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/kll-evreleme" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                KLL Evrelemesi (Rai · Binet)
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
