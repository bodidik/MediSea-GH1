// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "PNI — Prognostik Nütrisyon İndeksi",
  description: "PNI: Prognostik Nütrisyon İndeksi — albumin + lenfosit. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/pni" },
  openGraph: {
    type: "website",
    title: "PNI — Prognostik Nütrisyon İndeksi",
    description: "PNI: Prognostik Nütrisyon İndeksi — albumin + lenfosit. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/pni",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "PNI",
          aciklama: "PNI: Prognostik Nütrisyon İndeksi — albumin + lenfosit. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/pni",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "PNI", yol: "/tools/pni" },
        ])}
      />
      {children}
    </>
  );
}
