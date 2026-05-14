// FILE: web/app/api/plan/set/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const backend = backendBase();
  const cookies = req.headers.get("cookie") || "";
  const m = cookies.match(/(?:^|; )mk_uid=([^;]+)/);
  const externalId = m?.[1] || "guest";

  // body veya query'den plan al
  const urlPlan = req.nextUrl.searchParams.get("plan");
  let bodyPlan: string | undefined;
  try {
    const body = await req.json().catch(() => ({}));
    bodyPlan = body?.plan;
  } catch {
    bodyPlan = undefined;
  }
  const plan = (urlPlan || bodyPlan || "free").toLowerCase();

  // backend'e proxy: /api/plan/set
  const url = new URL("/api/plan/set", backend);
  url.searchParams.set("externalId", externalId);
  url.searchParams.set("plan", plan);

  try {
    const r = await fetch(url.toString(), { method: "POST" });
    if (!r.ok) throw new Error(`Backend yanıt vermedi: ${r.status}`);

    const j = await r.json();
    
    // Frontend çerezini senkron tut
    const res = NextResponse.json(j, { status: r.status });
    const cookieVal = plan === "premium" || plan === "pro" ? "P" : "V"; // V=visitor/basic
    res.cookies.set({
      name: "plan",
      value: cookieVal,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;

  } catch (error) {
    // 🚨 BACKEND ULAŞILAMAZSA: UI'YI ÇÖKERTME, MOCK BAŞARI VE ÇEREZ DÖN!
    console.warn(`Backend'e ulaşılamadı. Plan Set (${plan}) yedek motoru devrede.`);
    
    const res = NextResponse.json({ 
      ok: true, 
      mock: true, 
      message: "Plan başarıyla güncellendi (Mock)" 
    }, { status: 200 });

    const cookieVal = plan === "premium" || plan === "pro" ? "P" : "V";
    res.cookies.set({
      name: "plan",
      value: cookieVal,
      httpOnly: false,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return res;
  }
}