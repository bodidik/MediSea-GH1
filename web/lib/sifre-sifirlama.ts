import crypto from 'crypto';

/**
 * JETON ÜRETİMİ VE ÖZETİ — tek kaynak.
 *
 * İki uç (istek ve uygulama) aynı özet fonksiyonunu kullanmak ZORUNDA;
 * ayrı yazılsalar sessizce ayrışır ve hiçbir jeton doğrulanamazdı. Bu
 * deponun en çok tekrar eden kusur sınıfı (`kimlik.ts`teki not aynı sebeple
 * yazılmış).
 */

/** Ham jeton: 32 bayt rastgele, adres çubuğunda güvenli biçimde. */
export function jetonUret(): string {
  return crypto.randomBytes(32).toString('base64url');
}

/** Depoya YALNIZCA bu değer yazılır. */
export function jetonOzeti(ham: string): string {
  return crypto.createHash('sha256').update(ham).digest('hex');
}

/**
 * ÖMÜR — 60 dakika.
 *
 * Kısa tutmanın bedeli var (kullanıcı e-postayı geç açarsa yeniden ister),
 * uzun tutmanın bedeli daha ağır: posta kutusuna erişen biri için pencere
 * genişler. 60 dakika, "e-postayı şimdi açacağım" davranışını karşılayan en
 * dar aralık.
 */
export const JETON_OMRU_DK = 60;

/**
 * HIZ SINIRI — aynı hesap için 15 dakikada en çok 3 istek.
 *
 * BELLEKTE TUTULMUYOR: sunucusuz ortamda her örnek kendi sayacını tutardı ve
 * sınır fiilen örnek sayısıyla çarpılırdı. Bunun yerine son jetonların KENDİSİ
 * sayılıyor — durum zaten veritabanında ve örnekler arasında ortak.
 */
export const HIZ_PENCERESI_DK = 15;
export const HIZ_SINIRI = 3;
