import { ImageResponse } from "next/og";
import { SITE_ADI } from "@/lib/site";

/**
 * Site geneli paylaşım kartının ÇİZİMİ — Türkçe (`app/opengraph-image.tsx`)
 * ve İngilizce (`app/en/opengraph-image.tsx`) kart aynı tasarımdan çıksın
 * diye tek yerde. Yalnızca metin dile göre değişir.
 *
 * Satori kuralı: birden fazla çocuğu olan her `<div>` açık `display: flex`
 * ister; metinler tek dize olarak verilir (bkz. CLAUDE.md, görsel rotaları).
 */
export const KART_BOYUTU = { width: 1200, height: 630 };

export function siteKarti(metin: { baslik: string; alt: string }) {
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
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#fbbf24",
              display: "flex",
            }}
          />
          <div style={{ color: "#ffffff", fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>
            {SITE_ADI}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ color: "#ffffff", fontSize: 68, fontWeight: 700, lineHeight: 1.15 }}>
            {metin.baslik}
          </div>
          <div style={{ color: "#9db8dd", fontSize: 30, lineHeight: 1.4 }}>
            {metin.alt}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 60, height: 6, borderRadius: 3, background: "#fbbf24", display: "flex" }} />
          <div style={{ color: "#7f9dc4", fontSize: 24 }}>medisea</div>
        </div>
      </div>
    ),
    KART_BOYUTU
  );
}
