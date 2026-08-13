// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "ACT — Astım Kontrol Testi",
  description: "ACT: Astım Kontrol Testi — 5 soru, kontrolsüz/iyi kontrol/tam kontrol. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/act" },
  openGraph: {
    type: "website",
    title: "ACT — Astım Kontrol Testi",
    description: "ACT: Astım Kontrol Testi — 5 soru, kontrolsüz/iyi kontrol/tam kontrol. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/act",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "ACT",
          aciklama: "ACT: Astım Kontrol Testi — 5 soru, kontrolsüz/iyi kontrol/tam kontrol. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/act",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "ACT", yol: "/tools/act" },
        ])}
      />
      {children}
    </>
  );
}
