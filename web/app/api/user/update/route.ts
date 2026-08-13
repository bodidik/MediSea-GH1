// FILE: web/app/api/user/update/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backend = backendBase();
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const externalId = m?.[1] || "guest";

  try {
    const body = await req.json().catch(() => ({} as any));
    const url = new URL("/api/user/ensure", backend);
    url.searchParams.set("externalId", externalId);
    if (body?.name)  url.searchParams.set("name", body.name);
    if (body?.email) url.searchParams.set("email", body.email);

    const r = await fetch(url.toString(), { method: "POST" });
    if (!r.ok) throw new Error(`Backend yanıt vermedi: ${r.status}`);
    
    const j = await r.json();
    return NextResponse.json(j, { status: r.status });
  } catch (error) {
    console.warn("Backend'e ulaşılamadı. User Update yedek motoru devrede.");
    // "Güncellendi" deniyordu ama hiçbir şey güncellenmemişti. Yapılmamış bir
    // yazmayı yapılmış göstermek, sessiz veri kaybının tarifidir: kullanıcı
    // kaydettiğini sanar, veri hiçbir yere gitmez.
    return NextResponse.json(
      { ok: false, reason: "backend-unavailable" },
      { status: 503 }
    );
  }
}