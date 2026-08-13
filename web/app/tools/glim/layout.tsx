// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "GLIM Kriterleri — Küresel malnütrisyon tanı protokolü",
  description: "GLIM Kriterleri: Küresel malnütrisyon tanı protokolü. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/glim" },
  openGraph: {
    type: "website",
    title: "GLIM Kriterleri — Küresel malnütrisyon tanı protokolü",
    description: "GLIM Kriterleri: Küresel malnütrisyon tanı protokolü. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/glim",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
