// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "SLEDAI-2K — Lupus hastalık aktivite indeksi",
  description: "SLEDAI-2K: Lupus hastalık aktivite indeksi — 24 tanımlayıcı, 0–105. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/sle" },
  openGraph: {
    type: "website",
    title: "SLEDAI-2K — Lupus hastalık aktivite indeksi",
    description: "SLEDAI-2K: Lupus hastalık aktivite indeksi — 24 tanımlayıcı, 0–105. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/sle",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "SLEDAI-2K",
          aciklama: "SLEDAI-2K: Lupus hastalık aktivite indeksi — 24 tanımlayıcı, 0–105. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/sle",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "SLEDAI-2K", yol: "/tools/sle" },
        ])}
      />
      {children}
    </>
  );
}
