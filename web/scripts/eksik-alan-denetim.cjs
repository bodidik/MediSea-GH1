#!/usr/bin/env node
/* EKSİK ALAN DENETİMİ — tablo alanı kayıtların ÇOĞUNDA dolu, birkaçında boş mu?
 *
 * Doğduğu kusur (`status-epileptikus`): ajan tablosunda `tavanMg` alanı yedi
 * kaydın BEŞİNDE doluydu. Boş kalan iki ajan — fenitoin ve fosfenitoin — tam
 * da tavanı standart olanlardı ve araç 150 kg hastada 3000 mg / 3000 mg FE
 * yazıyordu; olması gereken 1500. Altyapı (tavan uygulandı bildirimi) zaten
 * vardı, yalnızca iki kayıtta alan boştu.
 *
 * Ölçüt: bir dizideki nesne kayıtlarının anahtar kümelerini karşılaştır.
 * Bir anahtar kayıtların çoğunda varsa ve azınlığında yoksa, eksik olanlar
 * ADAY olur.
 *
 * KAPI DEĞİL RAPOR. Eksiklik çoğu zaman MEŞRUDUR: opsiyonel alan gerçekten
 * o kayıt için geçersiz olabilir (lakosamid kiloya göre dozlanmadığı için
 * `mgKg: 0`). Karar, alanın o kayıt için anlamlı olup olmadığını bilmekle
 * verilir — bunu kaynak söylemez, insan söyler.
 *
 * ── AÇIK ADAYLAR: İKİSİ DE İÇERİK EKSİĞİ, KOD KUSURU DEĞİL ──────────
 *
 * Render TARAFI ikisinde de doğru: alan yoksa hiçbir şey basılmıyor
 * (`{end.uyari && …}` ve `{ilac.not && …}`), yani boş kap ya da bozuk
 * düzen YOK. Eksik olan şey klinik METİN ve onu yazmak içerik kararıdır.
 *
 *   magnezyum-infuzyon — `uyari` 4 endikasyonun 3'ünde var, "astım"da yok.
 *   vazoaktif-infuzyon — `not` 8 ilacın 5'inde var; adrenalin, dopamin ve
 *     dobutaminde yok. DİKKAT ÇEKİCİ: noradrenalin kartı "Tercihen santral
 *     yoldan. Ekstravazasyon doku nekrozu yapar." diyor; aynı tehlike
 *     adrenalin ve dopamin için de geçerli ama o kartlar sessiz. Kullanıcı
 *     noradrenalinden adrenaline geçtiğinde uyarıyı kaybediyor.
 *
 * Bu ikisi BEKLEYEN İÇERİK İŞİ olarak duruyor; kod tarafında yapılacak bir
 * şey yok.
 */
const fs = require('fs');
const path = require('path');
const os = require('os');

const KOK = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'app/tools';
/** Alan, kayıtların en az bu oranında varsa "beklenen" sayılır. */
const ESIK = 0.6;
/** Bu kadar kayıttan az olan diziler gürültü; atlanıyor. */
const EN_AZ_KAYIT = 4;

/** Verilen `[` konumundan dengeli bloğu döndürür. */
function blok(s, bas) {
  let derinlik = 0;
  for (let j = bas; j < s.length; j++) {
    if (s[j] === '[') derinlik++;
    else if (s[j] === ']') { derinlik--; if (derinlik === 0) return s.slice(bas, j + 1); }
  }
  return null;
}

/** Bir dizi bloğundaki ÜST DÜZEY `{...}` kayıtları. */
function kayitlar(dizi) {
  const out = [];
  let derinlik = 0, bas = -1;
  for (let i = 1; i < dizi.length - 1; i++) {
    if (dizi[i] === '{') { if (derinlik === 0) bas = i; derinlik++; }
    else if (dizi[i] === '}') { derinlik--; if (derinlik === 0 && bas >= 0) { out.push(dizi.slice(bas, i + 1)); bas = -1; } }
  }
  return out;
}

/** Kayıttaki ÜST DÜZEY anahtarlar (iç içe nesnelerinkini alma). */
function anahtarlar(kayit) {
  const out = new Set();
  let derinlik = 0;
  const govde = kayit.slice(1, -1);
  for (const m of govde.matchAll(/([{}[\]])|(?:^|,)\s*([A-Za-z_$][\w$]*)\s*:/g)) {
    if (m[1]) { derinlik += (m[1] === '{' || m[1] === '[') ? 1 : -1; continue; }
    if (derinlik === 0 && m[2]) out.add(m[2]);
  }
  return out;
}

function tara(kok) {
  const bulgu = [];
  let arac = 0, dizi = 0;
  for (const d of fs.readdirSync(kok, { withFileTypes: true })) {
    if (!d.isDirectory() || d.name.startsWith('_')) continue;
    const f = path.join(kok, d.name, 'page.tsx');
    if (!fs.existsSync(f)) continue;
    arac++;
    /**
     * YORUMLAR ELENİR — yoksa ölçüt KENDİ yazdığı belgeye takılıyor.
     * Ölçüldü: `status-epileptikus`ta `tavanMg` eklenmiş olduğu hâlde
     * "eksik" raporlandı, çünkü alanın hemen üstüne konan `/* … *␘/` bloğu
     * anahtarı önceki virgülden ayırıyor ve `,\s*anahtar:` deseni tutmuyor.
     * Aynı tuzak yuvarlama denetiminde de yaşanmıştı.
     */
    const s = fs.readFileSync(f, 'utf8')
      .replace(/\r\n/g, '\n')
      .replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '))
      .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(Math.max(0, m.length - p1.length)));
    for (const m of s.matchAll(/=\s*\[/g)) {
      const b = blok(s, m.index + m[0].length - 1);
      if (!b) continue;
      const kyt = kayitlar(b);
      if (kyt.length < EN_AZ_KAYIT) continue;
      dizi++;
      const setler = kyt.map(anahtarlar);
      const sayac = new Map();
      for (const set of setler) for (const k of set) sayac.set(k, (sayac.get(k) || 0) + 1);
      for (const [k, n] of sayac) {
        const oran = n / kyt.length;
        if (oran < ESIK || n === kyt.length) continue;
        /* Hangi kayıtlarda eksik? Kaydın kimliğini ad/slug/id'den al. */
        const eksik = [];
        setler.forEach((set, i) => {
          if (set.has(k)) return;
          const kim = (kyt[i].match(/\b(?:slug|id|key|ad|label|name)\s*:\s*"([^"]{1,28})"/) || [])[1] || ('#' + i);
          eksik.push(kim);
        });
        const satir = s.slice(0, m.index).split('\n').length;
        bulgu.push({ arac: d.name, satir, alan: k, var: n, toplam: kyt.length, eksik });
      }
    }
  }
  return { bulgu, arac, dizi };
}

if (process.argv.includes('--kontrol')) {
  const t = fs.mkdtempSync(path.join(os.tmpdir(), 'eksik-'));
  const yaz = (ad, g) => { fs.mkdirSync(path.join(t, ad)); fs.writeFileSync(path.join(t, ad, 'page.tsx'), g, 'utf8'); };
  /* NEGATİF: `tavanMg` 5/6 kayıtta var, biri eksik -> YAKALANMALI */
  yaz('zz-bozuk', 'const A = [' + [
    '{ slug: "a", mgKg: 1, tavanMg: 10 },',
    '{ slug: "b", mgKg: 2, tavanMg: 20 },',
    '{ slug: "c", mgKg: 3, tavanMg: 30 },',
    '{ slug: "d", mgKg: 4, tavanMg: 40 },',
    '{ slug: "e", mgKg: 5, tavanMg: 50 },',
    '{ slug: "eksik", mgKg: 6 },',
  ].join('') + '];');
  /* POZİTİF 1: alan HER kayıtta var -> işaretlenmemeli */
  yaz('zz-tam', 'const A = [' + [
    '{ slug: "a", tavanMg: 10 },', '{ slug: "b", tavanMg: 20 },',
    '{ slug: "c", tavanMg: 30 },', '{ slug: "d", tavanMg: 40 },',
  ].join('') + '];');
  /* POZİTİF 2: alan AZINLIKTA (eşiğin altında) -> beklenen değil, işaretlenmemeli */
  yaz('zz-azinlik', 'const A = [' + [
    '{ slug: "a", ozel: 1 },', '{ slug: "b" },',
    '{ slug: "c" },', '{ slug: "d" },', '{ slug: "e" },',
  ].join('') + '];');

  const { bulgu } = tara(t);
  fs.rmSync(t, { recursive: true, force: true });
  const adlar = bulgu.map((b) => b.arac);
  const negatif = adlar.includes('zz-bozuk');
  const sahte = ['zz-tam', 'zz-azinlik'].filter((x) => adlar.includes(x));
  if (!negatif) console.log('negatif kontrol DÜŞTÜ — 5/6 dolu alanın eksik kaydı yakalanmadı, ölçüt KÖR.');
  if (sahte.length) console.log('pozitif kontrol DÜŞTÜ — sahte bulgu: ' + sahte.join(', '));
  if (!negatif || sahte.length) process.exit(1);
  console.log('negatif + pozitif kontrol GEÇTİ — eksik alan yakalanıyor, tam ve azınlık biçimleri işaretlenmiyor.');
  process.exit(0);
}

const { bulgu, arac, dizi } = tara(KOK);
console.log(`eksik alan denetimi — ${arac} araç, ${dizi} kayıt dizisi tarandı`);
console.log('');
console.log(`çoğunlukta dolu ama bazı kayıtlarda BOŞ alan: ${bulgu.length}`);
for (const b of bulgu) {
  console.log(`  ${b.arac}:${b.satir}  ${b.alan}  (${b.var}/${b.toplam})`);
  console.log(`      eksik: ${b.eksik.join(', ')}`);
}
console.log('');
console.log('NOT: eksiklik çoğu zaman MEŞRU — opsiyonel alan o kayıt için');
console.log('geçersiz olabilir. Ölçüt aday üretir, kararı kaynağı okumak verir.');
