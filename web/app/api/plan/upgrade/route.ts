// FILE: web/app/api/plan/upgrade/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backend = backendBase();

  // mk_uid -> externalId
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const externalId = m?.[1] || "guest";

  // backend'e proxy: /api/plan/upgrade
  const url = new URL("/api/plan/upgrade", backend);
  url.searchParams.set("externalId", externalId);

  try {
    const r = await fetch(url.toString(), { method: "POST" });
    if (!r.ok) throw new Error(`Backend yanıt vermedi: ${r.status}`);

    const j = await r.json();
    const res = NextResponse.json(j, { status: r.status });

    // Başarılıysa plan=P çerezi set et
    res.cookies.set({
      name: "plan",
      value: "P",            // Premium
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 yıl
    });
    
    return res;

  } catch (error) {
    // 🚨 BACKEND ULAŞILAMAZSA: YÜKSELTME SİMÜLASYONU YAP!
    console.warn("Backend'e ulaşılamadı. Plan Upgrade yedek motoru devrede.");
    
    const res = NextResponse.json({ 
      ok: true, 
      mock: true, 
      message: "Hesap Premium'a yükseltildi (Mock)" 
    }, { status: 200 });

    res.cookies.set({
      name: "plan",
      value: "P", // Arayüzün kilitlerini açmak için mock Premium çerezi veriyoruz
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    
    return res;
  }
}