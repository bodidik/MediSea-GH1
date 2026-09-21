// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "SDAI — Basitleştirilmiş Hastalık Aktivite İndeksi",
  description: "SDAI: Basitleştirilmiş Hastalık Aktivite İndeksi — RA + CRP. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/sdai" },
  openGraph: {
    type: "website",
    title: "SDAI — Basitleştirilmiş Hastalık Aktivite İndeksi",
    description: "SDAI: Basitleştirilmiş Hastalık Aktivite İndeksi — RA + CRP. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/sdai",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "SDAI",
          aciklama: "SDAI: Basitleştirilmiş Hastalık Aktivite İndeksi — RA + CRP. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/sdai",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "SDAI", yol: "/tools/sdai" },
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
              <Link href="/topics/romatoloji/romatoid-artrit" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Romatoid Artrit (RA)
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Romatoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/sle" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SLEDAI-2K
              </Link>
            </li>
            <li>
              <Link href="/tools/yamaguchi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Yamaguchi Kriterleri
              </Link>
            </li>
            <li>
              <Link href="/tools/ra-2010" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ACR/EULAR 2010 RA Kriterleri
              </Link>
            </li>
            <li>
              <Link href="/tools/ssc-2013" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ACR/EULAR 2013 Sistemik Skleroz
              </Link>
            </li>
            <li>
              <Link href="/tools/sjogren-2016" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ACR/EULAR 2016 Sjögren Kriterleri
              </Link>
            </li>
            <li>
              <Link href="/tools/anca-vaskulit" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ACR/EULAR 2022 ANCA Vaskülitleri
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
