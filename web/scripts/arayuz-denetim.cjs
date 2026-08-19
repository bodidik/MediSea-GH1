#!/usr/bin/env node
/**
 * arayuz-denetim.cjs — arayüz kaynağındaki, ÜÇ KAPIDAN DA GEÇEN kusurları arar.
 *
 * lint, typecheck ve build bu sınıfların hiçbirini göremiyor: hepsi geçerli
 * TypeScript ve geçerli JSX. Kusur yalnızca ekranda ya da ekran okuyucuda
 * görünüyor. Beşi de bu depoda gerçekten ölçüldü:
 *
 *   1. bozuk kodlama   UTF-8 yazılıp CP1252 okunmuş metin. Üç yönetim sayfası
 *                      başlıklarını "BÃ¶lÃ¼m" diye basıyordu (129 satır).
 *   2. alt'sız görsel  ekran okuyucuda adsız görsel.
 *   3. rel'siz _blank  yeni sekme açan bağlantı, açtığı sayfaya window.opener
 *                      veriyor.
 *   4. type'sız buton  <form> içinde varsayılan "submit" — düğmeye basınca
 *                      sayfa yenileniyor.
 *   5. iç içe tıklama  <a> içinde <button> gibi. Hidrasyon hatası verir ve
 *                      klavyeyle hangi ögeye basıldığı belirsizleşir.
 *
 * ÖLÇÜM GÜVENİ: JSX'i yığınla izleyen tarama, kapanmamış bir etikette
 * güvenilmez olur. Bir yorumun içindeki `<a>` metni bir turda tam olarak
 * bunu yaptı ve altı hayalet bulgu üretti — o yüzden yorumlar ayıklanıyor ve
 * yığını dengesiz kalan dosyalar AYRICA raporlanıyor. Dengesiz dosya varsa
 * "0 kusur" sonucuna güvenme.
 *
 * Kullanım:
 *   node scripts/arayuz-denetim.cjs           kusur varsa çıkış kodu 1
 *   node scripts/arayuz-denetim.cjs --negatif kendini sınar (tohum ekler)
 */

const fs = require('fs');
const path = require('path');

const KOK = path.join(__dirname, '..', 'app');

/* ── yardımcılar ─────────────────────────────────────────────────────── */

// Yorumları boşlukla değiştirir; satır numaraları bozulmasın diye uzunluk korunur.
function yorumSil(s) {
  s = s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  s = s.replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, p) => p + ' '.repeat(m.length - p.length));
  return s;
}

// <tag …> açılış etiketini SÜSLÜ PARANTEZ DERİNLİĞİYLE alır.
// Düz regex burada çalışmaz: onClick={() => …} içindeki `=>` okundaki ">"
// etiketi erken kapatır ve etiketin geri kalanı hiç görünmez.
function etiketAl(s, i) {
  let j = i, depth = 0, tick = false;
  for (; j < s.length; j++) {
    const c = s[j];
    if (c === '`') tick = !tick;
    if (tick) continue;
    if (c === '{') depth++;
    else if (c === '}') depth--;
    else if (c === '>' && depth === 0 && s[j - 1] !== '=') break;
  }
  return { etiket: s.slice(i, j + 1), son: j + 1 };
}

function etiketler(s, ad) {
  const out = [];
  const acilis = '<' + ad;
  let i = 0;
  while ((i = s.indexOf(acilis, i)) >= 0) {
    const sonraki = s[i + acilis.length];
    if (sonraki && /[A-Za-z0-9]/.test(sonraki)) { i += acilis.length; continue; }
    const { etiket, son } = etiketAl(s, i);
    out.push({ etiket, idx: i });
    i = son;
  }
  return out;
}

function tsxDosyalari(kok) {
  const out = [];
  (function yuru(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (!/node_modules|\.next/.test(p)) yuru(p); continue; }
      if (/\.tsx$/.test(e.name)) out.push(p);
    }
  })(kok);
  return out;
}

/* ── denetimler ──────────────────────────────────────────────────────── */

// UTF-8 metnin CP1252 okunmuş hâlinde bu üç karakter kaçınılmaz olarak çıkar.
// Türkçe metinde tek başlarına neredeyse hiç geçmedikleri için yanlış pozitif düşük.
const BOZUK_IZ = [0xc3, 0xc4, 0xc5].map((c) => String.fromCharCode(c));

function denetle() {
  const kusur = [];
  const rapor = [];   // kapı DEĞİL — insan kararı isteyen adaylar
  const dengesiz = [];
  const dosyalar = tsxDosyalari(KOK);
  let olculenEtiket = 0;

  for (const p of dosyalar) {
    const yol = path.relative(path.join(__dirname, '..'), p).split(path.sep).join('/');
    const ham = fs.readFileSync(p, 'utf8');
    const s = yorumSil(ham);
    const satirNo = (i) => s.slice(0, i).split('\n').length;

    // 1) bozuk kodlama — yorumlarda da kusur sayılır (kaynak okunabilirliği)
    ham.split(/\r?\n/).forEach((l, i) => {
      if (BOZUK_IZ.some((c) => l.includes(c)))
        kusur.push({ tur: 'bozuk-kodlama', yol, satir: i + 1, not: l.trim().slice(0, 70) });
    });

    // 2) alt'sız görsel
    for (const ad of ['img', 'Image']) {
      for (const t of etiketler(s, ad)) {
        olculenEtiket++;
        if (!/\balt\s*=/.test(t.etiket))
          kusur.push({ tur: 'altsiz-gorsel', yol, satir: satirNo(t.idx), not: t.etiket.replace(/\s+/g, ' ').slice(0, 70) });
      }
    }

    // 3) rel'siz yeni sekme
    for (const ad of ['a', 'Link']) {
      for (const t of etiketler(s, ad)) {
        olculenEtiket++;
        if (!/target\s*=\s*["'{]?_blank/.test(t.etiket)) continue;
        if (/rel\s*=/.test(t.etiket)) continue;
        kusur.push({ tur: 'relsiz-blank', yol, satir: satirNo(t.idx), not: t.etiket.replace(/\s+/g, ' ').slice(0, 70) });
      }
    }

    // 6) seçili olduğunu yalnızca RENKLE anlatan denetim (RAPOR, kapı DEĞİL)
    //
    // Ölçüt: onClick taşıyan bir <button>/<Link>, className'inde bir üçlü ile
    // biçim değiştiriyor ama hiçbir durum özniteliği yok. Ekran okuyucu
    // kullanıcısı hangi şıkkı işaretlediğini göremez.
    //
    // Neden kapı DEĞİL: className'deki ilk üçlü her zaman seçim koşulu
    // olmuyor. Ölçüldü — kaydet düğmesinin `status === 'saving'` biçimi,
    // zaten `disabled` olan bir düğmenin görünürlük koşulu ve yalnızca renk
    // veren bir onay düğmesi üçü de bu ölçüte takılıyor ve üçü de kusur
    // değil. Aday üretir; kararı insan verir.
    for (const ad of ['button', 'Link']) {
      for (const t of etiketler(s, ad)) {
        if (!/onClick\s*=/.test(t.etiket)) continue;
        if (/aria-pressed|aria-current|aria-checked|aria-expanded|role\s*=\s*["'](radio|tab|switch)/.test(t.etiket)) continue;
        if (!/className=\{`[^`]*\$\{[\s\S]{2,120}?\?[^?]/.test(t.etiket)) continue;
        rapor.push({ tur: 'secim-durumu-yok', yol, satir: satirNo(t.idx), not: t.etiket.replace(/\s+/g, ' ').slice(0, 70) });
      }
    }

    // 4 + 5) yığın gerektiren denetimler
    if (!/<form\b/.test(s) && !/<button\b/.test(s)) continue;
    const olay = [];
    for (const ad of ['form', 'button', 'a', 'Link']) {
      for (const t of etiketler(s, ad))
        olay.push({ tip: 'ac', ad, idx: t.idx, etiket: t.etiket, kapali: /\/>\s*$/.test(t.etiket) });
      const kap = new RegExp('</' + ad + '>', 'g');
      let m;
      while ((m = kap.exec(s))) olay.push({ tip: 'kap', ad, idx: m.index });
    }
    olay.sort((a, b) => a.idx - b.idx);

    const yigin = [];
    for (const o of olay) {
      if (o.tip === 'kap') {
        const k = yigin.lastIndexOf(o.ad);
        if (k >= 0) yigin.splice(k, 1);
        continue;
      }
      olculenEtiket++;
      if (o.ad === 'button' && yigin.includes('form') && !/type\s*=/.test(o.etiket))
        kusur.push({ tur: 'formda-typesiz-buton', yol, satir: satirNo(o.idx), not: o.etiket.replace(/\s+/g, ' ').slice(0, 70) });

      const disKlik = yigin.filter((x) => x !== 'form');
      if (disKlik.length)
        kusur.push({ tur: 'ic-ice-tiklanabilir', yol, satir: satirNo(o.idx), not: `${disKlik[disKlik.length - 1]} içinde ${o.ad}` });

      if (!o.kapali) yigin.push(o.ad);
    }
    if (yigin.length) dengesiz.push({ yol, kalan: yigin.join(',') });
  }

  return { kusur, rapor, dengesiz, dosyaSayisi: dosyalar.length, olculenEtiket };
}

/* ── rapor ───────────────────────────────────────────────────────────── */

function yaz(sonuc) {
  const { kusur, rapor, dengesiz, dosyaSayisi, olculenEtiket } = sonuc;
  const gruplu = {};
  for (const k of kusur) (gruplu[k.tur] = gruplu[k.tur] || []).push(k);

  // Ölçülen sayıyı DA bas: "0 kusur" ile "0 öge" ekranda aynı görünür.
  console.log(`arayüz denetimi — ${dosyaSayisi} tsx, ${olculenEtiket} etiket ölçüldü`);

  for (const [tur, liste] of Object.entries(gruplu)) {
    console.log(`\n${tur}: ${liste.length}`);
    for (const k of liste.slice(0, 12)) console.log(`  ${k.yol}:${k.satir}  ${k.not}`);
    if (liste.length > 12) console.log(`  … +${liste.length - 12}`);
  }

  if (dengesiz.length) {
    console.log(`\nUYARI — yığını dengesiz kalan dosya: ${dengesiz.length}`);
    console.log('  Bu dosyalarda iç içelik ölçümü GÜVENİLMEZ; "kusur yok" sonucuna dayanma.');
    for (const d of dengesiz) console.log(`  ${d.yol}  kalan: ${d.kalan}`);
  }

  if (rapor.length) {
    console.log(`\nRAPOR (kapı değil) — seçili olduğunu yalnızca renkle anlatan denetim: ${rapor.length}`);
    console.log('  Her biri kusur DEĞİL: className\'deki ilk üçlü bir biçim koşulu da olabilir.');
    for (const r of rapor.slice(0, 20)) console.log(`  ${r.yol}:${r.satir}  ${r.not}`);
    if (rapor.length > 20) console.log(`  … +${rapor.length - 20}`);
  }

  if (!kusur.length && !dengesiz.length) console.log('\nkusur yok.');
}

/* ── kendini sınama ──────────────────────────────────────────────────── */

// Kusur bulamayan bir denetim, düzeltilmiş bir yüzeyden ayırt edilemez.
// --negatif, bilerek bozuk bir dosya bırakıp yakalandığını gösterir.
function negatifKontrol() {
  const tohum = path.join(KOK, 'components', '_arayuz-denetim-tohum.tsx');
  const icerik = [
    'export function Tohum() {',
    '  return (',
    '    <form>',
    '      <button onClick={() => {}}>Gönder</button>',
    '      <a href="/x"><button type="button">İç</button></a>',
    '      <img src="/y.png" />',
    '      <a href="https://ornek" target="_blank">Dış</a>',
    '    </form>',
    '  );',
    '}',
    '',
  ].join('\n');

  fs.writeFileSync(tohum, icerik);
  let sonuc;
  try {
    sonuc = denetle();
  } finally {
    fs.unlinkSync(tohum);
  }

  const bulunan = new Set(sonuc.kusur.filter((k) => k.yol.includes('_arayuz-denetim-tohum')).map((k) => k.tur));
  const beklenen = ['formda-typesiz-buton', 'ic-ice-tiklanabilir', 'altsiz-gorsel', 'relsiz-blank'];
  const eksik = beklenen.filter((b) => !bulunan.has(b));

  console.log('negatif kontrol — tohum dosyası eklendi, tarandı, silindi');
  for (const b of beklenen) console.log(`  ${bulunan.has(b) ? 'YAKALANDI' : 'KAÇIRILDI '}  ${b}`);
  if (eksik.length) {
    console.log(`\nDENETİM BOZUK: ${eksik.length} sınıf yakalanmadı.`);
    process.exit(1);
  }
  console.log('\ndenetim çalışıyor.');
}

/* ── giriş ───────────────────────────────────────────────────────────── */

if (process.argv.includes('--negatif')) {
  negatifKontrol();
} else {
  const sonuc = denetle();
  yaz(sonuc);
  if (sonuc.kusur.length || sonuc.dengesiz.length) process.exit(1);
}
