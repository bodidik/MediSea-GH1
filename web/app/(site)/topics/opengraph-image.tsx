import { ImageResponse } from "next/og";
import { SITE_ADI } from "@/lib/site";
import basliklar from "@/content/baslik-index.json";

/**
 * Kütüphane girişinin paylaşım kartı.
 *
 * Neden ayrı bir dosya gerekiyor: bu segmentin düzeninde açık bir openGraph
 * nesnesi tanımlı ve açık openGraph, üst segmentten miras alınan görseli
 * engelliyor. Yani /topics paylaşıldığında görselsiz çıkıyordu. Alt
 * segmentler (branş, konu) kendi kartlarıyla bunu eziyor.
 */

export const alt = "MediSea kütüphane kartı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const anahtarlar = Object.keys(basliklar as Record<string, string>);
  const konuSayisi = anahtarlar.length;
  const bransSayisi = new Set(anahtarlar.map((k) => k.split("/")[0])).size;

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
          <div style={{ display: "flex", color: "#ffffff", fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
            Kütüphane
          </div>
          <div style={{ display: "flex", color: "#9db8dd", fontSize: 30 }}>
            {`${bransSayisi} branşta ${konuSayisi} konu başlığı`}
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
