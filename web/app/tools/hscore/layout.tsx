// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "HScore — HLH olasılık skoru",
  description: "HScore: HLH olasılık skoru — 9 parametre, hemofagositik lenfohistiyositoz. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/hscore" },
  openGraph: {
    type: "website",
    title: "HScore — HLH olasılık skoru",
    description: "HScore: HLH olasılık skoru — 9 parametre, hemofagositik lenfohistiyositoz. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/hscore",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
