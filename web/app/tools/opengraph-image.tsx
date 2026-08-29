import { ImageResponse } from "next/og";
import { SITE_ADI } from "@/lib/site";

/**
 * Klinik araçların paylaşım kartı — /tools ve altındaki bütün araç sayfaları.
 *
 * Araç başına ayrı kart üretmek araç sayısı kadar ayrı görsel rotası demek olurdu; buna
 * değmez, çünkü paylaşım önizlemesindeki BAŞLIK zaten araca özel
 * (layout'lardaki og:title). Kart ortak, başlık kişisel.
 *
 * Ayrı dosya gerekiyor çünkü araç layout'ları açık bir openGraph nesnesi
 * tanımlıyor ve açık openGraph, üst segmentten miras alınan görseli
 * engelliyor: araç sayfaları görselsiz paylaşılıyordu.
 */

export const alt = "MediSea klinik araçlar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #1a3a6b 0%, #0c1e3a 100%)",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fbbf24", display: "flex" }} />
          <div style={{ color: "#ffffff", fontSize: 32, fontWeight: 700 }}>{SITE_ADI}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", color: "#ffffff", fontSize: 80, fontWeight: 700, lineHeight: 1.05 }}>
            Klinik Hesaplayıcılar
          </div>
          <div style={{ display: "flex", color: "#9db8dd", fontSize: 30 }}>
            Skorlar, formüller ve karar destek araçları
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 60, height: 6, borderRadius: 3, background: "#fbbf24", display: "flex" }} />
          <div style={{ color: "#9db8dd", fontSize: 24 }}>Ücretsiz · kayıt gerekmez</div>
        </div>
      </div>
    ),
    size
  );
}
