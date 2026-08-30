/**
 * app/lib/sorumluluk.ts
 *
 * Klinik sorumluluk cümlesi — TEK KAYNAK.
 *
 * Ölçüldü: 130 klinik aracın 130'u aynı uyarıyı ARAÇ KABUĞUNDAN basıyor,
 * ama 423 görünür konunun 359'unda (%85) hiçbir sorumluluk ifadesi yok ve
 * alt bilgi de sessizdi; premium tarafta 44 konunun 32'sinde yok ve o
 * yerleşimin alt bilgisi hiç yok. Yani ürünün en büyük klinik metin
 * yüzeyi hiçbir yerde uyarı taşımıyordu.
 *
 * Cümle 423 içerik dosyasına YAZILMADI — içerik kullanıcının sorumluluğu.
 * Araçlardaki gibi KABUKTAN geliyor; dil de araçların ev sesinden alındı
 * ("Bu araç akademik referans amaçlıdır. Tedavi kararı verilirken klinik
 * tablo, ek hastalıklar ve yerel rehberler esas alınmalıdır.").
 *
 * İki yüzey kullanıyor (açık alt bilgi + premium konu sayfası). Metni iki
 * yere kopyalamak bu depoda tur tur avlanan "iki gerçeklik" sınıfını
 * açardı: biri güncellenir, öteki kalırdı.
 */
export const KLINIK_SORUMLULUK =
  "Bu sitedeki içerik eğitim amaçlıdır ve hekimin klinik değerlendirmesinin " +
  "yerine geçmez. Tanı ve tedavi kararlarında güncel kılavuzlar, hastanın " +
  "kendi durumu ve yerel protokoller esas alınmalıdır.";
