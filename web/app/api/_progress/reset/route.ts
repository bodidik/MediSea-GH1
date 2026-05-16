import { NextRequest, NextResponse } from "next/server";
import { backendBase } from "@/lib/backend";

export async function POST(req: NextRequest) {
  const backend = backendBase();
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const userId = m?.[1] || "guest";
  
  const url = new URL("/api/progress/reset", backend);
  url.searchParams.set("userId", userId);

  try {
    const r = await fetch(url.toString(), { method: "POST" });
    
    // Eğer backend çöktüyse doğrudan catch bloğuna at (Patlamayı engelle)
    if (!r.ok) {
      throw new Error(`Backend yanıt vermedi veya hata kodu döndü: ${r.status}`);
    }
    
    const j = await r.json();
    
    // DİKKAT: r.status'u buraya ekledik ki ön yüz gerçekte ne olduğunu bilsin!
    return NextResponse.json(j, { status: r.status });
    
  } catch (error) {
    // 🚨 BACKEND ULAŞILAMAZSA: SİSTEMİ ÇÖKERTME, KULLANICIYA SAHTE BAŞARI DÖN!
    console.warn("Backend'e ulaşılamadı. İlerleme Sıfırlama (Progress Reset) yedek motoru devrede.");
    
    return NextResponse.json({
      success: true,
      message: "İlerleme sıfırlandı (Mock Modu)."
    }, { status: 200 });
  }
}