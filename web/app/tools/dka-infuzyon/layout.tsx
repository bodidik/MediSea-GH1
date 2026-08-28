// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "DKA Kurulumu — Diyabetik ketoasidozda sıvı, insülin ve",
  description: "DKA Kurulumu: Diyabetik ketoasidozda sıvı, insülin ve potasyum sıralaması — potasyum düşükse insülini bekletir. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/dka-infuzyon" },
  openGraph: {
    type: "website",
    title: "DKA Kurulumu — Diyabetik ketoasidozda sıvı, insülin ve",
    description: "DKA Kurulumu: Diyabetik ketoasidozda sıvı, insülin ve potasyum sıralaması — potasyum düşükse insülini bekletir. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/dka-infuzyon",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "DKA Kurulumu",
          aciklama: "DKA Kurulumu: Diyabetik ketoasidozda sıvı, insülin ve potasyum sıralaması — potasyum düşükse insülini bekletir. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/dka-infuzyon",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "DKA Kurulumu", yol: "/tools/dka-infuzyon" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            İlaç İnfüzyonu & Doz Hesabı kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/fomepizol" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Fomepizol Dozu
              </Link>
            </li>
            <li>
              <Link href="/tools/fosfat-replasman" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Fosfat Replasmanı
              </Link>
            </li>
            <li>
              <Link href="/tools/heparin-nomogram" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Heparin Nomogramı
              </Link>
            </li>
            <li>
              <Link href="/tools/hiperkalemi-tedavi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Hiperkalemi Tedavisi
              </Link>
            </li>
            <li>
              <Link href="/tools/infusion" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                İnfüzyon Hesaplama
              </Link>
            </li>
            <li>
              <Link href="/tools/kalsiyum-infuzyon" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Kalsiyum İnfüzyonu
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
