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
 *
 * KAPSAM SINIRI — BİLEREK: ölçüt renk ile zemini AYNI ÖGEDE arıyor. Zemin
 * bir üst kapsayıcıdan geliyorsa bu tarama görmez; onu ancak tarayıcı ölçümü
 * bulur. Sınır bilerek dar tutuldu, çünkü ata zincirini kaynaktan tahmin
 * etmek yanlış pozitif üretiyor (yukarıdaki 3. madde).
 *
 * Kapının negatif kontrolü yapılırken bu sınır UNUTULDU: ilk tohum dosyada
 * rengi ve zemini AYRI satırlara koymuştu, kapı ateşlemedi ve bir an
 * 'kapı bozuk' sanıldı. Kusur kapıda değil tohumdaydı.
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

const KAPI = process.argv.includes('--kapi');
/**
 * --kapi: KAPSAM yalnızca `app/tools` ve bulgu varsa çıkış 1.
 *
 * Neden dar: araç tarafı ölçümle SIFIRA indirildi (her bulgu tarayıcıda tek tek
 * doğrulandı). Yönetici ve genel alan HENÜZ ÖLÇÜLMEDİ — oraları kapı yapmak,
 * ölçülmemiş bir iddiayı CI'a yazmak olurdu. Onlar rapor olarak kalıyor.
 */
const KOKLER = KAPI ? ['app/tools'] : ['app', 'components'];
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
  negatifDosya = path.join(NEGATIF_DIZIN, 'zz-renk-cifti-negatif-kontrol.tsx');
  /* Tohum ÜÇ biçimi birden taşıyor ve üçü de AYNI DİZE içinde çift kuruyor —
     denetimin belgelenmiş kapsamı bu. Eski tohum zemini ve yazıyı AYRI
     ögelere koyuyordu (ebeveyn/çocuk); satır düzeyi eşleştirme onu kabaca
     kabul ediyordu, dize düzeyine geçilince haklı olarak reddetti. Kusur
     denetimde değil TOHUMDAYDI — aynı hata bir kez daha yapılmasın. */
  const satirlar = [
    'export default function X() {',
    '  const P = { badge: "bg-amber-600 text-white" };            // palet nesnesi',
    '  const a = true ? "bg-emerald-600 text-white" : "";        // üçlü işleç dalı',
    '  return <p className="text-[10px] text-amber-500 bg-amber-50">kasten kusurlu</p>;',
    '}',
    '',
    '/* POZİTİF KONTROL — aşağıdakilerin HİÇBİRİ işaretlenmemeli.',
    '   Ölçüt fazla genişse bunlar yakalanır ve rapor kullanılamaz hâle gelir;',
    '   bu oturumda tam olarak öyle oldu: satır düzeyi eşleştirme, aynı satırdaki',
    '   BAĞIMSIZ dizeleri birbirine karıştırıp sekiz sahte bulgu üretti. */',
    'export function Temiz() {',
    '  const Q = { badge: "bg-blue-900 text-white", dot: "bg-blue-400" };  // AYRI dizeler',
    '  const h = "hover:bg-amber-500 text-white";                          // varyant, taban DEĞİL',
    '  return (',
    '    <div>',
    '      <p className="text-[10px] text-amber-700 bg-amber-50">gecen ton</p>',
    '      <span className="bg-emerald-700 text-white">gecen cift</span>',
    '    </div>',
    '  );',
    '}',
  ];
  fs.writeFileSync(negatifDosya, satirlar.join('\n') + '\n', 'utf8');
}

const bulgu = [];
let dosyaSayisi = 0, className = 0;
for (const kok of (NEGATIF ? [...KOKLER, NEGATIF_DIZIN] : KOKLER)) {
  if (!fs.existsSync(kok)) continue;
  for (const p of dosyalar(kok)) {
    if (p.split(path.sep).some((x) => x.startsWith('_'))) continue;
    dosyaSayisi++;
    const satirlar = fs.readFileSync(p, 'utf8').split('\n');
    /*
     * BLOK YORUM İZLENİYOR — bu depoda yorumlar renk kusurlarını ANLATIYOR
     * ve gövde satırları düz metinle başlıyor. Ölçüm kendi belgesini kusur
     * sayarsa rapor okunmaz hâle gelir.
     */
    let blokYorumda = false;
    const yorumMu = (x) => {
      const baslar = x.includes('/*');
      const biter = x.includes('*/');
      if (blokYorumda) { if (biter) blokYorumda = false; return true; }
      if (baslar && !biter) { blokYorumda = true; return true; }
      return /^\s*(\/\/|\*|\/\*)/.test(x) || baslar;
    };
    satirlar.forEach((s, i) => {
      if (yorumMu(s)) return;
      /*
       * `className=` ŞARTI KALDIRILDI — DENETİM BU YÜZDEN TAMAMEN KÖRDÜ.
       *
       * Ölçüldü: bu oturumda düzeltilen ~71 kontrast kusurunun HİÇBİRİNİ
       * yakalamamıştı. Sebep, gerçek kodda kusurlu çiftin `className=` ile
       * aynı satırda OLMAMASI:
       *   badge: "bg-amber-600 text-white"      <- palet nesnesi
       *   ? 'bg-emerald-600 text-white'          <- üçlü işleç dalı
       *   className={`...                        <- çok satırlı şablon
       *     bg-slate-400 text-white`}
       * Tarihsel kontrolde altı dosyanın beşinde kusurlu çift vardı ve
       * denetim "0 eşleşme" diyordu.
       *
       * Sinyal zaten çiftin KENDİSİ: aynı satırda `bg-<ton>` ve `text-white`.
       * Nerede geçtiğinin önemi yok. `saydamlik-denetim`de kapatılan
       * körlüğün birebir aynısıydı.
       */
      if (!/\b(?:bg|text)-[a-z]+-\d{2,3}\b/.test(s) && !/text-white\b/.test(s)) return;
      className++;
      const buyuk = buyukMetin(s);
      // A) beyaz yazi + orta tonlu renkli zemin
      // VARYANT ONEKI ELENIR: `hover:bg-blue-500` taban renk DEGIL. Ilk surumde
      // elenmiyordu ve 27 adayin neredeyse hepsi bu yuzden sahteydi.
      // Varyantli sinifin TAMAMI atilir; yalnizca onegi silmek `bg-blue-500`i
      // birakiyordu ve 27 adayin cogu bu yuzden sahte cikmisti.
      /*
       * EŞLEŞTİRME SATIR DEĞİL AYNI DİZE DÜZEYİNDE.
       *
       * Satır düzeyi çok kaba: bir satır birden çok BAĞIMSIZ sınıf dizesi
       * taşıyabiliyor ve denetim onları birbirine karıştırıyordu. Ölçüldü —
       *   badge: "bg-blue-900 text-white",  ...  dot: "bg-blue-400"
       * satırında `dot`un zemini `badge`in yazısıyla eşleştirildi ve
       * `beyaz/blue-400 = 2.54` diye SAHTE bulgu üretildi. Oysa nokta hiç
       * metin taşımıyor, rozet de blue-900 üstünde beyaz (yüksek kontrast).
       * Sekiz sahte bulgunun kaynağı buydu; aynı satırdaki GERÇEK kusur
       * (`bg-amber-600 text-white`) ise doğruydu.
       *
       * Tailwind sınıfları zaten dize düzeyinde gruplanıyor; ölçüt de öyle.
       */
      const parcalar = [
        ...[...s.matchAll(/"([^"]*)"/g)].map((x) => x[1]),
        ...[...s.matchAll(/'([^']*)'/g)].map((x) => x[1]),
        ...[...s.matchAll(/`([^`]*)`/g)].map((x) => x[1]),
      ];
      // Tırnaksız (çok satırlı şablonun gövdesi) satırlar da değerlendirilir
      if (!parcalar.length) parcalar.push(s);
      const temizle = (t) => t.split(/[^A-Za-z0-9:_/\[\].-]+/).filter((x) => !x.includes(':')).join(' ');
      const kumeler = parcalar.map(temizle);
      const tabanZemin = (sinif) => kumeler.some((k) => k.includes('bg-' + sinif) && /text-white\b/.test(k));
      const tabanYazi = (sinif) =>
        kumeler.some((k) => k.includes('text-' + sinif) && k.includes('bg-' + sinif.split('-')[0] + '-50'));
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
        if (!tabanYazi(yazi)) continue;   // `-50` zemin kontrolü tabanYazi'nin İÇİNDE (aynı dize)
        void ton;
        const esik = buyuk ? 3.0 : 4.5;
        if (oran >= esik) continue;
        bulgu.push({ dosya: p.replace(/\\/g,'/'), satir: i+1, tip: yazi + '/' + ton + '-50', oran, esik, kod: s.trim().slice(0,80) });
      }
    });
  }
}

if (NEGATIF) {
  fs.unlinkSync(negatifDosya);
  fs.rmSync(NEGATIF_DIZIN, { recursive: true, force: true });
  const tohumBulgu = bulgu.filter((b) => b.dosya.includes('zz-renk-cifti-negatif-kontrol'));
  const kod = tohumBulgu.map((b) => b.kod).join(' | ');
  /* NEGATİF: üç kusurlu biçim yakalanmalı. */
  const kusurlu = {
    'palet nesnesi (amber-600)': /bg-amber-600 text-white/.test(kod),
    'üçlü işleç (emerald-600)': /bg-emerald-600 text-white/.test(kod),
    'className (amber-500/amber-50)': /text-amber-500/.test(kod),
  };
  /* POZİTİF: bunlar İŞARETLENMEMELİ. Ölçüt fazla genişse burada düşer. */
  const temiz = {
    'ayrı dizeler (blue-900 + dot blue-400)': !/bg-blue-900|blue-400/.test(kod),
    'varyant öneki (hover:bg-amber-500)': !/hover:/.test(kod),
    'geçen ton (amber-700)': !/text-amber-700/.test(kod),
    'geçen çift (emerald-700)': !/bg-emerald-700/.test(kod),
  };
  const eksik = Object.entries(kusurlu).filter(([, v]) => !v).map(([k]) => k);
  const sahte = Object.entries(temiz).filter(([, v]) => !v).map(([k]) => k);
  if (eksik.length || sahte.length) {
    if (eksik.length) console.log(`negatif kontrol DÜŞTÜ — yakalanmayan: ${eksik.join(', ')}`);
    if (sahte.length) console.log(`pozitif kontrol DÜŞTÜ — sahte bulgu: ${sahte.join(', ')}`);
    process.exit(1);
  }
  console.log('negatif + pozitif kontrol GEÇTİ — üç kusurlu biçim yakalanıyor, dört temiz biçim işaretlenmiyor.');
  process.exit(0);
}

console.log(`renk çifti taraması — ${dosyaSayisi} tsx, ${className} className satırı`);
console.log(`ölçülmüş kara listeden eşleşen: ${bulgu.length}`);
console.log('');
if (KAPI && !bulgu.length) {
  console.log('KAPI KİPİ (app/tools): bulgu yok.');
  process.exit(0);
}
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

if (KAPI) {
  console.log('');
  console.log('KAPI KİPİ: app/tools bulgusu var, CI düşüyor.');
  process.exit(1);
}
