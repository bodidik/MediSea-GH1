/**
 * "Bu e-posta yöneticiye mi ait?" — SAF kural, tek yerde.
 *
 * Neden `lib/yonetici.ts` içinde DEĞİL: orası `@/auth`'u içe aktarıyor ve o
 * modül mongoose/bcrypt taşıdığı için edge çalışma zamanında kullanılamıyor.
 * `middleware.ts` edge'de çalışıyor ve kuralın en geniş kapısı orada
 * (bütün /kayseritip alanı). Kuralı saf bir dosyaya almak, middleware'in de
 * aynı kaynağı kullanabilmesini sağlıyor.
 *
 * Kuralın kendisi: **ADMIN_EMAIL tanımlı değilse HERKES reddedilir.**
 * Elle yazılan `eposta === process.env.ADMIN_EMAIL` karşılaştırması, değişken
 * tanımsızken `undefined === undefined` olur ve OTURUMSUZ bir isteği yönetici
 * sayar. Yapılandırma eksikliği kapıyı açmamalı.
 */
export function yoneticiEpostasiMi(eposta?: string | null): boolean {
  const admin = process.env.ADMIN_EMAIL;
  return Boolean(eposta && admin && eposta === admin);
}
