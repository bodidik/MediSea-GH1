import { ImageResponse } from "next/og";
import { SITE_ADI } from "@/lib/site";

/**
 * Üyelik sayfasının paylaşım kartı.
 *
 * Sayfa kendi openGraph nesnesini tanımladığı için üst segmentten miras
 * alınan görsel engelleniyordu; dönüşüm sayfası olduğu hâlde görselsiz
 * paylaşılıyordu.
 *
 * Kartta fiyat YOK — satış açılmadı ve sayfanın kendisi de fiyat vermiyor.
 */

export const alt = "MediSea üyelik";
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
          <div style={{ display: "flex", color: "#ffffff", fontSize: 76, fontWeight: 700, lineHeight: 1.08 }}>
            Neyin ücretsiz, neyin Premium
          </div>
          <div style={{ display: "flex", color: "#9db8dd", fontSize: 30 }}>
            Kütüphane ve çalışma araçları ücretsiz · Premium YDUS hazırlığı
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 60, height: 6, borderRadius: 3, background: "#fbbf24", display: "flex" }} />
          <div style={{ color: "#9db8dd", fontSize: 24 }}>medisea</div>
        </div>
      </div>
    ),
    size
  );
}
