// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "NAFLD Fibrozis Skoru — Yağlı karaciğerde ileri fibroz",
  description: "NAFLD Fibrozis Skoru: Yağlı karaciğerde ileri fibroz olasılığı — yaş, BKİ, glukoz, AST/ALT, trombosit, albümin. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/nafld-fibrozis" },
  openGraph: {
    type: "website",
    title: "NAFLD Fibrozis Skoru — Yağlı karaciğerde ileri fibroz",
    description: "NAFLD Fibrozis Skoru: Yağlı karaciğerde ileri fibroz olasılığı — yaş, BKİ, glukoz, AST/ALT, trombosit, albümin. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/nafld-fibrozis",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "NAFLD Fibrozis Skoru",
          aciklama: "NAFLD Fibrozis Skoru: Yağlı karaciğerde ileri fibroz olasılığı — yaş, BKİ, glukoz, AST/ALT, trombosit, albümin. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/nafld-fibrozis",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "NAFLD Fibrozis Skoru", yol: "/tools/nafld-fibrozis" },
        ])}
      />
      {children}

      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Hepatoloji & Gastroenteroloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/ranson" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Ranson Kriterleri
              </Link>
            </li>
            <li>
              <Link href="/tools/rockall" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Rockall Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/mayo-uc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Ülseratif Kolit Mayo Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/aims65" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                AIMS65
              </Link>
            </li>
            <li>
              <Link href="/tools/apri" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                APRI
              </Link>
            </li>
            <li>
              <Link href="/tools/asit-analizi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Asit Sıvısı Analizi
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
