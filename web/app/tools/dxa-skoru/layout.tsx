// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "DXA T ve Z Skoru Yorumu — DSÖ sınıflaması",
  description: "DXA T ve Z Skoru Yorumu: DSÖ sınıflaması — normal, osteopeni, osteoporoz; Z ≤ −2,0 yaşa göre düşük kemik kütlesi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/dxa-skoru" },
  manifest: "/manifest/arac/dxa-skoru",
  openGraph: {
    type: "website",
    title: "DXA T ve Z Skoru Yorumu — DSÖ sınıflaması",
    description: "DXA T ve Z Skoru Yorumu: DSÖ sınıflaması — normal, osteopeni, osteoporoz; Z ≤ −2,0 yaşa göre düşük kemik kütlesi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/dxa-skoru",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "DXA T ve Z Skoru Yorumu",
          aciklama: "DXA T ve Z Skoru Yorumu: DSÖ sınıflaması — normal, osteopeni, osteoporoz; Z ≤ −2,0 yaşa göre düşük kemik kütlesi. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/dxa-skoru",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "DXA T ve Z Skoru Yorumu", yol: "/tools/dxa-skoru" },
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
              <Link href="/tools/findrisc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                FINDRISC
              </Link>
            </li>
            <li>
              <Link href="/tools/genant-vertebra" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Genant Vertebral Kırık Derecesi
              </Link>
            </li>
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
          </ul>
        </div>
      </nav>
    </>
  );
}
