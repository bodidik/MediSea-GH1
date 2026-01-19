// FILE: web/app/api/topics/[slug]/route.ts
import { backendBase } from "@/lib/backend";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  ctx: Promise<{ params: { slug: string } }>
) {
  const { params } = await ctx; // <-- kritik
  const backend = backendBase();

  const slug = String(params.slug || "").trim();
  const url = new URL(`/api/topics/${encodeURIComponent(slug)}`, backend);

  const r = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });

  const body = await r.text();
  return new Response(body, {
    status: r.status,
    headers: { "Content-Type": "application/json" },
  });
}
