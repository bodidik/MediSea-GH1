import { ImageResponse } from "next/og";
import { SITE_ADI } from "@/lib/site";
import { getSpecialty } from "@/app/lib/specialties";
import basliklar from "@/content/baslik-index.json";

/**
 * Branş sayfası paylaşım kartı.
 *
 * Branş sayfalarının hiç og:image'ı yoktu — kök karta da düşmüyorlardı,
 * çünkü generateMetadata içinde açık bir openGraph nesnesi tanımlı. Yani
 * 13 branş bağlantısı paylaşıldığında görselsiz çıkıyordu.
 *
 * Konu sayısı diskten değil başlık dizininden sayılıyor: bu rotada `fs`
 * çalışmıyor (bkz. konu kartındaki not).
 */

export const alt = "MediSea branş kartı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const brans = getSpecialty(slug);
  const ad = brans?.title || slug.replace(/-/g, " ");
  const aciklama = brans?.desc || "";

  const onek = `${slug}/`;
  const konuSayisi = Object.keys(basliklar as Record<string, string>).filter((k) =>
    k.startsWith(onek)
  ).length;

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
          <div style={{ color: "#7f9dc4", fontSize: 26 }}>· Kütüphane</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", color: "#ffffff", fontSize: 84, fontWeight: 700, lineHeight: 1.05 }}>
            {ad}
          </div>
          {aciklama ? (
            <div style={{ display: "flex", color: "#9db8dd", fontSize: 30 }}>{aciklama}</div>
          ) : null}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 60, height: 6, borderRadius: 3, background: "#fbbf24", display: "flex" }} />
          <div style={{ color: "#9db8dd", fontSize: 24 }}>
            {konuSayisi > 0 ? `${konuSayisi} konu başlığı · Türkçe klinik kaynak` : "Türkçe klinik kaynak"}
          </div>
        </div>
      </div>
    ),
    size
  );
}
