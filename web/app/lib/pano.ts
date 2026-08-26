/**
 * PANOYA KOPYALA — tek kaynak.
 *
 * `navigator.clipboard` GÜVENLİ BAĞLAM ister. Bu depo telefondan LAN üzerinden
 * `http://<ip>:3000` ile bakmayı açıkça destekliyor (`-H 0.0.0.0` kararının
 * gerekçesi) ve orada `navigator.clipboard` TANIMSIZ.
 *
 * Üç çağrı yeri bir dönem şunu yazıyordu:
 *
 *     navigator.clipboard?.writeText(text).catch(() => {})
 *
 * `?.` kısa devre yaptığı için hiçbir şey kopyalanmıyor, hiçbir hata da
 * görünmüyordu — düğmeye basılıyor, arayüz kapanıyor, pano değişmiyor.
 * Deponun kendi kuralı bunu kusur sayıyor: *"Kaydetme hatası yutulmaz;
 * depo dolduğunda 'Kaydedildi' yazmak kaydetmemekten beterdir."*
 *
 * En ağır çağrı yeri `NotePanel`in KOTA KURTARMA düğmesiydi: depo dolduğunda
 * kullanıcıya "yazıyı kopyala" deniyor ve kopyalama sessizce başarısız
 * olursa not gerçekten kayboluyor.
 *
 * `ToolShare` doğru yolu zaten yazmıştı (execCommand yedeği); burada
 * tekleştirildi — iki kopya er geç ayrışır.
 *
 * Dönüş değeri BOOLEAN çünkü çağıran "kopyalandı" demeden önce bilmek
 * zorunda.
 */
export async function panoyaKopyala(metin: string): Promise<boolean> {
  if (!metin) return false;

  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(metin);
      return true;
    }
  } catch {
    // izin reddi ya da güvensiz bağlam — yedeğe düşülüyor
  }

  // Yedek: güvenli bağlam istemeyen eski yol.
  try {
    const el = document.createElement("textarea");
    el.value = metin;
    el.setAttribute("readonly", "");
    el.style.position = "fixed";
    el.style.top = "0";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(el);
    return ok;
  } catch {
    return false;
  }
}
