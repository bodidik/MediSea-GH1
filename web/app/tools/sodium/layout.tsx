// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Sodyum Yönetimi — TBW · Hiponatremi · Hipernatremi",
  description: "Sodyum Yönetimi: TBW · Hiponatremi · Hipernatremi düzeltme hızı ve hacim hesabı. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/sodium" },
  openGraph: {
    type: "website",
    title: "Sodyum Yönetimi — TBW · Hiponatremi · Hipernatremi",
    description: "Sodyum Yönetimi: TBW · Hiponatremi · Hipernatremi düzeltme hızı ve hacim hesabı. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/sodium",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Sodyum Yönetimi",
          aciklama: "Sodyum Yönetimi: TBW · Hiponatremi · Hipernatremi düzeltme hızı ve hacim hesabı. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/sodium",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Sodyum Yönetimi", yol: "/tools/sodium" },
        ])}
      />
      {children}
    </>
  );
}
