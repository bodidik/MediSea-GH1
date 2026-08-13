// C:\Users\hucig\Medknowledge\web\app\api\protected\token\route.ts
import { NextRequest, NextResponse } from "next/server";
import { backendBase } from "@/lib/backend";

export async function GET(req: NextRequest) {
  try {
    const backend = backendBase();
    const url = new URL("/api/protected/token", backend);
    const xff = req.headers.get("x-forwarded-for") || "";

    const r = await fetch(url.toString(), {
      headers: { "x-forwarded-for": xff } as any,
      cache: "no-store",
    });

    // Backend ulaşılabilir ama hata döndüyse kasten catch'e atıyoruz ki mock devreye girsin
    if (!r.ok) throw new Error(`Backend token hatası: ${r.status}`);
    
    const data = await r.json();
    return NextResponse.json(data, { status: 200 });
    
  } catch {
    // Arka uca ulaşılamadı.
    //
    // Burada SAHTE bir erişim bileti üretiliyordu ("mock-premium-token-777")
    // ve yanıt ok:true diyordu. Yetki jetonu uydurmak, veri uydurmaktan daha
    // tehlikeli: çağıran taraf bunu geçerli yetki sanar ve o varsayımın
    // üstüne kod yazılır. Arka uç canlıda hiç çalışmadığı için bu "yedek"
    // hâl kalıcı hâldi.
    //
    // Artık başarısızlık başarısızlık olarak dönüyor.
    console.warn("Korumalı içerik jetonu alınamadı: arka uca ulaşılamıyor.");

    return NextResponse.json(
      { ok: false, reason: "backend-unavailable" },
      { status: 503 }
    );
  }
}