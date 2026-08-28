// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Birim Çevirici — Sık kullanılan laboratuvar birim",
  description: "Birim Çevirici: Sık kullanılan laboratuvar birim dönüşümleri. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/unit-converter" },
  openGraph: {
    type: "website",
    title: "Birim Çevirici — Sık kullanılan laboratuvar birim",
    description: "Birim Çevirici: Sık kullanılan laboratuvar birim dönüşümleri. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/unit-converter",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Birim Çevirici",
          aciklama: "Birim Çevirici: Sık kullanılan laboratuvar birim dönüşümleri. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/unit-converter",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Birim Çevirici", yol: "/tools/unit-converter" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Genel Araçlar kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/charlson" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Charlson Komorbidite İndeksi
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
