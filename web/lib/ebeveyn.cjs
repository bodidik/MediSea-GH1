/**
 * ÇOK EBEVEYNLİ HİYERARŞİ — tek kaynak.
 *
 * `meta.parent` iki biçimi de kabul eder:
 *   "hematolojik-maligniteler"              tek ebeveyn (eski davranış)
 *   ["lenfomalar", "b-hucreli-lenfomalar"]  çok ebeveyn
 *
 * DİZİNİN İLKİ BİRİNCİLDİR. Kırıntı yolu ve "asılı" hesabı yalnızca birincile
 * bakar — bir konunun tek bir kanonik yolu olmalı, yoksa aynı sayfa iki farklı
 * kırıntıyla görünür ve arama motoruna iki ayrı hiyerarşi bildirilir.
 * Üyelik (hangi hub'ın çocuk listesinde görüneceği) ise TÜM ebeveynlerden gelir.
 *
 * Bu dosya CommonJS: hem Next tarafı (TS) hem `scripts/*.cjs` aynı mantığı
 * kullansın diye. İki kopya tutmak bu depoda tekrar tekrar "iki gerçeklik"
 * kusuru üretti.
 */

/** Ham `meta.parent` -> ebeveyn dizisi. Boş/geçersiz değerler elenir, sıra korunur, çiftler atılır. */
function ebeveynListesi(ham) {
  const dizi = Array.isArray(ham) ? ham : ham == null ? [] : [ham];
  const cikti = [];
  for (const p of dizi) {
    if (typeof p !== "string") continue;
    const s = p.trim();
    if (s && !cikti.includes(s)) cikti.push(s);
  }
  return cikti;
}

/** Kırıntı ve asılı hesabı için tek kanonik ebeveyn. */
function birincilEbeveyn(ham) {
  return ebeveynListesi(ham)[0] ?? null;
}

module.exports = { ebeveynListesi, birincilEbeveyn };
