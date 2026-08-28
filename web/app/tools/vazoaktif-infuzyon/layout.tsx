// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Vazoaktif İnfüzyon — Nitrogliserin, nitroprussid",
  description: "Vazoaktif İnfüzyon: Nitrogliserin, nitroprussid, noradrenalin ve 5 ajan daha — doz ile pompa hızı arasında çevrim, torba karışımı düzenlenebilir. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/vazoaktif-infuzyon" },
  openGraph: {
    type: "website",
    title: "Vazoaktif İnfüzyon — Nitrogliserin, nitroprussid",
    description: "Vazoaktif İnfüzyon: Nitrogliserin, nitroprussid, noradrenalin ve 5 ajan daha — doz ile pompa hızı arasında çevrim, torba karışımı düzenlenebilir. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/vazoaktif-infuzyon",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Vazoaktif İnfüzyon",
          aciklama: "Vazoaktif İnfüzyon: Nitrogliserin, nitroprussid, noradrenalin ve 5 ajan daha — doz ile pompa hızı arasında çevrim, torba karışımı düzenlenebilir. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/vazoaktif-infuzyon",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Vazoaktif İnfüzyon", yol: "/tools/vazoaktif-infuzyon" },
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
            <li>
              <Link href="/tools/fosfat-replasman" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Fosfat Replasmanı
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
