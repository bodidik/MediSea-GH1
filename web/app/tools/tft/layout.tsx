// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Tiroid Fonksiyon Testi (TFT) — TSH / FT4 / FT3 patern",
  description: "Tiroid Fonksiyon Testi (TFT): TSH / FT4 / FT3 patern tanıma — hipo, hiper, subklinik, santral. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/tft" },
  openGraph: {
    type: "website",
    title: "Tiroid Fonksiyon Testi (TFT) — TSH / FT4 / FT3 patern",
    description: "Tiroid Fonksiyon Testi (TFT): TSH / FT4 / FT3 patern tanıma — hipo, hiper, subklinik, santral. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/tft",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Tiroid Fonksiyon Testi (TFT)",
          aciklama: "Tiroid Fonksiyon Testi (TFT): TSH / FT4 / FT3 patern tanıma — hipo, hiper, subklinik, santral. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/tft",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Tiroid Fonksiyon Testi (TFT)", yol: "/tools/tft" },
        ])}
      />
      {children}
    </>
  );
}
