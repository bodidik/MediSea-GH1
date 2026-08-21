// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Asit-Baz Analizi (ABG) — Mikst bozukluk ayrımı · pH",
  description: "Asit-Baz Analizi (ABG): Mikst bozukluk ayrımı · pH normalken bile gizli asidoz · kompansasyon · anyon açığı · delta-delta. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/abg" },
  openGraph: {
    type: "website",
    title: "Asit-Baz Analizi (ABG) — Mikst bozukluk ayrımı · pH",
    description: "Asit-Baz Analizi (ABG): Mikst bozukluk ayrımı · pH normalken bile gizli asidoz · kompansasyon · anyon açığı · delta-delta. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/abg",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Asit-Baz Analizi (ABG)",
          aciklama: "Asit-Baz Analizi (ABG): Mikst bozukluk ayrımı · pH normalken bile gizli asidoz · kompansasyon · anyon açığı · delta-delta. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/abg",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Asit-Baz Analizi (ABG)", yol: "/tools/abg" },
        ])}
      />
      {children}
    </>
  );
}
