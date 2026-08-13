#!/usr/bin/env node
/**
 * İçerik HTML'lerinin içindeki iç bağlantıları denetler.
 *
 * Konu metinleri HTML olarak saklanıyor ve içlerinde başka konulara/araçlara
 * bağlantılar var. Bir konu yeniden adlandırıldığında bu bağlantılar sessizce
 * eskiyor: okuyucu tıklıyor, 404 buluyor. Hiçbir derleme kapısı bunu yakalamaz,
 * çünkü bağlantı kodda değil veride.
 *
 * İlk çalıştırmada 18 iç bağlantının 3'ü kırıktı (hepsi hematolojik
 * maligniteler sayfasından; hedefler yeniden adlandırılmıştı). Onlar için
 * next.config.js'e 301 yönlendirmesi kondu.
 *
 * Kullanım (web/ dizininden):
 *   node scripts/link-denetim.cjs
 *
 * Çıkış kodu: kırık bağlantı varsa 1, yoksa 0 — istenirse CI'a bağlanabilir.
 */
const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const CANONICAL = path.join(KOK, 'content', 'canonical');
const ARACLAR = path.join(KOK, 'app', 'tools');

function konulariTopla() {
  const küme = new Set();
  for (const brans of fs.readdirSync(CANONICAL, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const f of fs.readdirSync(path.join(CANONICAL, brans.name)).filter((f) => f.endsWith('.json'))) {
      küme.add(`${brans.name}/${f.replace(/\.json$/, '')}`);
    }
  }
  return küme;
}

function araclariTopla() {
  try {
    return new Set(
      fs
        .readdirSync(ARACLAR, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    );
  } catch {
    return new Set();
  }
}

function main() {
  const konular = konulariTopla();
  const araclar = araclariTopla();

  const kirik = [];
  let toplam = 0;

  // href="/..." ve JSON içinde kaçırılmış href=\"/..." biçimlerinin ikisi de.
  const re = /href=\\?"(\/[^"\\]+)/g;

  for (const brans of fs.readdirSync(CANONICAL, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const f of fs.readdirSync(path.join(CANONICAL, brans.name)).filter((f) => f.endsWith('.json'))) {
      const kaynak = `${brans.name}/${f.replace(/\.json$/, '')}`;
      const metin = fs.readFileSync(path.join(CANONICAL, brans.name, f), 'utf-8');

      let m;
      while ((m = re.exec(metin))) {
        const yol = m[1];
        toplam++;

        const konu = yol.match(/^\/topics\/([^/]+)\/([^/#?]+)/);
        if (konu && !konular.has(`${konu[1]}/${konu[2]}`)) {
          kirik.push({ tur: 'konu', kaynak, hedef: yol });
          continue;
        }

        const arac = yol.match(/^\/tools\/([^/#?]+)/);
        if (arac && !araclar.has(arac[1])) {
          kirik.push({ tur: 'araç', kaynak, hedef: yol });
        }
      }
    }
  }

  console.log(`içerikteki iç bağlantı: ${toplam}`);
  if (!kirik.length) {
    console.log('kırık bağlantı yok.');
    return;
  }

  console.log(`KIRIK: ${kirik.length}`);
  for (const k of kirik) console.log(`  ${k.tur.padEnd(5)} ${k.kaynak.padEnd(46)} -> ${k.hedef}`);
  console.log('\nDüzeltme: hedefi yeniden adlandırılmışsa next.config.js redirects listesine ekle,');
  console.log('hedef gerçekten yoksa içerikteki bağlantıyı kaldır.');
  process.exitCode = 1;
}

main();
