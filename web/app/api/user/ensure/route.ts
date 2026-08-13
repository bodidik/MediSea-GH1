// FILE: web/app/api/user/ensure/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backend = backendBase();
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const externalId = m?.[1] || "guest";

  const url = new URL("/api/user/ensure", backend);
  url.searchParams.set("externalId", externalId);
  url.searchParams.set("plan", "free");

  try {
    const r = await fetch(url.toString(), { method: "POST" });
    if (!r.ok) throw new Error(`Backend yanıt vermedi: ${r.status}`);
    
    const j = await r.json();
    return NextResponse.json(j, { status: r.status });
  } catch {
    // Uydurma bir onay dönülüyordu (ok:true, plan:"free"). Kayıt gerçekte
    // oluşmadığı hâlde "oluştu" demek, çağıranı yanlış varsayımla ilerletir.
    // plan:"free" görece zararsız görünse de yanıtın kendisi yalan.
    console.warn("Kullanıcı kaydı doğrulanamadı: arka uca ulaşılamıyor.");
    return NextResponse.json(
      { ok: false, reason: "backend-unavailable" },
      { status: 503 }
    );
  }
}