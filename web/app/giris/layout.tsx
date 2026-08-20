import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Giriş formu. Arama sonucunda çıkmasının bir değeri yok.
 *
 * Sayfa bir istemci bileşeni ("use client") olduğu için metadata dışa
 * aktaramıyor; başlık bu düzenden geliyor.
 *
 * noindex: içerik kullanıcıya özel ve tarayıcı için boş görünüyor. Böyle
 * sayfaların dizine girmesi hem tarama bütçesini harcar hem de siteye
 * "ince içerik" olarak yazılır.
 */
export const metadata: Metadata = {
  title: "Giriş",
  robots: { index: false, follow: true },
};

/**
 * `main` landmark'ı buradan geliyor.
 *
 * `app/giris` ve `app/kayit` `(site)` route grubunun DIŞINDA, yani AppShell
 * almıyorlar; ölçümde iki sayfada da `main` sayısı SIFIRDI. Aynı boşluk
 * araç sayfalarında da vardı ve orada `app/tools/layout.tsx` ile çözüldü.
 *
 * Üst menü ve alt bilgi bilerek eklenmiyor: giriş formu odaklanmış bir
 * yüzey, sayfada gezinilecek başka bir şey yok. Landmark'ın olmaması ise
 * ayrı bir sorun — ekran okuyucu "ana içeriğe git" diyemiyor.
 */
export default function GirisDuzen({ children }: { children: ReactNode }) {
  return <main>{children}</main>;
}
