
// FILE: web/app/api/topics/[slug]/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest } from "next/server";
import fs from "fs";
import path from "path";

// content/canonical/{branch}/{slug}.json dosyasını bulur.
// branch biliniyorsa doğrudan oraya bakar; bilinmiyorsa tüm branşları tarar.
function findCanonicalFile(slug: string, branch?: string | null): string | null {
  const canonicalRoot = path.join(process.cwd(), "content", "canonical");

  if (branch) {
    const direct = path.join(canonicalRoot, branch, `${slug}.json`);
    if (fs.existsSync(direct)) return direct;
  }

  if (!fs.existsSync(canonicalRoot)) return null;
  const branches = fs.readdirSync(canonicalRoot).filter((d) =>
    fs.statSync(path.join(canonicalRoot, d)).isDirectory()
  );
  for (const b of branches) {
    const candidate = path.join(canonicalRoot, b, `${slug}.json`);
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const backend = backendBase(); 
  const params = await ctx.params;
  const slug = params.slug;
  
  // 1. Temel Hedef URL Tanımı
  const url = new URL(`/api/topics/${encodeURIComponent(slug)}`, backend);

  // 2. 🔍 QUERY STRING KAÇAĞI ÖNLEMİ: Orijinal URL'deki tüm filtreleri (?page=2, ?search=vs.) hedefe ekliyoruz
  const originalUrl = new URL(req.url);
  for (const [key, value] of originalUrl.searchParams.entries()) {
    url.searchParams.append(key, value);
  }

  // 3. 🛡️ HEADER / COOKIE KAÇAĞI ÖNLEMİ: İstek başlıklarını güvenle kopyalıyoruz
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    // Hop-by-hop başlıklarını proxy güvenliği için eliyoruz
    if (["host", "connection"].includes(key.toLowerCase())) return;
    headers.set(key, value);
  });

  try {
    // 4. Backend Sunucusuna Güvenli İstek
    const res = await fetch(url.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    // 5. YANIT BAŞLIKLARI KORUMASI: Gelen content-type ve set-cookie öğelerini sızdırmadan istemciye iletiyoruz
    const outHeaders = new Headers();
    const passThrough = [
      "content-type",
      "content-length",
      "set-cookie",
      "cache-control",
      "etag",
    ];
    res.headers.forEach((value, key) => {
      if (passThrough.includes(key.toLowerCase())) {
        outHeaders.append(key, value);
      }
    });

    const data = await res.arrayBuffer();
    return new Response(data, { status: res.status, headers: outHeaders });

  } catch (error) {
    // 6. 🚨 BACKEND KAPALIYSA JOKER KORUMA: Frontend'in çökmemesi için güvenli JSON yanıtı
    console.error(`Topics API hatası (${slug}):`, error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Veri sunucusuna şu anda ulaşılamıyor. Yedek koruma devrede.",
        data: null
      }),
      { 
        status: 200, // Frontend bileşenlerinin Error Boundary patlaması yaşamaması için 200 dönüyoruz
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}
export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  // 🚀 Next.js 15 kuralı: Önce Promise olan params yapısını çözüyoruz
  const params = await ctx.params;
  const slug = String(params?.slug || "").trim();
  const branch = req.nextUrl.searchParams.get("branch");

  if (!slug) {
    return Response.json({ ok: false, error: "Konu (slug) belirtilmedi." }, { status: 400 });
  }

  // İçerik Paneli artık ayrı bir backend'e değil, sitenin gerçekten okuduğu
  // content/canonical/{branch}/{slug}.json dosyasına doğrudan yazar.
  const filePath = findCanonicalFile(slug, branch);

  if (!filePath) {
    return Response.json(
      { ok: false, error: `Dosya bulunamadı: ${branch ? `${branch}/` : ""}${slug}.json` },
      { status: 404 }
    );
  }

  try {
    const payload = await req.json().catch(() => ({} as any));
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    // Özet: dosyanın kök seviyesindeki "summary" alanı güncellenir
    // (sayfa bunu rawData.summary || rawData.meta?.summary şeklinde okuyor).
    if (typeof payload.summary === "string") {
      data.summary = payload.summary;
    }

    // Bloklar: site kuralına uygun olarak "heading" anahtarıyla yazılır.
    if (Array.isArray(payload.sections)) {
      data.sections = payload.sections.map((b: any) => {
        const section: Record<string, any> = {
          heading: b.heading || b.title || "Başlıksız Blok",
          html: b.html || b.text || "",
        };
        if (b.visibility && b.visibility !== "V") section.visibility = b.visibility;
        return section;
      });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");

    return Response.json({ ok: true, message: `Konu (${slug}) kaydedildi.` }, { status: 200 });
  } catch (err: any) {
    console.error(`Konu güncelleme hatası (${slug}):`, err);
    return Response.json(
      { ok: false, error: err?.message || "Kaydetme sırasında beklenmeyen bir hata oluştu." },
      { status: 500 }
    );
  }
}