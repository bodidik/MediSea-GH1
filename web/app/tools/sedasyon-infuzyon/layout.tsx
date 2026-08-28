// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Sedasyon & Analjezi İnfüzyonu — Yedi ilaç",
  description: "Sedasyon & Analjezi İnfüzyonu: Yedi ilaç — doz tabanı ilaca göre değişir; remifentanil tek dakika tabanlı olan. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/sedasyon-infuzyon" },
  openGraph: {
    type: "website",
    title: "Sedasyon & Analjezi İnfüzyonu — Yedi ilaç",
    description: "Sedasyon & Analjezi İnfüzyonu: Yedi ilaç — doz tabanı ilaca göre değişir; remifentanil tek dakika tabanlı olan. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/sedasyon-infuzyon",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Sedasyon & Analjezi İnfüzyonu",
          aciklama: "Sedasyon & Analjezi İnfüzyonu: Yedi ilaç — doz tabanı ilaca göre değişir; remifentanil tek dakika tabanlı olan. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/sedasyon-infuzyon",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Sedasyon & Analjezi İnfüzyonu", yol: "/tools/sedasyon-infuzyon" },
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
              <Link href="/tools/status-epileptikus" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Status Epileptikus
              </Link>
            </li>
            <li>
              <Link href="/tools/tromboliz-doz" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Tromboliz Dozu (rt-PA)
              </Link>
            </li>
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
          </ul>
        </div>
      </nav>
    </>
  );
}
