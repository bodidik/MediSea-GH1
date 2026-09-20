// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "GAP İndeksi — İdiyopatik pulmoner fibrozda evre I–III",
  description: "GAP İndeksi: İdiyopatik pulmoner fibrozda evre I–III ve 1–3 yıllık mortalite. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/gap-ipf" },
  openGraph: {
    type: "website",
    title: "GAP İndeksi — İdiyopatik pulmoner fibrozda evre I–III",
    description: "GAP İndeksi: İdiyopatik pulmoner fibrozda evre I–III ve 1–3 yıllık mortalite. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/gap-ipf",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "GAP İndeksi",
          aciklama: "GAP İndeksi: İdiyopatik pulmoner fibrozda evre I–III ve 1–3 yıllık mortalite. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/gap-ipf",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "GAP İndeksi", yol: "/tools/gap-ipf" },
        ])}
      />
      {children}

      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Göğüs Hastalıkları & Enfeksiyon kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            <li>
              <Link href="/tools/pesi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                PESI ve sPESI
              </Link>
            </li>
            <li>
              <Link href="/tools/psi-port" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                PSI/PORT Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/rapid-plevral" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                RAPID Skoru
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
