#!/usr/bin/env node
/**
 * EŞİK–ETİKET DENETİMİ — etiket sayısal bir sınır İDDİA ediyorsa, aynı kayıttaki
 * eşik o sınırı mı kullanıyor?
 *
 * GERÇEK BİR KUSURDAN DOĞDU. `antikoagulan-geri-dondurme` yazılırken PCC
 * basamağı şöyleydi:
 *
 *     { esik: 2, uKg: 25, etiket: "INR < 4" }      <- eşik 4 olmalıydı
 *
 * Sonuç: INR 3 olan hastaya 25 yerine 35 Ü/kg, yani %40 fazla PCC. Ekranda ise
 * "INR 4-6" yazıyordu — girdisi 3 olan bir hastaya. Kod geçerli; lint,
 * typecheck ve build üçü de temiz. Kusur yalnızca SAYIYI OKUYARAK görünür,
 * çünkü çelişki iki alan ARASINDA duruyor.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ÖLÇÜT KUSURUN GERÇEK ŞEKLİNE DARALTILDI — GENİŞ HÂLİ KULLANILAMAZDI.
 *
 * İlk yazımda "sınır iddia eden her dize" aday sayılıyordu ve 816 etiketin
 * 279'unu işaretledi: SVG yol verisi ("M19 9l-7 7-7-7"), HTML parçası
 * ("<h3>"), regex karakter sınıfı ("A-Za-z0-9"), Tailwind şablon dizesi ve
 * salt gösterim amaçlı referans aralıkları ("7.35-7.45"). 279 aday gözden
 * geçirilemez; o denetim karar değil GÜRÜLTÜ üretiyordu.
 *
 * Ölçüt artık yalnızca kusurun şeklini arıyor: AYNI NESNE DEĞİŞMEZİNDE hem
 * sayısal bir eşik alanı hem de sınır iddia eden bir etiket alanı var ve
 * iddia edilen sayıların hiçbiri eşiklerde geçmiyor.
 * ─────────────────────────────────────────────────────────────────────────
 *
 * KAPI DEĞİL, RAPOR. Etiket kasten yuvarlanmış olabilir; kararı insan verir.
 * Ama negatif kontrolü VAR — kusur bulamayan bir denetim, düzeltilmiş bir
 * depodan ayırt edilemez.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

/** Negatif kontrol tohumu `app/` altına YAZILMAZ — çalışan dev sunucusunu düşürür. */
const NEGATIF_DIZIN = fs.mkdtempSync(path.join(os.tmpdir(), 'medisea-esik-'));

/**
 * `--kok <dizin>` ile başka bir ağaca YÖNLENDİRİLEBİLİR.
 *
 * Neden eklendi: bu denetim bir dönem kökleri yalnızca cwd üzerinden
 * çözüyordu ve `--kok` bayrağını SESSİZCE YOK SAYIYORDU. Meta test
 * (`yorum-korlugu-denetim`) onu tohuma yönlendirdiğini sanarken aslında
 * GERÇEK DEPOYU taratıyor, tohumda zz-yorum bulunmadığı için de "temiz"
 * diyordu. Yani denetim aylarca sınanmamış hâlde "sınandı" görünüyordu.
 *
 * Yakalayan ölçüt: aynı denetimi BOŞ bir ağaçta da sür; rapor birebir
 * aynıysa tohum hiç ölçülmemiştir.
 */
const KOK_ARG = (() => { const i = process.argv.indexOf("--kok"); return i >= 0 ? process.argv[i + 1] : null; })();
const kokCoz = (k) => (KOK_ARG ? path.join(KOK_ARG, k) : k);
const KOKLER = ['app', 'components'].map(kokCoz);

/** Etiketin sınır İDDİA ettiğini gösteren işaretler. */
const SINIR_ISARETI = /[<>≤≥]|\d\s*[-–]\s*\d/;

/** İç içe olmayan tek nesne değişmezi. */
const NESNE = /\{[^{}\n]*\}/g;

/** Sayısal eşik gibi duran alan: `esik: 4`, `sinir: 60`, `min: 2` … */
const SAYISAL_ALAN =
  /\b(esik|eşik|sinir|sınır|min|max|alt|ust|üst|deger|değer|puan|skor|thr|limit|kesim)\s*:\s*(-?\d+(?:\.\d+)?)/gi;

/** Etiket gibi duran alan: `etiket: "…"`, `ad: "…"`, `label: "…"` … */
const ETIKET_ALAN =
  /\b(etiket|ad|label|baslik|başlık|metin|aciklama|açıklama|text|name)\s*:\s*["'`]([^"'`\n]{2,60})["'`]/gi;

function* dosyalar(kok) {
  for (const g of fs.readdirSync(kok, { withFileTypes: true })) {
    const p = path.join(kok, g.name);
    if (g.isDirectory()) {
      if (g.name === 'node_modules' || g.name.startsWith('.')) continue;
      yield* dosyalar(p);
    } else if (g.name.endsWith('.tsx') || g.name.endsWith('.ts')) {
      yield p;
    }
  }
}

/** Dizedeki sayıları çıkar (ondalıklı dahil). */
const sayilar = (s) => (s.match(/\d+(?:\.\d+)?/g) || []).map(Number);

function tara(kokler) {
  const bulgu = [];
  let dosyaSayisi = 0;
  let etiketSayisi = 0;
  for (const kok of kokler) {
    if (!fs.existsSync(kok)) continue;
    for (const p of dosyalar(kok)) {
      // `_` önekli klasörler rotaya alınmıyor -> kullanıcıya ulaşmıyor
      if (p.split(path.sep).some((x) => x.startsWith('_'))) continue;
      dosyaSayisi++;
      const kaynak = fs.readFileSync(p, 'utf8');
      for (const n of kaynak.matchAll(NESNE)) {
        // Yorum içindeki örnek nesneleri atla (bu dosyanın kendi başlığı gibi)
        const satirBasi = kaynak.lastIndexOf('\n', n.index) + 1;
        const onek = kaynak.slice(satirBasi, n.index);
        if (/^\s*(\/\/|\*|\/\*)/.test(onek)) continue;

        const govde = n[0];
        const esikler = [...govde.matchAll(SAYISAL_ALAN)].map((x) => Number(x[2]));
        if (!esikler.length) continue;

        for (const e of govde.matchAll(ETIKET_ALAN)) {
          const metin = e[2];
          if (!SINIR_ISARETI.test(metin)) continue;
          const iddia = sayilar(metin);
          if (!iddia.length) continue;
          etiketSayisi++;
          if (!iddia.some((v) => esikler.includes(v))) {
            bulgu.push({
              dosya: p.replace(/\\/g, '/'),
              satir: kaynak.slice(0, n.index).split('\n').length,
              etiket: metin,
              iddia: iddia.join(', '),
              esikler: esikler.join(', '),
            });
          }
        }
      }
    }
  }
  return { bulgu, dosyaSayisi, etiketSayisi };
}

/* ── negatif kontrol ────────────────────────────────────────────────── */
if (process.argv.includes('--negatif')) {
  const gecici = path.join(NEGATIF_DIZIN, 'zz-esik-negatif-kontrol.tsx');
  // Yakalanan gerçek kusurun birebir kopyası: eşik 2, etiket "< 4" diyor.
  const satirlar = [
    'const BASAMAK = [',
    '  { esik: 2, uKg: 25, etiket: "INR < 4" },',
    '  { esik: 6, uKg: 35, etiket: "INR 4-6" },',
    '];',
  ];
  fs.writeFileSync(gecici, satirlar.join('\n') + '\n', 'utf8');
  const { bulgu } = tara([...KOKLER, NEGATIF_DIZIN]);
  fs.unlinkSync(gecici);
  fs.rmSync(NEGATIF_DIZIN, { recursive: true, force: true });
  const bozuk = bulgu.filter((b) => b.dosya.includes('zz-esik-negatif-kontrol'));
  // POZİTİF KONTROL AYNI TOHUMDA: ikinci kayıt (eşik 6, "INR 4-6") DOĞRU;
  // denetim onu işaretlerse ölçüt fazla geniş demektir.
  const yakalandi = bozuk.length === 1 && bozuk[0].etiket.includes('< 4');
  console.log(
    yakalandi
      ? 'negatif kontrol GEÇTİ — bozuk kayıt yakalandı, doğru kayıt işaretlenmedi.'
      : `negatif kontrol DÜŞTÜ — beklenen 1 bulgu, ölçülen ${bozuk.length}.`
  );
  process.exit(yakalandi ? 0 : 1);
}

const { bulgu, dosyaSayisi, etiketSayisi } = tara(KOKLER);
console.log(`eşik–etiket denetimi — ${dosyaSayisi} dosya, sınır iddia eden ${etiketSayisi} etiket alanı tarandı`);
console.log('');
if (!bulgu.length) {
  console.log('eşik taşıyan hiçbir kayıtta etiket–eşik çelişkisi yok.');
  process.exit(0);
}
console.log(`etiketi kendi eşiğiyle çelişen kayıt: ${bulgu.length}`);
console.log('(hepsi kusur olmayabilir — etiket kasten yuvarlanmış olabilir)');
console.log('');
for (const b of bulgu) {
  console.log(`  ${b.dosya}:${b.satir}`);
  console.log(`      "${b.etiket}"  iddia: ${b.iddia}  ·  kayıttaki eşikler: ${b.esikler}`);
}
process.exit(0);
