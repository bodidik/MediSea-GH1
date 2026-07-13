// FILE: web/app/api/ai/ask/route.ts
import { NextRequest, NextResponse } from "next/server";
import { backendBase } from "@/lib/backend";
import { buildTopicContext } from "@/lib/aiContext";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  let body: { branch?: string; topic?: string; question?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "gecersiz_istek" }, { status: 400 });
  }

  const branch = String(body.branch || "").trim();
  const topic = String(body.topic || "").trim();
  const question = String(body.question || "").trim();

  if (!branch || !topic || !question) {
    return NextResponse.json({ ok: false, error: "eksik_parametre" }, { status: 400 });
  }
  if (question.length > 800) {
    return NextResponse.json({ ok: false, error: "soru_cok_uzun" }, { status: 400 });
  }

  // Konu içeriğini + ek kaynağı dosyadan oku, bağlamı kur
  const ctx = buildTopicContext(branch, topic);
  if (!ctx) {
    return NextResponse.json({ ok: false, error: "konu_bulunamadi" }, { status: 404 });
  }

  // Kimlik: üye ise mk_uid, değilse kalıcı misafir çerezi mk_aid
  const cookies = req.headers.get("cookie") || "";
  const uid = cookies.match(/(?:^|; )mk_uid=([^;]+)/)?.[1];
  let aid = cookies.match(/(?:^|; )mk_aid=([^;]+)/)?.[1];

  const isGuest = !uid;
  let setAnonCookie = false;
  if (isGuest && !aid) {
    aid = "anon_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    setAnonCookie = true;
  }
  const externalId = uid || aid!;

  // Backend'e ilet (kredi + AI orada)
  try {
    const r = await fetch(new URL("/api/ai/ask", backendBase()).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ externalId, isGuest, question, context: ctx.context, baslik: ctx.baslik }),
    });
    const j = await r.json().catch(() => ({ ok: false, error: "gecersiz_yanit" }));
    const res = NextResponse.json(j, { status: r.status });
    if (setAnonCookie) {
      res.cookies.set("mk_aid", aid!, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return res;
  } catch {
    return NextResponse.json(
      { ok: false, error: "backend_ulasilamadi", message: "AI sunucusuna ulaşılamadı. Backend çalışıyor mu?" },
      { status: 503 }
    );
  }
}
