// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "CURB-65 Skoru — Toplum kökenli pnömoni triyaj kararı",
  description: "CURB-65 Skoru: Toplum kökenli pnömoni triyaj kararı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/curb65" },
  openGraph: {
    type: "website",
    title: "CURB-65 Skoru — Toplum kökenli pnömoni triyaj kararı",
    description: "CURB-65 Skoru: Toplum kökenli pnömoni triyaj kararı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/curb65",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
