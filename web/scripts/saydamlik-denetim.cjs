#!/usr/bin/env node
/**
 * SAYDAMLIK DENETİMİ — metin ögesinde `opacity-*` kullanımı.
 *
 * NEDEN AYRI BİR DENETİM: CSS `opacity` rengi soldurur ama
 * `getComputedStyle(el).color` değerine YANSIMAZ. Yani bu depodaki bütün
 * kontrast ölçümleri saydam yazıyı olduğundan KOYU görüyordu ve
 * `opacity-*` taşıyan hiçbir metin doğru ölçülmemişti.
 *
 * Ölçülen bedel (üç turda):
 *   92 araçta alt bilgi klinik uyarısı  3.46  (eşik 4.5)
 *   28 araçta sonuç açıklama satırı     3.59
 *   sınav geri sayımı, amber evresinde  4.34
 *   soru çözüm kokpiti başlığı          3.75
 *
 * ÇARE SAYDAMLIĞI ARTIRMAK DEĞİL, ÖLÇÜLEBİLİR HÂLE GETİRMEK:
 *   opacity-60  ->  text-white/80   (renk alfası)
 * Renk alfası `color` içinde rgba olarak görünür, yani standart ölçüm onu
 * görür. Aynı görsel etki, ölçülebilir hâli.
 *
 * YÖNETİCİ ALANI ÖLÇÜLDÜ VE GEÇTİ (kapı yapılmamasının sebebi bu değil,
 * kapsam ölçümünün eksik olması). Üç yönetim sayfası geçici bir tanı
 * rotasında render edilip ölçüldü: 26 öge, 14'ü saydamlık taşıyor, 0 kusur.
 * Sebep basit — orada taban renk DEVRALINIYOR ve neredeyse siyah; 0.7
 * saydamlıkta bile beyaz üstünde ~6.6 çıkıyor. Araç tarafında kusurlu
 * olmasının sebebi taban rengin `text-blue-900` olmasıydı.
 *
 * Yani bu raporun yönetici satırları KUSUR DEĞİL, aday. Yeniden kovalamadan
 * önce bunu oku.
 *
 * KAPSAM BİLEREK DAR: yalnızca METİN ögeleri. Süsleme katmanları, degrade
 * bulanıklıkları ve durum varyantları (hover:/focus:/disabled:/group-*)
 * elenir — onlarda saydamlık meşru bir araç.
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

const KAPI = process.argv.includes('--kapi');
/**
 * --kapi: KAPSAM yalnızca `app/tools` ve bulgu varsa çıkış 1.
 *
 * Neden dar: araç tarafı ölçümle SIFIRA indirildi (her bulgu tarayıcıda tek tek
 * doğrulandı). Yönetici ve genel alan HENÜZ ÖLÇÜLMEDİ — oraları kapı yapmak,
 * ölçülmemiş bir iddiayı CI'a yazmak olurdu. Onlar rapor olarak kalıyor.
 */
const KOKLER = KAPI ? ['app/tools'] : ['app', 'components'];

/** Metin ögesi işareti: yazı rengi ya da yazı boyutu sınıfı taşıyor. */
const METIN_ISARETI = /\btext-(?:\[|xs|sm|base|lg|xl|\dxl|slate|blue|white|black|rose|amber|emerald|red|green|orange|sky|indigo|purple|yellow|gray|zinc|neutral|stone)/;
const SAYDAMLIK = /(?:^|[\s`'"{])opacity-(40|50|60|70|80)\b/;
/** Durum varyantları: saydamlık orada meşru (devre dışı, üzerine gelme, odak). */
const VARYANT = /(?:hover|focus|active|disabled|group-hover|group-focus|peer-\w+|aria-\w+)[:-]opacity-/;

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
  let className = 0;
  for (const kok of kokler) {
    if (!fs.existsSync(kok)) continue;
    for (const p of dosyalar(kok)) {
      // `_` onekli klasorler Next'te rotaya alinmiyor -> kullaniciya ulasmiyor
      if (p.split(path.sep).some((x) => x.startsWith('_'))) continue;
      dosyaSayisi++;
      const satirlar = fs.readFileSync(p, 'utf8').split('\n');
      satirlar.forEach((s, i) => {
        if (!s.includes('className')) return;
        className++;
        if (!SAYDAMLIK.test(s)) return;
        if (VARYANT.test(s)) return;
        if (!METIN_ISARETI.test(s)) return;
        // Susleme: ogenin icerigi yalnizca emoji/glif ise kontrast konusu degil
        const icerik = (s.match(/>([^<>{}]*)</) || [])[1] || '';
        if (icerik.trim() && !/[a-zA-ZÀ-ɏİığş]/.test(icerik)) return;
        bulgu.push({ dosya: p.replace(/\\/g, '/'), satir: i + 1, kod: s.trim().slice(0, 96) });
      });
    }
  }
  return { bulgu, dosyaSayisi, className };
}

/* ── negatif kontrol: denetim hâlâ kusur yakalıyor mu ───────────────── */
if (process.argv.includes('--negatif')) {
  /* Dosya adı `_` ile BAŞLAMAMALI: betiğin kendi `_` süzgeci (rotaya alınmayan
     klasörleri eleyen kural) test dosyasını da eliyordu ve negatif kontrol
     "denetim körleşmiş" diyordu. Denetim çalışıyordu; testi kendi süzgecine
     takılmıştı. */
  const gecici = path.join(NEGATIF_DIZIN, 'zz-saydamlik-negatif-kontrol.tsx');
  fs.writeFileSync(
    gecici,
    'export default function X() {\n' +
      '  return <p className="text-[11px] text-blue-900 opacity-60">kasten kusurlu</p>;\n' +
      '}\n',
    'utf8',
  );
  const { bulgu } = tara([...KOKLER, NEGATIF_DIZIN]);
  fs.unlinkSync(gecici);
  fs.rmSync(NEGATIF_DIZIN, { recursive: true, force: true });
  const yakalandi = bulgu.some((b) => b.dosya.includes('zz-saydamlik-negatif-kontrol'));
  console.log(yakalandi ? 'negatif kontrol GEÇTİ — denetim kusuru yakalıyor.' : 'negatif kontrol DÜŞTÜ — denetim körleşmiş!');
  process.exit(yakalandi ? 0 : 1);
}

const { bulgu, dosyaSayisi, className } = tara(KOKLER);
console.log(`saydamlık denetimi — ${dosyaSayisi} tsx okundu, ${className} className satırı tarandı`);
console.log('');
if (!bulgu.length) {
  console.log('metin ögesinde saydamlık yok.');
  process.exit(0);
}
const alan = (d) => (d.includes('/admin/') ? 'yönetici' : d.includes('/tools/') ? 'araç' : 'genel');
const gruplar = { araç: [], genel: [], yönetici: [] };
for (const b of bulgu) gruplar[alan(b.dosya)].push(b);
console.log(`metin ögesinde saydamlık: ${bulgu.length}`);
console.log(`  araç: ${gruplar['araç'].length} · genel: ${gruplar.genel.length} · yönetici: ${gruplar['yönetici'].length}`);
for (const [ad, liste] of Object.entries(gruplar)) {
  if (!liste.length) continue;
  console.log('');
  console.log(`--- ${ad} (${liste.length}) ---`);
  for (const b of liste) {
    console.log(`  ${b.dosya}:${b.satir}`);
    console.log(`      ${b.kod}`);
  }
}
console.log('');
console.log('Çare: opacity-* yerine renk alfası kullan (ör. text-white/80).');
console.log('Renk alfası getComputedStyle(el).color içinde görünür; opacity görünmez.');
console.log('');
if (KAPI) { console.log(''); console.log('KAPI KİPİ: app/tools bulgusu var, CI düşüyor.'); process.exit(1); }
console.log('Bu betik CI KAPISI DEĞİL: saydamlık kimi yerde meşru bir tasarım aracı');
console.log('(süsleme katmanı, ölçüsü bilerek düşürülmüş ikincil bilgi). Karar insana ait.');
process.exit(0);
