// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "BAP-65 — KOAH alevlenmesinde şiddet sınıflaması",
  description: "BAP-65: KOAH alevlenmesinde şiddet sınıflaması — sınıf I–V, solunumsal asidoz ayrıca okunuyor. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/bap65" },
  manifest: "/manifest/arac/bap65",
  openGraph: {
    type: "website",
    title: "BAP-65 — KOAH alevlenmesinde şiddet sınıflaması",
    description: "BAP-65: KOAH alevlenmesinde şiddet sınıflaması — sınıf I–V, solunumsal asidoz ayrıca okunuyor. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/bap65",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "BAP-65",
          aciklama: "BAP-65: KOAH alevlenmesinde şiddet sınıflaması — sınıf I–V, solunumsal asidoz ayrıca okunuyor. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/bap65",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "BAP-65", yol: "/tools/bap65" },
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
              <Link href="/topics/gogus/koah-ana" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Kronik Obstrüktif Akciğer Hastalığı (KOAH)
              </Link>
            </li>
            <li>
              <Link href="/topics/gogus/koah-akciger-koruyucu-ventilasyon" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Akciğer Koruyucu Ventilasyon Kriterleri (KOAH)
              </Link>
            </li>
            <li>
              <Link href="/topics/gogus/koah-asetazolamid" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                KOAH'ta Asetazolamid Tehlikesi
              </Link>
            </li>
            <li>
              <Link href="/topics/gogus/koah-cpet-ve-ebv" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                KOAH'ta CPET Parametreleri ve Endobronşiyal Valf Fizyolojisi
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
              <Link href="/tools/berlin-ards" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Berlin ARDS Kriterleri
              </Link>
            </li>
            <li>
              <Link href="/tools/bode" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                BODE İndeksi
              </Link>
            </li>
            <li>
              <Link href="/tools/capture-koah" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CAPTURE
              </Link>
            </li>
            <li>
              <Link href="/tools/cat-copd" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CAT Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/curb65" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CURB-65 Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/decaf" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                DECAF Skoru
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
