// FILE: web/app/api/programs/[...path]/route.ts
import { backendBase } from "@/lib/backend";
import type { NextRequest } from "next/server";

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

/**
 * Ortak proxy işlevi: tüm HTTP metodları buradan geçer
 */
async function proxy(req: NextRequest, method: string, path: string) {
  // Hedef URL: /api/programs + dinamik alt yol + orijinal query
  const target = new URL(`/api/programs${path ? "/" + path : ""}`, BACKEND);
  const original = new URL(req.url);
  for (const [k, v] of original.searchParams.entries()) {
    target.searchParams.append(k, v);
  }

  // Gövdeyi sadece gerektiğinde oku
  const hasBody = !["GET", "HEAD"].includes(method.toUpperCase());
  const body = hasBody ? await req.arrayBuffer() : undefined;

  // İstek başlıkları — host/connection gibi hop-by-hop öğeleri aktarma
  const headers = new Headers();
  req.headers.forEach((v, k) => {
    if (["host", "connection"].includes(k.toLowerCase())) return;
    headers.set(k, v);
  });

  // Orijinal cookie'yi forward et (mk_uid vb. için önemli)
  const cookie = req.headers.get("cookie");
  if (cookie) headers.set("cookie", cookie);

  try {
    const res = await fetch(target.toString(), {
      method,
      headers,
      body: body as any,
      // Dış origin’e gittiğimiz için credentials: "include" yerine header forward kullanıyoruz
      redirect: "manual",
      cache: "no-store",
    });

    // Yanıt başlıkları — içerik tipi ve set-cookie’yi koru
    const outHeaders = new Headers();
    const passThrough = [
      "content-type",
      "content-length",
      "set-cookie",
      "cache-control",
      "etag",
    ];
    res.headers.forEach((v, k) => {
      if (passThrough.includes(k.toLowerCase())) outHeaders.append(k, v);
    });

    const buf = await res.arrayBuffer();
    return new Response(buf, { status: res.status, headers: outHeaders });

  } catch (error) {
    // 🚨 BACKEND KAPALIYSA: ÇÖKME, JOKER GÜVENLİK YANITI DÖN!
    console.warn(`Backend'e ulaşılamadı. Joker Proxy (${method} /api/programs/${path}) yedek motoru devrede.`);
    
    // Front-end'in JSON parse (Unexpected end of JSON) hatasına düşmemesi için 
    // her duruma uyan, boş ama geçerli bir JSON objesi dönüyoruz.
    return new Response(
      JSON.stringify({
        success: false,
        mock: true,
        message: "Backend sunucusuna ulaşılamadı. Yedek (mock) koruma kalkanı devrede.",
        data: null,
        items: [] // Eğer frontend bir dizi (.map) bekliyorsa patlamaması için
      }),
      { 
        status: 200, // 200 dönüyoruz ki frontend bileşenleri kırmızı ekran (Error) vermesin
        headers: { "Content-Type": "application/json" } 
      }
    );
  }
}

function getPathParam(params: { path?: string[] }) {
  return (params?.path || []).join("/");
}

export async function GET(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, "GET", getPathParam(ctx.params));
}
export async function POST(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, "POST", getPathParam(ctx.params));
}
export async function PUT(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, "PUT", getPathParam(ctx.params));
}
export async function PATCH(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, "PATCH", getPathParam(ctx.params));
}
export async function DELETE(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, "DELETE", getPathParam(ctx.params));
}
export async function OPTIONS(req: NextRequest, ctx: { params: { path?: string[] } }) {
  return proxy(req, "OPTIONS", getPathParam(ctx.params));
}