// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

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
  return <>{children}</>;
}
