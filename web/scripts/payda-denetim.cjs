/* PAYDA DENETİMİ — aracın ilan ettiği tavan, şıklardan hesaplanan tavana eşit mi?
 *
 * Sınıf iki gerçek kusur üretti: `rapid3` 0–30 ilan edip 0–50 üretiyordu
 * (işlev toplamı 3'e bölünmüyordu), `scorad` 0–103 ilan edip 0–85'te
 * kalıyordu (subjektif bileşen 10'a bölünüyordu). Ekran ikisinde de
 * kendisiyle çelişiyordu.
 *
 * Kaynak taraması BİLEREK seçildi: azami puan şıkların statik özelliği,
 * tarayıcı gerektirmiyor. Geçen turda yazılan genel tarayıcı sürücüsü
 * "0 kusur" ile "0 ölçüm"ü ayırt edemediği için kullanılmadan reddedilmişti.
 *
 * Ayrıştırılamayan araç için SAYI UYDURULMAZ; ayrı listede raporlanır.
 *
 * ── KAPSAM SINIRI — BU DENETİM SINIFI KAPATMAZ ──────────────────────
 *
 * TARİHSEL KONTROL DÜŞTÜ ve sonucu buraya yazıldı: düzeltme öncesi `rapid3`
 * ve `scorad` sürülünce denetim ikisini de "ayrıştırılamadı" diyor, yani
 * **doğduğu iki kusuru yakalayamazdı.**
 *
 * Sebep yapısal: ölçüt her grubun KENDİ şık dizisi olduğunu varsayıyor.
 * O iki araçta tek bir şık dizisi (`FUNC_OPTS`, yoğunluk şıkları) N madde
 * boyunca YENİDEN KULLANILIYOR; grup sayısı dizide değil madde listesinde
 * duruyor ve kaynaktan güvenle çıkarılamıyor.
 *
 * Yani bu denetim, ayrıştırabildiği araçlar için güçlü kanıt üretir; sınıfın
 * tamamı için DEĞİL. "Ayrıştırılamadı" kovası bir iş listesidir, temiz
 * listesi değil.
 *
 * ── "AYRIŞTIRILAMADI" KOVASININ 23 ARACI ELLE KARARA BAĞLANDI ───────
 *
 * O kova BEKLEYEN İŞ DEĞİL; hepsi kaynak okunarak doğrulandı ve tavanları
 * ilan ettikleriyle uyuşuyor. Yeniden kovalamayın:
 *
 *   N madde × şık tavanı:
 *     cat-copd 8×5=40 · ciwa-ar (7×9 + 4)=67 · dlqi 10×3=30 · gds-15 15×1=15
 *     mrss 17×3=51 · tnss 4×3=12 · uas7 7×(3+3)=42 · esas 9×10=90
 *   bileşen toplamı:
 *     conut 6+3+2=11 · glasgow-blatchford 6+6+3+1+1+2+2+2=23
 *     frail 5×1=5 · ipi 5×1=5 · timi-ua 7×1=7 · fibromiyalji WPI 19 bölge
 *     karnofsky 0–100 tek grup · gcs 4+5+6=15
 *   ayrı alt sayaçlar (toplam payda DEĞİL):
 *     ranson — "{admissionCount}/5" ve "{hour48Count}/6"; diziler gerçekten
 *     5 ve 6 öge taşıyor. Tarama bir ara 6 ve 7 saymıştı: TİP ANOTASYONU
 *     satırındaki `{ key: CriterionKey; … }` da sayılmıştı. Off-by-one ölçüm
 *     hatasıydı, araçta kusur yok.
 *   payda İLANI SAHTE (formül parçası, sınama gerektirmez):
 *     basdai `(S5+S6)/2` · gnri `(Boy − 150)/4` · haq-di · spot-urine
 *     `UÜre/2.8 + UGlukoz/18`
 *   bu seride düzeltilenler: rapid3 (0–30) · scorad (0–103)
 *
 * ── AÇIK ADAYIN VERDİKTİ — YENİDEN KOVALAMAYIN ──────────────────────
 *
 *   findrisc  hesap 30 · ilan 26  ->  KUSUR DEĞİL, ölçüt fazla sayıyor.
 *     Bel çevresi için iki ALTERNATİF dizi var (WAIST_M ve WAIST_F) ve
 *     hastanın cinsiyetine göre yalnızca biri kullanılıyor; ölçüt ikisini de
 *     topluyor, 26 + 4 = 30. Elle doğrulandı: 4+3+4+2+1+2+5+5 = 26, bantlar
 *     da yayımlanmış değerlerle uyuşuyor.
 *     Genel kural: birbirini dışlayan alternatif gruplar FAZLA sayılır.
 */
const fs = require('fs');
const path = require('path');
/* Bayraklar kök dizin sanılmasın: `--kontrol` bir yol değil. */
const KOK = process.argv.slice(2).find((a) => !a.startsWith('--')) || 'app/tools';

/* Ekranda ilan edilen payda: "/ 30 puan", "/ 42<", "/ ~103" */
const ILAN = /\/\s*~?(\d{1,3})\s*(?:puan|Puan|<)/;

/** Verilen konumdaki `[`den başlayan dengeli bloğu döndürür. */
function blok(s, bas) {
  let derinlik = 0;
  for (let j = bas; j < s.length; j++) {
    if (s[j] === '[') derinlik++;
    else if (s[j] === ']') { derinlik--; if (derinlik === 0) return s.slice(bas, j + 1); }
  }
  return null;
}

/**
 * ŞIK GRUPLARI — en dıştaki diziyi almak YANLIŞ sonuç verdi.
 *
 * İlk sürüm `const ITEMS = [ {…, options:[…]}, … ]` yapısında en dıştaki
 * bloğu tek grup sayıyordu; braden 6 grup yerine "1 grup" görünüyor ve
 * tavanı 23 yerine 4 çıkıyordu. Grup, şıkları DOĞRUDAN taşıyan dizidir:
 *   1) `options: [ … ]`  (act · heart · braden · nihss …)
 *   2) `const X = [ ["etiket", N], … ]`  (findrisc · abcd2 …)
 */
function gruplar(s) {
  const out = [];
  /* `options:` ve `opts:` — braden yalnızca tek kelime yüzünden ayrıştırma
     dışında kalıyordu, o yüzden ikisi de aranıyor. */
  for (const m of s.matchAll(/\b(?:options|opts)\s*:\s*\[/g)) {
    const b = blok(s, m.index + m[0].length - 1);
    if (b) out.push(b);
  }
  if (out.length) return out;
  for (const m of s.matchAll(/=\s*\[/g)) {
    const b = blok(s, m.index + m[0].length - 1);
    if (b && /\[\s*"[^"]+"\s*,\s*-?\d+\s*\]/.test(b)) out.push(b);
  }
  return out;
}

/** Bir dizideki puanlar: `pts: N`, `["etiket", N]`, `value: N`, `p: N` */
function puanlar(blok) {
  const p = [];
  for (const m of blok.matchAll(/\bpts\s*:\s*(-?\d+)/g)) p.push(+m[1]);
  if (!p.length) for (const m of blok.matchAll(/\[\s*"[^"]+"\s*,\s*(-?\d+)\s*\]/g)) p.push(+m[1]);
  if (!p.length) for (const m of blok.matchAll(/\bvalue\s*:\s*(-?\d+)/g)) p.push(+m[1]);
  if (!p.length) for (const m of blok.matchAll(/\bp\s*:\s*(-?\d+)/g)) p.push(+m[1]);
  return p;
}

const esit = [], sapan = [], ayristirilamayan = [];
let arac = 0, ilanEden = 0;

for (const d of fs.readdirSync(KOK, { withFileTypes: true })) {
  if (!d.isDirectory() || d.name.startsWith('_')) continue;
  const f = path.join(KOK, d.name, 'page.tsx');
  if (!fs.existsSync(f)) continue;
  arac++;
  const s = fs.readFileSync(f, 'utf8');
  const im = s.match(ILAN);
  if (!im) continue;
  ilanEden++;
  const ilan = +im[1];

  /* Her şık dizisi bir GRUP; grubun tavanı en yüksek puanı.
     İç içe dizilerde yalnızca EN DIŞTAKİ blok sayılır (diziler() öyle veriyor). */
  const gr = gruplar(s).map(puanlar).filter((p) => p.length > 1);
  if (!gr.length) { ayristirilamayan.push({ arac: d.name, ilan, neden: 'puanlı şık dizisi yok' }); continue; }

  /**
   * BOOL BİLEŞENLER — şık dizisi olmayan ama skora giren terimler.
   *
   * `abcd2` skoru `(age?1:0) + (bp?1:0) + cln + dur + (dm?1:0)`; tarayıcı
   * yalnızca iki şık dizisini görüp 4 diyordu, ilan 7. Kusur değil ayrıştırma
   * boşluğuydu: üç bool terimin 1+1+1'i eksikti.
   */
  const skorSatiri = s.match(/const\s+(?:score|total|toplam|skor)\s*=\s*([^;]+);/);
  let bool = 0;
  if (skorSatiri) for (const m of skorSatiri[1].matchAll(/\?\s*(-?\d+)\s*:\s*0/g)) bool += +m[1];

  const hesap = gr.reduce((t, p) => t + Math.max(...p), 0) + bool;
  const kayit = { arac: d.name, ilan, hesap, grup: gr.length };
  if (hesap === ilan) esit.push(kayit); else sapan.push(kayit);
}

if (process.argv.includes('--kontrol')) {
  const os = require('os');
  const t = fs.mkdtempSync(path.join(os.tmpdir(), 'payda-'));
  const yaz = (ad, govde) => { fs.mkdirSync(path.join(t, ad)); fs.writeFileSync(path.join(t, ad, 'page.tsx'), govde, 'utf8'); };
  /* NEGATİF: ilan 10, şıklardan hesap 8 -> SAPAN olarak YAKALANMALI */
  yaz('zz-bozuk', [
    'const ITEMS = [',
    '  { id: "a", options: [{ label: "yok", pts: 0 }, { label: "var", pts: 4 }] },',
    '  { id: "b", options: [{ label: "yok", pts: 0 }, { label: "var", pts: 4 }] },',
    '];',
    'export default function X(){ return <div>TOPLAM 8 / 10 puan</div>; }',
  ].join('\n'));
  /* POZİTİF: ilan 8, hesap 8 -> İŞARETLENMEMELİ */
  yaz('zz-temiz', [
    'const ITEMS = [',
    '  { id: "a", options: [{ label: "yok", pts: 0 }, { label: "var", pts: 4 }] },',
    '  { id: "b", options: [{ label: "yok", pts: 0 }, { label: "var", pts: 4 }] },',
    '];',
    'export default function X(){ return <div>TOPLAM 8 / 8 puan</div>; }',
  ].join('\n'));
  /* POZİTİF 2: bool terimli skor — ayrıştırma boşluğu sahte sapan üretmemeli */
  yaz('zz-bool', [
    'const DUR = [["kısa", 0], ["uzun", 2]] as const;',
    'const score = (age ? 1 : 0) + dur + (dm ? 1 : 0);',
    'export default function X(){ return <div>TOPLAM 4 / 4 puan</div>; }',
  ].join('\n'));
  const cikti = [];
  const eskiLog = console.log; console.log = (x) => cikti.push(String(x));
  const kayit = { esit: [], sapan: [], ayr: [] };
  // taramayı tohum dizinde tekrar çalıştır
  for (const d of fs.readdirSync(t, { withFileTypes: true })) {
    const f = path.join(t, d.name, 'page.tsx');
    const s2 = fs.readFileSync(f, 'utf8');
    const im2 = s2.match(ILAN); if (!im2) continue;
    const gr2 = gruplar(s2).map(puanlar).filter((p) => p.length > 1);
    const sk = s2.match(/const\s+(?:score|total|toplam|skor)\s*=\s*([^;]+);/);
    let bl = 0; if (sk) for (const m of sk[1].matchAll(/\?\s*(-?\d+)\s*:\s*0/g)) bl += +m[1];
    if (!gr2.length && !bl) { kayit.ayr.push(d.name); continue; }
    const h = gr2.reduce((a, p) => a + Math.max(...p), 0) + bl;
    (h === +im2[1] ? kayit.esit : kayit.sapan).push(d.name);
  }
  console.log = eskiLog;
  fs.rmSync(t, { recursive: true, force: true });
  const negatif = kayit.sapan.includes('zz-bozuk');
  const sahte = ['zz-temiz', 'zz-bool'].filter((x) => kayit.sapan.includes(x) || kayit.ayr.includes(x));
  if (!negatif) console.log('negatif kontrol DÜŞTÜ — ilan 10 / hesap 8 olan tohum yakalanmadı, ölçüt KÖR.');
  if (sahte.length) console.log('pozitif kontrol DÜŞTÜ — sahte sapan/ayrıştırılamadı: ' + sahte.join(', '));
  if (!negatif || sahte.length) process.exit(1);
  console.log('negatif + pozitif kontrol GEÇTİ — sapan yakalanıyor, iki temiz biçim işaretlenmiyor.');
  process.exit(0);
}

console.log(`payda denetimi — ${arac} araç tarandı, ${ilanEden} tanesi payda ilan ediyor`);
console.log('');
console.log(`İLAN = HESAP (güçlü kanıt temiz): ${esit.length}`);
for (const x of esit) console.log(`    ${x.arac.padEnd(22)} ${x.hesap} / ${x.ilan}  (${x.grup} grup)`);
console.log('');
console.log(`SAPAN (tarayıcıda elle doğrulanmalı): ${sapan.length}`);
for (const x of sapan) console.log(`    ${x.arac.padEnd(22)} hesap ${x.hesap}  ilan ${x.ilan}  (${x.grup} grup)`);
console.log('');
console.log(`AYRIŞTIRILAMADI — "temiz" DENMİYOR: ${ayristirilamayan.length}`);
for (const x of ayristirilamayan) console.log(`    ${x.arac.padEnd(22)} ilan ${x.ilan}  — ${x.neden}`);
