import ToolsIcerik from "./ToolsIcerik";

/**
 * Araç merkezi: SUNUCUDA render edilen ve STATİK prerender edilen sayfa.
 *
 * İki kusur arasında sıkışmış bir sayfaydı, ikisi de ölçülerek kapatıldı:
 *
 * 1. Sayfa `"use client"` iken `useSearchParams()` bir Suspense sınırı
 *    gerektiriyordu ve Next alt ağacı sunucuda HİÇ üretmiyordu. Sunulan
 *    HTML yalnızca `fallback` oluyordu — 19 KB, `<h1>` 0, araç bağlantısı 0.
 *    114 aracın hub bağlantısı ilk tarama dalgasında yoktu.
 *
 * 2. Çözüm olarak kategori sunucuda okununca (`searchParams`) rota
 *    dinamikleşti (`ƒ`) ve CDN'de her istek MISS oldu — 155 KB'lık sayfa
 *    her istekte yeniden üretiliyordu.
 *
 * Şimdiki yapı ikisini birden çözüyor: burada sorgu OKUNMUYOR, yani sayfa
 * statik kalıyor ve sunucu HTML'i süzülmemiş tam listeyi taşıyor; kategori
 * süzgeci hidrasyondan sonra istemcide uygulanıyor (bkz. ToolsIcerik).
 *
 * Ölçüt: canlıda art arda istekte `x-vercel-cache` PRERENDER/HIT olmalı ve
 * aynı yanıtta `<h1>` 1, `<h2>` 17, `/tools/` bağlantısı 117 kalmalı.
 */
export default function AraclarSayfasi() {
  return <ToolsIcerik />;
}
