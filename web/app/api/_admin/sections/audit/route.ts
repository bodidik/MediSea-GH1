// FILE: web/app/api/_admin/sections/audit/route.ts   — alt çizgili klasör: ROTAYA ALINMIYOR
import { backendBase } from "@/lib/backend";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
const backend = backendBase();
  const inUrl = new URL(req.url);
  const url = new URL("/api/admin/sections/audit", backend);
  const models = inUrl.searchParams.get("models") || "videos,notes";
  const limit = inUrl.searchParams.get("limit") || "5000";
  url.searchParams.set("models", models);
  url.searchParams.set("limit", limit);
  const r = await fetch(url.toString(), { cache: "no-store" });
  const j = await r.json();
  return new Response(JSON.stringify(j), { headers: { "Content-Type": "application/json" } });
}






