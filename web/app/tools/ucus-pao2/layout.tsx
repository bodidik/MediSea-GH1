// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Uçuşta PaO₂ Tahmini — Dillard denklemi",
  description: "Uçuşta PaO₂ Tahmini: Dillard denklemi — deniz seviyesi PaO₂ ve FEV1 ile 8000 ft kabinde beklenen PaO₂. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ucus-pao2" },
  manifest: "/manifest/arac/ucus-pao2",
  openGraph: {
    type: "website",
    title: "Uçuşta PaO₂ Tahmini — Dillard denklemi",
    description: "Uçuşta PaO₂ Tahmini: Dillard denklemi — deniz seviyesi PaO₂ ve FEV1 ile 8000 ft kabinde beklenen PaO₂. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ucus-pao2",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Uçuşta PaO₂ Tahmini",
          aciklama: "Uçuşta PaO₂ Tahmini: Dillard denklemi — deniz seviyesi PaO₂ ve FEV1 ile 8000 ft kabinde beklenen PaO₂. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/ucus-pao2",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Uçuşta PaO₂ Tahmini", yol: "/tools/ucus-pao2" },
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
              <Link href="/topics/gogus/koah-yuksek-rakim-seyahat" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                KOAH ve Yüksek Rakım / Hava Yolculuğu
              </Link>
            </li>
            <li>
              <Link href="/topics/gogus/koah-hast-testi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Uçuş Öncesi Hipoksi Simülasyon Testi (HAST)
              </Link>
            </li>
            <li>
              <Link href="/topics/gogus/koah-ucus-oksijen-hesaplama" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                KOAH'ta Uçuş İçi Oksijen İhtiyacının Hesaplanması
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Göğüs Hastalıkları & Enfeksiyon kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/otur-kalk-5" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                5 Kez Otur-Kalk Testi
              </Link>
            </li>
            <li>
              <Link href="/tools/act" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ACT
              </Link>
            </li>
            <li>
              <Link href="/tools/ado" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ADO İndeksi
              </Link>
            </li>
            <li>
              <Link href="/tools/anthonisen" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Anthonisen Kriterleri
              </Link>
            </li>
            <li>
              <Link href="/tools/ariscat" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ARISCAT
              </Link>
            </li>
            <li>
              <Link href="/tools/bap65" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                BAP-65
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
