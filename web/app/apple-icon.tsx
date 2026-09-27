import { ImageResponse } from "next/og";
import { MarkaIsareti } from "@/lib/marka-isareti";

/**
 * iOS ANA EKRAN SİMGESİ.
 *
 * Neden gerekti: `app/icon.svg`in kendi yorumu "16px sekme simgesinden 180px
 * dokunma simgesine kadar tek dosyayla net kalsın" diyor — ama iOS
 * `apple-touch-icon` için SVG KABUL ETMİYOR. Yani beyan edilen kapsam
 * gerçekleşmiyordu: `/apple-icon.png` 404 veriyordu ve tablete "Ana Ekrana
 * Ekle" ile kaydedilen MediSea, simge yerine sayfanın küçültülmüş ekran
 * görüntüsüyle duruyordu. Bu üründe tablet + kalem birinci sınıf bir
 * kullanım (bkz. CLAUDE.md, çalışma araçları), yani gerçek bir boşluk.
 *
 * İşaretin kendisi `lib/marka-isareti.tsx`te — Android simgeleri de aynı
 * kopyadan çiziyor.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(<MarkaIsareti boyut={180} />, { ...size });
}
