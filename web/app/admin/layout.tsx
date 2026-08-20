import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Yönetim sayfaları `(site)` route grubunun DIŞINDA ve AppShell almıyorlar —
 * yani üst menü, alt bilgi ve `<main>` landmark'ının hiçbirini.
 *
 * Ölçüldü (üretim derlemesinin çıktısında, 568 önceden üretilmiş sayfa
 * tarandı): sekiz yönetim sayfasının HEPSİNDE `main` sayısı sıfırdı.
 * Landmark olmayan bir sayfada ekran okuyucu "içeriğe git" diyemiyor.
 *
 * Aynı boşluk daha önce araç sayfalarında (115 sayfa) ve kök dizindeki
 * giris/kayit/profile sayfalarında ölçülüp kapatılmıştı; yönetim tarafı
 * o turlarda taranmamıştı.
 *
 * Üst menü ve alt bilgi bilerek verilmiyor: bunlar odaklanmış çalışma
 * yüzeyleri, site gezinmesi oraya gürültü katar. Landmark ise şart.
 */
export const metadata: Metadata = {
  title: { default: "Yönetim", template: "%s · Yönetim · MediSea" },
  // Yönetim yüzeyi robots.ts'te zaten kapalı; burada da açıkça söyleniyor,
  // çünkü bir gün robots kuralı değişirse bu sayfaların dizine girmesi
  // istenmiyor.
  robots: { index: false, follow: false },
};

export default function YonetimDuzen({ children }: { children: ReactNode }) {
  return <main>{children}</main>;
}
