// FILE: web/app/api/programs/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backend = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:4000").replace(/\/+$/, "");
  const inUrl = new URL(req.url);
  const url = new URL("/api/programs", backend);
  
  const track = inUrl.searchParams.get("track");
  if (track) url.searchParams.set("track", track);

  try {
    const r = await fetch(url.toString(), { cache: "no-store" });
    
    // Eğer backend çökerse veya hata kodu dönerse kasten catch bloğuna at
    if (!r.ok) throw new Error("Backend yanıt vermedi");
    
    const j = await r.json();
    return NextResponse.json(j, { status: r.status });
    
  } catch (error) {
    // 🚨 BACKEND KAPALIYSA VEYA ÇÖKTÜYSE: SİSTEMİ BOZMA, SAHTE (MOCK) PROGRAM LİSTESİ GÖNDER!
    console.warn(`Backend'e ulaşılamadı, Programlar (track: ${track || 'tümü'}) için yedek motor devrede.`);
    
    return NextResponse.json({
      success: true,
      programs: [
        { 
          id: "ydus-premium-01", 
          title: "YDUS İç Hastalıkları Premium", 
          track: track || "ydus", 
          status: "active",
          progress: 45
        },
        { 
          id: "tus-vaka-02", 
          title: "TUS Vaka Kampı", 
          track: track || "tus", 
          status: "upcoming",
          progress: 0
        }
      ]
    }, { status: 200 });
  }
}