#!/usr/bin/env node
/**
 * İÇ BİLEŞEN DENETİMİ — render'ın İÇİNDE tanımlanmış bileşen var mı?
 *
 * Sayfa/bileşen fonksiyonunun İÇİNDE tanımlanan bir bileşen her render'da YENİ
 * bir bileşen kimliği alır. React eskisini söküp yenisini takar; kontrol DOM'dan
 * çıktığı için odak <body>'ye düşer.
 *
 * Bedeli ölçüldü ve kullanıcı tarafından İKİ KEZ bildirildi ("170 yazmak için
 * kutuya üç kez tıklamak gerekiyor"):
 *   metin kutusunda -> her TUŞ VURUŞUNDAN sonra odak kayboluyor
 *   düğme/seçimde   -> her SEÇİMDEN sonra odak kayboluyor
 * Ölçüm sinyali odak DEĞİL, ögenin DOM'da kalıp kalmadığı:
 *   el.dispatchEvent(new Event('input', {bubbles:true}))
 *   -> bozukta document.body.contains(el) === false
 *
 * 19 araçta elle düzeltildi. Bu denetim geri gelmesini engelliyor.
 *
 * ÖLÇÜTÜN GEÇMİŞTEKİ KUSURU — TEKRARLAMASIN: ilk süpürme yalnızca `<input>`
 * arıyordu ve `<select>`/`<button>` taşıyan beş bileşen KENDİ ölçütü
 * tarafından elendi; tarama "0 aday" diyerek temiz göründü. Ölçüt artık
 * dördünü de arıyor.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * NEGATIF KONTROL DOSYASI `app/` ALTINA YAZILMAZ.
 *
 * Yazildiginda calisan `next dev` onu derlemeye aliyor; betik dosyayi
 * silince webpack bayat basvuruyla kaliyor ve BUTUN SITE 500 veriyor.
 * Olculdu: gecici bir tani rotasi acilmaya calisilirken sunucu
 * 'ENOENT: zz-renk-cifti-negatif-kontrol.tsx' diye dustu ve bir an
 * hata yonetici bilesenlerinde sanildi.
 *
 * Cozum: tohum dosyasi isletim sisteminin gecici dizinine yaziliyor ve
 * tarama kapsamina yalnizca --negatif kipinde ekleniyor.
 */
const NEGATIF_DIZIN = fs.mkdtempSync(path.join(os.tmpdir(), 'medisea-denetim-'));

const KOKLER = ['app', 'components'];
const ETKILESIMLI = ['<input', '<select', '<textarea', '<button'];

/** Bileşen gövdesinden sonra gelen ilk ~1800 karakter, iç içe tanımı yakalamaya yeter. */
const PENCERE = 1800;

function* dosyalar(kok) {
  for (const g of fs.readdirSync(kok, { withFileTypes: true })) {
    const p = path.join(kok, g.name);
    if (g.isDirectory()) {
      if (g.name === 'node_modules' || g.name.startsWith('.')) continue;
      yield* dosyalar(p);
    } else if (g.name.endsWith('.tsx')) {
      yield p;
    }
  }
}

function tara(kokler) {
  const bulgu = [];
  let dosyaSayisi = 0;
  let disBilesen = 0;
  for (const kok of kokler) {
    if (!fs.existsSync(kok)) continue;
    for (const p of dosyalar(kok)) {
      // `_` önekli klasörler rotaya alınmıyor -> kullanıcıya ulaşmıyor
      if (p.split(path.sep).some((x) => x.startsWith('_'))) continue;
      dosyaSayisi++;
      const s = fs.readFileSync(p, 'utf8');
      // Dış (modül düzeyi) bileşenler: satır başında export/const/function
      const disler = [...s.matchAll(/^(?:export default |export )?(?:function|const) ([A-Z]\w*)\s*[=(]/gm)];
      disBilesen += disler.length;
      for (const d of disler) {
        const bas = d.index;
        const sonrakiDis = disler.find((x) => x.index > bas);
        const son = sonrakiDis ? sonrakiDis.index : s.length;
        const govde = s.slice(bas, son);
        // Gövdenin İÇİNDE, girintili tanımlanmış büyük harfli bileşenler
        for (const ic of govde.matchAll(/\n {2,}(?:const|function) ([A-Z]\w*)\s*[=(]/g)) {
          const ad = ic[1];
          // Gerçekten JSX'te kullanılıyor mu
          if (!new RegExp('<' + ad + '[\\s/>]').test(govde)) continue;
          const parca = govde.slice(ic.index, ic.index + PENCERE);
          const tasidigi = ETKILESIMLI.filter((t) => parca.includes(t));
          if (!tasidigi.length) continue;
          const satir = s.slice(0, bas + ic.index).split('\n').length;
          bulgu.push({
            dosya: p.replace(/\\/g, '/'),
            satir,
            dis: d[1],
            ic: ad,
            tasidigi: tasidigi.join(','),
          });
        }
      }
    }
  }
  return { bulgu, dosyaSayisi, disBilesen };
}

/* ── negatif kontrol ────────────────────────────────────────────────── */
if (process.argv.includes('--negatif')) {
  // Dosya adı `_` ile BAŞLAMAMALI: betiğin kendi `_` süzgeci testi de eler.
  const gecici = path.join(NEGATIF_DIZIN, 'zz-ic-bilesen-negatif-kontrol.tsx');
  /*
   * TOHUM İKİ YÖNÜ BİRDEN SINIYOR.
   *
   * NEGATİF: `Kutu` render'ın içinde ve `<input>` taşıyor -> YAKALANMALI.
   *
   * POZİTİF: aşağıdaki üçü İŞARETLENMEMELİ. Ölçüt fazla genişse rapor
   * kullanılamaz hâle gelir; bu oturumda iki ayrı denetimde tam olarak bu
   * oldu (renk çiftinde 8 sahte bulgu, eşik-etikette 279 aday) ve ikisini de
   * yalnızca pozitif kontrol yakalayabilirdi.
   *   Etiket   — iç bileşen ama ETKİLEŞİMLİ öge taşımıyor (kusur değil)
   *   Yardimci — modül düzeyinde, `<input>` taşısa da render'ın içinde DEĞİL
   *   hesapla  — küçük harfli, bileşen değil
   */
  const satirlar = [
    'export default function X() {',
    '  const Kutu = ({ v }: { v: string }) => <input value={v} readOnly />;',
    '  const Etiket = ({ t }: { t: string }) => <span>{t}</span>;',
    '  const hesapla = (a: number) => a * 2;',
    '  return <div><Kutu v="a" /><Etiket t="b" />{hesapla(1)}</div>;',
    '}',
    '',
    'function Yardimci({ v }: { v: string }) {',
    '  return <input value={v} readOnly />;',
    '}',
  ];
  fs.writeFileSync(gecici, satirlar.join('\n') + '\n', 'utf8');
  const { bulgu } = tara([...KOKLER, NEGATIF_DIZIN]);
  fs.unlinkSync(gecici);
  fs.rmSync(NEGATIF_DIZIN, { recursive: true, force: true });
  const tohum = bulgu.filter((b) => b.dosya.includes('zz-ic-bilesen-negatif-kontrol'));
  const icler = tohum.map((b) => b.ic);
  const negatif = icler.includes('Kutu');
  const sahte = ['Etiket', 'Yardimci', 'hesapla'].filter((x) => icler.includes(x));
  if (!negatif || sahte.length) {
    if (!negatif) console.log('negatif kontrol DÜŞTÜ — render içindeki `Kutu` yakalanmadı, denetim körleşmiş!');
    if (sahte.length) console.log(`pozitif kontrol DÜŞTÜ — sahte bulgu: ${sahte.join(', ')}`);
    process.exit(1);
  }
  console.log('negatif + pozitif kontrol GEÇTİ — iç bileşen yakalanıyor, üç temiz biçim işaretlenmiyor.');
  process.exit(0);
}

const { bulgu, dosyaSayisi, disBilesen } = tara(KOKLER);
console.log(`iç bileşen denetimi — ${dosyaSayisi} tsx, ${disBilesen} modül düzeyi bileşen tarandı`);
console.log('');
if (!bulgu.length) {
  console.log('render içinde tanımlanmış etkileşimli bileşen yok.');
  process.exit(0);
}
console.log(`render içinde tanımlanmış etkileşimli bileşen: ${bulgu.length}`);
for (const b of bulgu) {
  console.log(`  ${b.dosya}:${b.satir}`);
  console.log(`      ${b.dis} içinde ${b.ic} (${b.tasidigi})`);
}
console.log('');
console.log('Çare: bileşeni MODÜL düzeyine taşı. Dış kapsamdaki değerlere');
console.log('bakıyorsa onları PROP olarak ver — tsc "Cannot find name" ile uyarır.');
process.exit(1);
