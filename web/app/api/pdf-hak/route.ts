import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import User from "@/lib/models/User";
import { GUNLUK_PDF_HAKKI, turkiyeGunu, gecerliKonuYolu, bugunkuKonular } from "@/lib/pdf-hak";

/**
 * Günlük PDF hakkı (`lib/pdf-hak.ts`).
 *   GET  ?yol=…  → { kalan, sinir, buKonuAlindi }   (düğmenin yanında gösterilir)
 *   POST { yol } → { izin, kalan, sinir }           (baskı penceresinden ÖNCE)
 *
 * Veritabanına ulaşılamazsa 503 — hak SAYILAMIYORSA verilmez de; istemci
 * "denetlenemedi, tekrar dene" der. Sessizce izin vermek sınırı kozmetik yapardı.
 */
export const dynamic = "force-dynamic";

async function kimlik(): Promise<string | null> {
  const s = await auth();
  const id = (s?.user as { id?: unknown } | undefined)?.id;
  return typeof id === "string" ? id : null;
}

export async function GET(req: NextRequest) {
  const id = await kimlik();
  if (!id) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  const yol = req.nextUrl.searchParams.get("yol");
  try {
    await dbConnect();
    const k = await User.findById(id).select("pdfIndirme").lean();
    if (!k) return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });
    const konular = bugunkuKonular(k.pdfIndirme, turkiyeGunu());
    return NextResponse.json({
      kalan: Math.max(0, GUNLUK_PDF_HAKKI - konular.length),
      sinir: GUNLUK_PDF_HAKKI,
      buKonuAlindi: !!yol && konular.includes(yol),
    });
  } catch {
    return NextResponse.json({ error: "Hak denetlenemedi." }, { status: 503 });
  }
}

export async function POST(req: NextRequest) {
  const id = await kimlik();
  if (!id) return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  const govde = await req.json().catch(() => null);
  const yol = govde?.yol;
  if (!gecerliKonuYolu(yol)) return NextResponse.json({ error: "Geçersiz konu." }, { status: 400 });

  const gun = turkiyeGunu();
  try {
    await dbConnect();
    /* İki koşullu, ATOMİK güncelleme: aynı anda iki sekmeden basılsa da
       sınır aşılmaz. (1) gün değişmişse kaydı bu konuyla yeniden başlat;
       (2) bugünse ve 3. konu henüz yoksa ekle. İkisi de tutmazsa kaydı oku:
       ya konu zaten alınmış (izin, hak yemez) ya hak dolmuş. */
    const yeniGun = await User.updateOne(
      { _id: id, $or: [{ pdfIndirme: null }, { "pdfIndirme.gun": { $ne: gun } }] },
      { $set: { pdfIndirme: { gun, konular: [yol] } } }
    );
    if (yeniGun.modifiedCount === 0) {
      await User.updateOne(
        {
          _id: id,
          "pdfIndirme.gun": gun,
          "pdfIndirme.konular": { $ne: yol },
          [`pdfIndirme.konular.${GUNLUK_PDF_HAKKI - 1}`]: { $exists: false },
        },
        { $push: { "pdfIndirme.konular": yol } }
      );
    }
    const k = await User.findById(id).select("pdfIndirme").lean();
    if (!k) return NextResponse.json({ error: "Hesap bulunamadı." }, { status: 404 });
    const konular = bugunkuKonular(k.pdfIndirme, gun);
    const izin = konular.includes(yol);
    return NextResponse.json(
      { izin, kalan: Math.max(0, GUNLUK_PDF_HAKKI - konular.length), sinir: GUNLUK_PDF_HAKKI },
      { status: izin ? 200 : 429 }
    );
  } catch {
    return NextResponse.json({ error: "Hak denetlenemedi." }, { status: 503 });
  }
}
