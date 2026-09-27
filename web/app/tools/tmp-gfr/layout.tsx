// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "TmP/GFR ve FEPO₄ — Fosfatın renal eşiği",
  description: "TmP/GFR ve FEPO₄: Fosfatın renal eşiği — hipofosfatemide renal kayıp ayrımı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/tmp-gfr" },
  manifest: "/manifest/arac/tmp-gfr",
  openGraph: {
    type: "website",
    title: "TmP/GFR ve FEPO₄ — Fosfatın renal eşiği",
    description: "TmP/GFR ve FEPO₄: Fosfatın renal eşiği — hipofosfatemide renal kayıp ayrımı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/tmp-gfr",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "TmP/GFR ve FEPO₄",
          aciklama: "TmP/GFR ve FEPO₄: Fosfatın renal eşiği — hipofosfatemide renal kayıp ayrımı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/tmp-gfr",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "TmP/GFR ve FEPO₄", yol: "/tools/tmp-gfr" },
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
              <Link href="/topics/nefroloji/bobrek-fosfor-homeostazi-fizyoloji" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Böbrekte Fosfor Homeostazı ve Transport Fizyolojisi
              </Link>
            </li>
            <li>
              <Link href="/topics/endokrinoloji/vitamin-d-bozukluklari" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Vitamin D Bozuklukları: Raşitizm ve Osteomalazi
              </Link>
            </li>
            <li>
              <Link href="/topics/nefroloji/FGF-23 vs PTH" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                FGF-23 ve PTH Arasındaki Moleküler Çapraz Konuşma (Crosstalk)
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Nefroloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/kreatinin-klirensi-24s" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                24 Saatlik Kreatinin Klirensi
              </Link>
            </li>
            <li>
              <Link href="/tools/anion-gap" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Anyon Açığı
              </Link>
            </li>
            <li>
              <Link href="/tools/abg" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Asit-Baz Analizi (ABG)
              </Link>
            </li>
            <li>
              <Link href="/tools/cockcroft-gault" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Cockcroft-Gault Kreatinin Klirensi
              </Link>
            </li>
            <li>
              <Link href="/tools/corrected-calcium" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Düzeltilmiş Kalsiyum
              </Link>
            </li>
            <li>
              <Link href="/tools/egfr" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                eGFR (CKD-EPI 2021)
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
