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

  console.log(`içerikteki iç bağlantı: ${toplam}${yonlendirilmis ? ` (${yonlendirilmis}'i yönlendirmeyle çalışıyor)` : ''}`);
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
