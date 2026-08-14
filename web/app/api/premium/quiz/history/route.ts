// FILE: web/app/api/premium/quiz/history/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backend = backendBase();
  
  // mk_uid → externalId
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const externalId = m?.[1] || "guest";

  const days = req.nextUrl.searchParams.get("days") || "30";
  const url = new URL("/api/premium/quiz/history", backend);
  
  url.searchParams.set("externalId", externalId);
  url.searchParams.set("days", days);

  try {
    const r = await fetch(url.toString(), { cache: "no-store" });
    
    // Eğer backend hata verirse kasten catch bloğuna düşür
    if (!r.ok) throw new Error("Backend yanıt vermedi");
    
    const j = await r.json();
    return NextResponse.json(j);
    
  } catch {
    /**
     * Arka uç yok. UYDURMA GEÇMİŞ DÖNÜLMÜYOR.
     *
     * Burada beş günlük sahte bir başarı serisi (12/20, 18/25, 17/20, 25/30,
     * 23/25) dönülüyordu ve `ok: true` diyordu. Kullanıcı bunu KENDİ geçmişi
     * sanıyordu — hiç çözmediği sınavların sonuçlarını. Sınava hazırlanan
     * biri çalışmasını bu sayılara göre ayarlar; tıbbi bir sınav ürününde
     * bu, boş grafik göstermekten çok daha zararlı.
     *
     * Aynı hata sınıfı bu projede daha önce yedi uçta düzeltilmişti
     * (bkz. /api/user/me). Çağıran bileşen `!r.ok` dalını zaten karşılıyor.
     */
    console.warn("Quiz geçmişi alınamadı — arka uç yok.");

    return NextResponse.json(
      { ok: false, reason: "backend-unavailable", days: parseInt(days), items: [] },
      { status: 503 }
    );
  }
}