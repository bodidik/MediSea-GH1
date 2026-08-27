/**
 * TARİH BASARKEN "Invalid Date" GÖSTERME.
 *
 * Ölçüldü (canlı): kullanıcı düzenlenmiş/bozuk bir yedek dosyası içe
 * aktardığında kuru prova paneli şunu basıyordu —
 *
 *   1 sayfa · 1 vurgu · 0 not · 0 çizgi · Invalid Date
 *   [BİRLEŞTİR]  [ÜZERİNE YAZ]
 *
 * Yani kullanıcının verisini SİLİP SİLMEYECEĞİNE karar verdiği panelde,
 * dosyanın ne zaman alındığını söyleyen alan çöp basıyordu.
 *
 * Var olan `tarih > 0` kapısı yetmiyor: `typeof "number"` olan ama Date
 * aralığının DIŞINDA kalan bir sayı (ör. 1e20) kapıdan geçiyor ve
 * `new Date(...)` "Invalid Date" veriyor. Kapı DEĞERE bakıyordu, sonucun
 * GEÇERLİ olup olmadığına değil.
 *
 * Aynı ilke deponun her yerinde yazılı: geçersiz bir değer basmaktansa
 * alanı hiç basmamak doğru (`isoTarih()` site haritasında, `sinav-takvimi`
 * boşken geri sayımı hiç çizmemesi, `GeriSayim`in `NaN >= 0` süzgeci).
 */

/**
 * Geçerli bir tarih üretmiyorsa `null` döner.
 *
 * Sayı (ms damgası) ya da dize kabul eder; ikisi de `Date` aralığında
 * olmalı. Sıfır ve negatif damgalar "hiç yazılmamış" sayılıyor — bu depoda
 * `at: 0` yokluk anlamına geliyor (`parseBackup` eksik alanı 0'a düşürüyor).
 */
export function gecerliTarih(deger: unknown): Date | null {
  if (typeof deger === "number") {
    if (!Number.isFinite(deger) || deger <= 0) return null;
  } else if (typeof deger === "string") {
    if (!deger.trim()) return null;
  } else {
    return null;
  }
  const d = new Date(deger as number | string);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Doğrudan basılabilir yerel tarih dizesi; geçersizse `null`.
 *
 * Çağıran `null` dalında alanı HİÇ basmamalı — boş bir tire ya da "—"
 * koymak da bir iddia olurdu ("tarih yok"), oysa gerçek olan "tarih
 * okunamadı".
 */
export function tarihYazisi(
  deger: unknown,
  secenekler?: Intl.DateTimeFormatOptions,
  saatDe = false,
): string | null {
  const d = gecerliTarih(deger);
  if (!d) return null;
  return saatDe ? d.toLocaleString("tr-TR", secenekler) : d.toLocaleDateString("tr-TR", secenekler);
}
