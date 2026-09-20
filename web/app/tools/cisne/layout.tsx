// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "CISNE Skoru — Stabil febril nötropenide komplikasyon",
  description: "CISNE Skoru: Stabil febril nötropenide komplikasyon riski — 0–8, MASCC'i tamamlar. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/cisne" },
  openGraph: {
    type: "website",
    title: "CISNE Skoru — Stabil febril nötropenide komplikasyon",
    description: "CISNE Skoru: Stabil febril nötropenide komplikasyon riski — 0–8, MASCC'i tamamlar. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/cisne",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "CISNE Skoru",
          aciklama: "CISNE Skoru: Stabil febril nötropenide komplikasyon riski — 0–8, MASCC'i tamamlar. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/cisne",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "CISNE Skoru", yol: "/tools/cisne" },
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
              <Link href="/topics/onkoloji/febril-notropeni-cisne-indexi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CISNE Risk İndeksi ve Solid Tümörlerde Febril Nötropeni Yönetimi
              </Link>
            </li>
            <li>
              <Link href="/topics/onkoloji/febril-notropeni-konu" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Febril Nötropeni (FN) Tanı, Risk Stratifikasyonu ve Ampirik Yönetim Rehberi
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
            <li>
              <Link href="/tools/khorana" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Khorana Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/mascc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                MASCC Risk İndeksi
              </Link>
            </li>
            <li>
              <Link href="/tools/recist" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                RECIST 1.1 Yanıt Değerlendirmesi
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
