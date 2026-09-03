// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Modifiye Rankin (mRS) — İnme sonrası işlevsel sonuç",
  description: "Modifiye Rankin (mRS): İnme sonrası işlevsel sonuç — 0–6 derece, yapılandırılmış görüşme çapraz kontrolü. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/rankin" },
  openGraph: {
    type: "website",
    title: "Modifiye Rankin (mRS) — İnme sonrası işlevsel sonuç",
    description: "Modifiye Rankin (mRS): İnme sonrası işlevsel sonuç — 0–6 derece, yapılandırılmış görüşme çapraz kontrolü. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/rankin",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Modifiye Rankin (mRS)",
          aciklama: "Modifiye Rankin (mRS): İnme sonrası işlevsel sonuç — 0–6 derece, yapılandırılmış görüşme çapraz kontrolü. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/rankin",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Modifiye Rankin (mRS)", yol: "/tools/rankin" },
        ])}
      />
      {children}
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Nöroloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/nihss" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                NIHSS
              </Link>
            </li>
            <li>
              <Link href="/tools/abcd2" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ABCD² Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/fisher" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Fisher Skalası
              </Link>
            </li>
            <li>
              <Link href="/tools/four" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                FOUR Skoru
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
