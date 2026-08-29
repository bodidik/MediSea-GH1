#!/usr/bin/env node
/**
 * "VERİ İLAN EDİYOR, RENDER YOK SAYIYOR" sınıfını süpürür.
 *
 * Bu oturumda beş kez çıktı (premium bilgi kutusu başlığı · quiz seti adı ·
 * vaka adı · vaka meta şeması · vaka şık açıklamaları — sonuncusu ÇÖKME).
 * Ölçüt: içerik dosyalarındaki alan adlarını topla, o içeriği okuyan
 * bileşenlerdeki okumalarla karşılaştır, veride VAR ama kodda HİÇ geçmeyeni
 * aday olarak bildir.
 *
 * TARİHSEL KONTROL (en güçlü doğrulama biçimi): düzeltme ÖNCESİ `VakaEngine`
 * (`HEAD~1`) ile sürüldüğünde `aciklamalar` alanını 4 kayıtta YAKALIYOR;
 * güncel depoda o satır temiz. Yani ölçüt gerçek bir kusurla sınandı.
 *
 * KARARA BAĞLANMIŞ ADAYLAR — yeniden kovalanmasın:
 *   accessLevel (36 içerik dosyası) : ÖLÜ ALAN. Hiçbir içerik kodu okumuyor;
 *     erişim `AccessGate` ile ROTA düzeyinde sağlanıyor. Sızıntı değil ama
 *     tuzak: yönetim tarafındaki `accessLevel` BAŞKA bir şey ('V'|'M'|'P',
 *     veritabanı ezmesi). Birinin `accessLevel: "free"` yazıp ücretsiz örnek
 *     açtığını sanması mümkün — hiçbir şey olmaz.
 *   text/options/correctAnswer/explanation (10 kayıt) : `hematoloji/
 *     aml-quiz-1.json` İngilizce şeması. Motor `veri.sorular ?? []` ile
 *     karşılıyor ve dürüst boş durum + çıkış bağlantısı basıyor — çökme YOK.
 *
 * Ölçütün sınırı YAZILI: kod tarafı metinsel taranıyor, yani bir alan
 * `{...obj}` yayılımıyla ya da `obj[degisken]` ile okunuyorsa "okunmuyor"
 * görünebilir. O yüzden bu ADAY üretir, karar vermez.
 */
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const kokBayrak = argv.indexOf('--kok');
const KOK = kokBayrak >= 0 ? argv[kokBayrak + 1] : (argv.find((a) => !a.startsWith('--')) || '.');

/** İçerik dizini -> onu okuyan kaynak dosyalar */
const ESLEME = [
  {
    ad: 'premium konu',
    veri: 'content/premium/ydus/topics',
    dizi: ['bloklar', 'icerik', 'sections'],
    kod: [
      'app/(ydus)/[lang]/premium/ydus/[branch]/[topic]/IcerikBloklari.tsx',
      'app/(ydus)/[lang]/premium/ydus/[branch]/[topic]/page.tsx',
    ],
  },
  {
    ad: 'quiz sorusu',
    veri: 'content/premium/ydus/quizzes',
    dizi: ['sorular', 'questions'],
    kod: ['app/(ydus)/[lang]/premium/ydus/quiz-coz/QuizEngine.tsx',
          'app/(ydus)/[lang]/premium/ydus/quiz-coz/page.tsx'],
  },
  {
    ad: 'vaka adımı',
    veri: 'content/premium/ydus/vakalar',
    dizi: ['adimlar'],
    kod: ['app/(ydus)/[lang]/premium/ydus/vaka-coz/VakaEngine.tsx',
          'app/(ydus)/[lang]/premium/ydus/vaka-coz/page.tsx'],
  },
  {
    ad: 'flashcard',
    veri: 'content/premium/ydus/flashcards',
    dizi: ['kartlar', 'cards'],
    kod: ['app/(ydus)/[lang]/premium/ydus/hizli-tekrar/FlashcardPlayer.tsx',
          'app/(ydus)/[lang]/premium/ydus/hizli-tekrar/page.tsx'],
  },
  {
    ad: 'inci',
    veri: 'content/premium/ydus/pearls',
    dizi: ['inciler', 'pearls'],
    kod: ['app/(ydus)/[lang]/premium/ydus/inciler/PearlsViewer.tsx',
          'app/(ydus)/[lang]/premium/ydus/inciler/page.tsx'],
  },
  {
    ad: 'açık konu bölümü',
    veri: 'content/canonical',
    dizi: ['sections'],
    kod: ['app/(site)/topics/[slug]/[topicSlug]/page.tsx'],
  },
];

function jsonGez(dizin, cb) {
  if (!fs.existsSync(dizin)) return;
  for (const e of fs.readdirSync(dizin, { withFileTypes: true })) {
    const p = path.join(dizin, e.name);
    if (e.isDirectory()) { jsonGez(p, cb); continue; }
    if (!e.name.endsWith('.json')) continue;
    let j;
    try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch (err) { continue; }
    cb(j, p);
  }
}

/**
 * Yorumları BOŞLUKLA doldur (satır numarası korunsun; belgede kayıtlı kural).
 *
 * Çift eğiğin ÖNÜNDEKİ karakter şartı olmadan bu maske bir URL'nin içindeki
 * çift eğiği de yorum sanıyor ve satırın geri kalanını siliyor — yani aynı
 * satırda URL'den SONRA gelen her alan okuması görünmez oluyor. Kardeş
 * denetimde (`sizinti-denetim`) bedeli ölçüldü ve gerçek bir körlüktü.
 */
function yorumSil(src) {
  let s = src.replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, o) => o + ' '.repeat(m.length - o.length));
  s = s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  return s;
}

const rapor = [];

for (const g of ESLEME) {
  // 1) veri tarafı: alan -> kaç kayıtta geçiyor
  const alan = new Map();
  let kayit = 0;
  jsonGez(path.join(KOK, g.veri), (j) => {
    const listeler = [];
    for (const d of g.dizi) if (Array.isArray(j[d])) listeler.push(j[d]);
    // üst düzey de sayılsın
    listeler.push([j]);
    for (const liste of listeler) {
      for (const o of liste) {
        if (!o || typeof o !== 'object') continue;
        kayit++;
        for (const k of Object.keys(o)) alan.set(k, (alan.get(k) || 0) + 1);
      }
    }
  });

  // 2) kod tarafı: hangi adlar metinde geçiyor
  let kod = '';
  const eksikDosya = [];
  for (const f of g.kod) {
    const p = path.join(KOK, f);
    if (!fs.existsSync(p)) { eksikDosya.push(f); continue; }
    kod += yorumSil(fs.readFileSync(p, 'utf8')) + '\n';
  }

  const okunmayan = [];
  for (const [k, n] of alan) {
    const desen = new RegExp('[."\'\\[]' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\'\\]]?');
    const dogrudan = new RegExp('\\b' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b');
    if (!desen.test(kod) && !dogrudan.test(kod)) okunmayan.push({ k, n });
  }

  rapor.push({ ad: g.ad, kayit, alanSayisi: alan.size, okunmayan, eksikDosya, alan });
}

console.log('İLAN–RENDER SÜPÜRMESİ\n');
let toplamAday = 0;
for (const r of rapor) {
  console.log('=== ' + r.ad);
  console.log('    kayıt: ' + r.kayit + '   benzersiz alan: ' + r.alanSayisi);
  if (r.eksikDosya.length) console.log('    !! okunamayan kod dosyası: ' + r.eksikDosya.join(', '));
  if (r.alanSayisi === 0) { console.log('    !! SIFIR alan ölçüldü — eşleme yanlış olabilir'); continue; }
  if (!r.okunmayan.length) { console.log('    okunmayan alan yok.'); continue; }
  for (const o of r.okunmayan.sort((a, b) => b.n - a.n)) {
    console.log('    ADAY  ' + o.k + '  (' + o.n + ' kayıtta)');
    toplamAday++;
  }
}
console.log('\ntoplam aday: ' + toplamAday);

/* ──────────────────────────────────────────────────────────────────────
   2) ŞEMA SAPMASI (set düzeyi)

   Yukarıdaki ölçüt alanın OKUNUP okunmadığına bakıyor. Kaçırdığı biçim:
   alan okunuyor ama BAZI dosyalarda BAŞKA DÜZEYDE duruyor.

   Gerçek vaka: 39 quiz dosyası künyesini üst düzeyde taşıyor
   (`{id, baslik, branch, topic}`), 1 dosya `meta` içinde
   (`{meta:{quizId, baslik, branch, topicId}}`). Motor üst düzeyi okuyor,
   yani o dosyada `veri.id` UNDEFINED kalıyordu ve ilerleme anahtarı
   `quiz-progress-undefined` oluyordu. İlk ölçüt bunu göremez: `id` alanı
   39 dosyada okunuyor, yani "okunmayan alan" listesine hiç girmiyor.

   Ölçüt: dosyaların ÇOĞUNLUĞUNUN taşıdığı üst düzey anahtarı taşımayan
   dosyaları bul. Eşik %70 ve en az 4 dosya — daha küçük kümede
   "çoğunluk" anlamsız, o yüzden ÖLÇÜLMEDİ diye raporlanıyor
   ("0 sapma" ile "0 ölçüm" ayrımı).

   VERDIKTLER — dört sapma karara bağlandı, yeniden kovalanmasın:

   quizzes/gogus-hastaliklari/tkp-quiz-1.json   künye `meta` içinde.
       Doğduğu kusur: `quiz-progress-undefined` + boş `<h1>` + geri
       bağlantısı branşa düşüyor. OKUYUCU DÜZELTİLDİ (`quizYukle`
       normalleştiriyor, üst düzey öncelikli). Veri hâlâ sapıyor, o
       yüzden liste onu göstermeye DEVAM EDİYOR — yeni bir yüzey aynı
       dosyayı ham okursa kusur geri gelir.

   vakalar/endokrinoloji/feokromositoma-vaka-1.json   künye `meta` içinde.
       OKUYUCU DÜZELTİLDİ (`VakaEngine` + vaka seçim listesi `meta`yı
       düzleştiriyor). Aynı gerekçeyle listede kalıyor.

   quizzes/hematoloji/aml-quiz-1.json   İngilizce şema
       (`questions`/`text`/`options`). `sorular` da yok, yani motor
       `veri.sorular ?? []` ile boş listeye düşüyor ve DÜRÜST boş durum
       basıyor (çökme yok). Ayrıca `yetim-denetim`de kayıtlı.

   flashcards/nefroloji/hiperf-kbh.json   `accessLevel` yok.
       ZARARSIZ: `accessLevel` bu depoda ÖLÜ ALAN — hiçbir içerik kodu
       okumuyor, erişim `AccessGate` ile rota düzeyinde sağlanıyor.

   ────────────────────────────────────────────────────────────────────── */
const semaRapor = [];

for (const g of ESLEME) {
  const dosyalar = [];
  jsonGez(path.join(KOK, g.veri), (j, p) => {
    if (!j || typeof j !== 'object' || Array.isArray(j)) return;
    dosyalar.push({
      rel: path.relative(path.join(KOK, g.veri), p).split(path.sep).join('/'),
      ust: new Set(Object.keys(j)),
      meta: j.meta && typeof j.meta === 'object' ? Object.keys(j.meta) : null,
    });
  });

  if (dosyalar.length < 4) {
    semaRapor.push({ ad: g.ad, dosya: dosyalar.length, olculdu: false, sapan: [] });
    continue;
  }

  const sayac = new Map();
  for (const d of dosyalar) for (const k of d.ust) sayac.set(k, (sayac.get(k) || 0) + 1);
  const cogunluk = [...sayac.entries()]
    .filter(([, n]) => n / dosyalar.length >= 0.7)
    .map(([k]) => k);

  const sapan = [];
  for (const d of dosyalar) {
    const eksik = cogunluk.filter((k) => !d.ust.has(k));
    if (eksik.length) sapan.push({ rel: d.rel, eksik, meta: d.meta });
  }
  semaRapor.push({ ad: g.ad, dosya: dosyalar.length, olculdu: true, cogunluk, sapan });
}

console.log('\n\nŞEMA SAPMASI (set düzeyi)\n');
let toplamSapan = 0;
for (const r of semaRapor) {
  console.log('=== ' + r.ad + '  (' + r.dosya + ' dosya)');
  if (!r.olculdu) { console.log('    ÖLÇÜLMEDİ — çoğunluk için en az 4 dosya gerekiyor.'); continue; }
  console.log('    çoğunluk anahtarı: ' + r.cogunluk.join(', '));
  if (!r.sapan.length) { console.log('    sapma yok.'); continue; }
  for (const s of r.sapan) {
    console.log('    SAPAN  ' + s.rel);
    console.log('        eksik üst düzey anahtar: ' + s.eksik.join(', '));
    if (s.meta) console.log('        ama `meta` içinde: ' + s.meta.join(', '));
    toplamSapan++;
  }
}
console.log('\ntoplam şema sapması: ' + toplamSapan);
