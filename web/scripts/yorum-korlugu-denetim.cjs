#!/usr/bin/env node
/* YORUM KÖRLÜĞÜ DENETİMİ — denetimler YALNIZCA yorumda geçen deseni kusur sanıyor mu?
 *
 * NEDEN VAR: bu depoda yorumlar geçmiş kusurları BİREBİR alıntılıyor. Kaynak
 * tarayan bir ölçüt yorumları elemezse iki yönde de bozulur:
 *
 *   sahte bulgu — `yuvarlama-denetim` JSDoc satırının `*` önekini ÇARPMA sandı
 *                 ve `fomepizol`u kusurlu gösterdi.
 *   körlük      — `eksik-alan-denetim` nesne içindeki yorumu görünce anahtarı
 *                 önceki virgülden ayıramadı ve EKLENMİŞ bir alanı "eksik"
 *                 raporladı.
 *   sahte bulgu — `olu-denetim` yalnızca yorumda geçen `useState` satırını
 *                 ölü durum saydı (bu betikle ölçüldü ve düzeltildi).
 *
 * NASIL ÇALIŞIR: hedef şekilleri SADECE yorum içinde taşıyan bir tohum kurar,
 * her denetimi o ağaca yönlendirir. Tohumu bildiren denetim KÖRDÜR.
 *
 * TARİHSEL DOĞRULAMA: `olu-denetim` düzeltilmeden önce bu testte DÜŞÜYORDU.
 * Yani test sentetik bir kontrol değil, gerçek bir kusur yakalamış hâli.
 *
 * BAYATLAMA KORUMASI: `scripts/` altında listede olmayan bir `*-denetim.cjs`
 * varsa uyarır — yeni denetim eklenince sessizce kapsam dışı kalmasın.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const KOK = 'scripts';

/* Yönlendirilebilen denetimler ve kök verme biçimleri. Kök alamayan bir
   denetim bu testle SINANAMAZ — o yüzden ayrıca raporlanıyor. */
const DENETIMLER = [
  { ad: 'bant-denetim', kok: (t) => [t] },
  { ad: 'bolme-denetim', kok: (t) => ['--kok', t] },
  { ad: 'eksik-alan-denetim', kok: (t) => [t] },
  { ad: 'esik-etiket-denetim', kok: (t) => ['--kok', t] },
  { ad: 'ic-bilesen-denetim', kok: (t) => ['--kok', t] },
  { ad: 'kapi-kapsam-denetim', kok: (t) => [t] },
  { ad: 'karar-denetim', kok: (t) => [t] },
  { ad: 'olu-denetim', kok: (t) => ['--kok', t] },
  { ad: 'payda-denetim', kok: (t) => [t] },
  { ad: 'yuvarlama-denetim', kok: (t) => [t] },
  { ad: 'arayuz-denetim', kok: (t) => ['--kok', t] },
  { ad: 'renk-cifti-denetim', kok: (t) => ['--kok', t] },
  { ad: 'saydamlik-denetim', kok: (t) => ['--kok', t] },
  { ad: 'cop-kapi-denetim', kok: (t) => ['--kok', t] },
];

/**
 * İÇERİK denetimleri kapsam DIŞI: JSON tarıyorlar, orada yorum kavramı yok.
 * Listede tutulmamaları bir eksik değil; uyarı gürültüsü olmasın diye
 * gerekçesiyle burada yazılı.
 */
const KAPSAM_DISI = new Set([
  'asili-denetim.cjs',   // konu hiyerarşisi (JSON)
  'konu-denetim.cjs',    // konu künyesi (JSON)
  'link-denetim.cjs',    // içerikteki bağlantılar (JSON)
  'soru-denetim.cjs',    // quiz/kart yapısı (JSON)
  'yetim-denetim.cjs',   // yetim içerik dosyaları (JSON)
]);

/** Hedef şekiller SADECE yorumda; kod tarafı tertemiz. */
const TOHUM = [
  '"use client";',
  'import React from "react";',
  '',
  '/**',
  ' * Bu yorum GEÇMİŞTEKİ kusurları anlatıyor — bu depoda olağan biçim.',
  ' *',
  ' * Eşik–etiket: { esik: 2, uKg: 25, etiket: "INR < 4" } yazıyordu.',
  ' * Kapı kapsamı: const uOsmCalc = aN > 0 && bN > 0 ? aN + cN / 2.8 : null;',
  ' * Karar kaynağı: className={`${ttkg >= 5 && pkN > 5 ? "sky" : "rose"}`}',
  ' * Yuvarlama: const mlSaat = yuvarla(x / y, 1); const omur = torba / mlSaat;',
  ' * Bölme: const oran = toplam / hacimNum;',
  ' * Ölü denetim: const [olu, setOlu] = React.useState(false);',
  ' * Bant cetveli: kod `v <= 3` iken cetvel "< 3" diyordu.',
  ' * İç bileşen: const Kutu = () => <input readOnly />;',
  ' * Çöp kapı: const gecerli = ham.trim() !== "" && sayi >= 0 && sayi <= 100;',
  ' * Saydamlık: <p className="opacity-60 text-slate-500">uyarı</p> 3.46 veriyordu.',
  ' * Renk çifti: <span className="bg-amber-500 text-white">2.15</span>',
  ' */',
  '',
  /**
   * GERÇEK (yorum olmayan) `parseLocaleNumber` kullanımı ŞART.
   *
   * `cop-kapi-denetim` yalnızca bu çağrıyı içeren dosyaları ölçüyor. Tohumda
   * yokken denetim dosyayı hiç açmıyor, raporunda "parseLocaleNumber kullanan:
   * 0" yazıyordu — ama meta testin ölçüm kontrolü çıktıdaki HERHANGİ bir
   * sayıya baktığı için ("taranan tsx: 2") SAHTE BİR "temiz" veriyordu.
   *
   * Yani belgedeki "0 kusur ile 0 ölçüm aynı görünür" tuzağı, tam da onu
   * yakalamak için yazılmış testin İÇİNDE tekrarladı. Aşağıdaki satır kapısız
   * ve bölmesiz, yani başka hiçbir denetime aday üretmiyor.
   */
  'const SAYI = parseLocaleNumber("1");',
  '',
  'const TEMIZ = [',
  '  { slug: "a", ad: "A", pts: 1 },',
  '  { slug: "b", ad: "B", pts: 2 },',
  '  { slug: "c", ad: "C", pts: 3 },',
  '  { slug: "d", ad: "D", pts: 4 },',
  '];',
  '',
  'export default function ZzYorum() {',
  '  return <div>{TEMIZ.length} kayıt · {SAYI}</div>;',
  '}',
].join('\n');

/**
 * TOHUM İKİ ŞEKLİ BİRDEN TAŞIMALI — denetimler aynı ağaç düzenini beklemiyor.
 *
 *   araç şekli : <kök>/<araç>/page.tsx      (payda, bant, karar, yuvarlama…)
 *   depo şekli : <kök>/app/**.tsx           (arayuz, saydamlik, renk-cifti…)
 *
 * Ölçüldü: tek şekil yazıldığında `arayuz-denetim` tohumda SIFIR öge ölçtü ve
 * "temiz" göründü. Kusur denetimde değil TOHUMDAYDI — ama "0 kusur" ile
 * "0 ölçüm" ayrımı olmasa fark edilmezdi.
 */
const T = fs.mkdtempSync(path.join(os.tmpdir(), 'yorumkor-'));
fs.mkdirSync(path.join(T, 'zz-yorum'));
fs.writeFileSync(path.join(T, 'zz-yorum', 'page.tsx'), TOHUM, 'utf8');
fs.mkdirSync(path.join(T, 'app', 'zz-yorum'), { recursive: true });
fs.writeFileSync(path.join(T, 'app', 'zz-yorum', 'page.tsx'), TOHUM, 'utf8');

/**
 * BOŞ AĞAÇ — ölçüm kontrolünün dayanağı.
 *
 * Aynı klasör şekli, TOHUM DOSYASI YOK. Bir denetimin raporu tohum varken ve
 * yokken BİREBİR aynıysa, o denetim tohumu hiç ölçmemiştir.
 */
const B = fs.mkdtempSync(path.join(os.tmpdir(), 'yorumkor-bos-'));
fs.mkdirSync(path.join(B, 'zz-yorum'));
fs.mkdirSync(path.join(B, 'app', 'zz-yorum'), { recursive: true });

const sur = (yol, kok) => {
  try { return execFileSync('node', [yol, ...kok], { encoding: 'utf8' }); }
  catch (e) { return (e.stdout || '') + (e.stderr || ''); }
};

const sonuc = [];
for (const d of DENETIMLER) {
  const yol = path.join(KOK, d.ad + '.cjs');
  if (!fs.existsSync(yol)) { sonuc.push({ ad: d.ad, kor: false, durum: 'betik yok' }); continue; }
  const cikti = sur(yol, d.kok(T));
  const kor = /zz-yorum/.test(cikti);
  /**
   * "0 KUSUR" İLE "0 ÖLÇÜM" AYNI GÖRÜNÜR — bu depoda defalarca yaşanmış tuzak.
   *
   * ÖNCEKİ ÖLÇÜT YETERSİZDİ ve tam da bu testin içinde sahte bir "temiz"
   * üretti: çıktıda HERHANGİ bir sayı > 0 ise "ölçtü" sayılıyordu.
   * `cop-kapi-denetim` yalnızca `parseLocaleNumber` içeren dosyaları açıyor;
   * tohumda o çağrı yokken denetim dosyayı HİÇ görmüyordu ama raporundaki
   * "taranan tsx: 2" satırı ölçütü tatmin ediyordu.
   *
   * Doğru ölçüt KARŞILAŞTIRMALI: aynı denetim BOŞ bir ağaçta da sürülür.
   * İki rapor birebir aynıysa tohum ölçülmemiştir. Bu ölçüt denetimin hangi
   * sayıyı bastığını bilmek zorunda değil, yani yeni denetimlerde de çalışır.
   */
  const bosCikti = sur(yol, d.kok(B));
  const norm = (s) => s.split(T).join('<KOK>').split(B).join('<KOK>');
  const olctu = norm(cikti) !== norm(bosCikti);
  sonuc.push({
    ad: d.ad,
    kor,
    olctu,
    durum: kor ? 'KÖR — yorumu kusur saydı' : olctu ? 'temiz' : 'SINANAMADI — tohumda hiç öge ölçmedi',
  });
}
fs.rmSync(T, { recursive: true, force: true });
fs.rmSync(B, { recursive: true, force: true });

/* Bayatlama koruması */
const bilinen = new Set(DENETIMLER.map((d) => d.ad + '.cjs'));
const listeDisi = fs.readdirSync(KOK)
  .filter((f) => /-denetim\.cjs$/.test(f) && !bilinen.has(f) && !KAPSAM_DISI.has(f) && f !== "yorum-korlugu-denetim.cjs");

console.log('yorum körlüğü denetimi — tohumda desenler YALNIZCA yorumda');
console.log('');
for (const s of sonuc) console.log('  ' + (s.kor ? '✗' : s.olctu ? '✓' : '?') + '  ' + s.ad.padEnd(24) + s.durum);

const korler = sonuc.filter((s) => s.kor);
console.log('');
if (listeDisi.length) {
  console.log('UYARI — listede olmayan denetim: ' + listeDisi.join(', '));
  console.log('Yönlendirilebiliyorsa DENETIMLER listesine ekleyin; ekleyemiyorsanız');
  console.log('o denetim bu testle SINANAMIYOR demektir ve bu ayrıca bir eksiktir.');
  console.log('');
}
if (korler.length) {
  console.log('KÖR denetim: ' + korler.map((s) => s.ad).join(', '));
  console.log('Çare: kaynağı okurken yorumları boşlukla doldur (satır numaraları korunsun).');
  process.exit(1);
}
console.log('yorum körü denetim yok.');
