#!/usr/bin/env node
/**
 * Premium soru (quiz) ve kart dosyalarının yapısal denetimi.
 *
 * Sınav hazırlık ürününde bozuk bir soru yalnızca arayüz hatası değil,
 * YANLIŞ BİLGİdir: doğru cevabı olmayan ya da var olmayan bir şıkkı işaret
 * eden soru, kullanıcının o konuyu yanlış öğrenmesine yol açar. Bu tür
 * hatalar lint/typecheck/build'in hiçbirine takılmaz — veri, kod değil.
 *
 * Denetlenenler:
 *   - soru metni ve şıklar var mı, en az iki şık var mı
 *   - `dogru` alanı şıklardan birini gösteriyor mu
 *   - aynı dosyada mükerrer soru kimliği var mı
 *   - şık açıklamaları var olmayan şıkka atıfta bulunuyor mu
 *   - kart dosyalarında ön/arka yüz boş mu
 *
 * Kullanım (web/ dizininden):
 *   node scripts/soru-denetim.cjs
 *
 * Çıkış kodu: kusur varsa 1.
 */
const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const QUIZ = path.join(KOK, 'content', 'premium', 'ydus', 'quizzes');
const KART = path.join(KOK, 'content', 'premium', 'ydus', 'flashcards');

function* dosyalar(kokDizin) {
  let girisler;
  try {
    girisler = fs.readdirSync(kokDizin, { withFileTypes: true });
  } catch {
    return;
  }
  for (const g of girisler) {
    const tam = path.join(kokDizin, g.name);
    if (g.isDirectory()) yield* dosyalar(tam);
    else if (g.name.endsWith('.json')) yield tam;
  }
}

function kisaAd(dosya) {
  return path.relative(path.join(KOK, 'content', 'premium', 'ydus'), dosya).replace(/\\/g, '/');
}

/** Şık kimliklerini normalize eder: dizi ise indeks harfi, nesne ise anahtar. */
function sikKimlikleri(secenekler) {
  if (Array.isArray(secenekler)) {
    // Dizi iki biçimde olabiliyor: ["A","B",...] ya da [{harf,metin}] ya da düz metinler.
    const hepsiKisaHarf = secenekler.every((s) => typeof s === 'string' && /^[A-E]$/.test(s.trim()));
    if (hepsiKisaHarf) return secenekler.map((s) => s.trim());
    return secenekler.map((s, i) => (s && typeof s === 'object' && s.harf ? String(s.harf) : String.fromCharCode(65 + i)));
  }
  if (secenekler && typeof secenekler === 'object') return Object.keys(secenekler);
  return [];
}

function quizDenetle(kusurlar) {
  let soruSayisi = 0;
  let dosyaSayisi = 0;

  for (const dosya of dosyalar(QUIZ)) {
    dosyaSayisi++;
    const ad = kisaAd(dosya);
    let veri;
    try {
      veri = JSON.parse(fs.readFileSync(dosya, 'utf-8'));
    } catch (e) {
      kusurlar.push({ dosya: ad, kusur: 'JSON ayrıştırılamıyor: ' + e.message });
      continue;
    }

    const sorular = veri?.sorular ?? veri?.questions;
    if (!Array.isArray(sorular) || sorular.length === 0) {
      kusurlar.push({ dosya: ad, kusur: 'soru listesi yok ya da boş' });
      continue;
    }

    const gorulen = new Set();
    sorular.forEach((s, i) => {
      soruSayisi++;
      const yer = `soru ${s?.id ?? '#' + (i + 1)}`;

      if (s?.id) {
        if (gorulen.has(s.id)) kusurlar.push({ dosya: ad, kusur: `${yer}: mükerrer soru kimliği` });
        gorulen.add(s.id);
      }

      const metin = s?.metin ?? s?.text ?? s?.soru;
      if (!metin || String(metin).trim().length < 5) {
        kusurlar.push({ dosya: ad, kusur: `${yer}: soru metni yok ya da çok kısa` });
      }

      const siklar = sikKimlikleri(s?.secenekler ?? s?.options);
      if (siklar.length < 2) {
        kusurlar.push({ dosya: ad, kusur: `${yer}: şık sayısı ${siklar.length} (en az 2 olmalı)` });
        return;
      }

      const dogru = s?.dogru ?? s?.correct ?? s?.correctAnswer;
      if (dogru === undefined || dogru === null || String(dogru).trim() === '') {
        kusurlar.push({ dosya: ad, kusur: `${yer}: doğru cevap belirtilmemiş` });
      } else if (!siklar.includes(String(dogru).trim())) {
        kusurlar.push({
          dosya: ad,
          kusur: `${yer}: doğru cevap "${dogru}" şıklar arasında yok (${siklar.join(',')})`,
        });
      }

      // Şık açıklamaları var olmayan şıkka atıf yapmasın.
      const acik = s?.secenekAciklamalari;
      if (acik && typeof acik === 'object' && !Array.isArray(acik)) {
        for (const harf of Object.keys(acik)) {
          if (!siklar.includes(harf)) {
            kusurlar.push({ dosya: ad, kusur: `${yer}: "${harf}" şıkkı için açıklama var ama böyle bir şık yok` });
          }
        }
      }
    });
  }

  return { dosyaSayisi, soruSayisi };
}

function kartDenetle(kusurlar) {
  let kartSayisi = 0;
  let dosyaSayisi = 0;

  for (const dosya of dosyalar(KART)) {
    dosyaSayisi++;
    const ad = kisaAd(dosya);
    let veri;
    try {
      veri = JSON.parse(fs.readFileSync(dosya, 'utf-8'));
    } catch (e) {
      kusurlar.push({ dosya: ad, kusur: 'JSON ayrıştırılamıyor: ' + e.message });
      continue;
    }

    const kartlar = veri?.cards ?? veri?.kartlar;
    if (!Array.isArray(kartlar) || kartlar.length === 0) {
      kusurlar.push({ dosya: ad, kusur: 'kart listesi yok ya da boş' });
      continue;
    }

    const gorulen = new Set();
    kartlar.forEach((k, i) => {
      kartSayisi++;
      const yer = `kart ${k?.id ?? '#' + (i + 1)}`;
      if (k?.id) {
        if (gorulen.has(k.id)) kusurlar.push({ dosya: ad, kusur: `${yer}: mükerrer kart kimliği` });
        gorulen.add(k.id);
      }
      if (!k?.front || String(k.front).trim().length < 2) kusurlar.push({ dosya: ad, kusur: `${yer}: ön yüz boş` });
      if (!k?.back || String(k.back).trim().length < 2) kusurlar.push({ dosya: ad, kusur: `${yer}: arka yüz boş` });
    });
  }

  return { dosyaSayisi, kartSayisi };
}

function main() {
  const kusurlar = [];
  const q = quizDenetle(kusurlar);
  const k = kartDenetle(kusurlar);

  console.log(`quiz dosyası: ${q.dosyaSayisi} | soru: ${q.soruSayisi}`);
  console.log(`kart dosyası: ${k.dosyaSayisi} | kart: ${k.kartSayisi}`);

  if (!kusurlar.length) {
    console.log('yapısal kusur yok.');
    return;
  }

  console.log(`\nKUSUR: ${kusurlar.length}`);
  for (const x of kusurlar) console.log(`  ${x.dosya.padEnd(52)} ${x.kusur}`);
  process.exitCode = 1;
}

main();
