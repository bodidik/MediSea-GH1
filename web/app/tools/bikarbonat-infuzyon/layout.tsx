// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Bikarbonat Açığı — NaHCO₃ açık hesabı",
  description: "Bikarbonat Açığı: NaHCO₃ açık hesabı — ampul karşılığı ve izotonik infüzyon hacmi, dağılım katsayısı seçilebilir. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/bikarbonat-infuzyon" },
  openGraph: {
    type: "website",
    title: "Bikarbonat Açığı — NaHCO₃ açık hesabı",
    description: "Bikarbonat Açığı: NaHCO₃ açık hesabı — ampul karşılığı ve izotonik infüzyon hacmi, dağılım katsayısı seçilebilir. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/bikarbonat-infuzyon",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Bikarbonat Açığı",
          aciklama: "Bikarbonat Açığı: NaHCO₃ açık hesabı — ampul karşılığı ve izotonik infüzyon hacmi, dağılım katsayısı seçilebilir. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/bikarbonat-infuzyon",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Bikarbonat Açığı", yol: "/tools/bikarbonat-infuzyon" },
        ])}
      />
      {children}
    </>
  );
}
