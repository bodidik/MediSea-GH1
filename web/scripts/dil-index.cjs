#!/usr/bin/env node
/**
 * DİL İNDEKSİ — hangi Türkçe sayfanın İngilizcesi var?
 *
 * `content/dil-index.json`u `app/en` ağacından üretir. Site haritası, `hreflang`
 * çiftleri, dil değiştirici ve araç layout'ları (`arac-metadata.cjs`) bu
 * listeyi okuyor (bkz. lib/dil.ts). Çalışma zamanında `app/` okunamadığı için
 * (sunucusuz ortamda kaynak dizin yok) liste `content/`te duruyor.
 *
 * İKİ KURAL (ihlal her kipte düşürür):
 *  1. Her İngilizce sayfanın bir TÜRKÇE karşılığı olmalı. Yoksa `hreflang`
 *     var olmayan bir adrese işaret eder ve dil değiştirici 404'e götürür.
 *  2. İngilizce ağaçta dinamik (`[x]`), paralel (`@x`) ya da kesişen
 *     (`(.)x`) rota YOK. Dinamik rotanın hangi adresleri ürettiğini dosya
 *     sisteminden bilemeyiz; o gün gelirse betik genişletilir — sessizce
 *     atlamak, çevrilmiş sayfayı indeksten düşürürdü.
 *
 * Boş liste MEŞRU: Faz 0'da (26 Eyl 2026) `app/en`de yalnızca layout var,
 * sayfa yok. Ayrıştırma yok (yalnızca yol eşleme), yani "hiç bulamadım"
 * burada "ayrıştırma bozuldu" anlamına gelemez.
 *
 * Kullanım:
 *   node scripts/dil-index.cjs              → üretir ve yazar
 *   node scripts/dil-index.cjs --kontrol    → yazmaz; bayatsa çıkış 1 (CI)
 *   node scripts/dil-index.cjs --kok <dizin> → başka bir ağaca yönlendir
 */
const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const kokIdx = argv.indexOf("--kok");
const KOK = kokIdx >= 0 ? path.resolve(argv[kokIdx + 1]) : process.cwd();
const APP = path.join(KOK, "app");
const EN = path.join(APP, "en");
const INDEKS = path.join(KOK, "content", "dil-index.json");
const SAYFA = /^page\.(tsx|ts|jsx|js)$/;

/** `dizin` altındaki sayfa dosyalarının rota parçaları (gruplar ve özel klasörler elenmiş). */
function sayfalar(dizin, disla) {
  const cikti = [];
  (function yur(d, parcalar) {
    let girdiler;
    try {
      girdiler = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of girdiler) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (disla && p === disla) continue;
        if (e.name.startsWith("_")) continue; // Next özel klasörü: rota değil
        if (e.name === "node_modules" || e.name.startsWith(".")) continue;
        const grup = /^\(.*\)$/.test(e.name) && !e.name.startsWith("(.");
        yur(p, grup ? parcalar : [...parcalar, e.name]);
      } else if (SAYFA.test(e.name)) {
        cikti.push({ dosya: path.relative(KOK, p).split(path.sep).join("/"), parcalar });
      }
    }
  })(dizin, []);
  return cikti;
}

const yolYap = (parcalar) => "/" + parcalar.join("/");

function uret() {
  const hatalar = [];

  // Türkçe rotalar: `app/en` DIŞINDA kalan her sayfa. Dinamik parça desen olur.
  const trDesenleri = sayfalar(APP, EN).map(({ parcalar }) => {
    const desen = parcalar
      .map((s) => (/^\[.*\]$/.test(s) ? "[^/]+" : s.replace(/[.*+?^${}()|\\]/g, "\\$&")))
      .join("/");
    return new RegExp(`^/${desen}$`);
  });

  const enSayfalari = fs.existsSync(EN) ? sayfalar(EN) : [];
  const liste = [];
  for (const { dosya, parcalar } of enSayfalari) {
    const garip = parcalar.find((s) => /^\[|^@|^\(\./.test(s));
    if (garip) {
      hatalar.push(`${dosya}: "${garip}" desteklenmiyor — İngilizce ağaçta yalnızca statik rota (betiği genişlet)`);
      continue;
    }
    const trYol = yolYap(parcalar);
    if (!trDesenleri.some((d) => d.test(trYol))) {
      hatalar.push(`${dosya}: Türkçe karşılığı yok (${trYol}) — hreflang ve dil değiştirici var olmayan adrese gider`);
      continue;
    }
    liste.push(trYol);
  }
  liste.sort();
  return { liste, hatalar, olculen: enSayfalari.length };
}

const { liste, hatalar, olculen } = uret();
const yeni = JSON.stringify({ sayfalar: liste }, null, 2) + "\n";

console.log(`ölçülen: ${olculen} İngilizce sayfa · indekse giren: ${liste.length}`);
if (hatalar.length) {
  hatalar.forEach((h) => console.log(`  KUSUR  ${h}`));
  console.log(`\n${hatalar.length} kusur — düzeltmeden indeks yazılmaz.`);
  process.exit(1);
}

if (argv.includes("--kontrol")) {
  let eski = null;
  try {
    eski = JSON.parse(fs.readFileSync(INDEKS, "utf8")).sayfalar;
  } catch {
    console.log(`${path.relative(KOK, INDEKS)} okunamadı — node scripts/dil-index.cjs`);
    process.exit(1);
  }
  const eksik = liste.filter((y) => !eski.includes(y));
  const fazla = eski.filter((y) => !liste.includes(y));
  if (eksik.length || fazla.length) {
    if (eksik.length) console.log(`  indekste EKSİK: ${eksik.join(", ")}`);
    if (fazla.length) console.log(`  indekste FAZLA (sayfası yok): ${fazla.join(", ")}`);
    console.log("BAYAT — çare: node scripts/dil-index.cjs && node scripts/arac-metadata.cjs");
    process.exit(1);
  }
  console.log("indeks güncel.");
  process.exit(0);
}

fs.mkdirSync(path.dirname(INDEKS), { recursive: true });
fs.writeFileSync(INDEKS, yeni, "utf8");
console.log(`yazıldı: ${path.relative(KOK, INDEKS)} (${liste.length} sayfa)`);
