// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Wells Skoru (PE) — Pulmoner emboli klinik olasılığı",
  description: "Wells Skoru (PE): Pulmoner emboli klinik olasılığı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/wells-pe" },
  openGraph: {
    type: "website",
    title: "Wells Skoru (PE) — Pulmoner emboli klinik olasılığı",
    description: "Wells Skoru (PE): Pulmoner emboli klinik olasılığı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/wells-pe",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Wells Skoru (PE)",
          aciklama: "Wells Skoru (PE): Pulmoner emboli klinik olasılığı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/wells-pe",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Wells Skoru (PE)", yol: "/tools/wells-pe" },
        ])}
      />
      {children}
    </>
  );
}
