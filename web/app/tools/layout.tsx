import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getToolCount } from "@/app/lib/topic-counts";

/**
 * Klinik araçlar dizininin metadata'sı.
 *
 * app/tools/page.tsx bir istemci bileşeni ("use client") ve istemci
 * bileşenleri metadata dışa aktaramaz — bu yüzden araç dizini kök başlığını
 * devralıyor, kendi başlığı olmuyordu. "klinik hesaplayıcı" aramaları tam da
 * bu sayfanın karşılaması gereken trafik.
 *
 * Sayı elle yazılmıyor ama app/tools klasöründen de sayılmıyor: sunucusuz
 * ortamda kaynak app/ dizini çalışma zamanında yok. Ortak sayaç
 * content/arac-index.json'u okuyor (bkz. getToolCount).
 */
export async function generateMetadata(): Promise<Metadata> {
  const n = getToolCount();
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

/**
 * `main` landmark'ı buradan geliyor.
 *
 * Araç sayfaları (site) route grubunun dışında ve AppShell almıyorlar; ölçümde
 * 115 sayfanın hepsinde `main` sayısı SIFIRDI. Landmark olmayan bir sayfada
 * ekran okuyucu "içeriğe git" diyemiyor, kullanıcı baştan sona gezinmek
 * zorunda kalıyor.
 *
 * Gezinme çubuğu (ToolTopNav) sayfaların içinde render edildiği için bu
 * main'in İÇİNDE kalıyor. İdeal yerleşim değil ama landmark'ın hiç
 * olmamasından iyi; atlama bağlantısı da zaten gezinmeyi aşacak şekilde
 * ToolTopNav'ın kendi içinde çözüldü.
 */
export default function AraclarDuzen({ children }: { children: ReactNode }) {
  return <main>{children}</main>;
}
