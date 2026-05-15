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

  } catch (error) {
    // 🚨 SİSTEMLERDEN BİRİ ÇÖKERSE: PREMIUM ARAYÜZÜ KIRMA, YEDEK (MOCK) İÇERİK DÖN!
    console.warn(`Korumalı İçerik (Chunk ID: ${id}) çekilemedi. Yedek motor devrede.`);
    
    return NextResponse.json({
      ok: true,
      id: id,
      // Kullanıcı arayüzünde patlama olmaması için güvenli bir HTML/Metin içeriği dönüyoruz
      content: "<div class='p-4 bg-slate-800/50 text-slate-300 rounded-xl border border-slate-700/50 text-sm'>⚠️ Korumalı sunucuya şu an ulaşılamıyor. Lütfen daha sonra tekrar deneyin (Mock İçerik).</div>",
      mock: true
    }, { status: 200 });
  }
}