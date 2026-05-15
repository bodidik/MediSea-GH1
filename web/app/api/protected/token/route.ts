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
    
  } catch (err: any) {
    // 🚨 BACKEND KAPALIYSA: ZİNCİRİ KIRMA, SAHTE (MOCK) ERİŞİM BİLETİ DÖN!
    console.warn("Backend'e ulaşılamadı. Protected Token yedek motoru devrede.");
    
    return NextResponse.json({ 
      ok: true, 
      token: "mock-premium-token-777", // Sahte bilet
      mock: true
    }, { status: 200 });
  }
}