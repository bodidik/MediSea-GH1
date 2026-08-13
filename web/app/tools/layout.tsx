import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Klinik araçlar dizininin metadata'sı.
 *
 * app/tools/page.tsx bir istemci bileşeni ("use client") ve istemci
 * bileşenleri metadata dışa aktaramaz — bu yüzden araç dizini kök başlığını
 * devralıyor, kendi başlığı olmuyordu. "klinik hesaplayıcı" aramaları tam da
 * bu sayfanın karşılaması gereken trafik.
 *
 * Sayı elle yazılmıyor: araç klasörleri sayılıyor, liste büyüdükçe kendisi
 * güncelleniyor.
 */

function aracSayisi(): number {
  try {
    const kok = path.join(process.cwd(), "app", "tools");
    return fs
      .readdirSync(kok, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .filter((ad) => !["components", "lib", "data"].includes(ad))
      .filter((ad) => fs.existsSync(path.join(kok, ad, "page.tsx"))).length;
  } catch {
    return 0;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const n = aracSayisi();
  const aciklama = n
    ? `${n} klinik hesaplayıcı ve skor: eGFR, Wells, CHA₂DS₂-VASc, Child-Pugh ve daha fazlası. Ücretsiz, kayıt gerekmez.`
    : "Klinik hesaplayıcılar ve skorlar. Ücretsiz, kayıt gerekmez.";

  return {
    // default'a kuyruk eklenmez (kök şablonu zaten uyguluyor); template ise
    // araç sayfalarının kendi başlıklarının kuyruğunu koruyor.
    title: { default: "Klinik Hesaplayıcılar", template: "%s · MediSea" },
    description: aciklama,
    alternates: { canonical: "/tools" },
    openGraph: {
      type: "website",
      title: "Klinik Hesaplayıcılar — MediSea",
      description: aciklama,
      url: "/tools",
    },
  };
}

export default function AraclarDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
