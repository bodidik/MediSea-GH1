// FILE: web/app/api/review/answer/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backend = backendBase();
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const externalId = m?.[1] || "guest";

  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL("/api/review/answer", backend);
    url.searchParams.set("externalId", externalId);

    const r = await fetch(url.toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    if (!r.ok) throw new Error(`Backend yanıt vermedi: ${r.status}`);

    const j = await r.json();
    return NextResponse.json(j, { status: r.status });
    
  } catch {
    /**
     * Arka uç yok. "KAYDEDİLDİ" DENMİYOR.
     *
     * Burada  dönülüyordu — kullanıcıya işinin kaydedildiği
     * söyleniyor, oysa hiçbir yere hiçbir şey yazılmıyordu. Projenin kendi
     * kuralı bunu yasaklıyor: kaydetme hatası yutulmaz, "Kaydedildi" yazmak
     * kaydetmemekten beterdir.
     *
     * Yalan bir dönem çağıran tarafta  bayrağı kontrol edilerek
     * savuşturuluyordu; bu, garantiyi her yeni çağıranın aynı şeyi
     * hatırlamasına bağlar. Artık ucun kendisi dürüst.
     */
    console.warn("Tekrar cevabı kaydedilemedi — arka uç yok.");

    return NextResponse.json(
      { ok: false, reason: "backend-unavailable" },
      { status: 503 }
    );
  }
}