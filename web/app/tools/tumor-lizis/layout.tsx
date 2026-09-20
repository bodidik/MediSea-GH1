// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Tümör Lizis Sendromu — Cairo-Bishop laboratuvar ve",
  description: "Tümör Lizis Sendromu: Cairo-Bishop laboratuvar ve klinik TLS tanımı — %25 değişim ölçütü dahil. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/tumor-lizis" },
  openGraph: {
    type: "website",
    title: "Tümör Lizis Sendromu — Cairo-Bishop laboratuvar ve",
    description: "Tümör Lizis Sendromu: Cairo-Bishop laboratuvar ve klinik TLS tanımı — %25 değişim ölçütü dahil. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/tumor-lizis",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Tümör Lizis Sendromu",
          aciklama: "Tümör Lizis Sendromu: Cairo-Bishop laboratuvar ve klinik TLS tanımı — %25 değişim ölçütü dahil. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/tumor-lizis",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Tümör Lizis Sendromu", yol: "/tools/tumor-lizis" },
        ])}
      />
      {children}
      <nav aria-label="Bu aracın geçtiği konular" className="bg-slate-50 px-4 pb-6 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Bu aracın geçtiği konular
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/topics/hematoloji/aml" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Akut Miyeloid Lösemi (AML)
              </Link>
            </li>
            <li>
              <Link href="/topics/onkoloji/tumor-lizis-sendromu-kapsamli" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Tümör Lizis Sendromu (TLS) Kapsamlı Çalışma Ünitesi (Güncellenmiş)
              </Link>
            </li>
            <li>
              <Link href="/topics/hematoloji/burkitt" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Burkitt Lenfoma
              </Link>
            </li>
            <li>
              <Link href="/topics/hematoloji/kll" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Kronik Lenfositik Lösemi (KLL)
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <nav aria-label="Aynı kategoriden araçlar" className="bg-slate-50 px-4 pb-10 font-sans">
        <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-sans mt-0 mb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Onkoloji kategorisinden
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <li>
              <Link href="/tools/bsa" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Vücut Yüzey Alanı (BSA)
              </Link>
            </li>
            <li>
              <Link href="/tools/anc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ANC Hesaplama
              </Link>
            </li>
            <li>
              <Link href="/tools/calvert" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Calvert Formülü
              </Link>
            </li>
            <li>
              <Link href="/tools/cisne" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CISNE Skoru
              </Link>
            </li>
            <li>
              <Link href="/tools/ctcae-laboratuvar" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                CTCAE Laboratuvar Derecelendirme
              </Link>
            </li>
            <li>
              <Link href="/tools/ecog" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ECOG Performans Durumu
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
