// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "SARC-F — Sarkopeni taraması",
  description: "SARC-F: Sarkopeni taraması — 5 madde, isteğe bağlı baldır çevresi (SARC-CalF). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/sarc-f" },
  openGraph: {
    type: "website",
    title: "SARC-F — Sarkopeni taraması",
    description: "SARC-F: Sarkopeni taraması — 5 madde, isteğe bağlı baldır çevresi (SARC-CalF). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/sarc-f",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "SARC-F",
          aciklama: "SARC-F: Sarkopeni taraması — 5 madde, isteğe bağlı baldır çevresi (SARC-CalF). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/sarc-f",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "SARC-F", yol: "/tools/sarc-f" },
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
              <Link href="/tools/sof-kirilganlik" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                SOF Kırılganlık İndeksi
              </Link>
            </li>
            <li>
              <Link href="/tools/tilburg-kirilganlik" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Tilburg Kırılganlık Göstergesi (TFI)
              </Link>
            </li>
            <li>
              <Link href="/tools/tinetti" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Tinetti POMA
              </Link>
            </li>
            <li>
              <Link href="/tools/ves-13" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                VES-13
              </Link>
            </li>
            <li>
              <Link href="/tools/4at" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                4AT
              </Link>
            </li>
            <li>
              <Link href="/tools/antikolinerjik-yuk" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Antikolinerjik Yük (ACB)
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
