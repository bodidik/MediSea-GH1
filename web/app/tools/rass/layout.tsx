// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "RASS — Richmond Ajitasyon–Sedasyon Skalası",
  description: "RASS: Richmond Ajitasyon–Sedasyon Skalası — −5/+4, sedasyon hedefi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/rass" },
  openGraph: {
    type: "website",
    title: "RASS — Richmond Ajitasyon–Sedasyon Skalası",
    description: "RASS: Richmond Ajitasyon–Sedasyon Skalası — −5/+4, sedasyon hedefi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/rass",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "RASS",
          aciklama: "RASS: Richmond Ajitasyon–Sedasyon Skalası — −5/+4, sedasyon hedefi. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/rass",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "RASS", yol: "/tools/rass" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Yoğun Bakım Ünitesi (YBÜ) kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/apache2" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                APACHE II
              </Link>
            </li>
            <li>
              <Link href="/tools/braden" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Braden Skalası
              </Link>
            </li>
            <li>
              <Link href="/tools/cam-icu" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CAM-ICU
              </Link>
            </li>
            <li>
              <Link href="/tools/murray" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Murray Skoru
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
