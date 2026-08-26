// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Refeeding Sendromu Riski — NICE kriterleri",
  description: "Refeeding Sendromu Riski: NICE kriterleri — beslenme başlatmada hipofosfatemi riski. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/refeeding-risk" },
  openGraph: {
    type: "website",
    title: "Refeeding Sendromu Riski — NICE kriterleri",
    description: "Refeeding Sendromu Riski: NICE kriterleri — beslenme başlatmada hipofosfatemi riski. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/refeeding-risk",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Refeeding Sendromu Riski",
          aciklama: "Refeeding Sendromu Riski: NICE kriterleri — beslenme başlatmada hipofosfatemi riski. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/refeeding-risk",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Refeeding Sendromu Riski", yol: "/tools/refeeding-risk" },
        ])}
      />
      {children}
    </>
  );
}
