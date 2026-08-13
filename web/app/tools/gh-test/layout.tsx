// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Büyüme Hormonu Testleri — GH eksikliği stimülasyon",
  description: "Büyüme Hormonu Testleri: GH eksikliği stimülasyon (ITT/glukagon) & akromegali OGTT süpresyonu. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/gh-test" },
  openGraph: {
    type: "website",
    title: "Büyüme Hormonu Testleri — GH eksikliği stimülasyon",
    description: "Büyüme Hormonu Testleri: GH eksikliği stimülasyon (ITT/glukagon) & akromegali OGTT süpresyonu. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/gh-test",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
