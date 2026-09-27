/** Bir konunun ya da branşın gerçek içeriği (`lib/premium-envanter.ts` → `envanterAl`). */
export interface IcerikSayisi {
  soru: number;
  kart: number;
  inci: number;
  vaka: number;
}

/**
 * "135 soru · 317 kart · 20 inci · 2 vaka" — premium pano ve branş sayfası
 * AYNI biçimi basar (tek kaynak; sunucu da istemci de çağırabilsin diye
 * `'use client'` dosyasında DEĞİL).
 *
 * Pano bir dönem ürünün yalnızca soru bankasını gösteriyordu — ölçüldü:
 * hazır konulardaki 2.261 kart, 953 inci ve 15 vaka hiç görünmüyordu; 100
 * incili bir konu "0 soru" diye tanıtılıyordu. Sıfır olan tür yazılmaz;
 * hepsi sıfırsa boş döner.
 */
export function icerikOzeti(s: IcerikSayisi): string {
  const parcalar: [number, string][] = [
    [s.soru, "soru"],
    [s.kart, "kart"],
    [s.inci, "inci"],
    [s.vaka, "vaka"],
  ];
  return parcalar
    .filter(([n]) => n > 0)
    .map(([n, ad]) => `${n.toLocaleString("tr-TR")} ${ad}`)
    .join(" · ");
}
