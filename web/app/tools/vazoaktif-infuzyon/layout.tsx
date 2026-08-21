// Bu dosya betikle üretildi: scripts/arac-metadata.cjs
// Elle düzenleme — başlık ve açıklama app/tools/page.tsx içindeki
// TOOLS_DATABASE'ten türetilir, betiği yeniden çalıştırmak üzerine yazar.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { JsonLd, aracSemasi, kirintiSemasi } from "@/lib/jsonld";

export const metadata: Metadata = {
  title: "Vazoaktif İnfüzyon — Nitrogliserin, nitroprussid",
  description: "Vazoaktif İnfüzyon: Nitrogliserin, nitroprussid, noradrenalin ve 5 ajan daha — doz ile pompa hızı arasında çevrim, torba karışımı düzenlenebilir. Ücretsiz klinik hesaplayıcı — MediSea.",
  alternates: { canonical: "/tools/vazoaktif-infuzyon" },
  openGraph: {
    type: "website",
    title: "Vazoaktif İnfüzyon — Nitrogliserin, nitroprussid",
    description: "Vazoaktif İnfüzyon: Nitrogliserin, nitroprussid, noradrenalin ve 5 ajan daha — doz ile pompa hızı arasında çevrim, torba karışımı düzenlenebilir. Ücretsiz klinik hesaplayıcı — MediSea.",
    url: "/tools/vazoaktif-infuzyon",
  },
};

export default function AracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <JsonLd
        veri={aracSemasi({
          ad: "Vazoaktif İnfüzyon",
          aciklama: "Vazoaktif İnfüzyon: Nitrogliserin, nitroprussid, noradrenalin ve 5 ajan daha — doz ile pompa hızı arasında çevrim, torba karışımı düzenlenebilir. Ücretsiz klinik hesaplayıcı — MediSea.",
          yol: "/tools/vazoaktif-infuzyon",
        })}
      />
      <JsonLd
        veri={kirintiSemasi([
          { ad: "Klinik Araçlar", yol: "/tools" },
          { ad: "Vazoaktif İnfüzyon", yol: "/tools/vazoaktif-infuzyon" },
        ])}
      />
      {children}
    </>
  );
}
