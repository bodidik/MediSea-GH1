#!/usr/bin/env node
/**
 * Asılı konu denetimi — hiyerarşiden düşen başlıklar.
 *
 * Bir konu `meta.parent` ile bir üst başlığa bağlanır. Ebeveyn bulunamazsa
 * konu ana listeye de giremez (ebeveyni var sayıldığı için), ebeveyninin
 * sayfasından da bağlantı almaz. Branş sayfası bunu onarıyor — böyle
 * konuları "Diğer Konular" altında listeliyor — yani hiçbir şey KAYBOLMUYOR.
 * Ama düzen bozuluyor: gastroenterolojide 34 konunun yalnızca 2'si ana
 * başlık, 13'ü bu kovada.
 *
 * Bu denetim kovanın NEDEN dolduğunu üç sınıfa ayırır, çünkü üçünün çaresi
 * farklı:
 *
 *   1. Ebeveyn VAR ama gizli   → `meta.hidden` kaldırılırsa hiyerarşi döner
 *   2. Ebeveyn adı SAPMIŞ      → büyük harf / Türkçe karakter farkı; dosya
 *                                gerçekte var, referans tutmuyor
 *   3. Ebeveyn hiç yok         → o üst başlık hiç yazılmamış
 *
 * Kullanım:  node scripts/asili-denetim.cjs
 * Çıkış kodu 0 — CI kapısı DEĞİL: hangi konunun hangi başlık altına gireceği
 * tıbbi bir sınıflandırma kararı ve içerik kullanıcının sorumluluğunda.
 */

const fs = require("fs");
const path = require("path");

const KOK = path.join(__dirname, "..", "content", "canonical");

const hepsi = [];
for (const b of fs.readdirSync(KOK, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  for (const f of fs.readdirSync(path.join(KOK, b.name)).filter((f) => f.endsWith(".json"))) {
    let v;
    try {
      v = JSON.parse(fs.readFileSync(path.join(KOK, b.name, f), "utf-8"));
    } catch {
      continue; // bozuk dosyayı başka denetim yakalar
    }
    hepsi.push({
      brans: b.name,
      slug: f.replace(/\.json$/, ""),
      parent: v?.meta?.parent || null,
      hidden: v?.meta?.hidden === true,
      hiddenHam: v?.meta?.hidden,
    });
  }
}

/* ── ŞEMA KONTROLÜ: `hidden` BOOLEAN olmalı ────────────────────────────
 *
 * Ölçüldü: bir konu dosyasında `"hidden": "true"` yazıyordu — DİZE. Bayrağı
 * okuyan dokuz yerin bir kısmı katı (`=== true`), bir kısmı gevşek
 * (`|| false`) karşılaştırıyor, yani dize değer yüzeyden yüzeye FARKLI
 * davranıyordu:
 *
 *   branş sayfası → listelenmiyor  (gevşek: gizli sayıldı)
 *   site haritası → DAHİL          (katı: görünür sayıldı)
 *   konu sayfası  → açılıyor
 *
 * Yani taslak bir sayfa arama motoruna ilan edilirken kullanıcı ona
 * gezinerek ulaşamıyordu. Tek karakterlik bir yazım hatası, iki yüzeyi
 * ters yönde etkiliyor.
 */
const semaKusuru = hepsi.filter((k) => k.hiddenHam !== undefined && typeof k.hiddenHam !== "boolean");
if (semaKusuru.length) {
  console.log("");
  console.log("ŞEMA KUSURU — `meta.hidden` boolean değil:");
  for (const k of semaKusuru) {
    console.log(`    ${k.brans}/${k.slug}  →  ${JSON.stringify(k.hiddenHam)} (${typeof k.hiddenHam})`);
  }
  console.log("    Bu değer bazı yüzeylerde gizli, bazılarında görünür sayılır.");
  process.exitCode = 1;
}

const gorunur = hepsi.filter((k) => !k.hidden);
const gorunurAnahtar = new Set(gorunur.map((k) => `${k.brans}/${k.slug}`));
const tumAnahtar = new Map(hepsi.map((k) => [`${k.brans}/${k.slug}`, k]));

/** Referans ile dosya adı arasındaki fark yalnızca harf düzeni/Türkçe karakter mi? */
const sadelestir = (s) =>
  String(s)
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c");

const asili = gorunur.filter((k) => k.parent && !gorunurAnahtar.has(`${k.brans}/${k.parent}`));

const gizli = [];
const sapmis = [];
const yok = [];

for (const k of asili) {
  if (tumAnahtar.has(`${k.brans}/${k.parent}`)) {
    gizli.push(k);
    continue;
  }
  const hedef = sadelestir(k.parent);
  const eslesen = gorunur.find((x) => x.brans === k.brans && sadelestir(x.slug) === hedef);
  if (eslesen) sapmis.push({ ...k, gercek: eslesen.slug });
  else yok.push(k);
}

console.log(`görünür konu: ${gorunur.length} | asılı: ${asili.length} (%${((asili.length / gorunur.length) * 100).toFixed(1)})\n`);
console.log(`1) ebeveyn VAR ama gizli : ${gizli.length}`);
console.log(`2) ebeveyn adı sapmış    : ${sapmis.length}`);
console.log(`3) ebeveyn hiç yok       : ${yok.length}`);

if (sapmis.length) {
  console.log(`\n— adı sapmış olanlar — KOD BUNLARI ZATEN ONARIYOR, elle düzeltme gerekmez:`);
  console.log(`  (lib/slug-eslestir.ts, okuma adımında harf düzeni ve Türkçe aksan farkını yok sayar)`);
  for (const k of sapmis)
    console.log(`   ${k.brans}/${k.slug}\n       parent: "${k.parent}"  →  gerçek dosya: "${k.gercek}"`);
}

if (gizli.length) {
  const grup = {};
  for (const k of gizli) (grup[`${k.brans}/${k.parent}`] ??= []).push(k.slug);
  console.log(`\n— gizli ebeveynler (hidden kalkarsa ${gizli.length} konu hiyerarşiye döner):`);
  for (const [eb, cocuklar] of Object.entries(grup).sort((a, b) => b[1].length - a[1].length))
    console.log(`   ${eb}  ←  ${cocuklar.length} konu`);
}

if (yok.length) {
  const grup = {};
  for (const k of yok) (grup[`${k.brans}/${k.parent}`] ??= []).push(k.slug);
  console.log(`\n— hiç yazılmamış üst başlıklar:`);
  for (const [eb, cocuklar] of Object.entries(grup).sort((a, b) => b[1].length - a[1].length))
    console.log(`   ${eb}  ←  ${cocuklar.length} konu`);
}
