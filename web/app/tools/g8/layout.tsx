// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "G8 Tarama Aracı — Onkogeriatri taraması",
  description: "G8 Tarama Aracı: Onkogeriatri taraması — kapsamlı geriatrik değerlendirme gereksinimi (≤ 14). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/g8" },
  openGraph: {
    type: "website",
    title: "G8 Tarama Aracı — Onkogeriatri taraması",
    description: "G8 Tarama Aracı: Onkogeriatri taraması — kapsamlı geriatrik değerlendirme gereksinimi (≤ 14). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/g8",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "G8 Tarama Aracı",
          aciklama: "G8 Tarama Aracı: Onkogeriatri taraması — kapsamlı geriatrik değerlendirme gereksinimi (≤ 14). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/g8",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "G8 Tarama Aracı", yol: "/tools/g8" },
        ])}
      />
      {children}

      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Geriatri kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            <li>
              <Link href="/tools/isar" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ISAR
              </Link>
            </li>
            <li>
              <Link href="/tools/klinik-kirilganlik" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Klinik Kırılganlık Ölçeği (CFS)
              </Link>
            </li>
            <li>
              <Link href="/tools/lawton-iadl" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Lawton IADL
              </Link>
            </li>
            <li>
              <Link href="/tools/lee-indeksi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Lee Prognostik İndeksi
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
