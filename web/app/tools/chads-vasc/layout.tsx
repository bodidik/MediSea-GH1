// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "CHA₂DS₂-VASc Skoru — AF'de inme riski hesaplama",
  description: "CHA₂DS₂-VASc Skoru: AF'de inme riski hesaplama. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/chads-vasc" },
  openGraph: {
    type: "website",
    title: "CHA₂DS₂-VASc Skoru — AF'de inme riski hesaplama",
    description: "CHA₂DS₂-VASc Skoru: AF'de inme riski hesaplama. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/chads-vasc",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
