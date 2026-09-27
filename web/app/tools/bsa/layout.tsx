// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Vücut Yüzey Alanı (BSA) — Mosteller formülü",
  description: "Vücut Yüzey Alanı (BSA): Mosteller formülü — kemoterapi dozlama. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/bsa" },
  manifest: "/manifest/arac/bsa",
  openGraph: {
    type: "website",
    title: "Vücut Yüzey Alanı (BSA) — Mosteller formülü",
    description: "Vücut Yüzey Alanı (BSA): Mosteller formülü — kemoterapi dozlama. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/bsa",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Vücut Yüzey Alanı (BSA)",
          aciklama: "Vücut Yüzey Alanı (BSA): Mosteller formülü — kemoterapi dozlama. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/bsa",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Vücut Yüzey Alanı (BSA)", yol: "/tools/bsa" },
        ])}
      />
      {children}
      <nav aria-label="Bu araçla ilgili konular" className="bg-slate-50 px-4 pb-6 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Bu araçla ilgili konular
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/topics/journal-club/flaura2-osimertinib-kemoterapi-nejm" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                NEJM: FLAURA2 Faz 3 - EGFR-Mutant KHDAK'de Osimertinib ve Kemoterapi
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Onkoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              <Link href="/tools/cisne" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CISNE Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/ctcae-laboratuvar" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CTCAE Laboratuvar Derecelendirme
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
