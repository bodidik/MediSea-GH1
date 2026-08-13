// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "FINDRISC — Tip 2 diyabet 10 yıllık risk taraması",
  description: "FINDRISC: Tip 2 diyabet 10 yıllık risk taraması. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/findrisc" },
  openGraph: {
    type: "website",
    title: "FINDRISC — Tip 2 diyabet 10 yıllık risk taraması",
    description: "FINDRISC: Tip 2 diyabet 10 yıllık risk taraması. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/findrisc",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "FINDRISC",
          aciklama: "FINDRISC: Tip 2 diyabet 10 yıllık risk taraması. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/findrisc",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "FINDRISC", yol: "/tools/findrisc" },
        ])}
      />
      {children}
    </>
  );
}
