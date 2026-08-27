import { ImageResponse } from "next/og";

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
 * YENİ BİR TASARIM DEĞİL: `icon.svg`teki mark birebir aynı — lacivert kare,
 * iki deniz dalgası, altın vurgu. Yalnızca iOS'un istediği biçimde (PNG)
 * ve boyutta üretiliyor. Renkler `opengraph-image.tsx` ile de aynı aileden.
 *
 * `next/og` bu depoda zaten kullanılıyor (paylaşım kartları), yani yeni bir
 * bağımlılık yok.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1a3a6b",
        }}
      >
        {/* Satori, birden fazla çocuğu olan her div'de açık `display` ister
            (CLAUDE.md'de kayıtlı tuzak). Tek çocuk: gömülü SVG. */}
        <svg width="180" height="180" viewBox="0 0 64 64">
          <path
            d="M8 40c6 0 6-6 12-6s6 6 12 6 6-6 12-6 6 6 12 6"
            fill="none"
            stroke="#ffffff"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <path
            d="M8 50c6 0 6-6 12-6s6 6 12 6 6-6 12-6 6 6 12 6"
            fill="none"
            stroke="#ffffff"
            strokeOpacity="0.45"
            strokeWidth="4.5"
            strokeLinecap="round"
          />
          <circle cx="46" cy="18" r="6" fill="#fbbf24" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
