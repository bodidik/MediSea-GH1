#!/usr/bin/env node
/**
 * İÇERİK KAZASI TARAMASI — gövde benzerliği.
 *
 * Belgede kayıtlı iki gerçek kaza (dosya adı bir konu, içeriği BAŞKA konu)
 * ÇİFT BAŞLIK sinyaliyle bulunmuştu. Gövde hiç karşılaştırılmamıştı:
 * kopyalanıp yeniden yazılmayan bir dosya aynı başlığı TAŞIMAZ ama gövdesi
 * kaynağıyla neredeyse aynı kalır.
 *
 * ÖLÇÜLEN SONUÇ (bu depoda, eşik 0.35): 428 konu, 4 çift — DÖRDÜ DE zaten
 * bilinen çift-başlık kayıtları. Yani bu ölçüt gerçek kopya içeriği buluyor
 * (pozitif kontrolü kendi bulgusu) ve yeni kaza üretmiyor.
 *
 * DENENİP ÇÜRÜTÜLEN İKİ ÖLÇÜT — yeniden icat edilmesin:
 *
 *  1) BAŞLIK–gövde tutarlılığı (başlığın ayırt edici kelimeleri gövdede
 *     geçiyor mu). Belgedeki iki kazayı YAKALAMIYOR, çünkü o dosyaların
 *     BAŞLIĞI gövdeye göre düzeltilmiş; yanlış kalan yalnızca DOSYA ADI.
 *
 *  2) SLUG kelime SIKLIĞI (kazalı dosya slug terimini seyrek anar varsayımı).
 *     VERİYLE ÇÜRÜTÜLDÜ: sağlıklı `endokrinoloji/addison` kendi slug kelimesini
 *     2 kez (‰3.1) geçiriyor; kazalı `hiperkalsemi-ve-hiperparatiroidi` ise
 *     `hiperkalsemi`yi 5 kez (‰4.0). Yani sağlıklı dosya kazalıdan DAHA AZ
 *     anıyor — eşik ayıramıyor. Sebep: sağlam bir konu kendi adını değil
 *     eşanlamlısını kullanıyor ("Addison" yerine "adrenal yetmezlik").
 *
 * SONUÇ: bu kaza sınıfı sözlüksel ölçütle güvenilir bulunamıyor. İki kazayı da
 * bulan sinyal YAPISALDI (aynı başlığı taşıyan iki dosya, `konu-denetim`).
 *
 * Ölçüt: gövdeden 5-kelimelik parmak izleri (shingle) çıkar, Jaccard benzerliği
 * hesapla. Yüksek benzerlik KUSUR DEĞİL, inceleme gerekçesidir — bir konu
 * ailesinin üyeleri (ör. aynı ilacın iki yan başlığı) meşru biçimde benzeşir.
 */
const fs = require('fs');
const path = require('path');

const KOK = process.argv[2] || '.';
const ESIK = parseFloat(process.argv[3] || '0.35');

function govde(j) {
  const parcalar = [];
  if (j.summary) parcalar.push(String(j.summary));
  for (const s of j.sections || []) {
    if (s.heading) parcalar.push(String(s.heading));
    parcalar.push(String(s.text || s.html || ''));
  }
  return parcalar.join(' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .toLocaleLowerCase('tr')
    .replace(/[^a-zçğıöşü0-9 ]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function shingles(metin, n = 5) {
  const k = metin.split(' ').filter(Boolean);
  const s = new Set();
  for (let i = 0; i + n <= k.length; i++) s.add(k.slice(i, i + n).join(' '));
  return s;
}

const kayitlar = [];
const dizin = path.join(KOK, 'content/canonical');
for (const b of fs.readdirSync(dizin)) {
  const d = path.join(dizin, b);
  if (!fs.statSync(d).isDirectory()) continue;
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith('.json')) continue;
    let j;
    try { j = JSON.parse(fs.readFileSync(path.join(d, f), 'utf8')); } catch (e) { continue; }
    const g = govde(j);
    if (g.split(' ').length < 60) continue; // çok kısa gövde anlamlı karşılaştırılamaz
    kayitlar.push({
      yol: b + '/' + f.slice(0, -5),
      baslik: j.title || '',
      gizli: j?.meta?.hidden === true,
      uzunluk: g.length,
      sh: shingles(g),
    });
  }
}

console.log('karşılaştırılan konu: ' + kayitlar.length + '   eşik: ' + ESIK);

const ciftler = [];
for (let i = 0; i < kayitlar.length; i++) {
  for (let j = i + 1; j < kayitlar.length; j++) {
    const a = kayitlar[i], b = kayitlar[j];
    // boyut farkı çok büyükse Jaccard zaten düşük kalır — ucuz eleme
    const kucuk = Math.min(a.sh.size, b.sh.size), buyuk = Math.max(a.sh.size, b.sh.size);
    if (!kucuk || kucuk / buyuk < ESIK) continue;
    let kesisim = 0;
    const [az, cok] = a.sh.size < b.sh.size ? [a.sh, b.sh] : [b.sh, a.sh];
    for (const s of az) if (cok.has(s)) kesisim++;
    const benzerlik = kesisim / (a.sh.size + b.sh.size - kesisim);
    if (benzerlik >= ESIK) ciftler.push({ a, b, benzerlik, kesisim });
  }
}

ciftler.sort((x, y) => y.benzerlik - x.benzerlik);
console.log('eşiği aşan çift: ' + ciftler.length + '\n');
for (const c of ciftler.slice(0, 25)) {
  const g = (x) => x.gizli ? ' [gizli]' : '';
  console.log('  %' + (100 * c.benzerlik).toFixed(0).padStart(3) + '  ' + c.a.yol + g(c.a) + '  ↔  ' + c.b.yol + g(c.b));
  console.log('          "' + c.a.baslik.slice(0, 52) + '"  |  "' + c.b.baslik.slice(0, 52) + '"');
}
