// C:\Users\hucig\Medknowledge\web\app\api\protected\chunk\route.ts
import { NextRequest, NextResponse } from "next/server";
import { backendBase } from "@/lib/backend";

export async function GET(req: NextRequest) {
  const backend = backendBase();
  const cookies = req.headers.get("cookie") || "";
  const mk = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const externalId = mk?.[1] || "guest";

  const id = req.nextUrl.searchParams.get("id") || "sample";

  try {
    // 1. AŞAMA: Token Alma İşlemi
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // Boş url hatasını önlemek için fallback eklendi
    const tRes = await fetch(`${baseUrl}/api/protected/token`, { 
      headers: { cookie: cookies }, 
      cache: "no-store" 
    });
    
    // Token sunucusu hata dönerse catch bloğuna at
    if (!tRes.ok) throw new Error("Token sunucusu yanıt vermedi");
    
    const tJson = await tRes.json();
    
    if (!tJson.ok) {
      return NextResponse.json({ ok: false, error: "token_fail" }, { status: 401 });
    }

    // 2. AŞAMA: Korumalı İçeriği (Chunk) Alma İşlemi
    const url = new URL("/api/protected/chunk", backend);
    url.searchParams.set("externalId", externalId);
    url.searchParams.set("id", id);

    const r = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${tJson.token}` },
      cache: "no-store"
    });

    // Backend hata dönerse catch bloğuna at
    if (!r.ok) throw new Error(`Backend chunk hatası döndü: ${r.status}`);

    const j = await r.json();
    return NextResponse.json(j, { status: r.status });

  } catch {
    /**
     * Arka uca ulaşılamadı.
     *
     * Burada `ok: true` ve 200 dönülüyordu — içerik yerine bir uyarı metni
     * konsa bile yanıt "başarılı" diyordu. Kardeş uç (protected/token) tam
     * bu sebeple düzeltilmişti; yorumu şunu söylüyor: uydurulmuş bir başarı,
     * çağıran tarafın üstüne kod yazdığı yanlış bir varsayım üretir.
     * Token artık 503 döndüğü için buradaki ilk aşama HER ZAMAN düşüyor,
     * yani "yedek" hâl kalıcı hâldi.
     *
     * Şu an bu ucu çağıran hiçbir arayüz yok (ölçüldü: 0 dosya), dolayısıyla
     * dürüst yanıt hiçbir yüzeyi kırmıyor.
     */
    console.warn(`Korumalı içerik alınamadı (id: ${id}) — arka uç yok.`);

    return NextResponse.json(
      { ok: false, reason: "backend-unavailable", id, content: null },
      { status: 503 }
    );
  }
}