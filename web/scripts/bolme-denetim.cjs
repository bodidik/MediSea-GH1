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

/**
 * Yorumları ve JSX METİN DÜĞÜMLERİNİ boşlukla doldurur (SİLMEZ — satır
 * numaraları korunsun, rapor doğru satırı göstersin).
 *
 * İKİ AYRI KÖRLÜK, ikisi de sahte bulgu üretti:
 *
 *  1. YORUM — bu depoda yorumlar geçmiş kusurları BİREBİR alıntılıyor.
 *     Elenmezse denetim kendi belgesini kusur sanıyor.
 *
 *  2. JSX METNİ — araçlar formülü EKRANA basıyor ve formülde bölme işareti
 *     var. Ölçüldü: `ktv:103` aday olarak raporlandı, oysa satır kod değil:
 *
 *       <p className="… font-mono">eKt/V = spKt/V − (0.6×spKt/V / t) + 0.03</p>
 *
 *     `</p>` kapanış etiketi zaten eleniyordu (bkz. aşağıdaki not) ama metnin
 *     İÇİNDEKİ bölme eleniyor değildi.
 *
 * JSX metni ölçütü DAR tutuldu: yalnızca bir AÇILIŞ ETİKETİNİN hemen ardından
 * gelen, süslü parantez taşımayan metin. Genel bir `>…<` süzgeci olsaydı
 * `if (x > 0 && y / z < 5)` gibi gerçek kodu da yutar ve GERÇEK kusuru
 * gizlerdi — yani ölçütü gevşetmek burada tehlikeli.
 */
function govdeAyikla(kaynak) {
  /* 1) Yorumlar */
  let cikti = '';
  let blok = false;
  for (const satir of kaynak.split('\n')) {
    let y = '';
    for (let i = 0; i < satir.length; i++) {
      if (blok) {
        if (satir[i] === '*' && satir[i + 1] === '/') { blok = false; y += '  '; i++; }
        else y += ' ';
      } else if (satir[i] === '/' && satir[i + 1] === '*') { blok = true; y += '  '; i++; }
      else if (satir[i] === '/' && satir[i + 1] === '/') { y += ' '.repeat(satir.length - i); break; }
      else y += satir[i];
    }
    cikti += y + '\n';
  }
  /* 2) JSX metin düğümleri — açılış etiketi + süslü parantezsiz metin */
  return cikti.replace(/(<[a-zA-Z][^<>]*>)([^<>{}]*)(?=<)/g,
    (t, etiket, metin) => etiket + ' '.repeat(metin.length));
}

/**
 * KAPI DOLAYLI OLABİLİR — adlandırılmış bir bool'un ARKASINDA.
 *
 * Ölçüt bir dönem yalnızca `x > 0` gibi DOĞRUDAN karşılaştırmaları ve adında
 * "makul"/"tamam" geçen bool'ları tanıyordu. Bu depoda kapılar sıklıkla
 * adlandırılıyor ve adlandırma serbest:
 *
 *   const yonDogru = preOk && postOk && post < pre;
 *   const hasAll   = yonDogru && tOk && ufOk && wtOk;
 *   const R        = hasAll ? post / pre : null;      <- korumalı ama görünmez
 *
 * Ölçüldü: bu oturumda `ktv` ve `kdigo-aki`ye kapı eklendikten SONRA denetim
 * 0'dan 4'e çıktı ve dördü de sahteydi. Kusur koddaydı değil ÖLÇÜTTEYDİ —
 * kodu denetime uydurmak (değişkenleri "…Makul" diye yeniden adlandırmak)
 * yanlış yön olurdu.
 *
 * Çare `kapi-kapsam-denetim`de zaten uygulanmış olan yöntem: kapıdaki her
 * TANIMLAYICININ tanımı BİR DÜZEY açılır ve orada sınır aranır. Bir düzeyle
 * sınırlı tutuluyor; sınırsız izleme, "her bool kapıdır" demeye varır ve
 * denetimi körleştirir.
 */
/**
 * Her kapı bool'unun HANGİ SAYIYI kapıladığını çıkarır.
 *
 * DEĞİŞKENE BAĞLI OLMAK ŞART. İlk sürüm yalnızca "bu ad bir kapı mı" diye
 * bakıyordu ve belgede kayıtlı tuzağı GERİ GETİRDİ: pencerede herhangi bir
 * kapı bool'u bulunması, BAŞKA bir değişkenin kapısız bölmesini de gizliyordu.
 * Tohumla ölçüldü —
 *
 *   const kiloMakul = sayiGirildiMi(k) && kilo >= 1 && kilo <= 400;
 *   const doz  = kiloMakul ? 500 / kilo : null;   // korumalı
 *   const oran = 250 / hacim;                     // KORUMASIZ ama gizleniyordu
 *
 * Artık `kiloMakul` yalnızca `kilo`yu kapılıyor sayılıyor.
 */
function kapiHaritasi(kaynak) {
  /* sayı adı <-> ham dize adı eşlemesi */
  const hamAdi = {};
  for (const m of kaynak.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*=\s*parseLocaleNumber\(\s*([A-Za-z_$][\w$]*)/g)) {
    hamAdi[m[1]] = m[2];
  }

  /* YAKALAMA SINIRI SESSİZ BİR KÖRLÜK KAYNAĞI. İlk sürüm 260 karakterle
     sınırlıydı ve `kalsiyum-infuzyon`daki 6 satırlık `infMakul` tanımı (~270
     karakter) HİÇ eşleşmiyordu — yani kapı haritada yoktu ve korumalı bir
     bölme aday olarak raporlanıyordu. Sınır tanımın gerçek uzunluğuna göre
     seçilmeli; 800 bu depodaki en uzun kapı tanımının rahat üstünde. */
  const tanim = {};
  for (const m of kaynak.matchAll(/const\s+([A-Za-z_$][\w$]*)\s*=([\s\S]{0,800}?);/g)) {
    tanim[m[1]] = m[2];
  }

  /** ad -> kapıladığı sayı adları kümesi */
  const harita = {};
  const iceriyor = (govde, sayiAd) => {
    const isimler = new Set(govde.match(/[A-Za-z_$][\w$]*/g) || []);
    return isimler.has(sayiAd) || (hamAdi[sayiAd] && isimler.has(hamAdi[sayiAd]));
  };

  /* TABAN: tanımı bir makullük denetimi ya da ALT SINIR taşıyanlar.
     Üst sınır (`x <= N`) tek başına sayılmıyor — bölmeyi sıfırdan korumaz. */
  for (const [ad, govde] of Object.entries(tanim)) {
    const denetimVar = /sayiGirildiMi\s*\(|[A-Za-z]*[Mm]akul\s*\(/.test(govde)
      || /[A-Za-z_$][\w$]*\s*(>=?)\s*[0-9]/.test(govde);
    if (!denetimVar) continue;
    harita[ad] = new Set(Object.keys(hamAdi).filter((s) => iceriyor(govde, s)));
  }

  /* SABİT NOKTA: bir kapıya DAYANAN tanım, onun kapıladıklarını devralır. */
  for (let tur = 0; tur < 6; tur++) {
    let degisti = false;
    for (const [ad, govde] of Object.entries(tanim)) {
      const isimler = new Set(govde.match(/[A-Za-z_$][\w$]*/g) || []);
      const devir = new Set(harita[ad] || []);
      const onceki = devir.size;
      for (const x of isimler) if (harita[x]) for (const s of harita[x]) devir.add(s);
      if (devir.size > onceki) { harita[ad] = devir; degisti = true; }
    }
    if (!degisti) break;
  }
  return harita;
}

/**
 * KAPI DOLAYLI OLABİLİR — adlandırılmış bir bool'un ARKASINDA.
 *
 * Pencerede geçen adlardan biri dosyanın kapı kümesindeyse bölme korumalıdır.
 */
function dolayliKapi(harita, pencere, ad) {
  const isimler = new Set(pencere.match(/[A-Za-z_$][\w$]*/g) || []);
  /* Pencerede geçen bir kapı bool'u TAM OLARAK bu sayıyı kapılıyorsa korumalı. */
  for (const x of isimler) if (x !== ad && harita[x] && harita[x].has(ad)) return true;
  return false;
}

function tara(kok) {
  const bulgu = [];
  let dosya = 0;
  let nokta = 0;
  for (const d of fs.readdirSync(kok, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith('_')) continue;
    const p = path.join(kok, d.name, 'page.tsx');
    if (!fs.existsSync(p)) continue;
    dosya++;
    const s = govdeAyikla(fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n'));
    const kapiKumesi = kapiHaritasi(s);
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
        /* HEPSİ BU SAYIYA BAĞLI. Ölçüt bir dönem pencerede adında "makul" ya da
           "tamam" GEÇEN herhangi bir bool'u kapı sayıyordu; o kural BAŞKA bir
           değişkenin kapısız bölmesini de aklıyordu. Tohumla ölçüldü:

             const kiloMakul = sayiGirildiMi(k) && kilo >= 1;
             const oran = 250 / hacim;   // korumasız ama "kiloMakul" yüzünden aklanıyordu

           Adlandırılmış kapılar artık `kapiHaritasi` ile DEĞİŞKENE BAĞLI
           çözülüyor, o yüzden ada bakan gevşek alternatifler kaldırıldı. */
        const dogrudanKapi = new RegExp(
          ad + '\\s*>\\s*0|' +
          ad + '\\s*>=\\s*[1-9]|' +
          ad + '\\s*!==\\s*0|' +
          ad + '\\s*&&'
        );
        if (dogrudanKapi.test(pencere)) continue;
        if (dolayliKapi(kapiKumesi, pencere, ad)) continue;
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
  /* JSX METİN DÜĞÜMÜ: araçlar formülü ekrana basıyor ve formülde bölme var.
     Gerçek taramada `ktv:103` bu yüzden aday çıkmıştı. */
  yaz('zz-temiz-e', [
    'const t = parseLocaleNumber(sure);',
    'return <p className="font-mono">eKt/V = spKt/V − (0.6×spKt/V / t) + 0.03</p>;',
  ]);
  /* YORUM: bu depoda yorumlar geçmiş kusurları birebir alıntılıyor. */
  yaz('zz-temiz-f', [
    'const hacim = parseLocaleNumber(h);',
    '/* Eski kusur: const oran = doz / hacim; korumasızdı. */',
    'const oran = hacim > 0 ? 10 / hacim : null;',
  ]);

  /* NEGATİF-2: JSX İFADESİ içindeki korumasız bölme YAKALANMALI.
   * Bu, yukarıdaki iki temiz biçimin ayna kontrolü: metni ve yorumu eleyen
   * süzgeç GERÇEK kodu da yerse denetim körleşir ve kimse fark etmez. */
  yaz('zz-bozuk-jsx', [
    'const kilo = parseLocaleNumber(k);',
    'return <div className="x">Doz <b>{500 / kilo}</b> mg</div>;',
  ]);
  /* NEGATİF-3: karşılaştırma işaretleri arasındaki korumasız bölme.
   * Genel bir `>…<` süzgeci bunu yutardı — ölçütün dar tutulma sebebi. */
  yaz('zz-bozuk-kars', [
    'const z = parseLocaleNumber(a);',
    'const sonuc = y / z < 5 ? "az" : "cok";',
  ]);
  /* NEGATİF-4: AYNI DOSYADA İKİNCİ BÖLME. Belgede kayıtlı tuzak — bir dosyada
   * kapılı bir bölme varken kapısız ikincisi gizlenmemeli. Bu tam olarak
   * yaşandı: adlandırılmış kapılar tanınmaya başlayınca ölçüt "pencerede kapı
   * bool'u var mı" diye baktı ve BAŞKA bir değişkenin bölmesini de akladı.
   * Kapı artık DEĞİŞKENE bağlı çözülüyor; bu tohum onu koruyor. */
  yaz('zz-bozuk-ikinci', [
    'const kilo = parseLocaleNumber(k);',
    'const hacim = parseLocaleNumber(h);',
    'const kiloMakul = sayiGirildiMi(k) && kilo >= 1 && kilo <= 400;',
    'const doz = kiloMakul ? 500 / kilo : null;',
    'const oran = 250 / hacim;',
  ]);
  /* POZİTİF: ADLANDIRILMIŞ ve ZİNCİRLİ kapı — ölçüt onu tanımalı.
   * `ktv`nin gerçek şekli: hasAll -> yonDogru -> preOk -> makul(...). */
  yaz('zz-temiz-g', [
    'const pre = parseLocaleNumber(preBun);',
    'const post = parseLocaleNumber(postBun);',
    'const makul = (ham, alt, ust) => sayiGirildiMi(ham) && parseLocaleNumber(ham) >= alt;',
    'const preOk = makul(preBun, 2, 300);',
    'const yonDogru = preOk && post < pre;',
    'const hasAll = yonDogru && true;',
    'const R = hasAll ? post / pre : null;',
  ]);

  const { bulgu } = tara(t);
  fs.rmSync(t, { recursive: true, force: true });
  const adlar = bulgu.map((b) => b.arac);
  const BOZUK = ['zz-bozuk', 'zz-bozuk-jsx', 'zz-bozuk-kars', 'zz-bozuk-ikinci'];
  const TEMIZ = ['zz-temiz-a', 'zz-temiz-b', 'zz-temiz-c', 'zz-temiz-d', 'zz-temiz-e', 'zz-temiz-f', 'zz-temiz-g'];
  const kacan = BOZUK.filter((x) => !adlar.includes(x));
  const sahte = TEMIZ.filter((x) => adlar.includes(x));
  if (kacan.length) console.log('negatif kontrol DÜŞTÜ — yakalanmayan korumasız bölme: ' + kacan.join(', '));
  if (sahte.length) console.log('pozitif kontrol DÜŞTÜ — sahte bulgu: ' + sahte.join(', '));
  if (kacan.length || sahte.length) process.exit(1);
  console.log('negatif + pozitif kontrol GEÇTİ — ' + BOZUK.length +
    ' korumasız biçim yakalanıyor, ' + TEMIZ.length + ' temiz biçim işaretlenmiyor.');
  process.exit(0);
}

const { bulgu, dosya, nokta } = tara(KOK);
console.log('bölme denetimi — ' + dosya + ' araç, ' + nokta + ' bölme noktası tarandı');
console.log('sıfır kapısı görünmeyen: ' + bulgu.length);
for (const b of bulgu) {
  console.log('  ' + b.arac + ':' + b.satir + '  /' + b.degisken);
  console.log('      ' + b.kod);
}
