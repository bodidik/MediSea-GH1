// C:\Users\hucig\Medknowledge\web\app\lib\topic-counts.ts
//
// Branş başına konu sayısını içerik klasöründen okur.
// SUNUCU TARAFI — fs kullanır, istemci bileşeninden içe aktarılamaz.
// İstemcinin ihtiyacı olduğunda /api/branch-counts üzerinden alınır.

import fs from "fs";
import path from "path";

/**
 * GİZLİ KONULAR SAYILMAZ.
 *
 * Önceden yalnızca dosya adları sayılıyordu; meta.hidden işaretli 45 konu da
 * toplama giriyordu. Ana sayfa "456+ konu" diyor, kullanıcı kütüphaneye
 * girince 411 buluyordu. Sayının kendisi küçük bir ayrıntı ama vaat ile
 * bulunan arasındaki fark güveni aşındırır.
 *
 * Gizliliği anlamak için dosyayı ayrıştırmak gerekiyor. Bu yüzden sonuç
 * modül düzeyinde bir kez hesaplanıp saklanıyor: içerik yalnızca dağıtımda
 * değiştiği için süreç ömrü boyunca geçerli, her istekte 456 dosya
 * ayrıştırmanın da anlamı yok.
 */
let onbellek: Record<string, number> | null = null;

export function getTopicCounts(): Record<string, number> {
  if (onbellek) return onbellek;

  const counts: Record<string, number> = {};
  try {
    const root = path.join(process.cwd(), "content", "canonical");
    if (!fs.existsSync(root)) return counts;

    const branches = fs
      .readdirSync(root, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name);

    for (const b of branches) {
      const dizin = path.join(root, b);
      let n = 0;
      for (const f of fs.readdirSync(dizin).filter((f) => f.endsWith(".json"))) {
        try {
          const veri = JSON.parse(fs.readFileSync(path.join(dizin, f), "utf-8"));
          if (veri?.meta?.hidden !== true) n++;
        } catch {
          // Bozuk dosya sayıma girmesin; sayfa yine çalışsın.
        }
      }
      counts[b] = n;
    }
    onbellek = counts;
  } catch {
    // sayaçlar dekoratif — okunamazsa sayfa yine çalışmalı
  }
  return counts;
}

/**
 * Yayımlanmış klinik araç sayısı — app/tools altındaki gerçek sayfa sayısı.
 *
 * Ana sayfada bu sayı "6+" olarak elle yazılıydı; gerçekte 114 araç var.
 * Yani sitenin en büyük varlığı, olduğunun yirmide biri gibi gösteriliyordu.
 * Başka bir yerde de "50+ skor" yazıyordu — iki rakam birbirini tutmuyordu.
 */
let aracOnbellek: number | null = null;

export function getToolCount(): number {
  if (aracOnbellek !== null) return aracOnbellek;

  try {
    const kok = path.join(process.cwd(), "app", "tools");
    aracOnbellek = fs
      .readdirSync(kok, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .filter((ad) => !["components", "lib", "data"].includes(ad))
      .filter((ad) => fs.existsSync(path.join(kok, ad, "page.tsx"))).length;
    return aracOnbellek;
  } catch {
    return 0;
  }
}
