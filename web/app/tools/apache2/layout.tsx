// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "APACHE II — Akut fizyoloji ve kronik sağlık",
  description: "APACHE II: Akut fizyoloji ve kronik sağlık değerlendirmesi — YBÜ mortalite tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/apache2" },
  openGraph: {
    type: "website",
    title: "APACHE II — Akut fizyoloji ve kronik sağlık",
    description: "APACHE II: Akut fizyoloji ve kronik sağlık değerlendirmesi — YBÜ mortalite tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/apache2",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "APACHE II",
          aciklama: "APACHE II: Akut fizyoloji ve kronik sağlık değerlendirmesi — YBÜ mortalite tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/apache2",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "APACHE II", yol: "/tools/apache2" },
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
            <li>
              <Link href="/tools/rass" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                RASS
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
