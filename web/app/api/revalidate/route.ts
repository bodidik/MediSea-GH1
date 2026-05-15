// C:\Users\hucig\Medknowledge\web\app\api\revalidate\route.ts
import { NextRequest, NextResponse } from "next/server";
// İŞTE BÜYÜ BURADA: Next.js'in resmi önbellek (cache) temizleyicilerini doğrudan içe aktarıyoruz!
import { revalidatePath, revalidateTag } from "next/cache";

export async function POST(req: NextRequest) {
  // 1) Token: Bearer / ?secret= / x-revalidate-token
  const auth = req.headers.get("authorization") || "";
  const bearer = auth.replace(/^Bearer\s+/i, "").trim();
  const qs = req.nextUrl.searchParams.get("secret") || "";
  const alt = req.headers.get("x-revalidate-token") || "";
  const token = bearer || qs || alt;

  // Güvenlik Kontrolü
  if (!process.env.REVALIDATE_SECRET || token !== process.env.REVALIDATE_SECRET) {
    console.warn("Revalidate yetkisiz erişim denemesi reddedildi.");
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  // 2) Body: { paths?: string[], tags?: string[] }
  let body: { paths?: string[]; tags?: string[] } = {};
  try { 
    body = await req.json(); 
  } catch {
    // Body yoksa veya bozuksa boş obje ile devam et (Sistem çökmesin)
  }

  const paths = Array.isArray(body.paths) ? body.paths : [];
  const tags  = Array.isArray(body.tags)  ? body.tags  : [];

  // 3) Revalidate (Önbellek Temizleme İşlemi)
  try {
    // Next.js revalidatePath ve revalidateTag fonksiyonları senkrondur, promise array'e gerek yoktur.
    // Döngü ile hepsini resmi fonksiyonlara gönderiyoruz.
    for (const p of paths) {
      revalidatePath(p);
    }
    
    for (const t of tags) {
      revalidateTag(t);
    }

    console.log(`[Cache Temizlendi] Paths: ${paths.length}, Tags: ${tags.length}`);
    return NextResponse.json({ ok: true, paths, tags, message: "Önbellek başarıyla temizlendi." });
    
  } catch (err: any) {
    console.error("Revalidate sırasında hata:", err);
    return NextResponse.json({ ok: false, error: String(err?.message || err) }, { status: 500 });
  }
}