import { ImageResponse } from "next/og";
import { SITE_ADI } from "@/lib/site";
import { getSpecialty } from "@/app/lib/specialties";
import basliklar from "@/content/baslik-index.json";
import { slugCoz } from "@/lib/slug";

/**
 * Konu sayfası paylaşım görseli — kartta konunun kendi başlığı görünür.
 *
 * Bir konu bağlantısı gruba düştüğünde genel bir "MediSea" kartı yerine
 * "Akut Böbrek Hasarı (ABH) · Nefroloji" yazan bir kart çıkması, tıklanma
 * açısından bambaşka bir şey. Tıp camiasında dağıtımın önemli kısmı bu
 * kanallardan geçiyor.
 *
 * İki tuzak burada öğrenildi:
 *
 * 1) Başlık diskten OKUNAMAZ. Bu rotada `fs` çalışmıyor — ne düz ne tembel
 *    içe aktarmayla; paketleyici modülü çözemiyor. Başlıklar statik dizinden
 *    geliyor (scripts/baslik-index.cjs). Dizinde olmayan konu slug'dan
 *    türeyen başlıkla basılır: kart bozulmaz, Türkçe harfleri eksilir.
 *
 * 2) Görsel motoru (Satori), birden fazla çocuğu olan her <div>'de açık
 *    "display: flex" ister. `<div>· {brans}</div>` JSX'te İKİ çocuk üretir
 *    (metin + değişken) ve rota hata bile göstermeden bağlantıyı düşürür.
 *    Bu yüzden metinler tek şablon dizesi olarak veriliyor.
 */

export const alt = "MediSea konu kartı";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Uzun başlıklar kartı taşırmasın; kelime sınırından kırpılır. */
function kirp(s: string, sinir: number): string {
  if (s.length <= sinir) return s;
  const k = s.slice(0, sinir);
  const b = k.lastIndexOf(" ");
  return (b > 10 ? k.slice(0, b) : k).trimEnd() + "…";
}

export default async function Image({
  params,
}: {
  // Next 15'te params bir Promise. Düz nesne olarak alınırsa slug/topicSlug
  // undefined kalır ve rota TypeError ile çöker.
  params: Promise<{ slug: string; topicSlug: string }>;
}) {
  const { slug: hamSlug, topicSlug: hamKonu } = await params;
  // Parametre yüzde-kodlu geliyor; çözülmezse başlık dizinindeki
  // "<branş>/<konu>" anahtarı tutmaz ve kart slug'ı yazıyla basar.
  const slug = slugCoz(hamSlug);
  const topicSlug = slugCoz(hamKonu);

  const dizin = basliklar as Record<string, string>;
  const baslik = kirp(dizin[`${slug}/${topicSlug}`] || topicSlug.replace(/-/g, " "), 88);
  const bransAdi = getSpecialty(slug)?.title || slug;

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
          <div style={{ color: "#7f9dc4", fontSize: 26 }}>{`· ${bransAdi}`}</div>
        </div>

        <div
          style={{
            display: "flex",
            color: "#ffffff",
            fontSize: baslik.length > 46 ? 58 : 74,
            fontWeight: 700,
            lineHeight: 1.14,
          }}
        >
          {baslik}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 60, height: 6, borderRadius: 3, background: "#fbbf24", display: "flex" }} />
          <div style={{ color: "#9db8dd", fontSize: 24 }}>Türkçe klinik kaynak</div>
        </div>
      </div>
    ),
    size
  );
}
