// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Steroid Eşdeğer Doz — Kortikosteroid dönüşüm tablosu",
  description: "Steroid Eşdeğer Doz: Kortikosteroid dönüşüm tablosu. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/steroid-dose" },
  openGraph: {
    type: "website",
    title: "Steroid Eşdeğer Doz — Kortikosteroid dönüşüm tablosu",
    description: "Steroid Eşdeğer Doz: Kortikosteroid dönüşüm tablosu. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/steroid-dose",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
