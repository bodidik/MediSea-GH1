// FILE: web/app/api/review/next/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backend = backendBase();
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const externalId = m?.[1] || "guest";

  try {
    const inUrl = new URL(req.url);
    const backendUrl = new URL("/api/review/next", backend);
    
    // proxy edilen query’ler
    for (const [k, v] of inUrl.searchParams.entries()) {
      backendUrl.searchParams.set(k, v);
    }
    backendUrl.searchParams.set("externalId", externalId);

    const r = await fetch(backendUrl.toString(), { cache: "no-store" });

    if (!r.ok) throw new Error(`Backend yanıt vermedi: ${r.status}`);

    const j = await r.json();
    return NextResponse.json(j, { status: r.status });

  } catch (error) {
    // 🚨 BACKEND ULAŞILAMAZSA: ÇÖKME, KULLANICIYA SAHTE BİR TEKRAR SORUSU VER!
    console.warn("Backend'e ulaşılamadı. Review Next yedek motoru devrede.");
    
    return NextResponse.json({
      ok: true,
      mock: true,
      question: {
        id: "mock-review-q1",
        text: "[MOCK] Bu bir aralıklı tekrar (spaced repetition) test sorusudur. Backend kapalı olduğu için sahte soru gösteriliyor. Tasarımı test etmeye devam edebilirsiniz!",
        options: ["A) Seçenek 1", "B) Seçenek 2", "C) Doğru Cevap", "D) Seçenek 4"],
        correctIndex: 2,
        explanation: "Çelik Kubbe kalkanı devrede olduğu için C seçeneği doğrudur."
      }
    }, { status: 200 });
  }
}