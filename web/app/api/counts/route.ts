// C:\Users\hucig\Medknowledge\web\app\api\counts\route.ts
import { NextRequest, NextResponse } from "next/server";
import { backendBase } from "@/lib/backend";

export async function GET(req: NextRequest) {
  const backend = backendBase();
  const cookies = req.headers.get("cookie") || "";
  const userMatch = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const userId = userMatch?.[1] || "guest";
  
  const url = new URL("/api/counts", backend);
  url.searchParams.set("userId", userId);

  try {
    const res = await fetch(url.toString(), { cache: "no-store" });
    
    // Backend hata kodu dönerse catch bloğuna atıp yedek (mock) veriyi devreye sok
    if (!res.ok) {
        throw new Error(`Backend istatistik yanıtı vermedi: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });

  } catch (error) {
    // 🚨 BACKEND ULAŞILAMAZSA: DASHBOARD'U ÇÖKERTME, MOCK İSTATİSTİK DÖN!
    console.warn("Backend'e ulaşılamadı. İstatistikler (Counts) yedek motoru devrede.");
    
    return NextResponse.json({
      ok: true,
      mock: true,
      userId: userId,
      counts: {
        videosWatched: 42,
        questionsSolved: 1250,
        notesRead: 18,
        casesSolved: 5,
        streakDays: 7
      },
      message: "Görsel test (UI) yapabilmeniz için sahte istatistikler yüklenmiştir."
    }, { status: 200 });
  }
}