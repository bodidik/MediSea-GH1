#!/usr/bin/env node
/**
 * İçerik dosyalarının içindeki iç bağlantıları denetler (açık + premium).
 *
 * Konu metinleri HTML olarak saklanıyor ve içlerinde başka konulara,
 * araçlara ya da premium sayfalara bağlantılar var. Bir konu yeniden
 * adlandırıldığında bu bağlantılar sessizce eskiyor: okuyucu tıklıyor, 404
 * buluyor. Hiçbir derleme kapısı bunu yakalamaz, çünkü bağlantı kodda değil
 * VERİDE — lint, typecheck ve build üçü de temiz geçer.
 *
 * Premium tarafta aynı hata daha pahalı: kırık bağlantı para ödemiş
 * kullanıcıya çıkıyor.
 *
 * Kullanım (web/ dizininden):
 *   node scripts/link-denetim.cjs
 *
 * Çıkış kodu: kırık bağlantı varsa 1, yoksa 0 — istenirse CI'a bağlanabilir.
 */
const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..');
const CANONICAL = path.join(KOK, 'content', 'canonical');
const PREMIUM = path.join(KOK, 'content', 'premium', 'ydus');
const ARACLAR_DIZINI = path.join(KOK, 'app', 'tools');

/** Bir dizindeki <brans>/<slug> kümesini çıkarır. */
function kumeCikar(kokDizin) {
  const kume = new Set();
  try {
    for (const brans of fs.readdirSync(kokDizin, { withFileTypes: true }).filter((d) => d.isDirectory())) {
      for (const f of fs.readdirSync(path.join(kokDizin, brans.name)).filter((f) => f.endsWith('.json'))) {
        kume.add(`${brans.name}/${f.replace(/\.json$/, '')}`);
      }
    }
  } catch {
    // Dizin yoksa boş küme; denetim yine çalışsın.
  }
  return kume;
}

function araclariTopla() {
  try {
    return new Set(
      fs
        .readdirSync(ARACLAR_DIZINI, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
    );
  } catch {
    return new Set();
  }
}

/** Bir dizin ağacındaki tüm .json dosyalarını dolaşır. */
function* jsonDosyalari(kokDizin) {
  let girisler;
  try {
    girisler = fs.readdirSync(kokDizin, { withFileTypes: true });
  } catch {
    return;
  }
  for (const g of girisler) {
    const tam = path.join(kokDizin, g.name);
    if (g.isDirectory()) yield* jsonDosyalari(tam);
    else if (g.name.endsWith('.json')) yield tam;
  }
}

/**
 * next.config.js'teki yönlendirmeler.
 *
 * Yönlendirilmiş bir adres kullanıcı için KIRIK DEĞİLDİR; tıklayan hedefe
 * varır. Denetim bunu bilmezse her çalıştırmada aynı üç satırı "kırık" diye
 * bağırır ve gerçek bir kusur çıktığında kimse fark etmez — gürültü,
 * denetimi işe yaramaz hâle getirir.
 */
async function yonlendirilenler() {
  try {
    const cfg = require(path.join(KOK, 'next.config.js'));
    if (typeof cfg.redirects !== 'function') return new Set();
    const liste = await cfg.redirects();
    return new Set((liste || []).map((r) => r.source));
  } catch {
    return new Set();
  }
}

/* ── İKİNCİ SINIF: kendi ALANINDA duran adres ────────────────────────────
 *
 * Yukarıdaki tarama `href="/..."` deseni arıyor, yani içerik metninin
 * içine gömülü HTML bağlantılarını. İçerik dosyalarında bir de adresin
 * KENDİ ALANI olarak durduğu yerler var (`navigation.pearls.url`,
 * `items.url`) ve desen onları hiç görmüyordu.
 *
 * Ölçüldü: dokuz böyle adres var, **sekizi kırık** — vaka kokpitinin
 * "sonraki vaka" ve "inciler" bağlantıları var olmayan rotalara gidiyor
 * (`/premium/ydus/cases/…` ve `/premium/ydus/pearls/…`; gerçek rotalar
 * `soru-cozum` ve `inciler`), altı video adresi ise hiç kurulmamış bir
 * `/premium/video/izle` rotasına.
 *
 * Bu bölüm ŞİMDİLİK CI'yı DÜŞÜRMÜYOR. Sebebi borcun kaynağı: video
 * rotasının yazılıp yazılmayacağı bir ürün kararı (SENDE-KALANLAR 24) ve
 * kırık adresleri "düzeltmek" için gidilecek bir hedef yok. Karar verilip
 * içerik temizlenince aşağıdaki `UYARI_MODU` false yapılır ve sınıf
 * gerçek bir kapıya dönüşür.
 */
const UYARI_MODU = true;

/** JSON ağacındaki her dizge değerini (yol, değer) olarak dolaşır. */
function* dizgeler(o, yol = []) {
  if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) {
      yield* dizgeler(v, Array.isArray(o) ? yol : yol.concat(k));
    }
  } else if (typeof o === 'string') {
    yield [yol.join('.'), o];
  }
}

/**
 * Bir adres gerçek bir rotaya düşüyor mu?
 *
 * İlk yazımı `null` (= "bilinmeyen biçim, karar verme") dönüyordu ve bu
 * denetimi işe yaramaz etti: sekiz kırık adresin yedisi bilinmeyen biçimdi,
 * yani tarama "1 kırık" dedi. Kusur bulamayan bir tarama, temiz bir
 * yüzeyden ayırt edilemez.
 *
 * Şimdi `/premium/` altındaki HER adres karara zorlanıyor: rota listesi
 * dosya sisteminden değil elle tutuluyor ama kapalı — listede olmayan
 * biçim kırıktır. Premium dışı bilinmeyen biçimlerde hâlâ `null` dönüyor,
 * çünkü orada rota uzayı geniş (araçlar, açık site) ve yanlış alarm
 * denetimi gürültüye boğar.
 */
const PREMIUM_MODUL = [
  'quiz-coz', 'hizli-tekrar', 'vaka-coz', 'inciler',
  'soru-cozum', 'profil', 'liderlik',
];

function rotaVar(yol, premiumKonular, konular, araclar) {
  const temiz = yol.replace(/[#?].*$/, '').replace(/\/$/, '');

  const prem = temiz.match(/^\/[a-z]{2}\/premium(?:\/(.*))?$/);
  if (prem) {
    const par = (prem[1] || '').split('/').filter(Boolean);
    if (!par.length) return true;                    // /tr/premium
    if (par[0] !== 'ydus') return false;             // /tr/premium/video/izle gibi
    if (par.length === 1) return true;               // /tr/premium/ydus
    if (PREMIUM_MODUL.includes(par[1])) return par.length === 2;
    if (par.length === 2) return true;               // /tr/premium/ydus/<brans>
    if (par.length === 3) return premiumKonular.has(`${par[1]}/${par[2]}`);
    return false;                                    // dörtten fazla segment: rota yok
  }

  const k = temiz.match(/^\/topics\/([^/]+)\/([^/]+)/);
  if (k) return konular.has(`${k[1]}/${k[2]}`);
  const a = temiz.match(/^\/tools\/([^/]+)/);
  if (a) return araclar.has(a[1]);
  return null;
}

/* ── ÜÇÜNCÜ SINIF: KAYNAKTA düz yazılmış adres ───────────────────────────
 *
 * İlk iki sınıf içerik dosyalarına bakıyor. Ama uygulamanın kendisinde de
 * elle yazılmış adresler var — ana sayfadaki öne çıkan araç listesi, branş
 * kartları, reklam şeritleri. Bunlar içerik dosyası olmadığı için hiçbir
 * denetimin kapsamında değildi.
 *
 * Bu, bu depoda tekrar eden bir sınıf: elle tutulan liste, içerik değişince
 * sessizce eskiyor. Ölçüldü — kaynakta 466 düz adres var ve ÜÇÜ kırık,
 * üçü de `app/tools/data/ads.ts` içinde:
 *
 *   /topics/acil-tip   böyle bir branş yok (13 branş sayıldı)
 *   /kitap             rota yok
 *   /premium           dilsiz rota yok; premium /[lang]/premium altında
 *
 * ŞİMDİLİK UYARI, kapı değil: üçü de `AdBanner` içinde ve o bileşen
 * hiçbir yerden çağrılmıyor (ölü kod listesinde kayıtlı). Ölü kod
 * temizlenince `KAYNAK_UYARI` false yapılıp gerçek bir kapıya dönüşür —
 * o an bu sınıf ana sayfayı kıran bir yeniden adlandırmayı yakalar.
 *
 * Şablon dizeler (`/topics/${slug}`) bilerek kapsam dışı: hedef çalışma
 * zamanında belli oluyor ve zaten veriden geliyor.
 */
const KAYNAK_UYARI = true;
const KAYNAK_DIZINLERI = ['app', 'lib', 'components'];

function* kaynakDosyalari(kokDizin) {
  let girisler;
  try { girisler = fs.readdirSync(kokDizin, { withFileTypes: true }); } catch { return; }
  for (const g of girisler) {
    if (g.name.startsWith('_') || g.name === 'node_modules') continue;
    const tam = path.join(kokDizin, g.name);
    if (g.isDirectory()) yield* kaynakDosyalari(tam);
    else if (/\.tsx?$/.test(g.name)) yield tam;
  }
}

/**
 * Uygulamadaki STATİK rota yolları — `app/` altındaki page.tsx dosyalarından.
 *
 * Buna neden gerek var: `rotaVar` bilinmeyen biçimlerde `null` dönüyordu ve
 * bu, taramayı iki kez yanılttı. `/kitap` ve dilsiz `/premium` "bilinmeyen"
 * sayılıp atlanıyordu, oysa ikisinin de rotası YOK. Kusur bulamayan tarama,
 * temiz yüzeyden ayırt edilemez.
 *
 * Route grupları `(site)` / `(ydus)` yola girmez; `_` ile başlayan klasörler
 * zaten rotaya alınmıyor (Next kuralı) ve burada da elenmeli.
 */
function rotaYollari() {
  const yollar = new Set();
  const gez = (dizin, parca) => {
    let girisler;
    try { girisler = fs.readdirSync(dizin, { withFileTypes: true }); } catch { return; }
    if (girisler.some((g) => g.isFile() && g.name === 'page.tsx')) {
      yollar.add('/' + parca.join('/'));
    }
    for (const g of girisler) {
      if (!g.isDirectory() || g.name.startsWith('_') || g.name === 'api') continue;
      const grup = /^\(.*\)$/.test(g.name);
      gez(path.join(dizin, g.name), grup ? parca : parca.concat(g.name));
    }
  };
  gez(path.join(KOK, 'app'), []);
  return yollar;
}

/** Yol, statik ya da dinamik bir rotaya oturuyor mu? */
function rotayaOturuyor(yol, yollar) {
  const hedef = yol.replace(/[#?].*$/, '').replace(/\/$/, '') || '/';
  if (yollar.has(hedef)) return true;
  const h = hedef.split('/').filter(Boolean);
  for (const r of yollar) {
    const parcalar = r.split('/').filter(Boolean);
    if (parcalar.some((x) => x.startsWith('[...'))) {
      const sabit = parcalar.filter((x) => !x.startsWith('['));
      if (sabit.every((x, i) => h[i] === x)) return true;
      continue;
    }
    if (parcalar.length !== h.length) continue;
    if (parcalar.every((x, i) => (x.startsWith('[') && x.endsWith(']')) || x === h[i])) return true;
  }
  return false;
}

async function main() {
  const yonlendirme = await yonlendirilenler();
  const konular = kumeCikar(CANONICAL);
  const premiumKonular = kumeCikar(path.join(PREMIUM, 'topics'));
  const araclar = araclariTopla();

  // href="/..." ve JSON içinde kaçırılmış href=\"/..." biçimlerinin ikisi de.
  const re = /href=\\?"(\/[^"\\]+)/g;

  const alanlar = [
    { ad: 'açık', kok: CANONICAL },
    { ad: 'premium', kok: PREMIUM },
  ];

  const kirik = [];
  let toplam = 0;
  let yonlendirilmis = 0;

  for (const alan of alanlar) {
    for (const dosya of jsonDosyalari(alan.kok)) {
      const kaynak = path.relative(path.join(KOK, 'content'), dosya).replace(/\\/g, '/');
      const metin = fs.readFileSync(dosya, 'utf-8');

      let m;
      while ((m = re.exec(metin))) {
        const yol = m[1];
        toplam++;

        // Yönlendirmesi olan adres kullanıcı için çalışıyor: kırık sayma.
        if (yonlendirme.has(yol.replace(/[#?].*$/, ''))) {
          yonlendirilmis++;
          continue;
        }

        const konu = yol.match(/^\/topics\/([^/]+)\/([^/#?]+)/);
        if (konu) {
          if (!konular.has(`${konu[1]}/${konu[2]}`)) kirik.push({ alan: alan.ad, tur: 'konu', kaynak, hedef: yol });
          continue;
        }

        // /tr/premium/ydus/<brans>/<konu>
        const pk = yol.match(/^\/[a-z]{2}\/premium\/ydus\/([^/]+)\/([^/#?]+)/);
        if (pk) {
          // Modül sayfaları (quiz-coz, hizli-tekrar…) konu değil, atla.
          const modul = ['quiz-coz', 'hizli-tekrar', 'vaka-coz', 'inciler', 'soru-cozum', 'profil'];
          if (!modul.includes(pk[1]) && !premiumKonular.has(`${pk[1]}/${pk[2]}`)) {
            kirik.push({ alan: alan.ad, tur: 'premium konu', kaynak, hedef: yol });
          }
          continue;
        }

        const arac = yol.match(/^\/tools\/([^/#?]+)/);
        if (arac && !araclar.has(arac[1])) {
          kirik.push({ alan: alan.ad, tur: 'araç', kaynak, hedef: yol });
        }
      }
    }
  }

  // Kendi alanında duran adresler (href= deseninin görmediği sınıf).
  const alanKirik = [];
  let alanToplam = 0;
  for (const alan of alanlar) {
    for (const dosya of jsonDosyalari(alan.kok)) {
      const kaynak = path.relative(path.join(KOK, 'content'), dosya).split(path.sep).join('/');
      const ham = fs.readFileSync(dosya, 'utf-8');
      let veri;
      try { veri = JSON.parse(ham); } catch { continue; }
      for (const [anahtar, deger] of dizgeler(veri)) {
        if (!deger.startsWith('/') || deger.startsWith('//') || deger.includes(' ')) continue;
        // href= içinde geçenler yukarıda zaten denetlendi.
        if (ham.includes(`href="${deger}`) || ham.includes(`href=\\"${deger}`)) continue;
        alanToplam++;
        if (rotaVar(deger, premiumKonular, konular, araclar) === false) {
          alanKirik.push({ kaynak, anahtar, hedef: deger });
        }
      }
    }
  }

  const yollar = rotaYollari();
  const branslar = new Set(
    [...konular].map((k) => k.split('/')[0])
  );

  // Kaynakta düz yazılmış adresler.
  const kaynakKirik = [];
  let kaynakToplam = 0;
  /* Desen bilerek DAR: yalnızca `href="/..."` ve `href: "/..."` biçimleri.
   * Her `"/..."` dizesini taramak dosya yolu, regex ve sınıf adı gibi
   * URL olmayan değerleri de yakalar ve sahte kusur üretir. */
  const DUZ = /href[:=]\s*"(\/[a-z0-9\-\/]*)"/g;
  for (const kokAd of KAYNAK_DIZINLERI) {
    for (const dosya of kaynakDosyalari(path.join(KOK, kokAd))) {
      const metin = fs.readFileSync(dosya, 'utf-8');
      let m;
      while ((m = DUZ.exec(metin))) {
        const yol = m[1];
        kaynakToplam++;
        if (yonlendirme.has(yol)) continue;
        /* Katmanlı karar: içerik gerektiren yollar içerikten, ötekiler
         * rota tablosundan doğrulanır. Hiçbir dal "bilmiyorum" demiyor. */
        let gecerli;
        const brans = yol.match(/^\/topics\/([^/]+)$/);
        if (brans) gecerli = branslar.has(brans[1]);
        else {
          const r = rotaVar(yol, premiumKonular, konular, araclar);
          gecerli = r === null ? rotayaOturuyor(yol, yollar) : r;
        }
        if (gecerli === false) {
          kaynakKirik.push({
            kaynak: path.relative(KOK, dosya).split(path.sep).join('/'),
            hedef: yol,
          });
        }
      }
    }
  }

  console.log(`içerikteki iç bağlantı: ${toplam}${yonlendirilmis ? ` (${yonlendirilmis}'i yönlendirmeyle çalışıyor)` : ''}`);
  console.log(`kendi alanında duran adres: ${alanToplam}${alanKirik.length ? ` (${alanKirik.length}'i kırık)` : ''}`);
  console.log(`kaynakta düz yazılmış adres: ${kaynakToplam}${kaynakKirik.length ? ` (${kaynakKirik.length}'i kırık)` : ''}`);
  if (kaynakKirik.length) {
    console.log('');
    console.log(KAYNAK_UYARI
      ? 'UYARI — kaynak adresleri (CI kapısı DEĞİL, bkz. KAYNAK_UYARI notu):'
      : 'KIRIK kaynak adresleri:');
    for (const k of kaynakKirik) {
      console.log(`  ${k.kaynak.padEnd(46)} -> ${k.hedef}`);
    }
    if (!KAYNAK_UYARI) process.exitCode = 1;
  }
  if (alanKirik.length) {
    console.log('');
    console.log(UYARI_MODU
      ? 'UYARI — alan adresleri (CI kapısı DEĞİL, bkz. UYARI_MODU notu):'
      : 'KIRIK alan adresleri:');
    for (const k of alanKirik) {
      console.log(`  ${k.kaynak.padEnd(46)} ${k.anahtar.padEnd(24)} -> ${k.hedef}`);
    }
    if (!UYARI_MODU) process.exitCode = 1;
  }
  if (!kirik.length) {
    console.log('kırık bağlantı yok.');
    return;
  }

  console.log(`KIRIK: ${kirik.length}`);
  for (const k of kirik) {
    console.log(`  [${k.alan}] ${k.tur.padEnd(12)} ${k.kaynak.padEnd(52)} -> ${k.hedef}`);
  }
  console.log('\nDüzeltme: hedef yeniden adlandırılmışsa next.config.js redirects listesine ekle,');
  console.log('hedef gerçekten yoksa içerikteki bağlantıyı kaldır.');
  process.exitCode = 1;
}

main().catch((e) => {
  console.error('Denetim çalışamadı:', e.message);
  process.exitCode = 1;
});
