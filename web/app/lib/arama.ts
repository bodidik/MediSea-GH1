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
