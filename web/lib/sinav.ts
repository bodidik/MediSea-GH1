/**
 * Sınav takvimi — SAF mantık ve tipler.
 *
 * Bu dosyada bilerek `fs` YOK. Geri sayım bir istemci bileşeni ve buradan
 * evreBul'u çağırıyor; dosya sistemi içe aktarımı olsaydı modülün tamamı
 * istemci paketine girip "Module not found: Can't resolve 'fs'" ile
 * derlemeyi kırardı. Diskten okuma sinav.server.ts'te.
 *
 * YDUS yılda bir kez yapılıyor; "kaç gün kaldı" bilgisi platformun en güçlü
 * motive edici ögesi. Ama tarih uydurulamaz: yanlış tarihe göre program yapan
 * biri gerçekten zarar görür. Takvim boşsa arayüz hiçbir şey göstermez.
 */

export type Sinav = {
  ad: string;
  /** YYYY-AA-GG */
  tarih: string;
  not?: string;
};

/** Sınava kalan gün sayısına göre çalışma evresi. Paketleme de bu evrelere dayanıyor. */
export type Evre = "uzun" | "son100" | "son30" | "sonHafta" | "bugun";

export function evreBul(kalanGun: number): Evre {
  if (kalanGun <= 0) return "bugun";
  if (kalanGun <= 7) return "sonHafta";
  if (kalanGun <= 30) return "son30";
  if (kalanGun <= 100) return "son100";
  return "uzun";
}

export function gecerliTarihMi(s: unknown): s is string {
  return typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
}
