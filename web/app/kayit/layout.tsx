import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Kayıt formu. Arama sonucunda çıkmasının bir değeri yok.
 *
 * Sayfa bir istemci bileşeni ("use client") olduğu için metadata dışa
 * aktaramıyor; başlık bu düzenden geliyor.
 *
 * noindex: içerik kullanıcıya özel ve tarayıcı için boş görünüyor. Böyle
 * sayfaların dizine girmesi hem tarama bütçesini harcar hem de siteye
 * "ince içerik" olarak yazılır.
 */
export const metadata: Metadata = {
  title: "Kayıt",
  robots: { index: false, follow: true },
};

/** `main` landmark'ı buradan geliyor — gerekçesi giriş düzeninde yazılı. */
export default function KayitDuzen({ children }: { children: ReactNode }) {
  return <main>{children}</main>;
}
