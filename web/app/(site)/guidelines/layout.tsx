import type { Metadata } from "next";
import type { ReactNode } from "react";
import { rotaMeta } from "@/lib/site";

/**
 * Rehberler sayfası henüz yer tutucu ("Yakında...").
 *
 * İçeriksiz bir sayfanın dizine girmesi sitenin geneline zarar verir: arama
 * motoru için "ince içerik", kullanıcı için de sonuçta tıklayıp boş sayfa
 * bulmak demek. İçerik yazılana kadar dizine kapatılıyor; site haritasında
 * da yok. İçerik gelince buradaki robots satırını silmek yeterli.
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
    baslik: "Rehberler ve Kılavuzlar",
    aciklama:
      "Dahiliye kılavuzlarının derlendiği bölüm — hazırlanıyor.",
    yol: "/guidelines",
  }),
  robots: { index: false, follow: true },
};

export default function RehberlerDuzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
