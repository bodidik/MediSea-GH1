// FILE: web/app/api/review/stats/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backend = (process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:4000").replace(/\/+$/, "");
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const externalId = m?.[1] || "guest";

  const url = new URL("/api/review/stats", backend);
  url.searchParams.set("externalId", externalId);

  try {
    const r = await fetch(url.toString(), { cache: "no-store" });
    
    if (!r.ok) throw new Error(`Backend yanıt vermedi: ${r.status}`);

    const j = await r.json();
    return NextResponse.json(j, { status: r.status });

  } catch (error) {
    // 🚨 BACKEND ULAŞILAMAZSA: GRAFİKLERİ ÇÖKERTME, MOCK İSTATİSTİK DÖN!
    console.warn("Backend'e ulaşılamadı. Review Stats yedek motoru devrede.");
    
    return NextResponse.json({
      ok: true,
      mock: true,
      stats: {
        totalCards: 120,    // Toplam kart
        learnedCards: 45,   // Öğrenilen
        dueCards: 12,       // Bugün tekrar edilecekler
        accuracy: 82        // Başarı oranı
      },
      message: "Sahte istatistik verisi (Mock)"
    }, { status: 200 });
  }
}