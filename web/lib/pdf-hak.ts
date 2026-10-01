/**
 * Üyelerin günlük PDF indirme hakkı — TEK KAYNAK (sınır, gün, yol kuralı).
 *
 * Kullanıcı kararı (1 Eki 2026): üye günde 3 konu indirir, "şimdilik".
 * Sayaç SUNUCUDA, kullanıcı kaydında (`User.pdfIndirme`): tarayıcıda
 * tutulsaydı depoyu silen sınırı sıfırlardı.
 *
 * Aynı konuyu aynı gün yeniden indirmek hak YEMEZ — baskı penceresini
 * kapatıp yeniden açan, ayarı değiştiren kullanıcı cezalandırılmasın.
 *
 * Gün Türkiye saatiyle döner (sunucu UTC'de; UTC gece yarısı TR'de 03:00).
 */
export const GUNLUK_PDF_HAKKI = 3;

export function turkiyeGunu(an: Date = new Date()): string {
  // en-CA biçimi YYYY-MM-DD verir.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(an);
}

/** Yalnız açık konu sayfaları sayılır; başka dize kayda giremez. */
export function gecerliKonuYolu(yol: unknown): yol is string {
  return typeof yol === "string" && yol.length <= 300 && /^\/topics\/[^/?#]+\/[^/?#]+$/.test(yol);
}

export type HakDurumu = { izin: boolean; kalan: number; sinir: number };

/** Kayıttaki durumdan (gün eskiyse boş sayılır) bugünkü konuları çıkarır. */
export function bugunkuKonular(kayit: { gun?: string; konular?: string[] } | null | undefined, gun: string): string[] {
  return kayit && kayit.gun === gun && Array.isArray(kayit.konular) ? kayit.konular : [];
}
