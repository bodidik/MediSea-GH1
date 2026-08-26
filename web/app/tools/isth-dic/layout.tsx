// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "ISTH DIC Skoru — Yaygın damar içi pıhtılaşma",
  description: "ISTH DIC Skoru: Yaygın damar içi pıhtılaşma — açık DIC tanı algoritması (≥ 5 puan). Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/isth-dic" },
  openGraph: {
    type: "website",
    title: "ISTH DIC Skoru — Yaygın damar içi pıhtılaşma",
    description: "ISTH DIC Skoru: Yaygın damar içi pıhtılaşma — açık DIC tanı algoritması (≥ 5 puan). Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/isth-dic",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "ISTH DIC Skoru",
          aciklama: "ISTH DIC Skoru: Yaygın damar içi pıhtılaşma — açık DIC tanı algoritması (≥ 5 puan). Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/isth-dic",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "ISTH DIC Skoru", yol: "/tools/isth-dic" },
        ])}
      />
      {children}
    </>
  );
}
