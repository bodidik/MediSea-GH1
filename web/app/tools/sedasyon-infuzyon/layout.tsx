// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
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
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Sedasyon & Analjezi İnfüzyonu", yol: "/tools/sedasyon-infuzyon" },
        ])}
      />
      {children}
    </>
  );
}
