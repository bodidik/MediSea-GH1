// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Anafilaksi Kriterleri — NIAID/FAAN 3 kriter",
  description: "Anafilaksi Kriterleri: NIAID/FAAN 3 kriter — epinefrin endikasyonu. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/anaphylaxis" },
  openGraph: {
    type: "website",
    title: "Anafilaksi Kriterleri — NIAID/FAAN 3 kriter",
    description: "Anafilaksi Kriterleri: NIAID/FAAN 3 kriter — epinefrin endikasyonu. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/anaphylaxis",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
