// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "CONUT — Controlling Nutritional Status",
  description: "CONUT: Controlling Nutritional Status — albumin + kolesterol + lenfosit. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/conut" },
  openGraph: {
    type: "website",
    title: "CONUT — Controlling Nutritional Status",
    description: "CONUT: Controlling Nutritional Status — albumin + kolesterol + lenfosit. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/conut",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "CONUT",
          aciklama: "CONUT: Controlling Nutritional Status — albumin + kolesterol + lenfosit. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/conut",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "CONUT", yol: "/tools/conut" },
        ])}
      />
      {children}
    </>
  );
}
