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
 *   Kalan adayların HEPSİ karara bağlandı — kusur yok. Ayrıntı aşağıda.
 *
 * ── AYIRT EDİCİ KURAL: BASAMAK, DEĞERİN BÜYÜKLÜĞÜNE GÖRE ─────────────
 *
 * Taşma tek başına kusur değil. Belirleyici olan, yuvarlama basamağının
 * değerin BÜYÜKLÜĞÜNE oranı:
 *
 *   sedasyon  0.15 -> 0.2   (1 basamak, değer 1'in ALTINDA)  -> %33  KUSUR
 *   kalsiyum  43.75 -> 44   (tam sayı, değer ~44)            -> %0.6 değil
 *
 * Yani şüphe, yuvarlanan değerin basamağa YAKIN ya da ondan küçük
 * olabildiği yerlerde. Bu kaynaktan hesaplanamaz; ölçüt aday üretir.
 *
 * ── ADAYLARIN VERDİKTİ — YENİDEN KOVALAMAYIN ────────────────────────
 *
 *   kalsiyum-infuzyon:253 — ÖLÇÜLDÜ. 62.5 kg × 0.7 = 43.75 -> 44 mg/sa,
 *     hız 43 mL/sa; tam değerle 42.8 olurdu, fark %0.5. Üstelik TUTARLI:
 *     araç 44 mg/sa vermeni söylüyor, pompa da onu vermeli.
 *   tromboliz-doz:151/153/154 — taşma BURADA GEREKLİ. bolus ve kalan,
 *     ekranda yazan toplamdan türetilmezse parçalar bütünü tutmaz
 *     (9 + 81 = 90). Toplamdan türetmek iç tutarlılığı garanti ediyor.
 *   bikarbonat-infuzyon:95 · magnezyum-infuzyon:359/360 — hastaya verilen
 *     şey YUVARLANMIŞ dozdur (tam mEq, 0.01 g); ampul sayısı ve mEq
 *     karşılığı ondan türemeli. Taşma doğru yönde.
 *   fosfat-replasman:218/220 — 0.1 mmol / 0.1 mEq basamağı, değerler
 *     onlarca birim; hata ~%0.1.
 *   bmr:26 — 1 kcal basamağı, değer ~1600; hata <%0.06.
 *   potasyum-replasman:89/90 — süre 1 basamak, hacim 1 mL; 55 mEq için
 *     1375/5.5 = 250 tam çıkıyor.
 *
 * fomepizol bir dönem listedeydi ve SAHTEYDİ: eşleşme JSDoc satırının `*`
 * önekinden geliyordu (çarpma sanıldı). Yorumlar artık eleniyor.
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
  /**
   * YORUMLAR ELENİR. Bu depoda JSDoc satırları `*` ile başlıyor ve ölçüt onu
   * ÇARPMA sanıyordu: `fomepizol`da " * doz" dizisi "bir şey × doz" gibi
   * okundu ve sahte aday üretti. Yorumlar ayrıca kusurları ANLATIYOR, yani
   * ölçütün kendi belgesini yakalaması da olası.
   */
  const s = fs.readFileSync(f, 'utf8')
    .replace(/\r\n/g, '\n')
    .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(Math.max(0, m.length - p1.length)));
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
