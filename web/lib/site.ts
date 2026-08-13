/**
 * Sitenin kendi adresi — canonical, site haritası ve paylaşım etiketleri
 * buradan besleniyor.
 *
 * Sıra bilinçli: elle verilen adres kazanır, yoksa Vercel'in ürettiği üretim
 * alan adına düşülür, o da yoksa localhost. Ortadaki basamak olmadığı için
 * canlıdaki site haritasının tamamı "http://localhost:3000/..." yazıyordu;
 * yani arama motoruna gönderilen her adres geçersizdi. Tek bir ortam
 * değişkeninin unutulması bütün açık tarafı görünmez kılmamalı.
 *
 * VERCEL_PROJECT_PRODUCTION_URL, önizleme dağıtımlarında da üretim alan adını
 * verir — canonical'ın her zaman asıl adresi göstermesi istendiği için doğru
 * olan da budur.
 */
export function siteUrl(): string {
  const elle = process.env.NEXT_PUBLIC_SITE_URL;
  if (elle) return elle.replace(/\/+$/, '');

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return 'http://localhost:3000';
}

export const SITE_ADI = 'MediSea';
export const SITE_ACIKLAMA =
  'Dahiliye asistanları ve uzmanları için Türkçe klinik kaynak: güncel konu anlatımları, ' +
  'klinik hesaplayıcılar ve YDUS hazırlık materyali.';
