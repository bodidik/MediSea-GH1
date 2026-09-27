// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Barthel ADL İndeksi — Günlük yaşam aktiviteleri",
  description: "Barthel ADL İndeksi: Günlük yaşam aktiviteleri — fonksiyonel bağımsızlık değerlendirmesi (0–100). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/barthel" },
  manifest: "/manifest/arac/barthel",
  openGraph: {
    type: "website",
    title: "Barthel ADL İndeksi — Günlük yaşam aktiviteleri",
    description: "Barthel ADL İndeksi: Günlük yaşam aktiviteleri — fonksiyonel bağımsızlık değerlendirmesi (0–100). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/barthel",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Barthel ADL İndeksi",
          aciklama: "Barthel ADL İndeksi: Günlük yaşam aktiviteleri — fonksiyonel bağımsızlık değerlendirmesi (0–100). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/barthel",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Barthel ADL İndeksi", yol: "/tools/barthel" },
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
              <Link href="/topics/hematoloji/aml-geriatrik-degerlendirme" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Yaşlı AML Hastalarında Kapsamlı Geriatrik Değerlendirme (KGD)
              </Link>
            </li>
            <li>
              <Link href="/topics/hematoloji/hct-ci-geriatrik-degerlendirme" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                HCT-CI ve Kapsamlı Geriatrik Değerlendirme: Allo-HCT'de Hasta Seçimi
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Geriatri kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/edmonton-kirilganlik" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Edmonton Kırılganlık Ölçeği (EFS)
              </Link>
            </li>
            <li>
              <Link href="/tools/frail" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                FRAIL Skalası
              </Link>
            </li>
            <li>
              <Link href="/tools/fried-fenotip" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Fried Kırılganlık Fenotipi
              </Link>
            </li>
            <li>
              <Link href="/tools/g8" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                G8 Tarama Aracı
              </Link>
            </li>
            <li>
              <Link href="/tools/gds-15" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                GDS-15
              </Link>
            </li>
            <li>
              <Link href="/tools/groningen-kirilganlik" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Groningen Kırılganlık Göstergesi (GFI)
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
