#!/usr/bin/env node
/**
 * KAYNAK KAPISI — yeni konu kaynaksız giremez.
 *
 * Uzman okuyucunun ilk sorusu "bu hangi kılavuza göre?". 26 Eylül 2026'da
 * 516 konunun yalnızca biri (AKS) yapılandırılmış kaynak taşıyordu. Kural
 * O GÜNDEN SONRASI için: o tarihte var olan kaynaksız konular
 * `content/kaynak-muaf.json` listesinde muaf, yeni her konu `meta.kaynaklar`
 * ile girer. Şema ve sayfadaki gösterimi: `lib/kaynaklar.ts`.
 *
 * ÜÇ KURAL:
 *  1. Listede OLMAYAN konu en az bir geçerli kaynak taşır.
 *  2. Bozuk kayıt HER konuda düşer (muaf olsa bile). Sayfa (`kaynaklariAl`)
 *     bozuk kaydı sessizce ATLAR — sayfa düşmesin diye doğru olan bu; ama
 *     yazarın "kaynak ekledim" sanıp eklemediği hâli ancak kapı görür:
 *       - `ad` yok ya da boş        → sayfada hiç görünmez
 *       - `url` https değil         → bağlantı olmaz, düz metin kalır
 *       - `yil` 1900..gelecek yıl dışı → yazım hatası
 *  3. Liste YALNIZCA KÜÇÜLÜR. Muaf bir konu kaynak kazanınca kapı düşer ve
 *     "listeden çıkar" der (`--guncelle` çıkarır). Listeye EKLEYEN bir kip
 *     bilerek yok: öyle bir kip varsa kural bir komutla delinir.
 *
 * Listede olup ağaçta bulunmayan yol DÜŞÜRMEZ, yalnızca yazılır: içerik
 * ayrı bir dalda (`icerik`) giriliyor ve o dalın henüz main'e gelmemiş
 * konuları bilerek listede (başlangıçta: buprenorfin-rotasyonu-ve-induksiyon).
 *
 * DOI doğruluğu bu kapının işi DEĞİL (CI'da ağ yok sayılır). Kural
 * CLAUDE.md'de: DOI `api.crossref.org/works/<doi>` ile doğrulanır.
 *
 * Kullanım:
 *   node scripts/kaynak-denetim.cjs              → kapı (çıkış 1 = kusur)
 *   node scripts/kaynak-denetim.cjs --guncelle   → kaynak kazanan muafları listeden çıkarır
 *   node scripts/kaynak-denetim.cjs --kok <dizin> → başka bir ağaca yönlendir
 *   node scripts/kaynak-denetim.cjs --negatif    → tohumlu ağaçla kendini sınar
 */
const fs = require("fs");
const os = require("os");
const path = require("path");

const argv = process.argv.slice(2);
const kokIdx = argv.indexOf("--kok");

function yolAl(kok) {
  return {
    konuKok: path.join(kok, "content", "canonical"),
    muafDosya: path.join(kok, "content", "kaynak-muaf.json"),
  };
}

function konulariOku(konuKok) {
  const cikti = [];
  (function yur(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { yur(p); continue; }
      if (!e.name.endsWith(".json")) continue;
      const yol = path.relative(konuKok, p).split(path.sep).join("/").replace(/\.json$/, "");
      let j = null;
      try { j = JSON.parse(fs.readFileSync(p, "utf8")); } catch { /* aşağıda raporlanır */ }
      cikti.push({ yol, j });
    }
  })(konuKok);
  return cikti.sort((a, b) => a.yol.localeCompare(b.yol, "tr"));
}

const BU_YIL = new Date().getFullYear();

/** Bir konunun kaynak kayıtlarını denetler: { gecerli: sayı, kusurlar: [] } */
function kaynakDenetle(meta) {
  const ham = meta && meta.kaynaklar;
  if (ham === undefined) return { gecerli: 0, kusurlar: [] };
  if (!Array.isArray(ham)) return { gecerli: 0, kusurlar: ["`meta.kaynaklar` dizi değil"] };
  let gecerli = 0;
  const kusurlar = [];
  ham.forEach((k, i) => {
    const no = `kaynak ${i + 1}`;
    if (!k || typeof k !== "object" || Array.isArray(k)) { kusurlar.push(`${no}: nesne değil`); return; }
    const { ad, yil, url } = k;
    let tamam = true;
    if (typeof ad !== "string" || !ad.trim()) { kusurlar.push(`${no}: \`ad\` yok ya da boş — sayfada görünmez`); tamam = false; }
    if (url !== undefined && !(typeof url === "string" && /^https:\/\/\S+$/.test(url.trim()))) {
      kusurlar.push(`${no}: \`url\` https değil (${JSON.stringify(url)}) — bağlantı olmaz`); tamam = false;
    }
    if (yil !== undefined) {
      const n = Number(yil);
      if (!Number.isInteger(n) || n < 1900 || n > BU_YIL + 1) { kusurlar.push(`${no}: \`yil\` makul değil (${JSON.stringify(yil)})`); tamam = false; }
    }
    if (tamam) gecerli++;
  });
  return { gecerli, kusurlar };
}

function denetle(kok) {
  const { konuKok, muafDosya } = yolAl(kok);
  if (!fs.existsSync(konuKok)) throw new Error(`konu ağacı yok: ${konuKok}`);
  if (!fs.existsSync(muafDosya)) throw new Error(`muaf listesi yok: ${muafDosya}`);
  const muafVeri = JSON.parse(fs.readFileSync(muafDosya, "utf8"));
  if (!Array.isArray(muafVeri.konular)) throw new Error("muaf listesinde `konular` dizisi yok");
  const muaf = new Set(muafVeri.konular);

  const konular = konulariOku(konuKok);
  // Ayrıştırmaya dayanan denetim sıfır ölçümü MEŞRU SAYMAZ (bkz. arac-metadata).
  if (konular.length === 0) throw new Error("hiç konu okunamadı — denetim kör");

  const sonuc = { olculen: konular.length, kaynakli: 0, muafKaynaksiz: 0, yeniKaynaksiz: [], bozuk: [], kaynakKazanan: [], okunamayan: [], ağactaYok: [] };
  const agacta = new Set();
  for (const { yol, j } of konular) {
    agacta.add(yol);
    if (!j) { sonuc.okunamayan.push(yol); continue; }
    const { gecerli, kusurlar } = kaynakDenetle(j.meta);
    if (kusurlar.length) sonuc.bozuk.push({ yol, kusurlar });
    if (gecerli > 0) {
      sonuc.kaynakli++;
      if (muaf.has(yol)) sonuc.kaynakKazanan.push(yol);
    } else if (muaf.has(yol)) {
      sonuc.muafKaynaksiz++;
    } else {
      sonuc.yeniKaynaksiz.push(yol);
    }
  }
  for (const y of muaf) if (!agacta.has(y)) sonuc.ağactaYok.push(y);
  return { sonuc, muafDosya, muafVeri };
}

function rapor(s) {
  console.log(`kaynak denetimi — ${s.olculen} konu ölçüldü · ${s.kaynakli} kaynaklı · ${s.muafKaynaksiz} muaf (26 Eyl 2026 öncesi)`);
  let kusur = 0;
  if (s.okunamayan.length) {
    kusur += s.okunamayan.length;
    console.log(`\nJSON olarak okunamayan (${s.okunamayan.length}):`);
    s.okunamayan.forEach((y) => console.log(`  ${y}`));
  }
  if (s.yeniKaynaksiz.length) {
    kusur += s.yeniKaynaksiz.length;
    console.log(`\nKAYNAKSIZ YENİ KONU (${s.yeniKaynaksiz.length}) — \`meta.kaynaklar\` ekleyin (şema: lib/kaynaklar.ts):`);
    s.yeniKaynaksiz.forEach((y) => console.log(`  ${y}`));
  }
  if (s.bozuk.length) {
    kusur += s.bozuk.length;
    console.log(`\nBOZUK KAYNAK KAYDI (${s.bozuk.length}):`);
    s.bozuk.forEach((b) => b.kusurlar.forEach((k) => console.log(`  ${b.yol}: ${k}`)));
  }
  if (s.kaynakKazanan.length) {
    kusur += s.kaynakKazanan.length;
    console.log(`\nKAYNAK KAZANAN MUAF (${s.kaynakKazanan.length}) — listeden çıkarın: node scripts/kaynak-denetim.cjs --guncelle`);
    s.kaynakKazanan.forEach((y) => console.log(`  ${y}`));
  }
  if (s.ağactaYok.length) {
    console.log(`\nnot: listede olup bu ağaçta olmayan ${s.ağactaYok.length} yol (başka dalda olabilir, düşürmez): ${s.ağactaYok.slice(0, 5).join(", ")}${s.ağactaYok.length > 5 ? " …" : ""}`);
  }
  return kusur;
}

/* ── negatif kontrol ─────────────────────────────────────────────────── */
if (argv.includes("--negatif")) {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), "kaynak-negatif-"));
  const yaz = (yol, veri) => {
    const p = path.join(kok, "content", "canonical", yol + ".json");
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, typeof veri === "string" ? veri : JSON.stringify(veri));
  };
  const konu = (meta) => ({ title: "Tohum", meta, sections: [] });
  const iyi = { ad: "Tohum kılavuzu", yil: 2024, url: "https://doi.org/10.0000/tohum" };
  // Temiz tohumlar — İŞARETLENMEMELİ
  yaz("a/muaf-kaynaksiz", konu({}));
  yaz("a/yeni-kaynakli", konu({ kaynaklar: [iyi] }));
  yaz("a/yeni-urlsiz", konu({ kaynaklar: [{ ad: "Ders kitabı" }] }));
  // Kusurlu tohumlar — HER BİRİ YAKALANMALI
  yaz("b/yeni-kaynaksiz", konu({}));
  yaz("b/bos-dizi", konu({ kaynaklar: [] }));
  yaz("b/adsiz", konu({ kaynaklar: [{ url: "https://x.org" }] }));
  yaz("b/js-url", konu({ kaynaklar: [{ ad: "X", url: "javascript:alert(1)" }] }));
  yaz("b/http-url", konu({ kaynaklar: [{ ad: "X", url: "http://x.org" }] }));
  yaz("b/yil", konu({ kaynaklar: [{ ad: "X", yil: 20233 }] }));
  yaz("b/muaf-bozuk", konu({ kaynaklar: [{ ad: "" }] }));
  yaz("b/muaf-kazanan", konu({ kaynaklar: [iyi] }));
  yaz("b/bozuk-json", "{ bozuk");
  fs.writeFileSync(path.join(kok, "content", "kaynak-muaf.json"),
    JSON.stringify({ konular: ["a/muaf-kaynaksiz", "b/muaf-bozuk", "b/muaf-kazanan", "z/baska-dalda"] }));

  const { sonuc: s } = denetle(kok);
  const beklenen = {
    yeniKaynaksiz: ["b/adsiz", "b/bos-dizi", "b/http-url", "b/js-url", "b/yeni-kaynaksiz", "b/yil"],
    bozuk: ["b/adsiz", "b/http-url", "b/js-url", "b/muaf-bozuk", "b/yil"],
    kaynakKazanan: ["b/muaf-kazanan"],
    okunamayan: ["b/bozuk-json"],
    ağactaYok: ["z/baska-dalda"],
  };
  const gercek = {
    yeniKaynaksiz: [...s.yeniKaynaksiz].sort(),
    bozuk: s.bozuk.map((b) => b.yol).sort(),
    kaynakKazanan: [...s.kaynakKazanan].sort(),
    okunamayan: [...s.okunamayan].sort(),
    ağactaYok: [...s.ağactaYok].sort(),
  };
  fs.rmSync(kok, { recursive: true, force: true });
  const hatalar = Object.keys(beklenen).filter((k) => JSON.stringify(beklenen[k]) !== JSON.stringify(gercek[k]));
  // Pozitif kontrol: temiz tohumların HİÇBİRİ hiçbir kovada olmamalı.
  const temiz = ["a/muaf-kaynaksiz", "a/yeni-kaynakli", "a/yeni-urlsiz"];
  const sahte = temiz.filter((y) => Object.values(gercek).some((l) => l.includes(y)));
  if (hatalar.length || sahte.length) {
    hatalar.forEach((k) => console.log(`negatif kontrol DÜŞTÜ — ${k}: beklenen ${JSON.stringify(beklenen[k])}, bulunan ${JSON.stringify(gercek[k])}`));
    if (sahte.length) console.log(`pozitif kontrol DÜŞTÜ — temiz tohum işaretlendi: ${sahte.join(", ")}`);
    process.exit(1);
  }
  console.log(`negatif + pozitif kontrol GEÇTİ — ${s.olculen} tohum: 9 kusur yakalandı, 3 temiz tohum işaretlenmedi.`);
  process.exit(0);
}

/* ── kapı / güncelleme ───────────────────────────────────────────────── */
const kok = kokIdx >= 0 ? argv[kokIdx + 1] : process.cwd();
const { sonuc, muafDosya, muafVeri } = denetle(kok);

if (argv.includes("--guncelle")) {
  if (!sonuc.kaynakKazanan.length) { console.log("kaynak kazanan muaf yok — liste değişmedi."); process.exit(0); }
  const cikar = new Set(sonuc.kaynakKazanan);
  muafVeri.konular = muafVeri.konular.filter((y) => !cikar.has(y));
  fs.writeFileSync(muafDosya, JSON.stringify(muafVeri, null, 2) + "\n", "utf8");
  console.log(`listeden çıkarıldı (${cikar.size}): ${[...cikar].join(", ")} · kalan muaf ${muafVeri.konular.length}`);
  process.exit(0);
}

const kusur = rapor(sonuc);
if (kusur) {
  console.log(`\n${kusur} kusur — kapı KAPALI.`);
  process.exit(1);
}
console.log("kusur yok.");
