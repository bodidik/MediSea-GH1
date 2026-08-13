// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "FRAIL Skalası — Kırılganlık (frailty) tarama",
  description: "FRAIL Skalası: Kırılganlık (frailty) tarama — Sağlıklı / Pre-kırılgan / Kırılgan. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/frail" },
  openGraph: {
    type: "website",
    title: "FRAIL Skalası — Kırılganlık (frailty) tarama",
    description: "FRAIL Skalası: Kırılganlık (frailty) tarama — Sağlıklı / Pre-kırılgan / Kırılgan. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/frail",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
