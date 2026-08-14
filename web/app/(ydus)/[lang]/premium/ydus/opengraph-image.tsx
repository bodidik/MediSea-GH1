import { ImageResponse } from "next/og";
import { SITE_ADI } from "@/lib/site";

/**
 * Premium YDUS tanıtım sayfasının kendi paylaşım görseli.
 *
 * Bu sayfa taramaya AÇIK (robots yalnızca premium KONU sayfalarını kapatıyor)
 * ve mevsimlik yüksek biletin giriş kapısı. Ölçüldü: kendi kartı olmadığı
 * için site geneli jenerik karta düşüyordu — yani YDUS bağlantısı
 * paylaşıldığında "Dahiliye için Türkçe klinik kaynak" yazan genel kart
 * çıkıyordu. Konu sayfalarının hepsi kendi kartını alıyor; ücretli tarafın
 * giriş sayfası almıyordu.
 *
 * Satori kısıtları (CLAUDE.md'de yazılı, üçü de sessizce kırıyor):
 * - Birden fazla çocuğu olan her `div` açık `display: flex` ister.
 * - Metinleri tek şablon dizesi ver; `<div>· {x}</div>` İKİ çocuk üretir.
 * - `fs` çalışmaz; bu yüzden burada dosya sisteminden sayı okunmuyor.
 *   Sayı yazmak yerine hiç sayı verilmiyor — elle yazılan bir sayı içerik
 *   büyürken sessizce yalana döner (projenin tekrar eden hatası).
 */

export const alt = `${SITE_ADI} Premium YDUS — Yandal sınavına hazırlık`;
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
          background: "linear-gradient(135deg, #0c1e3a 0%, #071426 100%)",
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
            {`${SITE_ADI} Premium`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ color: "#fbbf24", fontSize: 30, fontWeight: 700, letterSpacing: 6 }}>
            YDUS HAZIRLIK
          </div>
          <div style={{ color: "#ffffff", fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>
            Çıkmış sorular, çözümlü vakalar, hızlı tekrar
          </div>
          <div style={{ color: "#9db8dd", fontSize: 30, lineHeight: 1.4 }}>
            Dahiliye yandal sınavına yoğun hazırlık — soru bankası · vaka analizi · inciler
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 60, height: 6, borderRadius: 3, background: "#fbbf24", display: "flex" }} />
          <div style={{ color: "#7f9dc4", fontSize: 24 }}>medisea · premium ydus</div>
        </div>
      </div>
    ),
    size
  );
}
