// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "ECOG Performans Durumu — Fonksiyonel kapasite / tedavi",
  description: "ECOG Performans Durumu: Fonksiyonel kapasite / tedavi uygunluğu. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ecog" },
  openGraph: {
    type: "website",
    title: "ECOG Performans Durumu — Fonksiyonel kapasite / tedavi",
    description: "ECOG Performans Durumu: Fonksiyonel kapasite / tedavi uygunluğu. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ecog",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "ECOG Performans Durumu",
          aciklama: "ECOG Performans Durumu: Fonksiyonel kapasite / tedavi uygunluğu. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/ecog",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "ECOG Performans Durumu", yol: "/tools/ecog" },
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
              <Link href="/topics/onkoloji/khdak-tani-algoritma-evreleme" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Küçük Hücreli Dışı Akciğer Kanseri (KHDAK) Tanısal Algoritma, Evreleme ve Moleküler Patobiyoloji - Bölüm 2
              </Link>
            </li>
            <li>
              <Link href="/topics/journal-club/flaura2-osimertinib-kemoterapi-nejm" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                NEJM: FLAURA2 Faz 3 - EGFR-Mutant KHDAK'de Osimertinib ve Kemoterapi
              </Link>
            </li>
            <li>
              <Link href="/topics/palyatif/palyatif-bakim-ana-sayfa" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Palyatif Bakım: Kapsamlı Bir Genel Bakış
              </Link>
            </li>
            <li>
              <Link href="/topics/onkoloji/pankreas-kanseri-ileri-tedaviler" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Pankreas Duktal Adenokarsinomunda İleri Onkolojik Tedavi Protokolleri
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
            <li>
              <Link href="/tools/sins" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SINS Spinal İnstabilite Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/tumor-lizis" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Tümör Lizis Sendromu
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
