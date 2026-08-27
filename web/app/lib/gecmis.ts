/**
 * "Geri" düğmesi kullanıcıyı SİTEDEN ÇIKARMASIN.
 *
 * Ölçüldü (canlı, taze sekme — arama motorundan düşen kullanıcının hâli):
 * `/tools/bmi` doğrudan açıldığında `document.referrer` boş, `history.length`
 * 2 (about:blank + sayfa) ve "Geri" düğmesi `router.back()` çağırıyordu.
 * Sonuç: sekme **about:blank**'e düştü — kullanıcı siteden atıldı. Gerçek
 * hayatta hedef Google olurdu. Bu, 130 araç sayfasının ve `/tools` hub'ının
 * tamamında, yani sitenin en yüksek trafikli GİRİŞ yüzeyinde geçerliydi.
 *
 * ── Neden referrer ya da history.length TEK BAŞINA yetmiyor ────────────────
 * `document.referrer` istemci gezinmesinde DEĞİŞMİYOR: kullanıcı Google'dan
 * /topics'e girip oradan bir araca tıklarsa referrer hâlâ Google'dır, oysa
 * geri gitmek doğru davranıştır. `history.length` de tek başına anlamsız —
 * kullanıcı o sekmede daha önce başka siteleri gezmiş olabilir.
 *
 * Ölçüt bu yüzden FARK: oturumun İLK yüklemesindeki uzunluk kaydedilir;
 * bugünkü uzunluk ondan büyükse aradaki her adım BU sitede atılmıştır.
 *
 * Depo engelliyse (bu depoda ölçülmüş bir durum) `false` döner — yani
 * düğme hiç çizilmez. Güvenli taraf budur: hiç geri gitmemek, kullanıcıyı
 * siteden atmaktan iyidir.
 */
const ANAHTAR = "medisea:giris-gecmis-uzunlugu";

/** Oturumun ilk yüklemesinde bir kez çağrılır (bkz. `app/providers.tsx`). */
export function girisiKaydet(): void {
  if (typeof window === "undefined") return;
  try {
    if (window.sessionStorage.getItem(ANAHTAR) === null) {
      window.sessionStorage.setItem(ANAHTAR, String(window.history.length));
    }
  } catch {
    /* depo engelli — siteIciGecmisVar() false döner */
  }
}

/** Bu sekmede, BU sitede en az bir gezinme yapıldı mı? */
export function siteIciGecmisVar(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const ham = window.sessionStorage.getItem(ANAHTAR);
    if (ham === null) return false;
    const giris = Number(ham);
    return Number.isFinite(giris) && window.history.length > giris;
  } catch {
    return false;
  }
}
