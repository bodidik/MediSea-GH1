import { NextRequest, NextResponse } from "next/server";
import { backendBase } from "@/lib/backend";

import { cookies } from "next/headers";

/**
 * Proxy: /api/questions  â†’  BACKEND:/api/questions
 * Ã–rnek: /api/questions?module=nefroloji&limit=5
 */
export async function GET(req: NextRequest) {
  try {
const backend = backendBase();
    const inUrl = new URL(req.url);
    // Backend URLâ€™sini hazÄ±rlayalÄ±m
    const outUrl = new URL(backend + "/api/questions");
    // Ä°zin verdiÄŸimiz query parametreleri (gerektikÃ§e ekleyebilirsin)
    const passthroughParams = [
      "module",       // bizim FEâ€™de kullandÄ±ÄŸÄ±mÄ±z isim
      "section",      // BE "section" bekliyorsa
      "limit",
      "offset",
      "planLevel",    // V/M/P override iÃ§in testlerde iÅŸe yarar
      "seed",         // randomizasyon varsa
      "lang",         // TR/EN
    ] as const;
    for (const key of passthroughParams) {
      const v = inUrl.searchParams.get(key);
      if (v !== null) outUrl.searchParams.set(key, v);
    }
    // module aliasâ€™Ä±nÄ± sectionâ€™a da yansÄ±t (BE section beklerse)
    if (inUrl.searchParams.has("module") && !inUrl.searchParams.has("section")) {
      outUrl.searchParams.set("section", String(inUrl.searchParams.get("module")));
    }
    // KullanÄ±cÄ± ve plan bilgisi (cookie â†’ backend)
    const jar = await cookies();
    const mkUid = jar.get("mk_uid")?.value || "guest";
    outUrl.searchParams.set("externalId", mkUid);
    const planCookie = jar.get("mk_plan")?.value?.toUpperCase();
    const headers = new Headers();
    if (planCookie && ["V", "M", "P"].includes(planCookie)) {
      headers.set("x-plan", planCookie);
    }
    // Backendâ€™e isteÄŸi ilet
    const res = await fetch(outUrl.toString(), {
      headers,
      cache: "no-store",
      // timeout/cors vs. gerekirse buraya eklenir
    });
    // Backend ne dÃ¶ndÃ¼rdÃ¼yse onu iletelim
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": res.headers.get("content-type") || "application/json" },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err?.message || "proxy_failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}







