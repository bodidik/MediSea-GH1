#!/usr/bin/env node
/* KAPI KAPSAMI DENETİMİ — hesapta kullanılan her değer kapıdan geçiyor mu?
 *
 * Kalıp: `const x = <kapı> ? <ifade> : null`. İfadede geçen bir değişken
 * kapıda YOKSA, o alan boş bırakıldığında `parseLocaleNumber("")` 0 döndürür
 * ve hesap sessizce eksik veriyle yapılır.
 *
 * Doğduğu kusur (`spot-urine`, idrar osmolal açığı):
 *   const uOsmCalc = una2N > 0 && uk2N > 0
 *     ? 2*(una2N+uk2N) + uureabN/2.8 + uglucN/18 : null;
 * `uureabN` (idrar üresi) kapıda yok. Ölçüldü — aynı hastada:
 *   üre BOŞ       -> açık 210 -> "artmış NH₄⁺ atılımı" (uygun yanıt)
 *   üre 400 mg/dL -> açık  67 -> "NH₄⁺ atılımı yetersiz" (distal RTA)
 * Eşik 150; tek bir boş alan klinik yorumu TAM TERSİNE çeviriyordu.
 *
 * ── AÇIK İKİ ADAYIN VERDİKTİ — YENİDEN KOVALAMAYIN ──────────────────
 *
 *   spot-urine:225  uglucN  ->  KUSUR DEĞİL. İdrarda glukoz bulunmaması
 *     normaldir ve alanın kendi örneği "ör. 0"; meşru sıfır bilerek kapı
 *     dışında. (Aynı ifadedeki ÜRE kapıya alındı — o 0 olamaz.)
 *
 *   sodium:442  naN  ->  KUSUR DEĞİL, ölçütün YAPISAL sınırı. İfade
 *     `naMakul && hiperHedefMakul` ile kapılı bir JSX panelinin İÇİNDE;
 *     denetim yalnızca yerel `tbw ?` üçlüsünü görüyor, saran koşulu değil.
 *     Ölçümle doğrulandı: Na 9999 girildiğinde panel hiç çizilmiyor.
 *
 * KAPI DEĞİL RAPOR. Kapsam dışı kalmak her zaman kusur değildir:
 *
 *  1. Bazı alanlarda 0 FİZYOLOJİK OLARAK MEŞRUDUR (idrar glukozu gibi —
 *     alanın kendi örneği "ör. 0"). Ayrım değere değil, alanın sıfır
 *     OLABİLİRLİĞİNE bakar.
 *  2. KORUMA ÇOĞU ZAMAN İFADEDE DEĞİL GÖSTERİMDE. Ölçüt `const x = kapı ?
 *     ifade : null` satırına bakıyor; araç değeri basmadan önce başka bir
 *     koşulla eleyebiliyor. Ölçülmeden karar verilemez.
 *
 * ── DÖRT ADAYIN VERDİKTİ — YENİDEN KOVALAMAYIN ──────────────────────
 *
 *   spot-urine:196 uOsmCalc — `uureabN` DÜZELTİLDİ (kapıya `ureGirildi`
 *     eklendi). Satır hâlâ raporda çıkıyor çünkü `uglucN` kapı dışında ve
 *     ORASI MEŞRU: idrarda glukoz bulunmaması normaldir.
 *   bmi:15 — ÖLÇÜLDÜ, temiz. Ağırlık boşken ekran "–" basıyor, sınıflama yok.
 *   kdigo-aki:46 — ÖLÇÜLDÜ, temiz. Güncel kreatinin boşken "–"; 2.5 girilince
 *     evre 2 (2.5/1.0 oranıyla doğru).
 *   sodium:405 adrogueHyper — temiz. Blok, 361. satırdaki
 *     `fwd !== null && tbw && naN > 0 && hyperTargetN > 0` koşulunun İÇİNDE.
 *
 * Yani dördün üçü gösterim düzeyinde korunuyor. Denetimin değeri "kusur
 * listesi" vermek değil, ELLE BAKILACAK dört satırı 112 ifadeden ayırmak.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const KOK = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'app/tools';

/** `const AD = KOŞUL ? İFADE : null` — çok satırlı olabilir. */
const KALIP = /const\s+(\w+)\s*=\s*([^;?]{4,240}?)\s*\?\s*([^;:]{4,240}?)\s*:\s*(?:null|0)\s*;/g;
/** parseLocaleNumber'dan türeyen sayı değişkenleri (boşta 0 dönerler). */
const SAYI_ADI = /const\s+(\w+)\s*=\s*parseLocaleNumber\(/g;

function tara(kok) {
  const bulgu = [];
  let arac = 0, ifade = 0;
  for (const d of fs.readdirSync(kok, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith('_')) continue;
    const f = path.join(kok, d.name, 'page.tsx');
    if (!fs.existsSync(f)) continue;
    arac++;
    const s = fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
    const sayilar = new Set([...s.matchAll(SAYI_ADI)].map((m) => m[1]));
    if (!sayilar.size) continue;
    for (const m of s.matchAll(KALIP)) {
      const [, ad, kapi, ifadeMetni] = m;
      ifade++;
      const kullanilan = [...new Set((ifadeMetni.match(/\b[A-Za-z_$][\w$]*\b/g) || []))].filter((x) => sayilar.has(x));
      if (!kullanilan.length) continue;
      /**
       * KAPI DOLAYLI OLABİLİR — adları harfi harfine karşılaştırmak 34 aday
       * üretti ve çoğu sahteydi. Kapı çoğu araçta adlandırılmış bir bool:
       *   const heparinTamam = sayiGirildiMi(heparin) && heparinNum > 0;
       *   const protaminHam  = heparinTamam ? heparinNum * 1 : null;
       * `heparinTamam` metinde `heparinNum` içermez ama ONU sınar. Kapı
       * ifadesindeki her tanımlayıcının kendi tanımı BİR DÜZEY açılıyor.
       */
      /**
       * BİR DÜZEY YETMİYOR — ölçüldü ve 19 sahte aday üretti.
       *
       * Kapılar zincirlenebiliyor ve bu depoda sık:
       *   const preOk    = makul(preBun, 2, 300);
       *   const yonDogru = preOk && post < pre;
       *   const hasAll   = yonDogru && tOk && ufOk && wtOk;
       *   const R        = hasAll ? post / pre : null;
       * Tek düzey açılınca `hasAll` yalnızca `yonDogru`ya varıyor ve `pre`
       * hiçbir zaman görünmüyordu.
       *
       * İkinci körlük: makullük yardımcısı HAM DİZE adını alıyor
       * (`makul(preBun, …)`), sayı adını (`pre`) değil. Eşleme
       * `const pre = parseLocaleNumber(preBun)` satırından kurulup ham ad da
       * kapı metnine ekleniyor.
       *
       * Derinlik SINIRLI (4 tur): sınırsız izleme "her bool kapıdır" demeye
       * varır ve denetimi körleştirir.
       */
      const hamAdi = {};
      for (const mm of s.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*=\s*parseLocaleNumber\(\s*([A-Za-z_$][\w$]*)/g)) {
        hamAdi[mm[1]] = mm[2];
      }
      let kapiGenis = kapi;
      const acilan = new Set();
      for (let tur = 0; tur < 4; tur++) {
        let eklendi = false;
        for (const ad2 of new Set(kapiGenis.match(/\b[A-Za-z_$][\w$]*\b/g) || [])) {
          if (acilan.has(ad2)) continue;
          acilan.add(ad2);
          const tanim = s.match(new RegExp('const\\s+' + ad2 + '\\s*=\\s*([\\s\\S]{1,800}?);'));
          if (tanim) { kapiGenis += ' ' + tanim[1]; eklendi = true; }
        }
        if (!eklendi) break;
      }
      const kapida = new Set((kapiGenis.match(/\b[A-Za-z_$][\w$]*\b/g) || []));
      /* Ham dize adı kapıda geçiyorsa, karşılığı olan SAYI da kapıdadır. */
      for (const [sayiAd, ham] of Object.entries(hamAdi)) if (kapida.has(ham)) kapida.add(sayiAd);
      const disarida = kullanilan.filter((x) => !kapida.has(x));
      if (disarida.length) {
        const satir = s.slice(0, m.index).split('\n').length;
        bulgu.push({ arac: d.name, satir, ad, disarida, kapi: kapi.replace(/\s+/g, ' ').slice(0, 60) });
      }
    }
  }
  return { bulgu, arac, ifade };
}

if (process.argv.includes('--kontrol')) {
  const t = fs.mkdtempSync(path.join(os.tmpdir(), 'kapi-'));
  const yaz = (ad, g) => { fs.mkdirSync(path.join(t, ad)); fs.writeFileSync(path.join(t, ad, 'page.tsx'), g, 'utf8'); };
  /* NEGATİF: ifadede `cN` var, kapıda yok -> YAKALANMALI */
  yaz('zz-bozuk', [
    'const aN = parseLocaleNumber(a);',
    'const bN = parseLocaleNumber(b);',
    'const cN = parseLocaleNumber(c);',
    'const toplam = aN > 0 && bN > 0 ? aN + bN + cN / 2.8 : null;',
  ].join('\n'));
  /* POZİTİF 1: kapı bütün değerleri kapsıyor -> işaretlenmemeli */
  yaz('zz-temiz', [
    'const aN = parseLocaleNumber(a);',
    'const bN = parseLocaleNumber(b);',
    'const toplam = aN > 0 && bN > 0 ? aN + bN : null;',
  ].join('\n'));
  /* POZİTİF 2: ifadede yalnızca SABİT var -> işaretlenmemeli */
  yaz('zz-sabit', [
    'const aN = parseLocaleNumber(a);',
    'const toplam = aN > 0 ? aN * 1.73 / 100 : null;',
  ].join('\n'));
  const { bulgu } = tara(t);
  fs.rmSync(t, { recursive: true, force: true });
  const adlar = bulgu.map((b) => b.arac);
  const negatif = adlar.includes('zz-bozuk');
  const sahte = ['zz-temiz', 'zz-sabit'].filter((x) => adlar.includes(x));
  if (!negatif) console.log('negatif kontrol DÜŞTÜ — kapı dışı değişken yakalanmadı, ölçüt KÖR.');
  if (sahte.length) console.log('pozitif kontrol DÜŞTÜ — sahte bulgu: ' + sahte.join(', '));
  if (!negatif || sahte.length) process.exit(1);
  console.log('negatif + pozitif kontrol GEÇTİ — kapı dışı değer yakalanıyor, iki temiz biçim işaretlenmiyor.');
  process.exit(0);
}

const { bulgu, arac, ifade } = tara(KOK);
console.log(`kapı kapsamı denetimi — ${arac} araç, ${ifade} kapılı ifade tarandı`);
console.log('');
console.log(`kapı DIŞINDA kalan değer taşıyan ifade: ${bulgu.length}`);
for (const b of bulgu) {
  console.log(`  ${b.arac}:${b.satir}  ${b.ad}`);
  console.log(`      kapı dışı: ${b.disarida.join(', ')}   (kapı: ${b.kapi})`);
}
console.log('');
console.log('NOT: kapsam dışı kalmak her zaman kusur DEĞİL — bazı alanlarda 0');
console.log('fizyolojik olarak meşrudur (idrar glukozu gibi). Karar insanın.');
