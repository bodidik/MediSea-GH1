// C:\Users\hucig\Medknowledge\web\app\lib\topic-counts.ts
//
// Branş başına konu sayısını içerik klasöründen okur.
// SUNUCU TARAFI — fs kullanır, istemci bileşeninden içe aktarılamaz.
// İstemcinin ihtiyacı olduğunda /api/branch-counts üzerinden alınır.

import fs from "fs";
import path from "path";

export function getTopicCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  try {
    const root = path.join(process.cwd(), "content", "canonical");
    if (!fs.existsSync(root)) return counts;
    const branches = fs
      .readdirSync(root)
      .filter((d) => fs.statSync(path.join(root, d)).isDirectory());
    for (const b of branches) {
      counts[b] = fs
        .readdirSync(path.join(root, b))
        .filter((f) => f.endsWith(".json")).length;
    }
  } catch {
    // sayaçlar dekoratif — okunamazsa sayfa yine çalışmalı
  }
  return counts;
}
