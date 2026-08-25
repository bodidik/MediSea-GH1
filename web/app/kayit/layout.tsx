import type { Metadata } from "next";
import type { ReactNode } from "react";
import { rotaMeta } from "@/lib/site";

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
    baslik: "Kayıt",
    aciklama:
      "Ücretsiz MediSea hesabı oluştur; açık kütüphane ve çalışma araçları hemen kullanılabilir.",
    yol: "/kayit",
  }),
  robots: { index: false, follow: true },
};

/** `main` landmark'ı buradan geliyor — gerekçesi giriş düzeninde yazılı. */
export default function KayitDuzen({ children }: { children: ReactNode }) {
  return <main>{children}</main>;
}
