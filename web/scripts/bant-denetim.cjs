/* BANT CETVELİ DENETİMİ — ekranda basılan sınırlar, koddaki merdivene uyuyor mu?
 *
 * Araçlar sonucun yanında bir cetvel basıyor ("Remisyon ≤ 3 · Düşük 3.1–6").
 * Cetvel ile ternary merdiven ayrışırsa SINIR DEĞERİNDE yanlış bant çıkar ve
 * hiçbir kapı görmez — kod geçerli, tipler doğru, derleme temiz.
 *
 * Ölçüt ADAY üretir; karar kaynağı okumakla verilir.
 */
const fs = require('fs');
const path = require('path');
const KOK = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'app/tools';

/** Koddaki merdiven eşikleri: `v <= 3 ?`, `score > 12 ?` */
function merdivenEsikleri(s) {
  const out = [];
  for (const m of s.matchAll(/\b([A-Za-z_$][\w.$]*)\s*(<=|>=|<|>)\s*(-?\d+(?:\.\d+)?)\s*\?/g)) {
    out.push({ op: m[2], v: parseFloat(m[3]) });
  }
  return out;
}

/**
 * Cetveldeki sınırlar — YALNIZCA karşılaştırma glifine bitişik sayılar.
 * Düz sayıları (birim, referans aralığı) almak yüzlerce sahte aday üretir.
 */
function cetvelSinirlari(s) {
  const out = [];
  /* JSX metni: etiketleri ve ifadeleri at, geriye düz metin kalsın */
  const metin = s
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/^\s*\/\/.*$/gm, ' ')
    .replace(/\{[^{}]*\}/g, ' ')
    .replace(/<[^>]*>/g, ' ')
    /* JSX metninde düz `<` yazılamaz; cetveller `&lt;`/`&gt;` kullanıyor.
       Çözülmezse ölçüt tam da aradığı biçimi göremez (negatif kontrol bunu
       yakaladı: tohum gerçek şekli taşıyınca ölçüt kör çıktı). */
    .replace(/&lt;=?/g, '<')
    .replace(/&gt;=?/g, '>')
    .replace(/&le;/g, '≤')
    .replace(/&ge;/g, '≥');
  for (const m of metin.matchAll(/([≤≥<>])\s*(-?\d+(?:\.\d+)?)/g)) {
    out.push({ op: m[1], v: parseFloat(m[2]) });
  }
  for (const m of metin.matchAll(/(-?\d+(?:\.\d+)?)\s*[–—]\s*(-?\d+(?:\.\d+)?)/g)) {
    out.push({ op: 'aralik', v: parseFloat(m[1]) });
    out.push({ op: 'aralik', v: parseFloat(m[2]) });
  }
  return out;
}

const bulgu = [];
let arac = 0, incelenen = 0;
for (const d of fs.readdirSync(KOK, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name.startsWith('_')) continue;
  const f = path.join(KOK, d.name, 'page.tsx');
  if (!fs.existsSync(f)) continue;
  arac++;
  const s = fs.readFileSync(f, 'utf8');
  const mer = merdivenEsikleri(s);
  const cet = cetvelSinirlari(s);
  if (mer.length < 2 || cet.length < 2) continue;
  incelenen++;

  /**
   * ÖLÇÜT DARALTILDI. İlk sürüm "cetvelde olup merdivende olmayan sayı"
   * arıyordu ve 28 aracın 23'ünü işaretledi; fazla çıkanların hepsi ölçeğin
   * UÇ DEĞERLERİYDİ (braden 6 ve 23, dlqi 30, heart 0–10). Cetvelde uç
   * göstermek doğru, kusur değil.
   *
   * Asıl aranan şey: AYNI sayı hem cetvelde hem merdivende geçiyor ama
   * KAPSAYICILIĞI çelişiyor. O zaman tam o değerde ekranın vaat ettiği bant
   * ile hesaplanan bant ayrışır.
   *
   *   merdiven `v <= 3`  +  cetvel `< 3`   -> 3 hangi banda düşüyor?
   *   merdiven `v > 50`  +  cetvel `≥ 50`  -> 50 hangi banda düşüyor?
   */
  const kapsayici = { '<=': true, '>=': true, '<': false, '>': false, '≤': true, '≥': true };
  const celiski = [];
  for (const m of mer) {
    for (const c of cet) {
      if (c.op === 'aralik' || Math.abs(c.v - m.v) > 0.0001) continue;
      const ayniYon = ('<'.includes(m.op[0]) && '<'.includes(c.op)) || ('>'.includes(m.op[0]) && '>'.includes(c.op));
      if (!ayniYon) continue;
      if (kapsayici[m.op] !== kapsayici[c.op]) {
        celiski.push(`${m.v}: kod "${m.op}" ↔ cetvel "${c.op}"`);
      }
    }
  }
  const benzersiz = [...new Set(celiski)];
  if (benzersiz.length) {
    bulgu.push({ arac: d.name, merdiven: [...new Set(mer.map((x) => x.op + x.v))].join(' '), eksik: benzersiz });
  }
}

if (process.argv.includes('--kontrol')) {
  const os = require('os');
  const t = fs.mkdtempSync(path.join(os.tmpdir(), 'bant-'));
  const yaz = (ad, g) => { fs.mkdirSync(path.join(t, ad)); fs.writeFileSync(path.join(t, ad, 'page.tsx'), g, 'utf8'); };
  /* TOHUM GERÇEK ŞEKLİ TAŞIMALI. İlk tohum cetveli fonksiyon gövdesine
     koymuştu; metin çıkarıcının `{…}` süzgeci gövdenin tamamını yutuyor ve
     ölçüt KÖR görünüyordu. Gerçek araçlarda cetvel modül düzeyinde bir satır
     dizisinde duruyor (spot-urine'daki "Yorumlama Kılavuzu" gibi). */
  const cetvel = (esik) => 'const KILAVUZ = ["A: ' + esik + ' 3", "B: 3–6", "C: 6 üstü"];';
  const merdiven = 'const bant = (v) => v <= 3 ? "A" : v <= 6 ? "B" : "C";';
  /* NEGATİF: kod `<= 3`, cetvel `< 3` -> tam 3'te bant ayrışır, YAKALANMALI */
  yaz('zz-bozuk', merdiven + '\n' + cetvel('<'));
  /* POZİTİF 1: kod ile cetvel uyumlu -> İŞARETLENMEMELİ */
  yaz('zz-temiz', merdiven + '\n' + cetvel('≤'));
  /* POZİTİF 2: cetvelde ÖLÇEK UCU var (merdivende karşılığı yok) -> sahte
     bulgu üretmemeli. İlk sürüm tam bunu yapıp 28 aracın 23'ünü işaretledi. */
  yaz('zz-uc', merdiven + '\nconst BASLIK = ["Ölçek 0–23", "A: ≤ 3"];');

  const say = { sapan: [], temiz: [] };
  for (const d of fs.readdirSync(t, { withFileTypes: true })) {
    const s2 = fs.readFileSync(path.join(t, d.name, 'page.tsx'), 'utf8');
    const mer2 = merdivenEsikleri(s2), cet2 = cetvelSinirlari(s2);
    const kaps = { '<=': true, '>=': true, '<': false, '>': false, '≤': true, '≥': true };
    let c = 0;
    for (const m of mer2) for (const cc of cet2) {
      if (cc.op === 'aralik' || Math.abs(cc.v - m.v) > 0.0001) continue;
      const ayni = ('<'.includes(m.op[0]) && '<'.includes(cc.op)) || ('>'.includes(m.op[0]) && '>'.includes(cc.op));
      if (ayni && kaps[m.op] !== kaps[cc.op]) c++;
    }
    (c ? say.sapan : say.temiz).push(d.name);
  }
  fs.rmSync(t, { recursive: true, force: true });
  const negatif = say.sapan.includes('zz-bozuk');
  const sahte = ['zz-temiz', 'zz-uc'].filter((x) => say.sapan.includes(x));
  if (!negatif) console.log('negatif kontrol DÜŞTÜ — `<=` / `<` çelişkisi yakalanmadı, ölçüt KÖR.');
  if (sahte.length) console.log('pozitif kontrol DÜŞTÜ — sahte bulgu: ' + sahte.join(', '));
  if (!negatif || sahte.length) process.exit(1);
  console.log('negatif + pozitif kontrol GEÇTİ — kapsayıcılık çelişkisi yakalanıyor, ölçek ucu işaretlenmiyor.');
  process.exit(0);
}

console.log(`bant cetveli denetimi — ${arac} araç, ${incelenen} tanesi hem cetvel hem merdiven taşıyor`);
console.log('');
console.log(`kapsayıcılık çelişkisi: ${bulgu.length} araç`);
for (const b of bulgu) {
  console.log(`  ${b.arac}`);
  console.log(`      merdiven: ${b.merdiven}`);
  console.log(`      çelişki: ${b.eksik.join(', ')}`);
}
