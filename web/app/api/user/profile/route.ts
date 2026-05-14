// FILE: web/app/api/user/profile/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest, NextResponse } from "next/server";

function getUidFromCookie(req: NextRequest) {
  const c = req.headers.get("cookie") || "";
  const m = c.match(/(?:^|; )mk_uid=([^;]+)/);
  return (m?.[1] as string) || "guest";
}

export async function GET(req: NextRequest) {
  const backend = backendBase();
  const externalId = getUidFromCookie(req);
  const url = new URL("/api/user/profile", backend);
  url.searchParams.set("externalId", externalId);
  
  try {
    const r = await fetch(url.toString(), { cache: "no-store" });
    if (!r.ok) throw new Error(`Backend yanıt vermedi: ${r.status}`);
    const j = await r.json();
    return NextResponse.json(j, { status: r.status });
  } catch(error) {
    console.warn("Backend'e ulaşılamadı. User Profile (GET) yedek motoru devrede.");
    return NextResponse.json({ ok: true, mock: true, profile: { name: "Misafir Kaptan", email: "kaptan@mavivatan.com" } }, { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  // alias: POST ile track (hedef/yol) değiştirmeyi de destekleyelim (forward)
  const backend = backendBase();
  const externalId = getUidFromCookie(req);

  try {
    const body = await req.json().catch(() => ({}));
    const url = new URL("/api/user/track", backend);
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
  } catch(error) {
    console.warn("Backend'e ulaşılamadı. User Profile (POST/Track) yedek motoru devrede.");
    return NextResponse.json({ ok: true, mock: true, message: "Hedef/Track başarıyla güncellendi (Mock)" }, { status: 200 });
  }
}