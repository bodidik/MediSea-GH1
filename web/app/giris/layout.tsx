import type { Metadata } from "next";
import type { ReactNode } from "react";
import { rotaMeta } from "@/lib/site";

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
/**
 * canonical KENDİNİ göstermek zorunda.
 *
 * ÖLÇÜLDÜ (canlıda): kendi canonical'ı olmayan bu sayfa kökün
 * `alternates: { canonical: "/" }` değerini miras alıyordu ve aynı anda
 * `noindex` taşıyordu. "noindex + BAŞKA bir sayfayı gösteren canonical"
 * bilinen bir çelişki sinyalidir: noindex, canonical hedefine taşınabilir —
 * burada hedef sitenin ANA SAYFASIYDI. Kendini gösteren canonical ile
 * noindex yalnızca bu sayfaya bakar.
 *
 * `openGraph` da BU SAYFAYA ait olmak zorunda. ÖLÇÜLDÜ: tanımlanmadığında
 * kökün `openGraph.title` değeri miras alınıyor ve sayfa hem `og:title` hem
 * `twitter:title` olarak ANA SAYFANIN başlığını gönderiyordu — yani
 * paylaşılan bağlantının kartı yanlış sayfayı anlatıyordu.
 */
export const metadata: Metadata = {
  ...rotaMeta({
    baslik: "Giriş",
    aciklama:
      "MediSea hesabına giriş yap; vurguların, notların ve tekrar programın seni bekliyor.",
    yol: "/giris",
  }),
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
