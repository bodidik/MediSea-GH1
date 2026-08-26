// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "APACHE II — Akut fizyoloji ve kronik sağlık",
  description: "APACHE II: Akut fizyoloji ve kronik sağlık değerlendirmesi — YBÜ mortalite tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/apache2" },
  openGraph: {
    type: "website",
    title: "APACHE II — Akut fizyoloji ve kronik sağlık",
    description: "APACHE II: Akut fizyoloji ve kronik sağlık değerlendirmesi — YBÜ mortalite tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/apache2",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "APACHE II",
          aciklama: "APACHE II: Akut fizyoloji ve kronik sağlık değerlendirmesi — YBÜ mortalite tahmini. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/apache2",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "APACHE II", yol: "/tools/apache2" },
        ])}
      />
      {children}
    </>
  );
}
