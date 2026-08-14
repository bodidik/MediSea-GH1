#!/usr/bin/env node
/**
 * Yetim premium içerik denetimi.
 *
 * Kendini onaran okumalar (lib/premium-brans.ts) ters yöndeki sorunu çözüyor:
 * konu dosyası VAR ama branş listesinde adı geçmiyorsa yine de gösteriliyor.
 * Bu denetim öbür yönü kontrol ediyor: quiz / kart / vaka dosyası VAR ama
 * ait olduğu KONU dosyası yok. Böyle bir dosyaya hiçbir yerden ulaşılamaz —
 * içerik yazılmış, emek harcanmış, kimse göremiyor.
 *
 * Ayrıca sayıları da bozuyor: lib/icerik-sayaci.ts bütün quiz dosyalarını
 * sayıyor, pano ise yalnızca erişilebilir konuları topluyor. Satış sayfasında
 * bir dönem üst yazı "362 soru", panonun kendisi "352" diyordu — aynı
 * sayfada iki yüzey aynı sayıyı farklı söylüyordu. Farkın tamamı tek bir
 * yetim dosyaydı.
 *
 * Kullanım:  node scripts/yetim-denetim.cjs
 * Çıkış kodu 0 — bu bir CI kapısı DEĞİL: yetim dosya bir kod hatası değil,
 * içerik kararı (ya konu dosyası yazılacak ya da dosya silinecek) ve içerik
 * kullanıcının sorumluluğunda.
 */

const fs = require("fs");
const path = require("path");

const KOK = path.join(__dirname, "..", "content", "premium", "ydus");

/** `<konu>-quiz-1.json` → `konu`, `<konu>.json` → `konu` */
function konuAdi(dosya) {
  return dosya
    .replace(/\.json$/, "")
    .replace(/-(quiz|vaka|kart|flashcard)-\d+$/, "");
}

function kayitSay(veri) {
  for (const alan of ["sorular", "questions", "cards", "kartlar", "adimlar", "stages"]) {
    if (Array.isArray(veri?.[alan])) return veri[alan].length;
  }
  return 0;
}

function tur(ad) {
  const yetim = [];
  const saglam = [];
  let dizinler;
  try {
    dizinler = fs
      .readdirSync(path.join(KOK, ad), { withFileTypes: true })
      .filter((d) => d.isDirectory());
  } catch {
    return { yetim, saglam };
  }

  for (const brans of dizinler) {
    const dizin = path.join(KOK, ad, brans.name);
    for (const dosya of fs.readdirSync(dizin).filter((f) => f.endsWith(".json"))) {
      const konu = konuAdi(dosya);
      let adet = 0;
      try {
        adet = kayitSay(JSON.parse(fs.readFileSync(path.join(dizin, dosya), "utf-8")));
      } catch {
        // Bozuk dosyayı soru-denetim.cjs zaten yakalıyor.
      }
      const konuVar = fs.existsSync(path.join(KOK, "topics", brans.name, `${konu}.json`));
      const kayit = { yol: `${brans.name}/${dosya}`, konu: `${brans.name}/${konu}`, adet };
      (konuVar ? saglam : yetim).push(kayit);
    }
  }
  return { yetim, saglam };
}

const TURLER = [
  ["quizzes", "soru"],
  ["flashcards", "kart"],
  ["vakalar", "adım"],
];

let toplamYetim = 0;
const satirlar = [];

for (const [ad, birim] of TURLER) {
  const { yetim, saglam } = tur(ad);
  const sTop = saglam.reduce((a, b) => a + b.adet, 0);
  const yTop = yetim.reduce((a, b) => a + b.adet, 0);
  satirlar.push(
    `${ad.padEnd(11)} erişilebilir: ${String(saglam.length).padStart(3)} dosya / ` +
      `${String(sTop).padStart(4)} ${birim}   ·   yetim: ${yetim.length} dosya / ${yTop} ${birim}`
  );
  for (const y of yetim) {
    toplamYetim++;
    satirlar.push(`    ${y.yol}  →  konu dosyası yok: topics/${y.konu}.json  (${y.adet} ${birim})`);
  }
}

console.log(satirlar.join("\n"));

if (toplamYetim === 0) {
  console.log("\nyetim dosya yok — her içerik dosyasının bir konusu var.");
} else {
  console.log(
    `\n${toplamYetim} yetim dosya. Bunlara arayüzden ulaşılamıyor; ` +
      `ya konu dosyası eklenmeli ya da dosya kaldırılmalı.`
  );
}
