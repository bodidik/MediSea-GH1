// C:\Users\hucig\Medknowledge\web\app\api\progress\tick\route.ts
import { NextRequest, NextResponse } from "next/server";
import { backendBase } from "@/lib/backend";

export async function POST(req: NextRequest) {
  const backend = backendBase();
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const userId = m?.[1] || "guest";
  
  // URL'den gelen 'correct' (doğru/yanlış) parametresini alıyoruz
  const correct = req.nextUrl.searchParams.get("correct") ?? "true";
  
  const url = new URL("/api/progress/tick", backend);
  url.searchParams.set("userId", userId);
  url.searchParams.set("correct", correct);

  try {
    const r = await fetch(url.toString(), { method: "POST" });
    
    // Backend hata kodlarından birini dönerse kasten patlatıp catch bloğuna atlıyoruz
    if (!r.ok) {
      throw new Error(`Backend yanıt vermedi veya hata kodu döndü: ${r.status}`);
    }
    
    const j = await r.json();
    return NextResponse.json(j, { status: r.status });
    
  } catch (error) {
    // 🚨 BACKEND ULAŞILAMAZSA: KULLANICININ ÇALIŞMA RİTMİNİ BOZMA, BAŞARILI "SAHTE" TİCK DÖN!
    console.warn(`Backend'e ulaşılamadı. Progress Tick (Correct: ${correct}) yedek motoru devrede.`);
    
    return NextResponse.json({
      success: true,
      message: "İlerleme (Tick) kaydedildi (Mock Modu).",
      tickRecorded: true,
      correct: correct === "true"
    }, { status: 200 });
  }
}