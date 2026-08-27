#!/usr/bin/env node
/**
 * SIZINTI DENETİMİ — klinik araçlara girilen hasta verisi sekmeden çıkıyor mu?
 *
 * NEDEN VAR: bir dahiliye asistanı bu araçlara gerçek hasta değerleri
 * giriyor (yaş, kilo, kreatinin, eklem sayısı). Ölçüldü ve bugün o veri
 * tarayıcı sekmesinden HİÇ çıkmıyor — ne ağa, ne depoya, ne adres çubuğuna,
 * ne panoya. Bu bir özellik değil, korunması gereken bir DURUM.
 *
 * Ölçüm (canlı, `cdai`, düzeltme turunda): ayırt edici değerler girildi,
 * `fetch`/XHR/`sendBeacon` ve `Storage.prototype.setItem` sarmalandı;
 * girdi sonrası 0 çağrı, 0 yazma, adres değişmedi, paylaş düğmesi değerleri
 * kopyalamadı. Pozitif kontrol geçti (tohumlanan fetch ve setItem yakalandı).
 *
 * Bu betik o durumu KAYNAKTAN nöbetliyor. Üç kanal + bir sabit:
 *
 *   1) araç sayfalarında ağ çağrısı
 *   2) araç sayfalarında kalıcı depolama
 *   3) araç sayfalarında adres çubuğuna yazma
 *   4) `ToolShare` sorguyu SİLMEYE devam ediyor mu
 *
 * (4) en yakın risk: `params` 111 çağrı yerinden geçiyor ve adrese
 * yazılmamasını yalnızca `url.search = ""` satırı tutuyor.
 *
 * Üçüncü taraf ölçümleme depo GENELİNDE aranıyor; bir analitik betiği
 * girdi olaylarını da toplayabilir.
 *
 * CI KAPISI DEĞİL — rapor. Meşru bir istisna gerekebilir (ör. bir aracın
 * sunucudan referans tablosu çekmesi); karar insanın.
 *
 * Kullanım:
 *   node scripts/sizinti-denetim.cjs
 *   node scripts/sizinti-denetim.cjs --kok <dizin>
 *   node scripts/sizinti-denetim.cjs --kontrol     (negatif + pozitif kontrol)
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

/* Yorumlar bu depoda kusurları BİREBİR alıntılıyor; kaynak tarayan her
   ölçüt onları boşaltmak zorunda. Maske satır sonlarını KORUR — `\r` de
   silinirse CRLF dosyalarda satır numaraları kayıyor (ölçüldü: bir
   süpürme 29 dosyanın 10'unu yanlış yere yamalamıştı). */
function yorumSil(s) {
  const t = s.replace(/[/][/][^\r\n]*/g, (m) => ' '.repeat(m.length));
  return t.replace(/[/][*][\s\S]*?[*][/]/g, (m) => m.replace(/[^\r\n]/g, ' '));
}

const KANALLAR = [
  { ad: 'ağ çağrısı', re: /\bfetch\s*\(|XMLHttpRequest|navigator\.sendBeacon|new\s+WebSocket|navigator\.connection/ },
  { ad: 'kalıcı depolama', re: /\blocalStorage\b|\bsessionStorage\b|document\.cookie|indexedDB/ },
  { ad: 'adres çubuğuna yazma', re: /history\.(?:replaceState|pushState)|router\.(?:replace|push)\s*\(|location\.(?:search|href|hash|pathname)\s*=/ },
];

const OLCUMLEME = /googletagmanager|google-analytics|\bgtag\s*\(|posthog|@sentry|mixpanel|hotjar|clarity\.ms|plausible|segment\.com|amplitude/;

function tsxTopla(dizin, liste) {
  if (!fs.existsSync(dizin)) return liste;
  for (const e of fs.readdirSync(dizin, { withFileTypes: true })) {
    const p = path.join(dizin, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      tsxTopla(p, liste);
    } else if (/\.tsx?$/.test(e.name)) liste.push(p);
  }
  return liste;
}

function denetle(kok) {
  const aracKok = path.join(kok, 'app', 'tools');
  const aracDosyalari = tsxTopla(aracKok, []);
  const bulgular = [];

  for (const p of aracDosyalari) {
    /* `app/tools/components/` ve `app/tools/lib/` KAPSAM DIŞI DEĞİL:
       ToolShare panoya yazıyor ve orada da hasta verisi geçebilir. */
    const src = yorumSil(fs.readFileSync(p, 'utf8'));
    const satirlar = src.split(/\r?\n/);
    for (const k of KANALLAR) {
      satirlar.forEach((s, i) => {
        if (k.re.test(s)) bulgular.push({ tur: k.ad, dosya: p, satir: i + 1, metin: s.trim().slice(0, 78) });
      });
    }
  }

  // Depo geneli: üçüncü taraf ölçümleme
  const genel = [];
  for (const d of ['app', 'lib', 'components']) tsxTopla(path.join(kok, d), genel);
  const olcumleme = [];
  for (const p of genel) {
    const src = yorumSil(fs.readFileSync(p, 'utf8'));
    src.split(/\r?\n/).forEach((s, i) => {
      if (OLCUMLEME.test(s)) olcumleme.push({ dosya: p, satir: i + 1, metin: s.trim().slice(0, 78) });
    });
  }

  // ToolShare sorguyu hâlâ siliyor mu
  const paylasYolu = path.join(aracKok, 'components', 'ToolShare.tsx');
  let paylas = { var: false, aramaSilinir: false, hashSilinir: false };
  if (fs.existsSync(paylasYolu)) {
    const s = yorumSil(fs.readFileSync(paylasYolu, 'utf8'));
    paylas = {
      var: true,
      aramaSilinir: /url\.search\s*=\s*""/.test(s),
      hashSilinir: /url\.hash\s*=\s*""/.test(s),
    };
  }

  return { aracDosyalari, genel, bulgular, olcumleme, paylas };
}

function rapor(r) {
  console.log('taranan araç dosyası: ' + r.aracDosyalari.length +
              '   depo geneli: ' + r.genel.length + ' dosya');
  /* "0 kusur" ile "0 ölçüm" ekranda aynı görünür — ölçülen sayı da basılır. */
  if (!r.aracDosyalari.length) {
    console.log('!! HİÇ ARAÇ DOSYASI ÖLÇÜLMEDİ — "temiz" DEĞİL, ölçüt kör.');
    return 1;
  }

  let kusur = 0;
  for (const k of KANALLAR) {
    const liste = r.bulgular.filter((b) => b.tur === k.ad);
    console.log('  ' + k.ad.padEnd(24) + liste.length);
    for (const b of liste.slice(0, 8)) {
      console.log('      ' + b.dosya.replace(/\\/g, '/') + ':' + b.satir + '  ' + b.metin);
    }
    kusur += liste.length;
  }
  console.log('  üçüncü taraf ölçümleme  ' + r.olcumleme.length);
  for (const b of r.olcumleme.slice(0, 8)) {
    console.log('      ' + b.dosya.replace(/\\/g, '/') + ':' + b.satir + '  ' + b.metin);
  }
  kusur += r.olcumleme.length;

  if (!r.paylas.var) {
    console.log('  ToolShare               BULUNAMADI (nöbetçi körleşti)');
    kusur++;
  } else if (!r.paylas.aramaSilinir || !r.paylas.hashSilinir) {
    console.log('  ToolShare               SORGU/HASH ARTIK SİLİNMİYOR' +
                '  (search: ' + r.paylas.aramaSilinir + ', hash: ' + r.paylas.hashSilinir + ')');
    kusur++;
  } else {
    console.log('  ToolShare               sorgu ve hash siliniyor');
  }

  console.log('');
  console.log(kusur === 0
    ? 'Hasta verisi sekmeden çıkmıyor — dört kanal da temiz.'
    : 'ADAY: ' + kusur + ' (rapor, CI kapısı DEĞİL — meşru istisna olabilir)');
  return kusur;
}

function kontrol() {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), 'sizinti-'));
  const araclar = path.join(kok, 'app', 'tools');
  fs.mkdirSync(path.join(araclar, 'zz-kirli'), { recursive: true });
  fs.mkdirSync(path.join(araclar, 'zz-temiz'), { recursive: true });
  fs.mkdirSync(path.join(araclar, 'components'), { recursive: true });

  // NEGATİF KONTROL — dört kanal da tohumlu
  fs.writeFileSync(path.join(araclar, 'zz-kirli', 'page.tsx'), [
    '"use client";',
    'export default function K() {',
    '  const g = () => fetch("/api/log", { method: "POST", body: JSON.stringify({ kreatinin }) });',
    '  localStorage.setItem("hasta", kreatinin);',
    '  history.replaceState(null, "", "?cr=" + kreatinin);',
    '  return <div onClick={g} />;',
    '}',
  ].join('\n'), 'utf8');

  // POZİTİF KONTROL — temiz araç işaretlenmemeli
  fs.writeFileSync(path.join(araclar, 'zz-temiz', 'page.tsx'), [
    '"use client";',
    '/* Bu yorum bilerek fetch( ve localStorage ve history.pushState iceriyor:',
    '   yorum korlugu sinanmali — denetim bunlari SAYMAMALI. */',
    'export default function T() {',
    '  const skor = a + b;',
    '  return <div>{skor}</div>;',
    '}',
  ].join('\n'), 'utf8');

  fs.writeFileSync(path.join(araclar, 'components', 'ToolShare.tsx'), [
    'export default function ToolShare() {',
    '  const url = new URL(window.location.href);',
    '  url.search = "";',
    '  url.hash = "";',
    '  return url.toString();',
    '}',
  ].join('\n'), 'utf8');

  const r = denetle(kok);
  const kirli = r.bulgular.filter((b) => b.dosya.includes('zz-kirli'));
  const temiz = r.bulgular.filter((b) => b.dosya.includes('zz-temiz'));
  const turler = new Set(kirli.map((b) => b.tur));

  let hata = 0;
  console.log('negatif kontrol (kirli tohum) : ' + kirli.length + ' bulgu, ' + turler.size + '/3 kanal');
  if (turler.size !== 3) { console.log('  !! DÜŞTÜ — üç kanalın hepsi yakalanmalı'); hata++; }
  console.log('pozitif kontrol (temiz tohum) : ' + temiz.length + ' bulgu (0 olmalı)');
  if (temiz.length) { console.log('  !! DÜŞTÜ — yorumdaki geçişler sayıldı (yorum körlüğü)'); hata++; }

  // ToolShare koruması kaldırılınca yakalanıyor mu
  fs.writeFileSync(path.join(araclar, 'components', 'ToolShare.tsx'),
    'export default function ToolShare() { return new URL(window.location.href).toString(); }', 'utf8');
  const r2 = denetle(kok);
  console.log('ToolShare koruması kaldırıldı : ' +
              (r2.paylas.aramaSilinir ? '!! DÜŞTÜ — hâlâ "siliniyor" diyor' : 'yakalandı'));
  if (r2.paylas.aramaSilinir) hata++;

  fs.rmSync(kok, { recursive: true, force: true });
  console.log('');
  console.log(hata ? 'KONTROL DÜŞTÜ: ' + hata : 'kontrollerin hepsi geçti.');
  return hata;
}

const arg = process.argv.slice(2);
if (arg.includes('--kontrol') || arg.includes('--negatif')) {
  process.exit(kontrol() ? 1 : 0);
}
const ki = arg.indexOf('--kok');
const kok = ki >= 0 ? arg[ki + 1] : path.join(__dirname, '..');
rapor(denetle(kok));
process.exit(0);
