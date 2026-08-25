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
 *   node scripts/baslik-index.cjs             # üretir ve yazar
 *   node scripts/baslik-index.cjs --kontrol   # yazmadan: indeks bayat mı?
 *
 * Yeni konu eklendiğinde çalıştır. Çalıştırılmazsa kart, slug'dan türeyen
 * başlıkla basılır — bozulmaz, sadece daha az güzel görünür.
 *
 * `--kontrol` NEDEN VAR: bu betik CI'da çalışmıyor, yani biri konu ekleyip
 * çalıştırmayı unutursa indeks sessizce bayatlıyor. Aynı boşluk araç
 * indeksinde de vardı ve orada daha pahalıya patladı — üreteç kaynak yolu
 * değişince hiç araç bulamadı ve 114 kayıtlık indeksi `[]` ile EZDİ,
 * hatasız, çıkış kodu 0. Ders genel: ayrıştırmaya dayanan bir üreteç boş
 * sonucu asla meşru saymamalı.
 *
 * Buradaki iki koruma o dersten geliyor:
 *   1. Sıfır başlık bulunursa YAZMAZ (kaynak dizin yerinde duruyorsa sıfır
 *      "içerik yok" değil "okuma bozuldu" demektir).
 *   2. `--kontrol` hiçbir şey yazmadan indeksi yeniden hesaplayıp
 *      karşılaştırır, fark varsa neyin eksik/fazla/değişmiş olduğunu yazar
 *      ve çıkış kodu 1 döner. CI adımı olmaya hazır.
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
        // Gizli konular dizine girmez. Dizin yalnızca paylaşım kartı başlığı
        // için değil, /topics kartındaki konu sayısı için de kullanılıyor;
        // gizlileri sayarsa kart "456 konu" derken sayfa "411" diyor ve iki
        // yüzey birbirini tutmuyor.
        if (veri?.meta?.hidden === true) continue;
        if (typeof veri?.title === 'string' && veri.title.trim()) {
          index[`${brans}/${slug}`] = veri.title.trim();
          konu++;
        }
      } catch {
        // Bozuk dosya dizini bozmasın; o konu slug'dan türeyen başlıkla gösterilir.
      }
    }
  }

  /* Anahtar sırası KOD NOKTASINA göre — `localeCompare` DEĞİL.
   * `localeCompare` çalışma zamanının yerel ayarına bağlı, yani aynı
   * içerikten Windows (tr-TR) ile Linux FARKLI bayt üretiyor. Bu dosyanın
   * `--kontrol`ü içerik karşılaştırdığı için CI bundan düşmez; bedeli
   * sessiz: iki makinede üretilen indeks arasında sürekli sahte git farkı
   * (ölçüldü: 410 anahtarın 95'i yer değiştiriyor).
   * Kardeş üreteç `ilgili-index.cjs` aynı sebeple kod noktasına çevrildi —
   * orada bedel daha ağırdı ve CI'yı 1,5 gün kırmızı tuttu. */
  const sirali = Object.fromEntries(
    Object.entries(index).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  );

  // Boş sonuca ASLA yazma — bkz. üstteki not.
  if (konu === 0) {
    console.error('HATA: hiç başlık bulunamadı. İçerik dizini yerinde mi?');
    console.error('Mevcut indeks korundu; boş sonuç meşru sayılmıyor.');
    process.exitCode = 1;
    return;
  }

  if (process.argv.includes('--kontrol')) {
    let mevcut = null;
    try {
      mevcut = JSON.parse(fs.readFileSync(HEDEF, 'utf-8'));
    } catch {
      console.error('baslik-index.json okunamadı — üretmek için: node scripts/baslik-index.cjs');
      process.exitCode = 1;
      return;
    }
    const eksik  = Object.keys(sirali).filter((k) => !(k in mevcut));
    const fazla  = Object.keys(mevcut).filter((k) => !(k in sirali));
    const farkli = Object.keys(sirali).filter((k) => k in mevcut && mevcut[k] !== sirali[k]);

    if (!eksik.length && !fazla.length && !farkli.length) {
      console.log(`baslik-index.json senkron (${konu} başlık).`);
      return;
    }
    console.log(`baslik-index.json BAYAT — indekste ${Object.keys(mevcut).length}, olması gereken ${konu}`);
    for (const k of eksik)  console.log(`  eksik   : ${k}`);
    for (const k of fazla)  console.log(`  fazla   : ${k}`);
    for (const k of farkli) console.log(`  değişmiş: ${k}`);
    console.log('');
    console.log('Çare: node scripts/baslik-index.cjs');
    process.exitCode = 1;
    return;
  }

  fs.writeFileSync(HEDEF, JSON.stringify(sirali, null, 1) + '\n');

  console.log(`branş: ${branslar.length} | başlık: ${konu}`);
  console.log(`yazıldı: content/baslik-index.json`);
}

main();
