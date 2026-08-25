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

/**
 * Bir rotanın başlığını, açıklamasını ve KENDİ canonical'ını tek yerden verir.
 *
 * Sözleşme: her rota kendi kimliğini beyan eder. Beyan etmeyen rota kökün
 * `alternates: { canonical: "/" }` değerini miras alıyor ve arama motoruna
 * "ben ana sayfanın kopyasıyım" diyor — bu depoda defalarca ölçülmüş bir kusur.
 *
 * ⚠ `openGraph` BURADA ÜRETİLMEZ ve hiçbir sayfada elle yazılmamalı. Sebebi
 * ölçüldü ve iki yönlü:
 *
 * 1. Next, `openGraph.title`/`description` verilmediğinde bunları sayfanın
 *    KENDİ `title`/`description` değerinden TÜRETİYOR. Yani sayfa başına
 *    yazmak gereksiz.
 * 2. Bir alt sayfada `openGraph` tanımlamak, ATA segmentteki dosya tabanlı
 *    `opengraph-image` mirasını KESİYOR — ölçüldü: 12 sayfa (premium branş
 *    sayfaları, /tekrar, /calisma-alanim, /guidelines) paylaşım görselini
 *    tamamen kaybetti. Kart görselsiz kalıyor.
 *
 * Bu ikisi bir turda ters yönde yanılttı: önce "openGraph yazmak görseli
 * bozmaz" sanıldı (çünkü `/tools/bmi` hem yazıyor hem görselini koruyor —
 * orada görsel dosyası ARA segmentte ve o segment de openGraph tanımlıyor),
 * sonra ölçüm 12 sayfada görselin gittiğini gösterdi. Ayırt edici ölçüm,
 * kendi openGraph'ı HİÇ OLMAYAN bir sayfaya bakmak oldu (`/admin/*`):
 * og:title kendi başlığı, görsel yerinde.
 */
export function rotaMeta(opts: {
  baslik: string;
  aciklama: string;
  yol: string;
}): {
  title: string;
  description: string;
  alternates: { canonical: string };
} {
  const { baslik, aciklama, yol } = opts;
  return {
    title: baslik,
    description: aciklama,
    alternates: { canonical: yol },
  };
}
