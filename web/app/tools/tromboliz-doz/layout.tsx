// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Tromboliz Dozu (rt-PA) — İnmede kiloya göre + 90 mg",
  description: "Tromboliz Dozu (rt-PA): İnmede kiloya göre + 90 mg tavan, masif emboli de 100 mg sabit — aynı ilaç, farklı rejim. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/tromboliz-doz" },
  openGraph: {
    type: "website",
    title: "Tromboliz Dozu (rt-PA) — İnmede kiloya göre + 90 mg",
    description: "Tromboliz Dozu (rt-PA): İnmede kiloya göre + 90 mg tavan, masif emboli de 100 mg sabit — aynı ilaç, farklı rejim. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/tromboliz-doz",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Tromboliz Dozu (rt-PA)",
          aciklama: "Tromboliz Dozu (rt-PA): İnmede kiloya göre + 90 mg tavan, masif emboli de 100 mg sabit — aynı ilaç, farklı rejim. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/tromboliz-doz",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Tromboliz Dozu (rt-PA)", yol: "/tools/tromboliz-doz" },
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
              <Link href="/tools/vazoaktif-infuzyon" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Vazoaktif İnfüzyon
              </Link>
            </li>
            <li>
              <Link href="/tools/antikoagulan-geri-dondurme" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Antikoagülan Geri Döndürme
              </Link>
            </li>
            <li>
              <Link href="/tools/bikarbonat-infuzyon" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Bikarbonat Açığı
              </Link>
            </li>
            <li>
              <Link href="/tools/digoksin-toksisitesi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Digoksin Toksisitesi
              </Link>
            </li>
            <li>
              <Link href="/tools/dka-infuzyon" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                DKA Kurulumu
              </Link>
            </li>
            <li>
              <Link href="/tools/fomepizol" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Fomepizol Dozu
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
