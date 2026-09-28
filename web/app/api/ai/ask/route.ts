// FILE: web/app/api/ai/ask/route.ts
import { NextRequest, NextResponse } from "next/server";
import { backendBase } from "@/lib/backend";
import { buildTopicContext } from "@/lib/aiContext";
import { auth } from "@/auth";
import { checkTopicAccess } from "@/lib/access";

export const runtime = "nodejs";

/**
 * ÖDEME DUVARI BURADA DA GEÇERLİ — ölçüldü (28 Eyl): bu uç erişimi HİÇ
 * denetlemiyordu. Bağlam premium konu dosyasının metni (14.000 karaktere
 * kadar); oturumsuz biri doğrudan POST atıp "bu konunun metnini aynen yaz"
 * diyerek ücretli içeriği yapay zekâ üzerinden alabiliyordu. Konu sayfasının
 * kullandığı kapı (`checkTopicAccess`) burada da çağrılıyor.
 */
const ERISIM_MESAJI: Record<string, { status: number; message: string }> = {
  "need-login": { status: 401, message: "Soru sormak için giriş yapmalısın." },
  "need-member": { status: 403, message: "Bu konuya soru sormak için üyelik gerekiyor." },
  "need-premium": { status: 403, message: "Bu konuya soru sormak için Premium gerekiyor." },
  unavailable: { status: 503, message: "Erişim şu an doğrulanamıyor. Lütfen daha sonra tekrar deneyin." },
};

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

  const erisim = await checkTopicAccess(topic);
  if (erisim !== "ok") {
    const e = ERISIM_MESAJI[erisim] ?? ERISIM_MESAJI.unavailable;
    return NextResponse.json({ ok: false, error: erisim, message: e.message }, { status: e.status });
  }

  // Konu içeriğini + ek kaynağı dosyadan oku, bağlamı kur
  const ctx = buildTopicContext(branch, topic);
  if (!ctx) {
    return NextResponse.json({ ok: false, error: "konu_bulunamadi" }, { status: 404 });
  }

  /**
   * KİMLİK OTURUMDAN — eskiden `mk_uid` çerezinden okunuyordu. Ölçüldü: web
   * uygulamasında o çerezi YAZAN hiçbir kod yok (eski arka uç girişinden
   * kalma), yani oturum açmış premium üye de misafir sayılıyor ve günde 3
   * soruyla sınırlanıyordu; çerezi elle yazan da kimlik uydurabiliyordu.
   * Misafir yolu yalnız erişim kapısının oturumsuz izin verdiği (V düzeyi)
   * konular için kalıyor.
   */
  let oturum = null;
  try {
    oturum = await auth();
  } catch {
    oturum = null;
  }
  const kullanici = oturum?.user as { id?: string; plan?: string } | undefined;
  const uid = typeof kullanici?.id === "string" && kullanici.id ? kullanici.id : null;

  const cookies = req.headers.get("cookie") || "";
  let aid = cookies.match(/(?:^|; )mk_aid=([^;]+)/)?.[1];
  const isGuest = !uid;
  let setAnonCookie = false;
  if (isGuest && !aid) {
    aid = "anon_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    setAnonCookie = true;
  }
  const externalId = uid ? `oturum:${uid}` : aid!;

  // Arka uç ortak sırrı — tanımlıysa arka uç sırsız isteği reddeder
  // (server/controllers/aiController.js). Tarayıcıya gitmez: NEXT_PUBLIC_ değil.
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (process.env.AI_ICERI_ANAHTARI) headers["x-medisea-iceri"] = process.env.AI_ICERI_ANAHTARI;

  // Backend'e ilet (kredi + AI orada)
  try {
    const r = await fetch(new URL("/api/ai/ask", backendBase()).toString(), {
      method: "POST",
      headers,
      cache: "no-store",
      body: JSON.stringify({
        externalId,
        isGuest,
        // Plan yalnız ortak sır doğrulanınca arka uçta dikkate alınır.
        plan: uid ? kullanici?.plan ?? "free" : undefined,
        question,
        context: ctx.context,
        baslik: ctx.baslik,
      }),
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
      /**
       * Bu `message` doğrudan KULLANICIYA basılıyor (SoruSor bileşeni).
       * Eskiden "AI sunucusuna ulaşılamadı. Backend çalışıyor mu?" yazıyordu —
       * ücretli bir yüzeyde müşteriye, sunucunun çalışıp çalışmadığını soran
       * bir geliştirici mesajı. Sistem iç adları kullanıcıya gösterilmez.
       */
      {
        ok: false,
        error: "backend_ulasilamadi",
        message: "Yapay zekâ yanıtı şu an alınamıyor. Lütfen daha sonra tekrar deneyin.",
      },
      { status: 503 }
    );
  }
}
