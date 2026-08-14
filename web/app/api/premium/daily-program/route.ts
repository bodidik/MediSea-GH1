// FILE: web/app/api/premium/daily-program/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backend = backendBase();

  // mk_uid → externalId
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const externalId = m?.[1] || "guest";

  const url = new URL("/api/premium/daily-program", backend);
  url.searchParams.set("externalId", externalId);

  try {
    const r = await fetch(url.toString(), { cache: "no-store" });
    
    // Eğer backend hata verirse veya boş dönerse kasten hataya düşür (catch bloğuna at)
    if (!r.ok) throw new Error("Backend yanıt vermedi");
    
    const j = await r.json();
    return NextResponse.json(j);
    
  } catch {
    /**
     * Arka uç yok. UYDURMA PROGRAM DÖNÜLMÜYOR.
     *
     * Burada sabit bir günlük program üretiliyordu ("Hematoloji Mega Deneme
     * 1, Kardiyoloji Flashcard 50, Gastroenteroloji Klinik İnciler 15") ve
     * yanıt başarılı görünüyordu. Kullanıcı bunu kendisi için hazırlanmış
     * bir plan sanıp gününü ona göre kuruyordu; üstelik program her gün
     * aynıydı ve içerikle hiçbir ilgisi yoktu.
     *
     * Çağıran bileşen (PremiumDailyProgram) `!r.ok` dalını zaten karşılıyor.
     */
    console.warn("Günlük program alınamadı — arka uç yok.");

    return NextResponse.json(
      { ok: false, reason: "backend-unavailable", locked: false, program: null },
      { status: 503 }
    );
  }
}