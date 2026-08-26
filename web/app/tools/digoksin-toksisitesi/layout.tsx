// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Digoksin Toksisitesi — Fab flakon sayısı",
  description: "Digoksin Toksisitesi: Fab flakon sayısı — düzey, alınan miktar ve ampirik: üç ayrı formül; Fab sonrası düzey yorumlanamaz. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/digoksin-toksisitesi" },
  openGraph: {
    type: "website",
    title: "Digoksin Toksisitesi — Fab flakon sayısı",
    description: "Digoksin Toksisitesi: Fab flakon sayısı — düzey, alınan miktar ve ampirik: üç ayrı formül; Fab sonrası düzey yorumlanamaz. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/digoksin-toksisitesi",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Digoksin Toksisitesi",
          aciklama: "Digoksin Toksisitesi: Fab flakon sayısı — düzey, alınan miktar ve ampirik: üç ayrı formül; Fab sonrası düzey yorumlanamaz. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/digoksin-toksisitesi",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Digoksin Toksisitesi", yol: "/tools/digoksin-toksisitesi" },
        ])}
      />
      {children}
    </>
  );
}
