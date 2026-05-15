// FILE: web/app/api/premium/quiz/today/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backend = backendBase();
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const externalId = m?.[1] || "guest";

  const url = new URL("/api/premium/quiz/today-set", backend);
  url.searchParams.set("externalId", externalId);
  const n = req.nextUrl.searchParams.get("n");
  if (n) url.searchParams.set("n", n);

  try {
    const r = await fetch(url.toString(), { cache: "no-store" });
    
    if (!r.ok) throw new Error("Backend yanıt vermedi");

    const j = await r.json();
    return NextResponse.json(j, { status: r.status });

  } catch (error) {
    // 🚨 BACKEND KAPALIYSA: ÇÖKME, SAHTE GÜNLÜK QUİZ VERİSİ GÖNDER!
    console.warn("Backend'e ulaşılamadı, Günlük Quiz (Today) için yedek motor devrede.");
    
    return NextResponse.json({
      ok: true,
      locked: false,
      setId: "mock-today-set-001",
      items: [
        { id: "mock-q1", topic: "Hematoloji", difficulty: "Zor" },
        { id: "mock-q2", topic: "Kardiyoloji", difficulty: "Orta" }
      ]
    }, { status: 200 });
  }
}