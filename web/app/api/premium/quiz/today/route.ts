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

  } catch {
    /**
     * Arka uç yok. UYDURMA SORU SETİ DÖNÜLMÜYOR.
     *
     * Burada `setId: "mock-today-set-001"` ve iki sahte soru dönülüyordu.
     * Var olmayan bir set kimliği, onu açmaya çalışan her akışı sessizce
     * kırar; kullanıcı da "günlük quiz" diye gerçek olmayan bir göreve
     * bakar.
     */
    console.warn("Günlük quiz alınamadı — arka uç yok.");

    return NextResponse.json(
      { ok: false, reason: "backend-unavailable", locked: false, setId: null, items: [] },
      { status: 503 }
    );
  }
}