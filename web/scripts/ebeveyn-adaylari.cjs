#!/usr/bin/env node
/**
 * ÇOK EBEVEYN ADAYLARI — öneri üretir, KARAR VERMEZ.
 *
 * Ölçüt tıbbi değil YAPISAL: bir konunun "İlgili Konular" listesindeki
 * konuların çoğu TEK BİR hub'ın çocuklarıysa, o hub konunun ikinci ebeveyni
 * için adaydır. Akrabalık zaten `ilgili-index.cjs` tarafından etiket
 * NADİRLİĞİNE göre ölçülmüş durumda — burada yeni bir iddia üretilmiyor,
 * var olan ölçüm hiyerarşi tarafına çevriliyor.
 *
 * ADAY ÜRETİR, KARAR VERMEZ: bir konunun hangi başlığın altında olacağı
 * tıbbi sınıflandırma kararıdır ve içerik sahibinindir (bkz. CLAUDE.md).
 *
 * Kapsam: ebeveyn AYNI BRANŞTA olmak zorunda (iki sayfa da yalnız kendi
 * branş dizinini okuyor), o yüzden çapraz branş adayları hiç üretilmiyor.
 */
const fs = require("fs");
const path = require("path");
const { ebeveynListesi } = require("../lib/ebeveyn.cjs");

const KOK = path.join(__dirname, "..", "content", "canonical");
const IDX = path.join(__dirname, "..", "content", "ilgili-index.json");
const ESIK = Number(process.argv[process.argv.indexOf("--esik") + 1]) || 2;

const norm = (s) =>
  String(s).toLocaleLowerCase("tr")
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c").trim();

const konu = new Map();  // "brans/slug" -> {parentler, gizli, baslik}
const cocuk = new Map(); // "brans/normHub" -> Set(slug)
for (const b of fs.readdirSync(KOK, { withFileTypes: true }).filter((d) => d.isDirectory())) {
  for (const f of fs.readdirSync(path.join(KOK, b.name)).filter((x) => x.endsWith(".json"))) {
    let v; try { v = JSON.parse(fs.readFileSync(path.join(KOK, b.name, f), "utf-8")); } catch { continue; }
    if (v?.meta?.hidden === true) continue;
    const slug = f.replace(/\.json$/, "");
    const parentler = ebeveynListesi(v?.meta?.parent);
    konu.set(b.name + "/" + slug, { brans: b.name, slug, parentler, baslik: v?.title || slug });
    for (const e of parentler) {
      const k = b.name + "/" + norm(e);
      if (!cocuk.has(k)) cocuk.set(k, new Set());
      cocuk.get(k).add(slug);
    }
  }
}

/**
 * ATA/TORUN ELEMESİ — ölçütün ilk hâli 6 aday verdi ve BEŞİ işe yaramazdı:
 *   3'ü konunun ZATEN ATASI  (gereksiz: hiyerarşi onu kapsıyor)
 *   2'si konunun TORUNU      (ters yön: hub değil, alt konu)
 * Eleme tamamen yapısal — tıbbi bir iddia taşımıyor.
 */
function atalar(brans, slug) {
  const out = new Set();
  const yigin = [norm(slug)];
  while (yigin.length) {
    const n = yigin.pop();
    const r = konu.get(brans + "/" + n) || [...konu.values()].find((k) => k.brans === brans && norm(k.slug) === n);
    if (!r) continue;
    for (const e of r.parentler.map(norm)) { if (out.has(e)) continue; out.add(e); yigin.push(e); }
  }
  return out;
}

const idx = JSON.parse(fs.readFileSync(IDX, "utf-8"));
const aday = [];
for (const [anahtar, ilgili] of Object.entries(idx)) {
  const k = konu.get(anahtar);
  if (!k) continue;
  const kendiEb = new Set(k.parentler.map(norm));
  const sayac = new Map();
  for (const d of ilgili) {
    if (d.brans !== k.brans) continue;                 // çapraz branş desteklenmiyor
    const dk = konu.get(d.brans + "/" + d.slug);
    if (!dk) continue;
    for (const e of dk.parentler) {
      const ne = norm(e);
      if (kendiEb.has(ne)) continue;                   // zaten ebeveyni
      if (ne === norm(k.slug)) continue;               // kendisi
      if (!konu.has(k.brans + "/" + e)) continue;      // hub gerçekten var mı
      sayac.set(ne, (sayac.get(ne) || 0) + 1);
    }
  }
  const kendiAtalari = atalar(k.brans, k.slug);
  for (const [hub, n] of sayac) {
    if (n < ESIK) continue;
    if (kendiAtalari.has(hub)) continue;                 // zaten atası — gereksiz
    if (atalar(k.brans, hub).has(norm(k.slug))) continue; // torunu — ters yön
    // Konu o hub'ın çocuğu ZATEN değil; hub'ın kaç çocuğu var?
    const hubCocuk = (cocuk.get(k.brans + "/" + hub) || new Set()).size;
    /* AD ÇAKIŞMASI — hedef hub'da benzer başlıklı bir çocuk var mı?
       Ölçüldü: tek güçlü aday (men-adrenal-kriz-yonetimi -> adrenal-yetmezlik)
       tam bu yüzden UYGULANMADI; hub'da zaten "Akut Adrenal Kriz (Addison
       Krizi)" var ve ikincisi "aynı ad, farklı hedef" kusuru üretirdi. */
    const sozcuk = (t) => new Set(norm(t).split(/[^a-z0-9]+/).filter((w) => w.length > 3));
    const benim = sozcuk(k.baslik);
    let cakisma = null;
    for (const cs of cocuk.get(k.brans + "/" + hub) || []) {
      const ck = konu.get(k.brans + "/" + cs);
      if (!ck) continue;
      const o = sozcuk(ck.baslik);
      const ortak = [...benim].filter((w) => o.has(w)).length;
      if (ortak / Math.max(1, Math.min(benim.size, o.size)) >= 0.6) { cakisma = ck.baslik + " (" + cs + ")"; break; }
    }
    aday.push({ anahtar, brans: k.brans, slug: k.slug, baslik: k.baslik,
                mevcut: k.parentler, oneri: hub, kanit: n, hubCocuk, cakisma });
  }
}
aday.sort((a, b) => b.kanit - a.kanit || a.anahtar.localeCompare(b.anahtar));

console.log("görünür konu: " + konu.size + "  |  eşik: ilgili listesinde >= " + ESIK + " kardeş");
console.log("ADAY: " + aday.length + "  (öneri — karar içerik sahibinin)\n");
if (!aday.length) { console.log("  (aday yok)"); process.exit(0); }
for (const a of aday.slice(0, 30)) {
  console.log("  " + a.brans + "/" + a.slug);
  console.log("      mevcut ebeveyn : " + (a.mevcut.length ? a.mevcut.join(", ") : "(yok)"));
  console.log("      ÖNERİ          : " + a.oneri + "   (ilgili listesinde " + a.kanit + " kardeşi, hub'ın " + a.hubCocuk + " çocuğu var)");
  if (a.cakisma) console.log("      ⚠ AD ÇAKIŞMASI : hub'da zaten benzer başlık var — " + a.cakisma);
}
if (aday.length > 30) console.log("\n  ... ve " + (aday.length - 30) + " aday daha");
