/* Bölme denetimi — kullanıcı sayısına bölerken payda 0 olabilir mi?
 *
 * `sayiGirildiMi` HAM DİZEYE bakıyor, yani kullanıcı bir paydaya "0" yazarsa
 * kapı GEÇİYOR ve bölme korumasız kalır — sonuç Infinity. Boş alan zaten
 * parseLocaleNumber("") ile 0 dönüyor ama orada kapı tutuyor; asıl açık
 * kullanıcının bilerek 0 yazması.
 *
 * Eleme BÖLME NOKTASI düzeyinde yapılır; dosya düzeyinde elemek aynı
 * dosyadaki ikinci bölmeyi gizler (CLAUDE.md'de kayıtlı tuzak) — ilk sürüm
 * tam olarak bunu yapıyordu.
 *
 * KAPI DEĞİL RAPOR: ölçüt kaynaktan aday üretir, kararı insan verir.
 *
 * ── AÇIK ADAYIN VERDİKTİ — YENİDEN KOVALAMAYIN ──────────────────────
 *
 *   ktv:103  /t  ->  KUSUR DEĞİL, ekran metni.
 *     Satır bir <p> içinde basılan FORMÜL: "eKt/V = spKt/V − (0.6×spKt/V / t)".
 *     Koddaki gerçek bölme `/ tHours` ve kapısı var (`hasAll` içinde t > 0).
 *     İlan–gerçek çelişkisi de yok: aynı kutudaki açıklama "t = seans süresi
 *     (saat)" diyor ve araç dönüşümü kendisi yapıp "t = 4.00 saat" basıyor.
 *     Girdi alanı dakika; dönüşüm kullanıcıdan gizlenmiyor.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const kokArg = process.argv.indexOf('--kok');
const KOK = kokArg > 0 ? process.argv[kokArg + 1] : 'app/tools';

function tara(kok) {
  const bulgu = [];
  let dosya = 0;
  let nokta = 0;
  for (const d of fs.readdirSync(kok, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith('_')) continue;
    const p = path.join(kok, d.name, 'page.tsx');
    if (!fs.existsSync(p)) continue;
    dosya++;
    const s = fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
    const adlar = [...s.matchAll(/const\s+(\w+)\s*=\s*parseLocaleNumber\(/g)].map((m) => m[1]);
    if (!adlar.length) continue;
    const satirlar = s.split('\n');
    for (let i = 0; i < satirlar.length; i++) {
      for (const ad of adlar) {
        /* `</p>` KAPANIŞ ETİKETİ BÖLME DEĞİL. Bu araçlarda değişken adı tek
         * harfli (`p`, `t`, `h1`) ve ölçüt ilk turda 17 sahte bulgu verdi —
         * hepsi JSX kapanış etiketiydi. Bölme işaretinin önü `<` olamaz. */
        if (!new RegExp('[^<]/\\s*' + ad + '\\b').test(satirlar[i])) continue;
        nokta++;
        /* Kapı, bölmenin BULUNDUĞU ifadede aranır: aynı satır ya da onu açan
         * koşul (üstteki 6 satır — `const x = makul ? ... : 0` üçlüsü). */
        const pencere = satirlar.slice(Math.max(0, i - 6), i + 1).join('\n');
        const kapi = new RegExp(
          ad + '\\s*>\\s*0|' +
          ad + '\\s*>=\\s*[1-9]|' +
          ad + '\\s*!==\\s*0|' +
          ad + '\\s*&&|' +
          '\\w*[Mm]akul\\b|' +
          '\\w*[Tt]amam\\b'
        );
        if (kapi.test(pencere)) continue;
        bulgu.push({ arac: d.name, degisken: ad, satir: i + 1, kod: satirlar[i].trim().slice(0, 90) });
      }
    }
  }
  return { bulgu, dosya, nokta };
}

if (process.argv.includes('--kontrol')) {
  const t = fs.mkdtempSync(path.join(os.tmpdir(), 'bolme-'));
  const yaz = (ad, satir) => {
    fs.mkdirSync(path.join(t, ad));
    fs.writeFileSync(path.join(t, ad, 'page.tsx'), satir.join('\n'), 'utf8');
  };
  /* NEGATİF: korumasız bölme -> YAKALANMALI */
  yaz('zz-bozuk', [
    'const hacimNum = parseLocaleNumber(hacim);',
    'const hiz = Math.round(toplam / hacimNum);',
  ]);
  /* POZİTİF: üç temiz biçim -> İŞARETLENMEMELİ.
   * Ölçüt fazla genişse rapor kullanılamaz hâle gelir. */
  yaz('zz-temiz-a', [
    'const mlNum = parseLocaleNumber(torbaMl);',
    'const makul = mlNum > 0 && mlNum <= 5000;',
    'const derisim = makul ? mgNum / mlNum : 0;',
  ]);
  yaz('zz-temiz-b', [
    'const kgNum = parseLocaleNumber(kilo);',
    'const oran = kgNum && toplam / kgNum;',
  ]);
  yaz('zz-temiz-c', [
    'const dakikaNum = parseLocaleNumber(dakika);',
    'const bolusMakul =',
    '  dakika.trim() !== "" && dakikaNum > 0 && dakikaNum <= 240;',
    'const pompa = bolusMakul ? Math.round((hacimNum / dakikaNum) * 60) : 0;',
  ]);
  /* JSX kapanış etiketi: gerçek taramada 17 sahte bulgu üretti. */
  yaz('zz-temiz-d', [
    'const p = parseLocaleNumber(protein);',
    'return <div><p className="x">Değer</p></div>;',
  ]);
  const { bulgu } = tara(t);
  fs.rmSync(t, { recursive: true, force: true });
  const adlar = bulgu.map((b) => b.arac);
  const negatif = adlar.includes('zz-bozuk');
  const sahte = ['zz-temiz-a', 'zz-temiz-b', 'zz-temiz-c', 'zz-temiz-d'].filter((x) => adlar.includes(x));
  if (!negatif) console.log('negatif kontrol DÜŞTÜ — korumasız bölme yakalanmadı, ölçüt KÖR.');
  if (sahte.length) console.log('pozitif kontrol DÜŞTÜ — sahte bulgu: ' + sahte.join(', '));
  if (!negatif || sahte.length) process.exit(1);
  console.log('negatif + pozitif kontrol GEÇTİ — korumasız bölme yakalanıyor, üç temiz biçim işaretlenmiyor.');
  process.exit(0);
}

const { bulgu, dosya, nokta } = tara(KOK);
console.log('bölme denetimi — ' + dosya + ' araç, ' + nokta + ' bölme noktası tarandı');
console.log('sıfır kapısı görünmeyen: ' + bulgu.length);
for (const b of bulgu) {
  console.log('  ' + b.arac + ':' + b.satir + '  /' + b.degisken);
  console.log('      ' + b.kod);
}
