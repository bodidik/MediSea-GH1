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

/**
 * Bölüm başlığından kararlı bir `id` üretir — sayfa içi bağlantı için.
 *
 * ÖLÇÜLDÜ (canlı, 390px): en uzun konu sayfası `26 803px` yükseklikte, yani
 * **31.8 ekran**. Sayfada 15 `h2` ve 17 `h3` var ama sayfa içi çapa SIFIR ve
 * başlıkların hiçbirinde `id` YOK — atlama bağlantısının `#icerik`i dışında.
 * Yani "tedavi" bölümünü arayan okuyucu 30 ekran kaydırmak zorunda ve bir
 * bölüme bağlantı vermek (ya da yer imi koymak) imkânsız.
 *
 * Türkçe katlama ELLE kuruluyor: `toLowerCase()` `I`yı `i` yapar ama `İ`yi
 * noktalı bırakır ve `ı`/`i` ayrımı bu depoda daha önce üç kez yanlış sonuç
 * verdi (bkz. CLAUDE.md — `/paylaş/i`, `Remisyon.toUpperCase()`).
 *
 * `bolum-` ÖNEKİ bilerek var: id'ler sayfadaki mevcut kimliklerle (`icerik`,
 * `ana-menu`) çakışamasın ve bir bölüm "içerik" adını taşısa bile atlama
 * bağlantısının hedefini çalmasın.
 */
const TR_HARF: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
  Ç: "c", Ğ: "g", İ: "i", I: "i", Ö: "o", Ş: "s", Ü: "u",
  â: "a", î: "i", û: "u", Â: "a", Î: "i", Û: "u",
};

export function basligaId(baslik: string): string {
  const govde = [...String(baslik)]
    .map((h) => TR_HARF[h] ?? h)
    .join("")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return "bolum-" + (govde || "bolum");
}

/**
 * Bir bölüm listesi için ÇAKIŞMASIZ id dizisi.
 *
 * Aynı başlık iki kez geçebiliyor (ör. iki bölümde de "Tedavi"). Çakışan
 * id ilk hedefe götürür ve ikinci bölüme ULAŞILAMAZ — sessiz bir kusur,
 * çünkü bağlantı yine de "çalışıyor" görünür. İkinciden itibaren sıra eki
 * konuyor.
 */
export function bolumKimlikleri(basliklar: string[]): string[] {
  const sayac = new Map<string, number>();
  return basliklar.map((b) => {
    const temel = basligaId(b);
    const n = (sayac.get(temel) ?? 0) + 1;
    sayac.set(temel, n);
    return n === 1 ? temel : `${temel}-${n}`;
  });
}
