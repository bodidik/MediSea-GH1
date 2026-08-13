// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "GNRI — Geriyatrik Nütrisyon Risk İndeksi",
  description: "GNRI: Geriyatrik Nütrisyon Risk İndeksi — albumin + ideal ağırlık. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/gnri" },
  openGraph: {
    type: "website",
    title: "GNRI — Geriyatrik Nütrisyon Risk İndeksi",
    description: "GNRI: Geriyatrik Nütrisyon Risk İndeksi — albumin + ideal ağırlık. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/gnri",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "GNRI",
          aciklama: "GNRI: Geriyatrik Nütrisyon Risk İndeksi — albumin + ideal ağırlık. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/gnri",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "GNRI", yol: "/tools/gnri" },
        ])}
      />
      {children}
    </>
  );
}
