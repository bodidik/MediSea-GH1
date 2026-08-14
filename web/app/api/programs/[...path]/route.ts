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
    /**
     * Arka uca ulaşılamadı — DÜRÜST HATA DÖNÜLÜR.
     *
     * Burada `status: 200` ve `items: []` dönülüyordu; gerekçesi de yorumda
     * yazılıydı: "frontend bileşenleri kırmızı ekran vermesin". Ama 200,
     * çağırana "istek başarılı" demek: `res.ok` true çıkıyor ve boş dizi
     * "kayıt yok" gibi okunuyor. Kullanıcı "program bulunamadı" görüyor,
     * oysa sunucuya hiç ulaşılamamış. Projede aynı kusur on bir uçta
     * düzeltildi; bu, tarama sırasında bulunan sonuncusuydu.
     *
     * 503 + `ok: false` ile çağıran gerçeği görüyor. Gövde yine geçerli
     * JSON, yani "Unexpected end of JSON" riski yok — asıl korkulan oydu.
     */
    console.warn(`Backend'e ulaşılamadı: ${method} /api/programs/${path}`, error);

    return new Response(
      JSON.stringify({ ok: false, reason: "backend-unavailable" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }
}

function getPathParam(params: { path?: string[] }) {
  return (params?.path || []).join("/");
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const params = await ctx.params;
  return proxy(req, "GET", getPathParam(params));
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const params = await ctx.params;
  return proxy(req, "POST", getPathParam(params));
}

export async function PUT(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const params = await ctx.params;
  return proxy(req, "PUT", getPathParam(params));
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const params = await ctx.params;
  return proxy(req, "PATCH", getPathParam(params));
}

export async function DELETE(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const params = await ctx.params;
  return proxy(req, "DELETE", getPathParam(params));
}

export async function OPTIONS(req: NextRequest, ctx: { params: Promise<{ path?: string[] }> }) {
  const params = await ctx.params;
  return proxy(req, "OPTIONS", getPathParam(params));
}