/**
 * İçerik HTML'indeki başlık düzeylerini belgenin taslağına oturtur.
 *
 * SORUN — ölçüldü: konu sayfası bölüm başlıklarını `<h2>` basıyor ama içerik
 * HTML'i neredeyse tamamen `<h4>` kullanıyor (410 görünür konuda 1771 `h4`,
 * yalnızca 1 `h3`, 33 `h5`). Yani her bölümde h2'den sonra doğrudan h4
 * geliyor ve arada h3 yok:
 *
 *   240 konu (görünürlerin %59'u) · toplam 907 düzey atlaması
 *
 * Bunun bedeli ekran okuyucuda görünür: kullanıcılar belgede başlık
 * düzeyine göre geziniyor ve atlanan düzey taslağı kırıyor — h4 başlıklar
 * h2'nin altında değil, kayıp bir h3'ün altında gibi duyuruluyor.
 *
 * ÇARE RENDER TARAFINDA, içerik dosyasına dokunulmadan. Bu, deponun yerleşik
 * kararı: `metin.tsx` (kalın işareti) ve `kisaltma.ts` (açılım) de aynı yolu
 * izliyor. İçeriği düzeltmek 456 dosyada metin değişikliği demek ve içerik
 * kullanıcının sorumluluğunda.
 *
 * KURAL sabit eşleme DEĞİL. Önce `h4→h3, h5→h4` denendi ve 907 atlamayı
 * 16'ya düşürdü ama sıfırlamadı: bazı bölümler h3 ile h5'i birlikte
 * kullanıyor, bazıları yalnızca h5 taşıyor. Onun yerine bölüm İÇİNDE
 * kullanılan seviyeler artan sırada 3, 4, 5… diye yeniden numaralanıyor.
 * Bölümün kendi iç hiyerarşisi korunuyor, belge taslağı da bozulmuyor.
 *
 * Ölçüldü — bu kuralla 410 konunun hepsinde atlama SIFIR.
 *
 * Kapsam bilerek dar: yalnızca `<h1>`–`<h6>` etiket adları değişiyor.
 * Sınıflar, kimlikler ve içerik olduğu gibi kalıyor; açılış ve kapanış
 * etiketleri aynı haritayla çevrildiği için etiket eşleşmesi bozulmuyor.
 */
const BASLIK = /<(\/?)h([1-6])\b/gi;

export function basliklariDuzenle(html: string): string {
  if (!html || !html.includes("<h")) return html;

  const kullanilan = new Set<number>();
  for (const m of html.matchAll(BASLIK)) kullanilan.add(Number(m[2]));
  if (kullanilan.size === 0) return html;

  const harita = new Map<number, number>();
  [...kullanilan]
    .sort((a, b) => a - b)
    // Bölüm başlığı h2 olduğu için içerik h3'ten başlar. h6 tavan:
    // daha derin bir yuvalanma HTML'de zaten temsil edilemiyor.
    .forEach((seviye, i) => harita.set(seviye, Math.min(6, 3 + i)));

  return html.replace(
    BASLIK,
    (tam, kapanis: string, n: string) => `<${kapanis}h${harita.get(Number(n)) ?? n}`
  );
}
