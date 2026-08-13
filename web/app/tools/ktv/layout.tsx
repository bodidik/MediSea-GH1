// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Kt/V — Daugirdas II — Hemodiyaliz yeterliliği · spKt/V",
  description: "Kt/V — Daugirdas II: Hemodiyaliz yeterliliği · spKt/V · eKt/V · URR. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/ktv" },
  openGraph: {
    type: "website",
    title: "Kt/V — Daugirdas II — Hemodiyaliz yeterliliği · spKt/V",
    description: "Kt/V — Daugirdas II: Hemodiyaliz yeterliliği · spKt/V · eKt/V · URR. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/ktv",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
