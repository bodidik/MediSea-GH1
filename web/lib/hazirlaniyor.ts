/**
 * "Hazırlanıyor" konuları — gövdesi kullanıcıya GÖSTERİLMEYEN sayfalar.
 *
 * Ölçüt: 🤖 başlıklı "Uzman Modülü: Harrison 21st Ed … referanslıdır" kutusu
 * (2 Eki 2026: 44 dosya, 21'i görünür). Bu kutu doğrulanmamış bir kaynak
 * iddiası taşıyan, yeniden yazılacak yapay zekâ taslağının imzası. İçerik
 * dosyasına DOKUNULMAZ; konu yeniden yazılıp kutu kalkınca sayfa
 * kendiliğinden açılır.
 *
 * Sayfa 404 değil: adres, başlık ve bağlantılar yaşar, gövde yerine
 * "hazırlanıyor" kartı basılır; arama motoruna ve site haritasına kapalı.
 */
export function hazirlaniyorMu(veri: any): boolean {
  const bolumler = Array.isArray(veri?.sections) ? veri.sections : [];
  return bolumler.some((b: any) => String(b?.heading ?? b?.title ?? "").includes("🤖"));
}
