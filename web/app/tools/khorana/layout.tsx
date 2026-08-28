// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Khorana Skoru — Kemoterapi ilişkili VTE riski",
  description: "Khorana Skoru: Kemoterapi ilişkili VTE riski. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/khorana" },
  openGraph: {
    type: "website",
    title: "Khorana Skoru — Kemoterapi ilişkili VTE riski",
    description: "Khorana Skoru: Kemoterapi ilişkili VTE riski. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/khorana",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Khorana Skoru",
          aciklama: "Khorana Skoru: Kemoterapi ilişkili VTE riski. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/khorana",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Khorana Skoru", yol: "/tools/khorana" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Onkoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/mascc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                MASCC Risk İndeksi
              </Link>
            </li>
            <li>
              <Link href="/tools/bsa" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Vücut Yüzey Alanı (BSA)
              </Link>
            </li>
            <li>
              <Link href="/tools/anc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ANC Hesaplama
              </Link>
            </li>
            <li>
              <Link href="/tools/calvert" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Calvert Formülü
              </Link>
            </li>
            <li>
              <Link href="/tools/ecog" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ECOG Performans Durumu
              </Link>
            </li>
            <li>
              <Link href="/tools/ipi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                IPI Skoru
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
