import { NextRequest, NextResponse } from "next/server";
import { backendBase } from "@/lib/backend";

export async function GET(req: NextRequest) {
  try {
    const backend = backendBase();
    const url = new URL("/api/protected/token", backend);
    const xff = req.headers.get("x-forwarded-for") || "";

    const r = await fetch(url.toString(), {
      headers: { "x-forwarded-for": xff } as any,
      cache: "no-store",
    });

    if (!r.ok) return NextResponse.json({ ok: false, status: r.status }, { status: r.status });
    const data = await r.json();
    return NextResponse.json(data, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}
