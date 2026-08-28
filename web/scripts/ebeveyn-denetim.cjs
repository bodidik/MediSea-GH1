#!/usr/bin/env node
/**
 * ÇOK EBEVEYNLİ HİYERARŞİ DENETİMİ (rapor — CI kapısı DEĞİL).
 *
 * `meta.parent` dize ya da dizi olabiliyor. Bu denetim şemanın kendi
 * tutarlılığını ölçüyor; içerik kararlarını (hangi konu hangi hub'ın altında
 * olmalı) YARGILAMAZ, onlar kullanıcının.
 *
 * Aranan sınıflar:
 *   1) KENDİ KENDİNE ebeveyn      -> okuma adımı eliyor ama içerik kusuru
 *   2) DÖNGÜ (a -> b -> ... -> a) -> kırıntı yolu `gorulen` ile kırılır ama
 *                                    hiyerarşi anlamsızlaşır
 *   3) ÇİFT ebeveyn kaydı         -> okuma adımı tekilliyor
 *   4) dize OLMAYAN öge           -> sessizce düşer
 *   5) BOŞ dizi                   -> `[]` ile "ebeveyn yok" aynı şey; niyet
 *                                    belirsiz, açıkça yazılmalı
 *
 * `--kontrol`: kendi tohumuyla sınar (negatif + pozitif), bulgu varsa 1 döner.
 */
const fs = require("fs");
const path = require("path");
const os = require("os");
const { ebeveynListesi } = require("../lib/ebeveyn.cjs");

const kokArg = process.argv.indexOf("--kok");
const KOK = kokArg > 0 ? process.argv[kokArg + 1] : path.join(__dirname, "..", "content", "canonical");

const sadelestir = (s) =>
  String(s).toLocaleLowerCase("tr")
    .replace(/ı/g, "i").replace(/ğ/g, "g").replace(/ü/g, "u")
    .replace(/ş/g, "s").replace(/ö/g, "o").replace(/ç/g, "c").trim();

function tara(kok) {
  const konu = [];
  if (!fs.existsSync(kok)) return { konu, bulgu: [], okunan: 0 };
  for (const d of fs.readdirSync(kok, { withFileTypes: true }).filter((x) => x.isDirectory())) {
    for (const f of fs.readdirSync(path.join(kok, d.name)).filter((x) => x.endsWith(".json"))) {
      let v;
      try { v = JSON.parse(fs.readFileSync(path.join(kok, d.name, f), "utf-8")); } catch { continue; }
      const ham = v && v.meta ? v.meta.parent : undefined;
      konu.push({
        brans: d.name,
        slug: f.replace(/\.json$/, ""),
        ham,
        parentler: ebeveynListesi(ham),
        gizli: v && v.meta ? v.meta.hidden === true : false,
      });
    }
  }

  const bulgu = [];
  const anahtar = new Map();
  for (const k of konu) anahtar.set(k.brans + "/" + sadelestir(k.slug), k);

  for (const k of konu) {
    const ad = k.brans + "/" + k.slug;
    if (k.parentler.some((e) => sadelestir(e) === sadelestir(k.slug)))
      bulgu.push(["kendi", ad]);
    if (Array.isArray(k.ham)) {
      if (k.ham.length === 0) bulgu.push(["bos-dizi", ad]);
      if (k.ham.some((x) => typeof x !== "string")) bulgu.push(["dize-degil", ad]);
      const sade = k.ham.filter((x) => typeof x === "string").map((x) => x.trim());
      if (new Set(sade).size !== sade.length) bulgu.push(["cift", ad]);
    }
  }

  // DÖNGÜ: birincil ebeveyn zinciri (kırıntının izlediği yol)
  for (const k of konu) {
    const gorulen = new Set([k.brans + "/" + sadelestir(k.slug)]);
    let cur = k;
    while (cur && cur.parentler.length) {
      const sonraki = anahtar.get(cur.brans + "/" + sadelestir(cur.parentler[0]));
      if (!sonraki) break;
      const key = sonraki.brans + "/" + sadelestir(sonraki.slug);
      if (gorulen.has(key)) { bulgu.push(["dongu", k.brans + "/" + k.slug + " -> " + key]); break; }
      gorulen.add(key);
      cur = sonraki;
    }
  }
  return { konu, bulgu, okunan: konu.length };
}

/* ── --kontrol: tohumlu iki yönlü sınama ─────────────────────────────── */
if (process.argv.includes("--kontrol")) {
  const dizin = fs.mkdtempSync(path.join(os.tmpdir(), "ebeveyn-"));
  const yaz = (b, s, meta) => {
    fs.mkdirSync(path.join(dizin, b), { recursive: true });
    fs.writeFileSync(path.join(dizin, b, s + ".json"), JSON.stringify({ title: s, meta, sections: [] }));
  };
  // TEMİZ (pozitif kontrol: hiçbiri işaretlenmemeli)
  yaz("x", "kok", {});
  yaz("x", "cocuk", { parent: "kok" });
  yaz("x", "coklu", { parent: ["kok", "cocuk"] });
  // KUSURLU (negatif kontrol)
  yaz("x", "kendine", { parent: ["kendine"] });
  yaz("x", "a", { parent: ["b"] });
  yaz("x", "b", { parent: ["a"] });
  yaz("x", "bos", { parent: [] });
  yaz("x", "sayi", { parent: ["kok", 7] });
  yaz("x", "ciftli", { parent: ["kok", "kok"] });

  const { bulgu, okunan } = tara(dizin);
  const tur = new Set(bulgu.map((b) => b[0]));
  const bekle = ["kendi", "dongu", "bos-dizi", "dize-degil", "cift"];
  const eksik = bekle.filter((t) => !tur.has(t));
  const temizIsaretli = bulgu.filter((b) => /\/(kok|cocuk|coklu)$/.test(b[1]));
  fs.rmSync(dizin, { recursive: true, force: true });

  console.log("--kontrol  okunan: " + okunan + "  bulgu: " + bulgu.length);
  if (!okunan) { console.log("HİÇ ÖLÇÜLMEDİ — ölçüt kör"); process.exit(1); }
  if (eksik.length) { console.log("NEGATİF KONTROL DÜŞTÜ — yakalanmayan: " + eksik.join(", ")); process.exit(1); }
  if (temizIsaretli.length) { console.log("POZİTİF KONTROL DÜŞTÜ — temiz kayıt işaretlendi: " + JSON.stringify(temizIsaretli)); process.exit(1); }
  console.log("negatif ✓ (5 sınıfın 5'i)   pozitif ✓ (3 temiz kayıt işaretlenmedi)");
  process.exit(0);
}

/* ── olağan rapor ────────────────────────────────────────────────────── */
const { konu, bulgu, okunan } = tara(KOK);
const cokEbeveynli = konu.filter((k) => k.parentler.length > 1);
console.log("okunan konu: " + okunan + "  |  ÇOK EBEVEYNLİ: " + cokEbeveynli.length);
if (cokEbeveynli.length) {
  console.log("\n— çok ebeveynli konular (ilki BİRİNCİL: kırıntı yolu ondan):");
  for (const k of cokEbeveynli)
    console.log("   " + k.brans + "/" + k.slug + "  →  " + k.parentler.join(", "));
}
const grup = {};
for (const [t, ad] of bulgu) (grup[t] ??= []).push(ad);
const ad = { kendi: "kendi kendine ebeveyn", dongu: "DÖNGÜ", cift: "çift ebeveyn kaydı", "dize-degil": "dize olmayan öge", "bos-dizi": "boş dizi (niyet belirsiz)" };
console.log("\nbulgu: " + bulgu.length);
for (const [t, liste] of Object.entries(grup)) {
  console.log("\n— " + (ad[t] || t) + ": " + liste.length);
  for (const x of liste.slice(0, 10)) console.log("   " + x);
}
if (!okunan) { console.log("\nHİÇ KONU OKUNMADI — ölçüt kör, 'temiz' DEĞİL"); process.exit(1); }
