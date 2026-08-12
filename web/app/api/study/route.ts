// C:\Users\hucig\Medknowledge\web\app\api\study\route.ts
//
// Kullanıcının çalışma verisinin sunucu tarafı: vurgular, notlar, çizimler,
// tekrar takvimi ve türetilmiş sayaçlar.
//
// Tasarım kuralları:
//
// 1) KİMLİK OTURUMDAN GELİR. İstemcinin gönderdiği hiçbir kullanıcı kimliğine
//    güvenilmez. Eski Express ucu `mk_uid` çerezini ya da ?userId= sorgusunu
//    kabul ediyordu; bu hem oturumla ilişkisizdi hem de başkasının verisini
//    okumaya açıktı.
//
// 2) SENKRON BİR İYİLEŞTİRMEDİR, BAĞIMLILIK DEĞİL. Oturum yoksa 401 döner ve
//    istemci yereldeki çalışmasına devam eder. Bu uç çökse bile kullanıcı not
//    almaya ve vurgulamaya devam edebilmeli.
//
// 3) SAHTE VERİ YOK. Arka uç ulaşılamazsa hata döner; "mock" başarı dönmez.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import StudyStat from "@/lib/models/StudyStat";

export const dynamic = "force-dynamic";

/** Mongo belge sınırı 16 MB. El çizimleri büyüyebildiği için güvenli tavan. */
const MAX_PAYLOAD_BYTES = 8 * 1024 * 1024;

/** Sayaçlar istemciden geliyor ama körlemesine yazılmıyor: tip ve sınır kontrolü. */
function sayi(v: unknown): number {
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.floor(n), 1_000_000);
}

async function oturumKullanicisi() {
  const session = await auth();
  const id = (session?.user as any)?.id;
  return typeof id === "string" && id ? id : null;
}

/* ── Oku ─────────────────────────────────────────────────────────────────
   Yeni cihazda açılışta çağrılır: kullanıcının çalışması geri gelir. */
export async function GET() {
  const userId = await oturumKullanicisi();
  if (!userId) {
    return NextResponse.json({ ok: false, reason: "auth" }, { status: 401 });
  }

  try {
    await dbConnect();
    const doc = await StudyStat.findOne({ userId }).lean();
    return NextResponse.json({
      ok: true,
      stat: doc
        ? {
            marks: doc.marks,
            notes: doc.notes,
            strokes: doc.strokes,
            cards: doc.cards,
            due: doc.due,
            streak: doc.streak,
            pages: doc.pages,
            studiedAt: doc.studiedAt ?? null,
            updatedAt: (doc as any).updatedAt ?? null,
          }
        : null,
      payload: doc?.payload ?? null,
    });
  } catch (e) {
    // Sessizce "boş veri" dönmek, kullanıcının çalışması silinmiş gibi
    // görünmesine yol açardı. Hata hata olarak bildirilir.
    console.error("[api/study] okuma başarısız:", e);
    return NextResponse.json({ ok: false, reason: "db" }, { status: 503 });
  }
}

/* ── Yaz ─────────────────────────────────────────────────────────────────
   İstemci çalışma verisi değiştikçe (gecikmeli) çağırır. */
export async function PUT(req: NextRequest) {
  const userId = await oturumKullanicisi();
  if (!userId) {
    return NextResponse.json({ ok: false, reason: "auth" }, { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "json" }, { status: 400 });
  }

  const payload = body?.payload ?? null;
  const payloadBytes = payload ? Buffer.byteLength(JSON.stringify(payload), "utf8") : 0;

  if (payloadBytes > MAX_PAYLOAD_BYTES) {
    // Kırpıp kaydetmek sessiz veri kaybı olurdu; reddedip sebebini söylüyoruz.
    return NextResponse.json(
      { ok: false, reason: "too_large", bytes: payloadBytes, limit: MAX_PAYLOAD_BYTES },
      { status: 413 }
    );
  }

  try {
    await dbConnect();
    await StudyStat.findOneAndUpdate(
      { userId },
      {
        $set: {
          marks: sayi(body?.marks),
          notes: sayi(body?.notes),
          strokes: sayi(body?.strokes),
          cards: sayi(body?.cards),
          due: sayi(body?.due),
          streak: sayi(body?.streak),
          pages: sayi(body?.pages),
          studiedAt: new Date(),
          payload,
          payloadBytes,
        },
      },
      { upsert: true, new: true }
    );
    return NextResponse.json({ ok: true, bytes: payloadBytes });
  } catch (e) {
    console.error("[api/study] yazma başarısız:", e);
    return NextResponse.json({ ok: false, reason: "db" }, { status: 503 });
  }
}
