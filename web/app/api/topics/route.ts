// FILE: web/app/api/topics/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const backend = backendBase();
  const url = new URL("/api/topics", backend);

  // Query params aynen geçir (section/lang/q/page/limit/sort)
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  // Liste için makul ISR: 5 dk
  const r = await fetch(url.toString(), {
    next: { revalidate: 300 },
    // cache modu fetch'te otomatik yönetilir; next.revalidate yeterli
  });

  const body = await r.text();
  return new Response(body, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
