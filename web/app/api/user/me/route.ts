// FILE: web/app/api/user/me/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const backend = backendBase();
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const externalId = m?.[1] || "guest";

  const url = new URL("/api/user/me", backend);
  url.searchParams.set("externalId", externalId);

  try {
    const r = await fetch(url.toString(), { cache: "no-store" });
    if (!r.ok) throw new Error(`Backend yanıt vermedi: ${r.status}`);
    
    const j = await r.json();
    return NextResponse.json(j, { status: r.status });
  } catch (error) {
    // 🚨 BACKEND KAPALIYSA: SAHTE KULLANICI DÖN Kİ ARAYÜZ (NAVBAR) ÇÖKMESİN
    console.warn("Backend'e ulaşılamadı. User Me yedek motoru devrede.");
    return NextResponse.json({
      ok: true,
      mock: true,
      user: { id: externalId, name: "Misafir Kaptan", plan: "P", role: "admin" }
    }, { status: 200 });
  }
}