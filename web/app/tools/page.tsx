import ToolsIcerik from "./ToolsIcerik";

/**
 * Araç merkezi artık SUNUCUDA render ediliyor.
 *
 * Önceden sayfanın kendisi `"use client"` idi ve `useSearchParams()`
 * kullandığı için içeriği bir `<Suspense>` sınırına sarılmıştı. Next bu
 * durumda alt ağacı sunucuda hiç üretmiyor; sunulan HTML yalnızca
 * `fallback` oluyor. Ölçüldü (canlı sunucu HTML'i):
 *
 *   /tools        19 KB   h1: 0   h2: 0   <a>: 0
 *   /topics       98 KB   h1: 1   h2: 1   <a>: 43   (sunucu bileşeni)
 *   /tools/bmi    28 KB   h1: 1                     (sunucu bileşeni)
 *
 * Yani 114 aracın hub bağlantısı ilk tarama dalgasında hiç görünmüyordu.
 * Araç sayfaları site haritasında olduğu için keşfedilebiliyor, ama hub
 * bağlantısının taşıdığı bağ değeri ve konu kümelenmesi kayboluyordu —
 * "klinik hesaplayıcı" aramalarının karşılaması gereken sayfa tam da bu.
 *
 * Çare: kategori sorgusu SUNUCUDA okunup prop olarak veriliyor; istemci
 * bileşeninin `useSearchParams()`e ihtiyacı kalmıyor, Suspense sınırı
 * gerekmiyor ve sayfa normal şekilde sunucuda basılıyor.
 *
 * `searchParams` Next 15'te bir Promise — düz nesne gibi okunursa değer
 * undefined kalır (aynı tuzak görsel rotalarında da yaşandı).
 */
export default async function AraclarSayfasi({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const { kategori } = await searchParams;
  return <ToolsIcerik kategori={kategori} />;
}
