// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Karnofsky (KPS) — 0–100 performans skalası",
  description: "Karnofsky (KPS): 0–100 performans skalası — fonksiyonel kapasite ve prognoz. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/karnofsky" },
  openGraph: {
    type: "website",
    title: "Karnofsky (KPS) — 0–100 performans skalası",
    description: "Karnofsky (KPS): 0–100 performans skalası — fonksiyonel kapasite ve prognoz. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/karnofsky",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Karnofsky (KPS)",
          aciklama: "Karnofsky (KPS): 0–100 performans skalası — fonksiyonel kapasite ve prognoz. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/karnofsky",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "MediSea", yol: "/" },
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Karnofsky (KPS)", yol: "/tools/karnofsky" },
        ])}
      />
      {children}
    </>
  );
}
