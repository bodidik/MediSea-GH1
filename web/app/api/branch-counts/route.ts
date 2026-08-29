// C:\Users\hucig\Medknowledge\web\app\api\branch-counts\route.ts
//
// Branş başına konu sayısı. Çalışma Alanım'daki kapsama görünümü buradan
// beslenir — o sayfa istemci bileşeni olduğu için dosya sistemine erişemez.
//
// Not: Buradaki veri herkese açık içerik sayımıdır, kullanıcıya özel bir şey
// içermez; oturum gerektirmez ve arka uca bağımlı değildir.

import { NextResponse } from "next/server";
import { getTopicCounts } from "@/app/lib/topic-counts";

/**
 * DERLEME ANINDA üretilir — `force-dynamic` yerine `force-static`.
 *
 * Burası `export const dynamic = "force-dynamic"` diyordu ve bu, hemen
 * üstteki notla çelişiyordu: not "herkese açık içerik sayımı, oturum
 * gerektirmez" diyor, direktif ise "hiç önbelleğe alma, her istekte yeniden
 * hesapla" diyordu.
 *
 * Bedeli ölçüldü (canlı, üç istek): 228 baytlık, herkeste AYNI olan bir yanıt
 * için üç istekte de `x-vercel-cache: MISS` ve 0.37–0.93 sn. Yani
 * `/calisma-alanim` ya da premium profil açan her ziyaretçi, dağıtımdan
 * dağıtıma değişmeyen bir sayı için bir sunucusuz çağrı harcıyordu.
 *
 * Kıyas aynı depoda duruyordu: `sitemap.xml` de dosya sisteminden türüyor,
 * o da herkese açık — ve PRERENDER → HIT. İki eş veri, iki ayrı muamele.
 *
 * Belgedeki karşı kural bilerek uygulandı: "hep MISS olan her rota bir
 * performans kusuru değildir; önce yanıtın KULLANICIYA ÖZEL olup olmadığına
 * bak." Bu yanıt kullanıcıya özel DEĞİL — ölçüldü: rota ne `auth()`, ne
 * `cookies()`, ne `headers()`, ne `searchParams` okuyor (`force-dynamic`
 * ilan eden üç rotadan gerekçesi bulunmayan tek rota buydu).
 *
 * İçerik yalnızca dağıtımda değiştiği için derleme anında üretmek doğru
 * olan; `getTopicCounts()` zaten süreç ömrü boyunca bir kez hesaplanıyor.
 *
 * ⚠ Direktifi SİLMEK yetmiyor — ölçüldü. Next 15'te GET rota işleyicileri
 * VARSAYILAN OLARAK önbelleğe alınmıyor; `force-dynamic` kaldırıldığında
 * rota tablosunda hâlâ `ƒ` çıkıyordu. Statik üretim açıkça istenmeli.
 */
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ counts: getTopicCounts() });
}
