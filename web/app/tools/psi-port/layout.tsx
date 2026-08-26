// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "PSI/PORT Skoru — Pnömonide 30 günlük mortalite tahmini",
  description: "PSI/PORT Skoru: Pnömonide 30 günlük mortalite tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/psi-port" },
  openGraph: {
    type: "website",
    title: "PSI/PORT Skoru — Pnömonide 30 günlük mortalite tahmini",
    description: "PSI/PORT Skoru: Pnömonide 30 günlük mortalite tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/psi-port",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "PSI/PORT Skoru",
          aciklama: "PSI/PORT Skoru: Pnömonide 30 günlük mortalite tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/psi-port",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "PSI/PORT Skoru", yol: "/tools/psi-port" },
        ])}
      />
      {children}
    </>
  );
}
