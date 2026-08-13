// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Vücut Yüzey Alanı (BSA) — Mosteller formülü",
  description: "Vücut Yüzey Alanı (BSA): Mosteller formülü — kemoterapi dozlama. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/bsa" },
  openGraph: {
    type: "website",
    title: "Vücut Yüzey Alanı (BSA) — Mosteller formülü",
    description: "Vücut Yüzey Alanı (BSA): Mosteller formülü — kemoterapi dozlama. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/bsa",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Vücut Yüzey Alanı (BSA)",
          aciklama: "Vücut Yüzey Alanı (BSA): Mosteller formülü — kemoterapi dozlama. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/bsa",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Vücut Yüzey Alanı (BSA)", yol: "/tools/bsa" },
        ])}
      />
      {children}
    </>
  );
}
