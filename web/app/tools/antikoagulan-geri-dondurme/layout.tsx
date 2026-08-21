// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Antikoagülan Geri Döndürme — Protamin, 4F-PCC, K",
  description: "Antikoagülan Geri Döndürme: Protamin, 4F-PCC, K vitamini ve idarucizumab — üç ayrı dozlama mantığı: miktara, kiloya ve hiçbirine bağlı olmayan. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/antikoagulan-geri-dondurme" },
  openGraph: {
    type: "website",
    title: "Antikoagülan Geri Döndürme — Protamin, 4F-PCC, K",
    description: "Antikoagülan Geri Döndürme: Protamin, 4F-PCC, K vitamini ve idarucizumab — üç ayrı dozlama mantığı: miktara, kiloya ve hiçbirine bağlı olmayan. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/antikoagulan-geri-dondurme",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Antikoagülan Geri Döndürme",
          aciklama: "Antikoagülan Geri Döndürme: Protamin, 4F-PCC, K vitamini ve idarucizumab — üç ayrı dozlama mantığı: miktara, kiloya ve hiçbirine bağlı olmayan. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/antikoagulan-geri-dondurme",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Antikoagülan Geri Döndürme", yol: "/tools/antikoagulan-geri-dondurme" },
        ])}
      />
      {children}
    </>
  );
}
