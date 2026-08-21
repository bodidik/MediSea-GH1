// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Status Epileptikus — Yükleme dozları ve HIZ sınırları",
  description: "Status Epileptikus: Yükleme dozları ve HIZ sınırları — fenitoin 50 mg/dk aşılırsa hipotansiyon ve aritmi. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/status-epileptikus" },
  openGraph: {
    type: "website",
    title: "Status Epileptikus — Yükleme dozları ve HIZ sınırları",
    description: "Status Epileptikus: Yükleme dozları ve HIZ sınırları — fenitoin 50 mg/dk aşılırsa hipotansiyon ve aritmi. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/status-epileptikus",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Status Epileptikus",
          aciklama: "Status Epileptikus: Yükleme dozları ve HIZ sınırları — fenitoin 50 mg/dk aşılırsa hipotansiyon ve aritmi. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/status-epileptikus",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Status Epileptikus", yol: "/tools/status-epileptikus" },
        ])}
      />
      {children}
    </>
  );
}
