// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Birim Çevirici — Sık kullanılan laboratuvar birim",
  description: "Birim Çevirici: Sık kullanılan laboratuvar birim dönüşümleri. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/unit-converter" },
  openGraph: {
    type: "website",
    title: "Birim Çevirici — Sık kullanılan laboratuvar birim",
    description: "Birim Çevirici: Sık kullanılan laboratuvar birim dönüşümleri. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/unit-converter",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
