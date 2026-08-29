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

/**
 * AY KESİNLİĞİNDEKİ tarih için: `"2026-07"` → `"Tem 2026"`; geçersizse `null`.
 *
 * Neden ayrı bir fonksiyon: premium konu künyesi tarihi AY kesinliğinde
 * tutuyor (`meta.guncelleme: "2026-07"`, 41 dosyanın 41'inde). Bunu
 * `tarihYazisi` ile basmak GÜN uydururdu — `new Date("2026-07")` ayın
 * birine çözülüyor ve ekranda "01 Tem 2026" çıkardı. Veride olmayan bir
 * kesinliği ekrana yazmak, bu depoda tekrar tekrar avlanan "uydurma değer"
 * sınıfının ta kendisi olurdu.
 *
 * Gün ORTASI seçiliyor (`15`, saat 12): ayın birinde ve UTC ayrıştırmasında
 * saat dilimi kayması bir önceki aya düşürebiliyor. Açık taraf da aynı
 * korumayı kullanıyor (`${iso}T12:00:00`).
 *
 * `\d{4}-\d{2}` dışındaki her şey `null` — çağıran o dalda alanı HİÇ
 * basmamalı (modülün başındaki kural).
 */
export function ayYazisi(deger: unknown): string | null {
  if (typeof deger !== "string") return null;
  const m = deger.trim().match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
  if (!m) return null;
  const yil = Number(m[1]);
  const ay = Number(m[2]);
  if (!yil || ay < 1 || ay > 12) return null;
  const d = new Date(yil, ay - 1, 15, 12, 0, 0);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("tr-TR", { month: "short", year: "numeric" });
}
