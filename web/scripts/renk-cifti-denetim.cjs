/**
 * RENK ÇİFTİ TARAMASI — saydamlık taşımayan kontrast kusurları.
 *
 * Geçen turda ölçülen kusurların bir kısmı `opacity` taşımıyordu; saydamlık
 * denetimi onları göremiyordu. Ortak yanları belli bir RENK ÇİFTİ olması:
 * beyaz yazı orta tonlu renkli zeminde, ya da renkli yazı aynı rengin -50
 * tonunda.
 *
 * Kara liste TAHMİN DEĞİL: uygulamanın kendi CSS'i içinde, gerçek bir araç
 * sayfasında ölçüldü (global ezme kuralları dahil). Tailwind'in üretmediği
 * sınıflar elendi — onlar ölçümde 1.00 veriyor ve sahte kusur üretiyordu.
 *
 * KARA LİSTEYİ GÜNCELLEME: renk ölçekleri ya da globals.css'teki ezme kuralları
 * değişirse liste bayatlar. Yenilemenin yolu, gerçek bir sayfada her çifti
 * çizip ölçmek — sınıf adından hesaplamak DEĞİL, çünkü bu depoda
 * `.text-slate-300` gibi tonlar globals.css tarafından eziliyor.
 *
 * ÜÇ YANLIŞ POZİTİF KAYNAĞI, üçü de yaşandı:
 *   1. `hover:bg-blue-500` TABAN renk değil. Yalnızca öneki silmek yetmiyor,
 *      varyantlı sınıfın TAMAMI atılmalı — ilk sürümde 27 adayın çoğu buydu.
 *   2. Tailwind kullanılmayan sınıfı üretmiyor; ölçümde zemin uygulanmıyor ve
 *      beyaz beyaz üstünde 1.00 çıkıyor. Zeminin gerçekten uygulandığı
 *      doğrulanmalı.
 *   3. Zemin gerçekte bir ATA tarafından veriliyor olabilir; className'de
 *      görünen çift her zaman ekrandaki çift değil.
 */
const fs = require('fs');
const path = require('path');

/** Ölçülen değerler: küçük metin eşiği 4.5, büyük metin (>=24px) eşiği 3.0. */
const BEYAZ_ZEMIN = {
  'slate-400': 2.56, 'blue-400': 2.54, 'blue-500': 3.68, 'rose-400': 2.69, 'rose-500': 3.67,
  'amber-400': 1.67, 'amber-500': 2.15, 'amber-600': 3.19, 'emerald-400': 1.92,
  'emerald-500': 2.54, 'emerald-600': 3.77, 'red-400': 2.77, 'red-500': 3.76,
  'green-400': 1.74, 'orange-400': 2.26, 'orange-500': 2.8, 'orange-600': 3.56,
  'sky-400': 2.14, 'sky-500': 2.77, 'sky-600': 4.1, 'indigo-400': 2.98, 'indigo-500': 4.47,
  'purple-400': 2.64, 'purple-500': 3.96, 'teal-400': 1.86, 'teal-500': 2.49, 'teal-600': 3.74,
  'cyan-400': 1.81, 'cyan-500': 2.43, 'cyan-600': 3.68, 'violet-400': 2.72, 'violet-500': 4.23,
};
const RENKLI_YAZI = {
  'blue-500': 3.38, 'rose-500': 3.34, 'rose-600': 4.28, 'amber-500': 2.07, 'amber-600': 3.07,
  'emerald-500': 2.41, 'emerald-600': 3.58, 'red-500': 3.44, 'red-600': 4.41,
  'green-500': 2.18, 'green-600': 3.15, 'orange-500': 2.64, 'orange-600': 3.35,
  'sky-600': 3.84, 'indigo-500': 3.99, 'teal-500': 2.39, 'teal-600': 3.59,
  'cyan-600': 3.54, 'pink-500': 3.23, 'pink-600': 4.21,
};

/** Büyük metin mi (eşik 3.0)? className'deki boyut sınıfından çıkarılır. */
function buyukMetin(ic) {
  if (/text-(?:2xl|3xl|4xl|5xl|6xl|7xl|8xl|9xl)\b/.test(ic)) return true;
  const m = ic.match(/text-\[(\d+(?:\.\d+)?)px\]/);
  if (m && Number(m[1]) >= 24) return true;
  if (/text-xl\b/.test(ic) && /font-(?:bold|black|extrabold|semibold)/.test(ic)) return true;
  return false;
}

const KOKLER = ['app', 'components'];
function* dosyalar(kok) {
  for (const g of fs.readdirSync(kok, { withFileTypes: true })) {
    const p = path.join(kok, g.name);
    if (g.isDirectory()) { if (g.name === 'node_modules' || g.name.startsWith('.')) continue; yield* dosyalar(p); }
    else if (g.name.endsWith('.tsx')) yield p;
  }
}

/* ── negatif kontrol: denetim hâlâ kusur yakalıyor mu ───────────────── */
const NEGATIF = process.argv.includes('--negatif');
let negatifDosya = null;
if (NEGATIF) {
  // Dosya adı `_` ile BAŞLAMAMALI: betiğin kendi `_` süzgeci testi de eler
  // (saydamlik-denetim'de tam olarak bu oldu).
  negatifDosya = path.join('app', 'zz-renk-cifti-negatif-kontrol.tsx');
  const satirlar = [
    'export default function X() {',
    '  return <div className="bg-amber-50"><p className="text-[10px] text-amber-500">kasten kusurlu</p></div>;',
    '}',
  ];
  fs.writeFileSync(negatifDosya, satirlar.join('\n') + '\n', 'utf8');
}

const bulgu = [];
let dosyaSayisi = 0, className = 0;
for (const kok of KOKLER) {
  if (!fs.existsSync(kok)) continue;
  for (const p of dosyalar(kok)) {
    if (p.split(path.sep).some((x) => x.startsWith('_'))) continue;
    dosyaSayisi++;
    const satirlar = fs.readFileSync(p, 'utf8').split('\n');
    satirlar.forEach((s, i) => {
      const m = s.match(/className=(?:"([^"]*)"|\{`([^`]*)`\})/g);
      if (!m) return;
      className++;
      const buyuk = buyukMetin(s);
      // A) beyaz yazi + orta tonlu renkli zemin
      // VARYANT ONEKI ELENIR: `hover:bg-blue-500` taban renk DEGIL. Ilk surumde
      // elenmiyordu ve 27 adayin neredeyse hepsi bu yuzden sahteydi.
      // Varyantli sinifin TAMAMI atilir; yalnizca onegi silmek `bg-blue-500`i
      // birakiyordu ve 27 adayin cogu bu yuzden sahte cikmisti.
      const varyantsiz = s.split(/[^A-Za-z0-9:_/\[\].-]+/).filter(t => !t.includes(':')).join(' ');
      const tabanZemin = (sinif) => varyantsiz.includes('bg-' + sinif);
      const tabanYazi = (sinif) => varyantsiz.includes('text-' + sinif);
      for (const [zemin, oran] of Object.entries(BEYAZ_ZEMIN)) {
        if (!tabanZemin(zemin)) continue;
        if (!/text-white\b/.test(s)) continue;
        const esik = buyuk ? 3.0 : 4.5;
        if (oran >= esik) continue;
        bulgu.push({ dosya: p.replace(/\\/g,'/'), satir: i+1, tip: 'beyaz/' + zemin, oran, esik, kod: s.trim().slice(0,80) });
      }
      // B) renkli yazi + ayni rengin -50 zemini
      for (const [yazi, oran] of Object.entries(RENKLI_YAZI)) {
        const ton = yazi.split('-')[0];
        if (!tabanYazi(yazi)) continue;
        if (!tabanZemin(ton + '-50')) continue;
        const esik = buyuk ? 3.0 : 4.5;
        if (oran >= esik) continue;
        bulgu.push({ dosya: p.replace(/\\/g,'/'), satir: i+1, tip: yazi + '/' + ton + '-50', oran, esik, kod: s.trim().slice(0,80) });
      }
    });
  }
}

if (NEGATIF) {
  fs.unlinkSync(negatifDosya);
  const yakalandi = bulgu.some((b) => b.dosya.includes('zz-renk-cifti-negatif-kontrol'));
  console.log(yakalandi ? 'negatif kontrol GEÇTİ — denetim kusuru yakalıyor.' : 'negatif kontrol DÜŞTÜ — denetim körleşmiş!');
  process.exit(yakalandi ? 0 : 1);
}

console.log(`renk çifti taraması — ${dosyaSayisi} tsx, ${className} className satırı`);
console.log(`ölçülmüş kara listeden eşleşen: ${bulgu.length}`);
console.log('');
const alan = d => d.includes('/admin/') ? 'yönetici' : d.includes('/tools/') ? 'araç' : 'genel';
const grup = { araç: [], genel: [], yönetici: [] };
for (const b of bulgu) grup[alan(b.dosya)].push(b);
for (const [ad, l] of Object.entries(grup)) {
  if (!l.length) continue;
  console.log(`--- ${ad} (${l.length}) ---`);
  for (const b of l) console.log(`  ${b.dosya}:${b.satir}  ${b.tip} = ${b.oran} (eşik ${b.esik})\n      ${b.kod}`);
  console.log('');
}
console.log('NOT: bu bir ADAY listesidir. Zemin gerçekte başka bir ata tarafından');
console.log('değiştirilmiş olabilir; her aday tarayıcıda doğrulanmalı.');

console.log('');
console.log('Bu betik CI KAPISI DEĞİL — aday üretir, karar tarayıcı ölçümüyle verilir.');
