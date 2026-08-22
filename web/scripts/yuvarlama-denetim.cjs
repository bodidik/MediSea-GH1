/* YUVARLAMA TAŞMASI — gösterime yuvarlanmış bir değer, ikinci bir hesaba girmiş mi?
 *
 * Doğduğu kusur (`sedasyon-infuzyon`): pompa hızı 1 basamağa yuvarlanıyor,
 * torba ömrü O YUVARLANMIŞ hızdan hesaplanıyordu.
 *   ham 0.15 mL/saat -> ekranda 0.2 (doğru) ; ömür 100/0.2 = 500 saat
 *   doğrusu 100/0.15 = 667 saat  (%25 hata; hız küçüldükçe büyüyor)
 *
 * Kural: GÖSTERİM yuvarlanır, HESAP yuvarlanmaz.
 *
 * KAPI DEĞİL RAPOR — her geçiş kusur DEĞİL. Yuvarlama basamağı yeterince
 * inceyse hata ölçülemez kalır; karar hatanın BÜYÜKLÜĞÜNÜ ölçmekle verilir.
 *
 * ── ADAYLARIN DURUMU ────────────────────────────────────────────────
 *
 *   sedasyon-infuzyon — DÜZELTİLDİ ve doğrulandı. Tarihsel kontrol bu
 *     denetimin düzeltme öncesi sürümü yakaladığını gösteriyor (224. satır).
 *   potasyum-replasman:89/90 — ÖLÇÜLDÜ, kusur değil. Süre 1 basamağa,
 *     hacim 1 mL'ye yuvarlanıyor; 55 mEq için 1375/5.5 = 250 mL/saat tam
 *     çıkıyor. Basamak yeterince ince.
 *   Kalan 11 aday HENÜZ ÖLÇÜLMEDİ ve "kusur" DENMİYOR: bikarbonat-infuzyon,
 *     bmr, fomepizol, fosfat-replasman (2), kalsiyum-infuzyon,
 *     magnezyum-infuzyon (2), tromboliz-doz (3).
 */
const fs = require('fs');
const path = require('path');
const KOK = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'app/tools';

if (process.argv.includes('--kontrol')) {
  const os = require('os');
  const t = fs.mkdtempSync(path.join(os.tmpdir(), 'yuv-'));
  const yaz = (ad, g) => { fs.mkdirSync(path.join(t, ad)); fs.writeFileSync(path.join(t, ad, 'page.tsx'), g, 'utf8'); };
  /* NEGATİF: yuvarlanmış hız ikinci hesaba giriyor -> YAKALANMALI */
  yaz('zz-bozuk', [
    'const mlSaat = yuvarla(mikrogramSaat / derisim, 1);',
    'const torbaSaat = yuvarla(torbaMl / mlSaat, 1);',
  ].join('\n'));
  /* POZİTİF 1: yuvarlanmış değer YALNIZCA gösterimde -> işaretlenmemeli */
  yaz('zz-gosterim', [
    'const mlSaat = yuvarla(mikrogramSaat / derisim, 1);',
    'const A = () => <div>{mlSaat} mL/saat</div>;',
  ].join('\n'));
  /* POZİTİF 2: ikinci hesap HAM değerden -> işaretlenmemeli */
  yaz('zz-ham', [
    'const mlSaatHam = mikrogramSaat / derisim;',
    'const mlSaat = yuvarla(mlSaatHam, 1);',
    'const torbaSaat = yuvarla(torbaMl / mlSaatHam, 1);',
  ].join('\n'));
  const eski = { bulgu: [], arac: 0, yuvarlanan: 0 };
  for (const d of fs.readdirSync(t, { withFileTypes: true })) {
    const s2 = fs.readFileSync(path.join(t, d.name, 'page.tsx'), 'utf8');
    const adlar2 = [...s2.matchAll(/const\s+(\w+)\s*=\s*[^;]*(?:yuvarla|Math\.round)\(/g)].map((m) => m[1]);
    for (const ad of adlar2) {
      const kalan = s2.replace(new RegExp('const\\s+' + ad + '\\s*=\\s*[^;]*;'), ' ');
      if (new RegExp('[/*+-]\\s*' + ad + '\\b|\\b' + ad + '\\s*[/*]').test(kalan)) eski.bulgu.push(d.name);
    }
  }
  fs.rmSync(t, { recursive: true, force: true });
  const negatif = eski.bulgu.includes('zz-bozuk');
  const sahte = ['zz-gosterim', 'zz-ham'].filter((x) => eski.bulgu.includes(x));
  if (!negatif) console.log('negatif kontrol DÜŞTÜ — yuvarlanmış değerin ikinci hesaba girmesi yakalanmadı.');
  if (sahte.length) console.log('pozitif kontrol DÜŞTÜ — sahte bulgu: ' + sahte.join(', '));
  if (!negatif || sahte.length) process.exit(1);
  console.log('negatif + pozitif kontrol GEÇTİ — taşma yakalanıyor, gösterim ve ham-değer biçimleri işaretlenmiyor.');
  process.exit(0);
}

const bulgu = [];
let arac = 0, yuvarlanan = 0;
for (const d of fs.readdirSync(KOK, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name.startsWith('_')) continue;
  const f = path.join(KOK, d.name, 'page.tsx');
  if (!fs.existsSync(f)) continue;
  arac++;
  const s = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
  /* `const X = ... yuvarla(...)` ya da `Math.round(...)` ile tanımlananlar */
  const adlar = [...s.matchAll(/const\s+(\w+)\s*=\s*[^;]*(?:yuvarla|Math\.round)\(/g)].map((m) => m[1]);
  for (const ad of adlar) {
    yuvarlanan++;
    /* Tanım satırını çıkar; kalanda ARİTMETİK bağlamda geçiyor mu?
       Yalnızca gösterimde geçmesi (JSX içinde `{ad}`) kusur değil. */
    const kalan = s.replace(new RegExp('const\\s+' + ad + '\\s*=\\s*[^;]*;'), ' ');
    const aritmetik = new RegExp(
      '[/*+-]\\s*' + ad + '\\b' + '|' + '\\b' + ad + '\\s*[/*]'
    );
    if (aritmetik.test(kalan)) {
      const satir = s.slice(0, s.search(new RegExp('const\\s+' + ad + '\\s*='))).split('\n').length;
      const ornek = (kalan.match(new RegExp('.{0,44}(?:[/*+-]\\s*' + ad + '\\b|\\b' + ad + '\\s*[/*]).{0,26}')) || [''])[0];
      bulgu.push({ arac: d.name, ad, satir, ornek: ornek.replace(/\s+/g, ' ').trim() });
    }
  }
}

console.log(`yuvarlama taşması denetimi — ${arac} araç, ${yuvarlanan} yuvarlanmış değer tarandı`);
console.log('');
console.log(`sonraki hesaba giren yuvarlanmış değer: ${bulgu.length}`);
for (const b of bulgu) {
  console.log(`  ${b.arac}:${b.satir}  ${b.ad}`);
  console.log(`      ${b.ornek}`);
}
console.log('');
console.log('NOT: her geçiş kusur DEĞİL — yuvarlama basamağı yeterince ince olabilir.');
console.log('Karar, hatanın büyüklüğünü ÖLÇMEKLE verilir.');
