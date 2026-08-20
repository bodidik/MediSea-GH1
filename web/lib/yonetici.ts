import "server-only";
import { auth } from "@/auth";

/**
 * "Bu istek yönetici mi?" — tek yerde.
 *
 * Neden gerekti: içerik yazan iki uç (`/api/topics` ve `/api/topics/[slug]`
 * PUT) hiçbir yetki kontrolü taşımıyordu. Ölçüldü — yetkisiz bir PUT
 * işleyiciye ulaşıp 401 yerine içerik düzeyinde 404 dönüyordu, yani geçerli
 * bir slug verilse yazmaya devam edecekti. Bu uçlar
 * `content/canonical/<branş>/<konu>.json` dosyasına DOĞRUDAN yazıyor.
 *
 * Kontrol beş ayrı uçta elle tekrarlanıyordu (`session?.user?.email ===
 * process.env.ADMIN_EMAIL`). Tekrarlanan bir güvenlik kontrolü, bir yerde
 * unutulduğunda sessizce açık bırakır — nitekim öyle olmuş.
 *
 * ADMIN_EMAIL tanımlı değilse HERKES reddedilir: yapılandırma eksikliği
 * kapıyı açmamalı.
 */
export async function yoneticiMi(): Promise<boolean> {
  try {
    const session = await auth();
    const eposta = session?.user?.email;
    const admin = process.env.ADMIN_EMAIL;
    return Boolean(eposta && admin && eposta === admin);
  } catch {
    // Oturum okunamadıysa yönetici DEĞİL say — kapalı tarafa düş.
    return false;
  }
}

/** Yetkisiz isteğe verilecek ortak yanıt. */
export function yetkisizYanit() {
  return Response.json(
    { ok: false, error: "Bu işlem için yönetici yetkisi gerekiyor." },
    { status: 401 }
  );
}

/**
 * Aynı kuralın SENKRON hâli, elinde zaten e-posta varken kullanılır.
 * Tanımı `lib/yonetici-eposta.ts` içinde: middleware edge'de çalıştığı ve
 * bu dosya `@/auth` (mongoose/bcrypt) taşıdığı için kural saf bir modülde
 * durmak zorunda. Buradan yeniden dışa aktarılıyor ki çağrı yerleri
 * değişmesin.
 */
export { yoneticiEpostasiMi } from "./yonetici-eposta";
