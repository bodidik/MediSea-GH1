// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";import Link from "next/link";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Roma Alevlenme Şiddeti — KOAH alevlenmesinde hafif",
  description: "Roma Alevlenme Şiddeti: KOAH alevlenmesinde hafif / orta / ağır — VAS, SS, nabız, SaO₂, CRP, kan gazı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/roma-alevlenme" },
  manifest: "/manifest/arac/roma-alevlenme",
  openGraph: {
    type: "website",
    title: "Roma Alevlenme Şiddeti — KOAH alevlenmesinde hafif",
    description: "Roma Alevlenme Şiddeti: KOAH alevlenmesinde hafif / orta / ağır — VAS, SS, nabız, SaO₂, CRP, kan gazı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/roma-alevlenme",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Roma Alevlenme Şiddeti",
          aciklama: "Roma Alevlenme Şiddeti: KOAH alevlenmesinde hafif / orta / ağır — VAS, SS, nabız, SaO₂, CRP, kan gazı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/roma-alevlenme",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Roma Alevlenme Şiddeti", yol: "/tools/roma-alevlenme" },
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
              <Link href="/topics/gogus/koah-akciger-koruyucu-ventilasyon" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Akciğer Koruyucu Ventilasyon Kriterleri (KOAH)
              </Link>
            </li>
            <li>
              <Link href="/topics/gogus/koah-asetazolamid" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                KOAH'ta Asetazolamid Tehlikesi
              </Link>
            </li>
            <li>
              <Link href="/topics/gogus/koah-cpet-ve-ebv" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                KOAH'ta CPET Parametreleri ve Endobronşiyal Valf Fizyolojisi
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
              <Link href="/tools/rox-indeksi" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ROX İndeksi
              </Link>
            </li>
            <li>
              <Link href="/tools/stop-bang" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                STOP-Bang
              </Link>
            </li>
            <li>
              <Link href="/tools/surucu-basinc" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Sürücü Basınç
              </Link>
            </li>
            <li>
              <Link href="/tools/ucus-pao2" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                Uçuşta PaO₂ Tahmini
              </Link>
            </li>
            <li>
              <Link href="/tools/act" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ACT
              </Link>
            </li>
            <li>
              <Link href="/tools/ado" className="block rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-bold text-slate-600 hover:border-blue-900/30 hover:text-blue-900 transition-colors">
                ADO İndeksi
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}
