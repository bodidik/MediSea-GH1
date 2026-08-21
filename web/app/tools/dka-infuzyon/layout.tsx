// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "DKA Kurulumu — Diyabetik ketoasidozda sıvı, insülin ve",
  description: "DKA Kurulumu: Diyabetik ketoasidozda sıvı, insülin ve potasyum sıralaması — potasyum düşükse insülini bekletir. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/dka-infuzyon" },
  openGraph: {
    type: "website",
    title: "DKA Kurulumu — Diyabetik ketoasidozda sıvı, insülin ve",
    description: "DKA Kurulumu: Diyabetik ketoasidozda sıvı, insülin ve potasyum sıralaması — potasyum düşükse insülini bekletir. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/dka-infuzyon",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "DKA Kurulumu",
          aciklama: "DKA Kurulumu: Diyabetik ketoasidozda sıvı, insülin ve potasyum sıralaması — potasyum düşükse insülini bekletir. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/dka-infuzyon",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "DKA Kurulumu", yol: "/tools/dka-infuzyon" },
        ])}
      />
      {children}
    </>
  );
}
