/**
 * `meta.parent` referansını gerçek dosya adına eşler.
 *
 * Neden gerekti: `asili-denetim.cjs` ölçümünde 46 asılı konudan biri
 * tamamen mekanikti — `akromegali-ve-gigantizm` ebeveynini
 * "Ön-hipofiz-hastaliklari-giris" diye yazmış, dosya ise
 * "on-hipofiz-hastaliklari-giris". Fark yalnızca büyük harf ve Ö.
 * Sonuç: konu hiyerarşiden düşüyor, ebeveyninin sayfasında görünmüyor,
 * "Diğer Konular" kovasına atılıyordu.
 *
 * İçeriği düzeltmek yerine OKUMA ADIMI onarıyor — bu projede aynı yaklaşım
 * ebeveyni bulunamayan konular ve listelenmemiş premium başlıklar için de
 * kullanılıyor (bkz. CLAUDE.md, "Kendini onaran okumalar"). İçerik düzelirse
 * bu eşleme kendiliğinden devre dışı kalır, hiçbir şey bozulmaz.
 *
 * Türkçe özellikle riskli: `I/İ/ı/i` çifti ve aksanlı harfler bu kod
 * tabanında daha önce de yanlış eşleşmelere yol açtı.
 */

/** Harf düzeni ve Türkçe aksan farkını yok sayan sadeleştirme. */
export function slugSadelestir(s: string): string {
  return String(s)
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .trim();
}

/**
 * Ham `parent` değerini, verilen slug kümesindeki gerçek adla eşler.
 *
 * Tam eşleşme varsa dokunmaz (hızlı yol). Yoksa sadeleştirilmiş biçimde
 * arar. Hiçbiri tutmuyorsa ham değeri aynen döndürür — böylece gerçekten
 * var olmayan bir ebeveyn hâlâ "Diğer Konular"a düşer ve
 * `asili-denetim.cjs` onu görmeye devam eder. Yani bu eşleme gerçek
 * eksikleri GİZLEMEZ, yalnızca yazım sapmasını onarır.
 */
export function ebeveyniCoz(ham: string | null | undefined, slugler: Iterable<string>): string | null {
  if (!ham) return null;
  const kume = slugler instanceof Set ? slugler : new Set(slugler);
  if (kume.has(ham)) return ham;

  const hedef = slugSadelestir(ham);
  for (const s of kume) {
    if (slugSadelestir(s) === hedef) return s;
  }
  return ham;
}
