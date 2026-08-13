#!/usr/bin/env node
/**
 * content/canonical altındaki konu başlıklarını tek bir JSON'a toplar.
 *
 * Neden gerekiyor: paylaşım görseli (opengraph-image) rotasında `fs`
 * kullanılamıyor — ne düz ne de tembel içe aktarmayla; paketleyici modülü
 * çözemeyip isteği hata bile göstermeden düşürüyor. Başlığı slug'dan türetmek
 * ise Türkçe harfleri kaybediyor ("Akut Böbrek Hasarı" yerine "akut bobrek
 * hasari"), ki paylaşım kartında bu kabul edilemez. Statik JSON içe aktarımı
 * paketlendiği için her çalışma zamanında güvenle okunuyor.
 *
 * Kullanım (web/ dizininden):
 *   node scripts/baslik-index.cjs
 *
 * Yeni konu eklendiğinde çalıştır. Çalıştırılmazsa kart, slug'dan türeyen
 * başlıkla basılır — bozulmaz, sadece daha az güzel görünür.
 */
const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const ICERIK = path.join(KOK, 'content', 'canonical');
const HEDEF = path.join(KOK, 'content', 'baslik-index.json');

function main() {
  const index = {};
  let konu = 0;

  const branslar = fs
    .readdirSync(ICERIK, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);

  for (const brans of branslar) {
    const dizin = path.join(ICERIK, brans);
    for (const dosya of fs.readdirSync(dizin).filter((f) => f.endsWith('.json'))) {
      const slug = dosya.replace(/\.json$/, '');
      try {
        const veri = JSON.parse(fs.readFileSync(path.join(dizin, dosya), 'utf-8'));
        if (typeof veri?.title === 'string' && veri.title.trim()) {
          index[`${brans}/${slug}`] = veri.title.trim();
          konu++;
        }
      } catch {
        // Bozuk dosya dizini bozmasın; o konu slug'dan türeyen başlıkla gösterilir.
      }
    }
  }

  const sirali = Object.fromEntries(Object.entries(index).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(HEDEF, JSON.stringify(sirali, null, 1) + '\n');

  console.log(`branş: ${branslar.length} | başlık: ${konu}`);
  console.log(`yazıldı: content/baslik-index.json`);
}

main();
