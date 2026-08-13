import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * "Bu oturum yönetici mi?" — tek soruya tek cevap.
 *
 * Yönetici kontrolü ADMIN_EMAIL ile yapılıyor ve bu bir sunucu sırrı; istemci
 * karşılaştırmayı kendi yapamaz. Konu sayfasındaki düzenleyicinin yalnızca
 * yöneticiye görünmesi için istemcinin sorabileceği bir uç gerekiyordu.
 *
 * Veritabanına dokunmuyor: yalnızca oturum ve ortam değişkeni. Böylece
 * veritabanı erişilemez olsa bile sayfa çalışmayı sürdürüyor.
 */
export async function GET() {
  try {
    const session = await auth();
    const eposta = session?.user?.email;
    const admin = !!eposta && !!process.env.ADMIN_EMAIL && eposta === process.env.ADMIN_EMAIL;
    return NextResponse.json({ admin });
  } catch {
    // Oturum okunamadıysa yönetici DEĞİL say — kapalı tarafa düş.
    return NextResponse.json({ admin: false });
  }
}
