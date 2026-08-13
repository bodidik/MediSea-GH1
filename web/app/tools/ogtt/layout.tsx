// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "OGTT Yorumlama — T2DM/prediyabet, gestasyonel diyabet",
  description: "OGTT Yorumlama: T2DM/prediyabet, gestasyonel diyabet (GDM), akromegali GH süpresyonu. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ogtt" },
  openGraph: {
    type: "website",
    title: "OGTT Yorumlama — T2DM/prediyabet, gestasyonel diyabet",
    description: "OGTT Yorumlama: T2DM/prediyabet, gestasyonel diyabet (GDM), akromegali GH süpresyonu. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ogtt",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
