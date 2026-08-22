#!/usr/bin/env node
/* KARAR KAYNAĞI DENETİMİ — renk, kararı veren alandan mı geliyor?
 *
 * Doğduğu kusur (`spot-urine`, TTKG kartı): yorum fonksiyonu `ok` alanını
 * döndürüyor ve dosyanın geri kalanı onunla boyanıyordu; TEK bir kart bunu
 * ATLAYIP kararı ham değerlerden yeniden hesaplıyordu (`ttkg >= 5 && pkN > 5`).
 * Üç durumun ikisi yanlış boyanıyordu:
 *
 *   hipokalemik, TTKG 8 = renal K kaybı (ANORMAL) -> büyük sayı MAVİ
 *   normokalemik, TTKG 6 = yoruma girmiyor        -> ALARM KIRMIZISI
 *
 * ── ÖLÇÜT NEDEN "OKUNMAYAN ALAN" DEĞİL ──────────────────────────────
 *
 * İlk ölçüt "dönüş nesnesinde hiç okunmayan alan" arıyordu ve TARİHSEL
 * KONTROLDE DÜŞTÜ: `ok` aslında okunuyordu — paylaşılan `ResultRow` bileşeni
 * satırları ondan boyuyor. Kusur "alan hiç okunmuyor" değil, **"her yerde
 * okunuyor ama TEK bir yerde atlanıp yeniden hesaplanıyor"**dı.
 *
 * Ölçüt bu yüzden İKİ koşulun KESİŞİMİ:
 *   (a) dosyada bir KARAR ALANI döndürülüyor (`ok:` gibi)
 *   (b) bir `className` ifadesi kararı HAM SAYI karşılaştırmasından üretiyor
 *
 * (b) tek başına meşru olabilir — karar alanı hiç yoksa atlanacak bir şey de
 * yoktur. Asıl şüphe, aynı dosyada iki gerçekliğin bir arada olması.
 *
 * KAPI DEĞİL RAPOR: ölçüt aday üretir, kararı kaynağı okumak verir.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const KOK = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'app/tools';

const KARAR_ALANI = /return \{[^{}]*\b(?:ok|gecerli|uygun|normal|iyi)\s*:/;
const HAM_KOSUL = /className=[^>]*\b[a-zA-Z_$][\w$]* *(?:<=|>=|<|>) *-?[0-9.]+ *(?:&&|\?)/;

function tara(kok) {
  const bulgu = [];
  let arac = 0;
  for (const d of fs.readdirSync(kok, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith('_')) continue;
    const f = path.join(kok, d.name, 'page.tsx');
    if (!fs.existsSync(f)) continue;
    arac++;
    const s = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
    if (!KARAR_ALANI.test(s)) continue;
    const satirlar = s.split('\n');
    const vurus = [];
    for (let i = 0; i < satirlar.length; i++) {
      if (HAM_KOSUL.test(satirlar[i])) vurus.push({ satir: i + 1, kod: satirlar[i].trim().slice(0, 100) });
    }
    if (vurus.length) bulgu.push({ arac: d.name, vurus });
  }
  return { bulgu, arac };
}

if (process.argv.includes('--kontrol')) {
  const t = fs.mkdtempSync(path.join(os.tmpdir(), 'karar-'));
  const yaz = (ad, g) => { fs.mkdirSync(path.join(t, ad)); fs.writeFileSync(path.join(t, ad, 'page.tsx'), g, 'utf8'); };
  /* NEGATİF: karar alanı VAR ama renk ham değerden -> YAKALANMALI */
  yaz('zz-bozuk', [
    'const yorum = (v) => { return { txt: "x", ok: v > 5 }; };',
    'const A = () => <p className={`text-4xl ${deger >= 5 ? "text-sky-700" : "text-rose-700"}`}>{v}</p>;',
  ].join('\n'));
  /* POZİTİF 1: renk KARAR ALANINDAN geliyor -> işaretlenmemeli */
  yaz('zz-temiz', [
    'const yorum = (v) => { return { txt: "x", ok: v > 5 }; };',
    'const A = () => <p className={`text-4xl ${y.ok === false ? "text-rose-700" : "text-sky-700"}`}>{v}</p>;',
  ].join('\n'));
  /* POZİTİF 2: karar alanı YOK; ham karşılaştırma meşru -> işaretlenmemeli */
  yaz('zz-hamsiz', [
    'const A = () => <p className={`text-4xl ${deger >= 5 ? "text-sky-700" : "text-rose-700"}`}>{v}</p>;',
  ].join('\n'));

  const { bulgu } = tara(t);
  fs.rmSync(t, { recursive: true, force: true });
  const adlar = bulgu.map((b) => b.arac);
  const negatif = adlar.includes('zz-bozuk');
  const sahte = ['zz-temiz', 'zz-hamsiz'].filter((x) => adlar.includes(x));
  if (!negatif) console.log('negatif kontrol DÜŞTÜ — karar alanı varken ham koşullu renk yakalanmadı, ölçüt KÖR.');
  if (sahte.length) console.log('pozitif kontrol DÜŞTÜ — sahte bulgu: ' + sahte.join(', '));
  if (!negatif || sahte.length) process.exit(1);
  console.log('negatif + pozitif kontrol GEÇTİ — atlama yakalanıyor, iki meşru biçim işaretlenmiyor.');
  process.exit(0);
}

const { bulgu, arac } = tara(KOK);
console.log(`karar kaynağı denetimi — ${arac} araç tarandı`);
console.log('');
console.log(`karar alanı VARKEN rengi ham değerden hesaplayan araç: ${bulgu.length}`);
for (const b of bulgu) {
  console.log(`  ${b.arac}`);
  for (const v of b.vurus) console.log(`      ${v.satir}: ${v.kod}`);
}
if (!bulgu.length) {
  console.log('');
  console.log('TARİHSEL KONTROL: düzeltme öncesi spot-urine bu ölçütle yakalanıyor');
  console.log('(328/330/332. satırlar). Yani sıfır sonuç körlükten gelmiyor.');
}
