import { ImageResponse } from "next/og";
import { SITE_ADI } from "@/lib/site";

/**
 * Site geneli paylaşım görseli.
 *
 * Bağlantılar WhatsApp/Telegram gibi kanallarda paylaşıldığında şimdiye kadar
 * boş kutu görünüyordu; tıp camiasında dağıtımın büyük kısmı bu kanallardan
 * geçtiği için bu, hunide doğrudan kayıp demekti.
 *
 * Alt segmentler kendi opengraph-image dosyalarıyla bunu geçersiz kılabilir;
 * bir dosya yoksa en yakın üst segmentinki miras alınır.
 */

export const alt = `${SITE_ADI} — Dahiliye için Türkçe klinik kaynak`;
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
            Dahiliye için Türkçe klinik kaynak
          </div>
          <div style={{ color: "#9db8dd", fontSize: 30, lineHeight: 1.4 }}>
            Güncel konu anlatımları · klinik hesaplayıcılar · YDUS hazırlık
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 60, height: 6, borderRadius: 3, background: "#fbbf24", display: "flex" }} />
          <div style={{ color: "#7f9dc4", fontSize: 24 }}>medisea</div>
        </div>
      </div>
    ),
    size
  );
}
