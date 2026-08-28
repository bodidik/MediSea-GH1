#!/usr/bin/env node
/**
 * ELLE YAZILMIŞ SLUG/ROTA LİSTESİ TARAMASI (rapor — CI kapısı DEĞİL).
 *
 * Bu sınıf bu depoda DÖRT kez kusur verdi:
 *   ARAC_KATEGORILERI      — en büyük kategori (19 infüzyon aracı) menüde yoktu
 *   app/lib/tools.ts       — 34 araçlık dönemden kalmış branş eşlemesi;
 *                            hematoloji ve palyatifte hub ile ortak araç SIFIRDI
 *   SiteHeader.branches    — 4 branş (21 konu) menüden hiç erişilemiyordu
 *   premium panosu         — yeni branş JSON'u panoda görünmüyordu
 *
 * Ölçüt: aynı dizide 3+ slug benzeri dize literali, ya da dosyada 3+ `slug:`
 * alanı. Yorumlar boşlukla DOLDURULUR (satır sonları korunur) — bu depoda
 * yorumlar kusurları birebir alıntılıyor ve kaynak tarayan her ölçüt onları
 * elemek zorunda.
 *
 * ADAY ÜRETİR, KARAR VERMEZ. Bir liste "elle yazılmış" olduğu için kusurlu
 * değildir; kusur, o listenin TÜRETİLEBİLİR bir gerçeği ikinci kez tutması
 * ve sessizce bayatlayabilmesidir.
 *
 * ── VERDİKTLER (ölçüldü, yeniden kovalanmasın) ───────────────────────────
 *   ToolsIcerik.tsx (151) · specialties.ts (13)  KAYNAĞIN KENDİSİ
 *   app/tools/<araç>/page.tsx `slug:` alanları    slug değil ŞIK kimliği
 *   app/tools/data/ads.ts (6 dizi, 46 slug)       ÖLÜ KOD — 3 bağı zaten kırık
 *   app/(site)/page.tsx FEATURED_TOOLS            arac-metadata --kontrol izliyor
 *   SiteHeader ARAC_KATEGORILERI                  ölçütü yorumunda BEYAN EDİLMİŞ
 *   SecurePlayer / API rotaları / kayit           HTTP başlığı, iframe izni,
 *                                                 form alanı — slug DEĞİL
 *   premium panosu BRANCH_IDS                     DÜZELTİLDİ (dizinden türüyor)
 */
const fs = require("fs");
const path = require("path");

const kokArg = process.argv.indexOf("--kok");
const TABAN = kokArg > 0 ? process.argv[kokArg + 1] : path.join(__dirname, "..");
const KOKLER = ["app", "lib", "components"];

const atlaMi = (p) =>
  p.includes("node_modules") ||
  p.includes(".next") ||
  p.split(/[\\/]/).some((seg) => seg.startsWith("_"));

/** Yorumları BOŞLUKLA doldurur; satır sonları korunur ki rapor doğru satırı göstersin. */
function maske(s) {
  s = s.replace(/\/\/[^\n]*/g, (m) => " ".repeat(m.length));
  s = s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  return s;
}

const dosyalar = [];
for (const kok of KOKLER) {
  const tam = path.join(TABAN, kok);
  if (!fs.existsSync(tam)) continue;
  (function gez(d) {
    if (atlaMi(d)) return;
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (atlaMi(p)) continue;
      if (e.isDirectory()) gez(p);
      else if (/\.(ts|tsx)$/.test(e.name)) dosyalar.push(p);
    }
  })(tam);
}

const DIZI = /\[\s*(?:(?:"[a-z0-9][a-z0-9-]{2,}"|'[a-z0-9][a-z0-9-]{2,}')\s*,\s*){2,}(?:"[a-z0-9][a-z0-9-]{2,}"|'[a-z0-9][a-z0-9-]{2,}')\s*,?\s*\]/g;
const OGE = /["']([a-z0-9][a-z0-9-]{2,})["']/g;
const SLUG_ALAN = /slug:\s*["'][a-z0-9-]+["']/g;

const bulgu = [];
for (const f of dosyalar) {
  const s = maske(fs.readFileSync(f, "utf8"));
  const kisa = path.relative(TABAN, f);
  for (const m of s.matchAll(DIZI)) {
    const ogeler = [...m[0].matchAll(OGE)].map((x) => x[1]);
    bulgu.push({ f: kisa, tur: "dizi", n: ogeler.length, ogeler });
  }
  const n = (s.match(SLUG_ALAN) || []).length;
  if (n >= 3) bulgu.push({ f: kisa, tur: "slug-alani", n, ogeler: [] });
}

/* ── --kontrol: iki yönlü tohum ─────────────────────────────────────────── */
if (process.argv.includes("--kontrol")) {
  const os = require("os");
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), "liste-"));
  fs.mkdirSync(path.join(dizin, "app"), { recursive: true });
  // KUSURLU: elle yazılmış dizi
  fs.writeFileSync(path.join(dizin, "app", "kirli.ts"),
    'export const X = ["alfa-bir", "beta-iki", "gama-uc"];\n');
  // TEMİZ: aynı şekil YALNIZCA yorumda — ölçüt yorum körü olmamalı
  fs.writeFileSync(path.join(dizin, "app", "temiz.ts"),
    '/* örnek: ["alfa-bir", "beta-iki", "gama-uc"] */\nexport const Y = 1;\n');

  const { execFileSync } = require("child_process");
  const cikti = execFileSync(process.execPath, [__filename, "--kok", dizin], { encoding: "utf-8" });
  fs.rmSync(dizin, { recursive: true, force: true });

  const okunan = Number((cikti.match(/taranan ts\/tsx: (\d+)/) || [])[1] || 0);
  const kirli = /kirli\.ts/.test(cikti);
  const temiz = /temiz\.ts/.test(cikti);
  console.log("--kontrol  okunan: " + okunan);
  if (okunan !== 2) { console.log("HİÇ/EKSİK ÖLÇÜLDÜ — ölçüt kör (beklenen 2 dosya)"); process.exit(1); }
  if (!kirli) { console.log("NEGATİF KONTROL DÜŞTÜ — elle yazılmış dizi yakalanmadı"); process.exit(1); }
  if (temiz) { console.log("POZİTİF KONTROL DÜŞTÜ — YORUMDAKİ şekil aday sayıldı"); process.exit(1); }
  console.log("negatif ✓ (kod içindeki dizi yakalandı)   pozitif ✓ (yorumdaki şekil sayılmadı)");
  process.exit(0);
}

console.log("taranan ts/tsx: " + dosyalar.length);
console.log("ADAY LİSTE: " + bulgu.length + "   (aday üretir, karar vermez)\n");
for (const b of bulgu.sort((a, z) => z.n - a.n)) {
  console.log("  " + String(b.n).padStart(3) + "  " + b.tur.padEnd(11) + b.f);
  if (b.ogeler.length) console.log("        " + b.ogeler.slice(0, 8).join(", ") + (b.ogeler.length > 8 ? " …" : ""));
}
if (!dosyalar.length) { console.log("\nHİÇ DOSYA OKUNMADI — ölçüt kör, 'temiz' DEĞİL"); process.exit(1); }
