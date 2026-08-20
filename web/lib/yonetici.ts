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
 * Aynı kuralın SENKRON hâli: elinde zaten bir e-posta varken kullanılır
 * (düzen dosyaları, oturumu kendisi okuyan uçlar).
 *
 * Neden ayrı bir yardımcı gerekti: yedi yer kontrolü elle tekrarlıyordu ve
 * hiçbirinde `ADMIN_EMAIL` VAR MI kontrolü yoktu:
 *
 *     session?.user?.email === process.env.ADMIN_EMAIL
 *
 * Değişken tanımsızsa bu ifade `undefined === undefined` olur, yani OTURUMSUZ
 * bir istek yönetici sayılır. Ölçüldü — canlıda değişken tanımlı olduğu için
 * açık şu an aktif DEĞİL (dört uç da 403 dönüyor); risk gizil ve bir
 * yapılandırma kazasıyla açılır.
 */
export function yoneticiEpostasiMi(eposta?: string | null): boolean {
  const admin = process.env.ADMIN_EMAIL;
  return Boolean(eposta && admin && eposta === admin);
}
