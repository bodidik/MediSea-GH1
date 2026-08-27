"use client";

/**
 * HESAPLAYICI SONUCUNU EKRAN OKUYUCUYA DUYURUR.
 *
 * Ölçüldü: 130 klinik hesaplayıcının 130'unda sonuç SESSİZCE beliriyordu.
 * 42'si yalnızca hata/bildirim duyuruyordu (benim eklediğim sebep kartları),
 * 88'inde hiçbir canlı bölge yoktu. Yani ekran okuyucuyla çalışan biri
 * değer giriyor, ekranda skor ve bant çiziliyor, hiçbir şey duyulmuyordu.
 *
 * Aynı kusur `SiteHeader`ın arama kutusunda ölçülüp düzeltilmişti; oradaki
 * gerekçe birebir geçerli.
 *
 * `role="status"` — `alert` DEĞİL: sonuç acil bir kesinti değil, ve bölge
 * KOŞULSUZ render ediliyor. Belgede kayıtlı kural: `status` içerik
 * değişmeden ÖNCE DOM'da bulunmak zorunda; sonradan eklenirse ilk mesaj
 * kaçar. Bu yüzden bileşen `metin` boşken de bir kap basıyor.
 *
 * YALNIZCA BANT ETİKETİ duyuruluyor, SAYI değil — ve bu bilinçli:
 * serbest sayısal alanı olan araçlarda skor HER TUŞ VURUŞUNDA değişiyor,
 * yani sayıyı duyurmak "1", "1.", "1.2" diye gürültü üretirdi. Bant etiketi
 * ancak bir eşik geçildiğinde değişiyor; metin değişmediği sürece ekran
 * okuyucu yeniden duyurmuyor. Böylece duyuru hem anlamlı hem sessiz.
 */
export default function SonucDuyuru({ metin }: { metin: string | null }) {
  return (
    <p role="status" className="sr-only">
      {metin ? `Sonuç: ${metin}` : ""}
    </p>
  );
}
