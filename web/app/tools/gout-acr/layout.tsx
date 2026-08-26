// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Gut ACR 2015 — ACR/EULAR gut hastalığı sınıflama",
  description: "Gut ACR 2015: ACR/EULAR gut hastalığı sınıflama kriterleri — MSU + domain skoru. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/gout-acr" },
  openGraph: {
    type: "website",
    title: "Gut ACR 2015 — ACR/EULAR gut hastalığı sınıflama",
    description: "Gut ACR 2015: ACR/EULAR gut hastalığı sınıflama kriterleri — MSU + domain skoru. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/gout-acr",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Gut ACR 2015",
          aciklama: "Gut ACR 2015: ACR/EULAR gut hastalığı sınıflama kriterleri — MSU + domain skoru. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/gout-acr",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Gut ACR 2015", yol: "/tools/gout-acr" },
        ])}
      />
      {children}
    </>
  );
}
