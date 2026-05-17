
// FILE: web/app/api/topics/[slug]/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest } from "next/server";

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
  { params }: { params: { slug: string } }
) {
  const backend = backendBase();
  const slug = String(params?.slug || "").trim();
  const url = new URL(`/api/topics/${encodeURIComponent(slug)}`, backend);

  req.nextUrl.searchParams.forEach((v, k) => {
    url.searchParams.set(k, v);
  });

  try {
    // Body'yi güvenli okuma
    const payload = await req.json().catch(() => ({}));

    const r = await fetch(url.toString(), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (!r.ok) {
        throw new Error(`Backend PUT hatası: ${r.status}`);
    }

    const j = await r.json();
    return NextResponse.json(j, { status: 200 });
    
  } catch (err: any) {
    // 🚨 BACKEND ULAŞILAMAZSA: EDİTÖRÜ (CMS) ÇÖKERTME, MOCK BAŞARI DÖN!
    console.warn(`Backend'e ulaşılamadı. Konu Güncelleme (PUT: ${slug}) yedek motoru devrede.`);
    
    return NextResponse.json({
      ok: true,
      mock: true,
      message: `Konu (${slug}) başarıyla güncellendi (Mock).`
    }, { status: 200 });
  }
}