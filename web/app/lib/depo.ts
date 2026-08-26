/**
 * BOZUK DEPO KAYDINI KURTARMA — tek kaynak.
 *
 * Kalıp şuydu ve ÜÇ depoda birden ölçüldü: okuyucu `JSON.parse` hatasını
 * yutup nötr bir değer (`{}` / `[]` / `""`) döndürüyor, kullanıcıya HİÇBİR
 * ŞEY söylenmiyor, ve kullanıcı o yüzeyde bir şey yaptığı anda kaydetme
 * bozuk kaydın ÜZERİNE yazıyor — veri kalıcı gidiyor.
 *
 * Ölçüldü (bozuk kayıt tohumlanıp gerçek arayüzle sürülerek):
 *
 *   not defteri  : boş kutu açılıyor, `role=alert` 0; kullanıcı "burada notum
 *                  yok" sanıp yazınca ELLE YAZDIĞI eski not gidiyor
 *   tekrar takvimi: `/tekrar` ZİYARETİ bozmuyor (prune boş kümede yazmıyor),
 *                  ama ilk derecelendirmede SM-2 geçmişi gidiyor
 *   çalışma günlüğü: aynı derecelendirmede gidiyor
 *
 * Çare deponun kendi emsali: `UserContext` bozuk kaydı `…_bozuk` anahtarına
 * TAŞIYIP normale devam ediyor ve belgede "sınıf kapalı" diye kayıtlı.
 *
 * NEDEN `:bozuk` SON EKİ GÜVENLİ (ölçüldü, varsayılmadı):
 *   - `collectAll` önek taraması yedeği bir YOL sanıyor, ama içeriği tanım
 *     gereği ayrıştırılamaz olduğu için kayıt boş kalıyor ve eleniyor —
 *     Çalışma Alanım'da hayalet kart ÇIKMIYOR.
 *   - `readAll` (dışa aktarım) `json<T>` ile okuyor, bozuk değer `null`
 *     dönüyor ve `if (Array.isArray(v) && v.length)` süzgecinden düşüyor —
 *     yedek dosyasına SIZMIYOR.
 *   - "üzerine yaz" kipi önekle sildiği için yedekler de temizleniyor;
 *     kullanıcı o kipi bilerek seçiyor.
 */
/** Yedek anahtarının son eki. Dışa aktarılıyor: tarayıcı yapan her yer aynı ölçütü kullanmalı. */
export const BOZUK_EK = ":bozuk";

export function bozukKaydiTasi(anahtar: string, ham: string | null): void {
  if (!ham) return;
  /**
   * YEDEĞİN YEDEĞİ OLMAZ. Ölçüldü: `collectAll` önek taraması
   * `<önek><yol>:bozuk` anahtarını bir YOL sanıyor ve güvenli okuyucuya
   * geçtikten sonra onu da taşımaya kalkıyordu — anahtar her ziyarette
   * `:bozuk:bozuk:bozuk` diye uzuyor ve sayaç şişiyordu.
   */
  if (anahtar.endsWith(BOZUK_EK)) return;
  try {
    localStorage.setItem(anahtar + ":bozuk", ham);
    localStorage.removeItem(anahtar);
    kurtarilan.add(anahtar);
  } catch {
    /**
     * Yedekleyemedik (kota dolu ya da depo engelli). Ham kayda DOKUNMA —
     * en kötü ihtimalle eski davranışa dönülür, ama elimizdeki tek kopyayı
     * yedeksiz silmiş olmayız.
     */
  }
}

/**
 * Depodan bir kaydı okur; ayrıştırılamıyorsa YA DA beklenen şekli
 * taşımıyorsa yedeğe taşıyıp `null` döner.
 *
 * ŞEKİL DENETİMİ ŞART: "geçerli JSON ama yanlış şekil" de aynı sınıftandır.
 * Bu depoda ölçülmüş örneği var — `strokes` alanına bir DİZE düştüğünde
 * `.length` karakter sayısını verip "10 çizgi" gibi uydurma bir sayı
 * üretiyordu. Yalnızca `JSON.parse` hatasına bakan bir kurtarma o kaydı
 * yine sessizce sildirir.
 */
export function guvenliOku<T>(anahtar: string, sekilTamam: (v: unknown) => v is T): T | null {
  let ham: string | null = null;
  try {
    ham = localStorage.getItem(anahtar);
  } catch {
    return null; // depo engelli — taşınacak bir şey de yok
  }
  if (!ham) return null;

  let cozulen: unknown;
  try {
    cozulen = JSON.parse(ham);
  } catch {
    bozukKaydiTasi(anahtar, ham);
    return null;
  }
  if (!sekilTamam(cozulen)) {
    bozukKaydiTasi(anahtar, ham);
    return null;
  }
  return cozulen;
}

/** Düz nesne mi (dizi ve `null` değil). */
export function nesneMi(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === "object" && !Array.isArray(v);
}

/** `guvenliOku`nun düz nesne kısayolu — çağrı yerlerinde tip zorlaması bırakmaz. */
export function guvenliNesneOku<T>(anahtar: string): T | null {
  return guvenliOku<T>(anahtar, ((v: unknown) => nesneMi(v)) as (v: unknown) => v is T);
}

/** `guvenliOku`nun dizi kısayolu. */
export function guvenliDiziOku<T>(anahtar: string): T[] | null {
  return guvenliOku<T[]>(anahtar, ((v: unknown) => Array.isArray(v)) as (v: unknown) => v is T[]);
}

/**
 * BU OTURUMDA kurtarılan anahtarlar.
 *
 * Kurtarma tek başına YETMİYOR: veri korunuyor ama kullanıcı hâlâ boş bir
 * kutu görüyor ve "burada notum yok" sanıyor. Deponun kendi kuralı bunu
 * kusur sayıyor — "hesaplanamıyorsa SEBEBİNİ söyle; sessizce boş bırakmak
 * kullanıcıyı yanıltır."
 *
 * OTURUM KAPSAMLI, bilerek: tehlike anı "kullanıcı boşu görüp yazıyor"
 * anıdır. Yazdıktan sonra yeni kayıt sağlam, uyarıyı kalıcı tutmak gürültü
 * olurdu. Yeniden yüklemede liste boşalır.
 */
const kurtarilan = new Set<string>();

export function kurtarildiMi(anahtar: string): boolean {
  return kurtarilan.has(anahtar);
}

export function kurtarilanSayisi(): number {
  return kurtarilan.size;
}

/** Yedeğe alınmış HAM kaydı döndürür — kullanıcıya kopyalatmak için. */
export function bozukYedegiOku(anahtar: string): string | null {
  try {
    return localStorage.getItem(anahtar + ":bozuk");
  } catch {
    return null;
  }
}
