/**
 * Arama metinlerini karşılaştırmadan önce normalleştirir.
 *
 * ── Neden gerekti ──────────────────────────────────────────────────────────
 *
 * Arama yüzeyleri `toLowerCase()` kullanıyordu ve bu Türkçe'de BOZUK:
 * JS'in varsayılan küçültmesi Unicode'un dilden bağımsız kuralını uygular,
 * Türkçe'nin noktalı/noktasız i ayrımını bilmez.
 *
 * Ölçüldü:
 *   "İdrar".toLowerCase()  ->  "i̇drar"  (i + BİRLEŞEN NOKTA)  ->  "idrar" ile EŞLEŞMEZ
 *   "Işık".toLowerCase()   ->  "işık"                          ->  "ışık"  ile EŞLEŞMEZ
 *   "Iyot".toLowerCase()   ->  "iyot"                          ->  "ıyot"  ile EŞLEŞMEZ
 *
 * Bu kenar durum değil, VARSAYILAN durum: Türkçe klavyede Shift+i tuşu
 * doğrudan "İ" üretir. Yani "İdrar analizi" aramak isteyen kullanıcı hiçbir
 * sonuç görmüyordu. Araç sayfasının arama alanında 290 kelime bu şekilde
 * bulunamaz haldeydi.
 *
 * ── İki katmanlı çözüm ─────────────────────────────────────────────────────
 *
 * 1) `toLocaleLowerCase("tr")` — İ→i ve I→ı dönüşümünü DOĞRU yapar.
 *
 * 2) Aksan katlama — kullanıcı Türkçe karakterleri yazmadan da arayabilsin:
 *    "gogus" yazan "Göğüs"ü, "GÖĞÜS" yazan "gogus"u bulur. Hızlı yazarken
 *    ya da İngilizce klavyede bu çok yaygın.
 *
 *    ö/ü/ç/ğ/ş aksanlı harflerdir, NFD ile taban harf + birleşen işarete
 *    ayrışırlar ve işaret atılınca o/u/c/g/s kalır. "ı" ise AKSANLI DEĞİL,
 *    kendi başına bir harftir — ayrışmaz, o yüzden elle eşlenir. Sıra
 *    önemli: `ı→i` dönüşümü NFD'den ÖNCE yapılır, çünkü sonrasında
 *    "i" üzerindeki noktayı da atmış oluruz.
 *
 * ── Kapsam ─────────────────────────────────────────────────────────────────
 *
 * Yalnızca ARAMA karşılaştırmasında kullanılır. Ekrana basılan metne
 * uygulanmaz; kullanıcı içeriği her zaman kendi doğru yazımıyla görür.
 */
export function aramaNormalize(metin: string): string {
  if (!metin) return "";
  return metin
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

/**
 * `aranan`, `icerik` içinde geçiyor mu? İkisi de aynı kuralla normalleştirilir.
 *
 * ⚠ BOŞ SORGU `false` DÖNER — bunu doğrudan `.filter()` içinde kullanma.
 *
 * Sözleşme "eşleşme var mı?" sorusunu cevaplıyor ve boş bir sorgunun hiçbir
 * şeyle eşleşmemesi doğru cevap: `String.includes("")` her zaman `true`'dur,
 * yani vurgulama gibi bir çağrı yerinde boş kutu SAYFADAKİ HER ŞEYİ
 * işaretlerdi.
 *
 * Ama süzgeçlerde soru farklı — "listede kalsın mı?" — ve orada boş kutunun
 * cevabı her zaman evet. Süzen her çağrı yeri boş sorguyu KENDİSİ karşılamalı:
 *
 *     if (!sorgu.trim()) return hepsi;      // ya da
 *     const bos = !sorgu.trim();
 *     ... bos ? hepsi : hepsi.filter(x => aramaEslesir(x.ad, sorgu))
 *
 * Ölçüldü: `/tools` bu korumayı bir tur boyunca taşımadı ve arama kutusu
 * boşken 114 aracın hepsi elendi — sayfa "0 araç listeleniyor" diyordu ve
 * hub'daki 117 bağlantı hem kullanıcıdan hem arama motorundan kayboldu.
 * Kusur sessizdi: kategori sayaçları ayrı veriden geldiği için "114" yazmaya
 * devam ediyordu, yani sayfa dolu görünüyordu.
 */
export function aramaEslesir(icerik: string, aranan: string): boolean {
  const a = aramaNormalize(aranan);
  if (!a) return false;
  return aramaNormalize(icerik).includes(a);
}

/**
 * ESNEK ARAMA ANAHTARI — kısmi araç adıyla ulaşmak için.
 *
 * ── Ölçülen kusur ──────────────────────────────────────────────────────────
 *
 * Arama yüzeyleri araçları yalnızca `name` ve `desc` üzerinden eşleştiriyordu
 * ve karşılaştırma düz `includes`. Ölçüldü (130 araç):
 *
 *   kendi SLUG'ıyla bulunamayan            : 65
 *   slug'ın 6 harflik önekiyle bulunamayan : 44
 *   kendi ADIYLA (noktalamasız) bulunamayan: 106
 *
 * Üç ayrı sebep vardı ve üçü de kullanıcının yazdığı biçimi vuruyor:
 *
 *   1) SLUG HİÇ ARANMIYORDU. Adres ve URL biçimi çoğu zaman akılda kalan
 *      biçim, üstelik bazı araçların adı Türkçe ama slug'ı İngilizce:
 *      `endocarditis` → "Duke Kriterleri", `canadian-ct` → "Kanada BT Kural",
 *      `corrected-calcium` → "Düzeltilmiş Kalsiyum".
 *
 *   2) NOKTALAMA ve ALT/ÜST SİMGE. Kullanıcı tire yazmıyor:
 *      "curb65" ↛ "CURB-65" · "childpugh" ↛ "Child-Pugh" · "camicu" ↛ "CAM-ICU".
 *      Daha kötüsü ad gerçek alt/üst simge taşıyor: "CHA₂DS₂-VASc" (U+2082),
 *      "ABCD² Skoru" (U+00B2) — klavyeden yazılamayan karakterler.
 *
 *   3) KISALTMA ADDA HİÇ GEÇMİYOR: `gcs` → "Glasgow Koma Skalası".
 *
 * ── Kural MELEZ ve eşiği ölçümle seçildi ───────────────────────────────────
 *
 * Her şeyi (boşluk dahil) silen tek bir anahtar kapsamı çözüyor ama KELİME
 * SINIRINDA yanlış pozitif üretiyor: "PERC Kriterleri" → "perckriterleri"
 * ve iki harflik "ck" sorgusu ona takılıyordu (ölçüldü: "ck" 2 → 5).
 *
 * Bu yüzden iki anahtar var ve sıkıştırılmış olan yalnızca sorgu
 * ARAMA_SIKISTIRMA_ESIGI kadar uzunken deneniyor:
 *
 *   yumuşak : noktalama → boşluk (kelime sınırı KORUNUR)
 *   sert    : alfanümerik dışı her şey silinir ("cha2ds2vasc")
 *
 * Ölçüldü — melez kuralla bulunamayan 65 → 0, ad üzerinden 106 → 0, ve
 * 1296 iki-harflik sorgunun tamamında toplam ek sonuç yalnızca 85 (hepsi
 * slug eşleşmesi, kelime sınırı artefaktı değil).
 *
 * ⚠ Kapsam: BUGÜN yalnızca araç eşleştirmesinde kullanılıyor. Konu
 *   başlıkları ayrı bir yüzey ve ayrıca ölçülmeden buraya bağlanmamalı.
 */
export const ARAMA_SIKISTIRMA_ESIGI = 4;

/** Ortak taban: Türkçe küçültme + ı→i + NFKD (₂→2, ²→2) + aksan atma. */
function esnekTaban(metin: string): string {
  return metin
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "");
}

export type AramaAnahtari = { yumusak: string; sert: string };

/**
 * Bir kaydın aranabilir alanlarından anahtar üretir.
 *
 * Çağrı yerleri bunu KAYIT BAŞINA BİR KEZ hesaplamalı: hub 130 aracı her tuş
 * vuruşunda süzüyor ve alan başına normalleştirme tuş başına yüzlerce kez
 * çalışırdı.
 */
export function aramaAnahtariKur(...parcalar: (string | undefined)[]): AramaAnahtari {
  const ham = parcalar.filter(Boolean).join(" ");
  const t = esnekTaban(ham);
  return {
    yumusak: t.replace(/[^a-z0-9 ]+/g, " ").replace(/ +/g, " ").trim(),
    sert: t.replace(/[^a-z0-9]+/g, ""),
  };
}

/**
 * ⚠ BOŞ SORGU `false` DÖNER — `aramaEslesir` ile aynı sözleşme.
 * Süzgeçler boş sorguyu KENDİLERİ karşılamalı (bkz. yukarıdaki uyarı).
 */
export function aramaAnahtariEslesir(anahtar: AramaAnahtari, aranan: string): boolean {
  const t = esnekTaban(aranan);
  const y = t.replace(/[^a-z0-9 ]+/g, " ").replace(/ +/g, " ").trim();
  if (!y) return false;
  if (anahtar.yumusak.includes(y)) return true;
  const s = t.replace(/[^a-z0-9]+/g, "");
  return s.length >= ARAMA_SIKISTIRMA_ESIGI && anahtar.sert.includes(s);
}

/** Tek seferlik çağrılar için kolaylık — sıcak döngüde ANAHTARI önceden kur. */
export function esnekEslesir(icerik: string, aranan: string): boolean {
  return aramaAnahtariEslesir(aramaAnahtariKur(icerik), aranan);
}
