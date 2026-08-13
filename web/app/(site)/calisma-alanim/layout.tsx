import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Kullanıcının kendi not, vurgu ve tekrar birikimi.
 *
 * Sayfa bir istemci bileşeni ("use client") olduğu için metadata dışa
 * aktaramıyor; başlık bu düzenden geliyor.
 *
 * noindex: içerik kullanıcıya özel ve tarayıcı için boş görünüyor. Böyle
 * sayfaların dizine girmesi hem tarama bütçesini harcar hem de siteye
 * "ince içerik" olarak yazılır.
 */
export const metadata: Metadata = {
  title: "Çalışma Alanım",
  robots: { index: false, follow: true },
};

export default function CalismaAlanimDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
