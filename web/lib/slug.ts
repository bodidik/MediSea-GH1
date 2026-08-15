/**
 * Rota parametresini dosya adına çevirir.
 *
 * Next 15'te dinamik segment sayfaya YÜZDE-KODLU ulaşıyor. ASCII slug'larda
 * bu fark etmiyor ama Türkçe karakter ya da boşluk taşıyan bir slug'da
 * `content/canonical/<branş>/<slug>.json` araması ham dizeyle yapıldığında
 * dosya bulunamıyor ve sayfa `notFound()`'a düşüyor.
 *
 * Ölçüldü (geçici tanı rotasıyla, canlı dev sunucuda): `/…/ascit-sıvısı`
 * isteğinde parametre `ascit-s%C4%B1v%C4%B1s%C4%B1` olarak geliyor;
 * `existsSync(ham)` false, `existsSync(decodeURIComponent(ham))` true.
 *
 * Sonuç: dosyası duran BEŞ konu hiçbir şekilde açılamıyordu (405 değil, 404)
 * ve beşi de site haritasında arama motoruna ilan ediliyordu —
 * men1-menin-lösemi-onkojen · ascit-sıvısı · gebelikte-immün-ITP-yonetimi ·
 * "FGF-23 vs PTH" · pankreas-kanseri-neden-ilaç-vs.
 *
 * `decodeURIComponent` bozuk bir dizide (tek başına `%`) atar; o yüzden
 * çıplak değil, sarılı çağrılıyor. Zaten çözülmüş bir dize ikinci kez
 * çözülmez, çünkü içinde `%XX` kalmaz.
 */
export function slugCoz(ham: string): string {
  try {
    return decodeURIComponent(ham);
  } catch {
    return ham;
  }
}

/**
 * Site haritası ve canonical için adres parçasını kodlar.
 *
 * `<loc>` içine ham boşluk basmak geçersiz bir adres üretiyordu
 * ("…/topics/nefroloji/FGF-23 vs PTH"). Şema ve eğik çizgiler korunmalı,
 * yalnızca segment içeriği kodlanmalı.
 */
export function yolKodla(yol: string): string {
  return yol
    .split("/")
    .map((parca) => encodeURIComponent(parca))
    .join("/");
}
