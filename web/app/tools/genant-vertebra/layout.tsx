// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Genant Vertebral Kırık Derecesi — Ön/orta/arka",
  description: "Genant Vertebral Kırık Derecesi: Ön/orta/arka yükseklik kaybından derece 0–3 ve kırık şekli. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/genant-vertebra" },
  manifest: "/manifest/arac/genant-vertebra",
  openGraph: {
    type: "website",
    title: "Genant Vertebral Kırık Derecesi — Ön/orta/arka",
    description: "Genant Vertebral Kırık Derecesi: Ön/orta/arka yükseklik kaybından derece 0–3 ve kırık şekli. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/genant-vertebra",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Genant Vertebral Kırık Derecesi",
          aciklama: "Genant Vertebral Kırık Derecesi: Ön/orta/arka yükseklik kaybından derece 0–3 ve kırık şekli. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/genant-vertebra",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Genant Vertebral Kırık Derecesi", yol: "/tools/genant-vertebra" },
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
              <Link href="/topics/endokrinoloji/erkek-osteoporozu-ana-sayfa" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Erkek Osteoporozu
              </Link>
            </li>
            <li>
              <Link href="/topics/endokrinoloji/erkek-osteoporozu-testosteron" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Erkek Osteoporozu: Seks Steroidleri Aksı
              </Link>
            </li>
            <li>
              <Link href="/topics/endokrinoloji/kbh-osteoporoz-ckd-mbd" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                KBH İlişkili Osteoporoz (CKD-MBD)
              </Link>
            </li>
            <li>
              <Link href="/topics/endokrinoloji/osteoporoz-ana-sayfa" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Osteoporoz ve Metabolik Kemik Hastalıkları
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Endokrinoloji & Metabolizma kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/graves-cas" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Graves Orbitopatisi CAS
              </Link>
            </li>
            <li>
              <Link href="/tools/hba1c-eag" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HbA1c → Ortalama Glukoz
              </Link>
            </li>
            <li>
              <Link href="/tools/homa-ir" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HOMA-IR
              </Link>
            </li>
            <li>
              <Link href="/tools/cccr" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Kalsiyum/Kreatinin Klirens Oranı
              </Link>
            </li>
            <li>
              <Link href="/tools/makroprolaktin" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Makroprolaktin (PEG Geri Kazanımı)
              </Link>
            </li>
            <li>
              <Link href="/tools/metabolik-sendrom" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Metabolik Sendrom
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
