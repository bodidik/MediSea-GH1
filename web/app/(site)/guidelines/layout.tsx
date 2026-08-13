import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Rehberler sayfası henüz yer tutucu ("Yakında...").
 *
 * İçeriksiz bir sayfanın dizine girmesi sitenin geneline zarar verir: arama
 * motoru için "ince içerik", kullanıcı için de sonuçta tıklayıp boş sayfa
 * bulmak demek. İçerik yazılana kadar dizine kapatılıyor; site haritasında
 * da yok. İçerik gelince buradaki robots satırını silmek yeterli.
 */
export const metadata: Metadata = {
  title: "Rehberler ve Kılavuzlar",
  robots: { index: false, follow: true },
};

export default function RehberlerDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
