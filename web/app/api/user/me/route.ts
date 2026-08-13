// FILE: web/app/api/user/me/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backend = backendBase();
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const externalId = m?.[1] || "guest";

  const url = new URL("/api/user/me", backend);
  url.searchParams.set("externalId", externalId);

  try {
    const r = await fetch(url.toString(), { cache: "no-store" });
    if (!r.ok) throw new Error(`Backend yanıt vermedi: ${r.status}`);
    
    const j = await r.json();
    return NextResponse.json(j, { status: r.status });
  } catch {
    // Arka uca ulaşılamadı.
    //
    // Burada SAHTE bir kullanıcı dönülüyordu — üstelik plan:"P" (premium) ve
    // role:"admin" ile. Yani kimliği doğrulanmamış herkes, kendisini premium
    // ve yönetici ilan eden bir yanıt alıyordu. Şu an bu ucu çağıran bir
    // arayüz yok ve gerçek yetki NextAuth oturumundan geçiyor; ama böyle bir
    // yanıt, ileride bunu bağlayan koda hazır bir yetki açığı devreder.
    //
    // Kimlik ve yetki uydurulmaz. Bilinmiyorsa bilinmiyor denir.
    console.warn("Kullanıcı bilgisi alınamadı: arka uca ulaşılamıyor.");
    return NextResponse.json(
      { ok: false, reason: "backend-unavailable", user: null },
      { status: 503 }
    );
  }
}