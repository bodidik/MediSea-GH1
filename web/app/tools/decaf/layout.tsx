// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "DECAF Skoru — KOAH alevlenmesiyle yatışta hastane içi",
  description: "DECAF Skoru: KOAH alevlenmesiyle yatışta hastane içi mortalite — 0–6. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/decaf" },
  manifest: "/manifest/arac/decaf",
  openGraph: {
    type: "website",
    title: "DECAF Skoru — KOAH alevlenmesiyle yatışta hastane içi",
    description: "DECAF Skoru: KOAH alevlenmesiyle yatışta hastane içi mortalite — 0–6. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/decaf",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "DECAF Skoru",
          aciklama: "DECAF Skoru: KOAH alevlenmesiyle yatışta hastane içi mortalite — 0–6. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/decaf",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "DECAF Skoru", yol: "/tools/decaf" },
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
              <Link href="/topics/gogus/koah-asetazolamid" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                KOAH'ta Asetazolamid Tehlikesi
              </Link>
            </li>
            <li>
              <Link href="/topics/gogus/koah-ucus-oksijen-hesaplama" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                KOAH'ta Uçuş İçi Oksijen İhtiyacının Hesaplanması
              </Link>
            </li>
            <li>
              <Link href="/topics/gogus/koah-yuksek-rakim-seyahat" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                KOAH ve Yüksek Rakım / Hava Yolculuğu
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
              <Link href="/tools/epworth" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Epworth Uykululuk Ölçeği
              </Link>
            </li>
            <li>
              <Link href="/tools/esc-pe-risk" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ESC 2019 PE Risk Sınıflaması
              </Link>
            </li>
            <li>
              <Link href="/tools/gap-ipf" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                GAP İndeksi
              </Link>
            </li>
            <li>
              <Link href="/tools/gold-koah" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                GOLD KOAH Sınıflaması
              </Link>
            </li>
            <li>
              <Link href="/tools/light-kriterleri" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Light Kriterleri
              </Link>
            </li>
            <li>
              <Link href="/tools/mmrc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                mMRC Dispne
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
