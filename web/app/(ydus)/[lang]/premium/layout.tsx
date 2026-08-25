// app/(ydus)/[lang]/premium/layout.tsx
import type { Metadata } from "next";

/**
 * Bu metadata `/tr/premium` (satış açılış sayfası) İÇİN.
 *
 * Sayfa `"use client"` olduğu için metadata'yı kendisi dışa aktaramıyor —
 * bir istemci bileşeninden `metadata` vermek çalışma zamanında 500 üretiyor
 * ve lint/typecheck/build üçü de bunu görmüyor (ölçüldü).
 *
 * ⚠ SIRALAMA ÖNEMLİYDİ. Bu layout `ydus/` altının TAMAMINI da sarıyor, yani
 * buraya konan canonical kendi metadata'sı OLMAYAN her alt sayfaya yayılır.
 * Bir önceki turda bu yüzden bilerek yapılmamıştı. Önce on ydus rotasının
 * onuna da kendi metadata'sı verildi; ancak ondan sonra burası güvenli hâle
 * geldi — alt sayfalar kendi değerleriyle EZİYOR.
 *
 * Neden önemli: `robots.ts` yalnızca `/premium` ve `/*​/premium/ydus/`
 * kalıplarını yasaklıyor, yani `/tr/premium` TARANABİLİR ve canonical'ı bir
 * dönem ana sayfayı gösteriyordu — "ben ana sayfanın kopyasıyım".
 *
 * `openGraph` BURADA TANIMLI ve olması gerekiyor. Bir dönem "kökteki dosya
 * tabanlı paylaşım görseli miras kalsın" diye bilerek yazılmamıştı; o inanç
 * ÖLÇÜMLE ÇÜRÜTÜLDÜ — `images` verilmediği sürece görsel mirası bozulmuyor
 * (`/tools/bmi` hem openGraph tanımlıyor hem kendi kartını alıyor). İnancın
 * bedeli şuydu: sekme başlığı düzelmiş ama PAYLAŞIM KARTI hâlâ ana sayfanın
 * başlığını ve adresini gösteriyordu — yani asıl paylaşılan yüzey yanlıştı.
 */
export const metadata: Metadata = {
  /**
   * `title` DÜZ DİZE OLARAK VERİLEMEZ — ölçüldü: öyle verilince kökün
   * `template: "%s · MediSea"` kuyruğu bu ağaç için DEVRE DIŞI kalıyor ve
   * alt sayfaların başlığı "YDUS Hazırlık — Dahiliye · MediSea" yerine
   * "YDUS Hazırlık — Dahiliye" oluyordu. Şablon burada yeniden veriliyor.
   */
  title: {
    default: "Premium — Dahiliye YDUS",
    template: "%s · MediSea",
  },
  description:
    "MediSea Premium: dahiliye uzmanlık sınavına yönelik konu anlatımları, " +
    "çözümlü sorular, klinik vakalar ve aralıklı tekrar kartları.",
  alternates: { canonical: "/tr/premium" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  // Eski "premium-wrapper" sınıfını ve gereksiz sargıları sildik.
  // Artık içerideki page.tsx dosyaları kendi arka planlarını ve tasarımlarını özgürce ekrana basabilecek.
  return <>{children}</>;
}
