// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Hiperkalemi Tedavisi — Kaydıran ile çıkaranı ayırır",
  description: "Hiperkalemi Tedavisi: Kaydıran ile çıkaranı ayırır — kalsiyum ve insülin potasyumu DÜŞÜRMEZ, etkileri bitince geri çıkar. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/hiperkalemi-tedavi" },
  openGraph: {
    type: "website",
    title: "Hiperkalemi Tedavisi — Kaydıran ile çıkaranı ayırır",
    description: "Hiperkalemi Tedavisi: Kaydıran ile çıkaranı ayırır — kalsiyum ve insülin potasyumu DÜŞÜRMEZ, etkileri bitince geri çıkar. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/hiperkalemi-tedavi",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Hiperkalemi Tedavisi",
          aciklama: "Hiperkalemi Tedavisi: Kaydıran ile çıkaranı ayırır — kalsiyum ve insülin potasyumu DÜŞÜRMEZ, etkileri bitince geri çıkar. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/hiperkalemi-tedavi",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Hiperkalemi Tedavisi", yol: "/tools/hiperkalemi-tedavi" },
        ])}
      />
      {children}
    </>
  );
}
