#!/usr/bin/env node
/**
 * DİL KAPISI — İngilizce yüzey gerçekten İngilizce mi?
 *
 * Karar (26 Eylül 2026): Türkçe adresler öneksiz kalır, İngilizce yalnızca
 * ÇEVRİLMİŞ sayfalar için `/en` altında açılır (bkz. lib/dil.ts). Bu kapının
 * korduğu iki kusur, lint/typecheck/build'in hiçbirine takılmıyor:
 *
 *   yarım çeviri — `/en` sayfasında Türkçe bir düğme, uyarı ya da başlık
 *                  kalıyor. Okuyucu için kırık sayfa, arama motoru için
 *                  "karışık dil" ya da kopya içerik.
 *   eksik beyan  — `lang`, `canonical`, `hreflang`, `og:locale` yanlış ya da
 *                  yok: sayfa doğru dilde ama arama motoru onu Türkçenin
 *                  kopyası sanıyor (kök layout `canonical: "/"` miras
 *                  bırakıyor — bu depoda defalarca ölçülmüş kusur).
 *
 * İKİ KİP:
 *
 *  1. SÖZLÜK (varsayılan, derlemeden önce) — `app/`, `lib/`, `content/`
 *     altındaki her `*.dil.json`:
 *       - `tr` ve `en` nesneleri var, anahtarları BİREBİR aynı
 *         (tip yalnızca eksik anahtarı yakalar, fazlayı göremez);
 *       - değer boş olmayan dize;
 *       - `{ad}` yer tutucuları iki dilde aynı (yoksa `bicimle` sayıyı
 *         yutar ya da ekranda `{n}` kalır);
 *       - İngilizce değerde Türkçe metin yok (ölçüt aşağıda).
 *
 *  2. ÇIKTI (`--cikti <dağıtım dizini>`, derlemeden SONRA) — indeksteki her
 *     sayfanın DERLENMİŞ HTML'i. Uygulamanın kendisini sürmenin statik
 *     karşılığı: kaynaktaki `sozluk` çağrısını değil, kullanıcıya giden
 *     metni ölçer. İngilizce sayfada: `lang="en"` kabı, kendi canonical'ı,
 *     üç `hreflang` (tr · en · x-default), `og:locale` en_US, `og:image`,
 *     görünür metinde ve okunan niteliklerde (alt · aria-label · title ·
 *     placeholder · başlık · açıklama) Türkçe yok. Türkçe karşılıkta:
 *     `hreflang` en çifti — tek yönlü beyanı arama motoru yok sayar.
 *
 * TÜRKÇE ÖLÇÜTÜ ve AYNA HÂLİ:
 *   - Harf: yalnızca Türkçeye özgü `ğ ş ı İ` (büyük/küçük). `ö ü ç` BİLEREK
 *     dışarıda — İngilizce tıp metninde eponim taşıyorlar (Sjögren, Löfgren).
 *   - Sözcük: Türkçeye özgü sık sözcükler (ve · ile · için · hasta · sonuç …),
 *     TAM sözcük olarak (Unicode harf dizisine bölünüp karşılaştırılır; JS
 *     `\b` ASCII'ye göre çalıştığı için kullanılmaz).
 *   - GÖREMEDİĞİ: listede olmayan ve özel harf taşımayan Türkçe sözcük
 *     ("Hesapla" listede, "Gönder" değil). Ölçüt yarım çeviriyi büyük
 *     olasılıkla yakalar, TAM çeviriyi kanıtlamaz; son onay insanda.
 *   - `lang` niteliği `en` olmayan alt ağaç (ör. dil değiştiricideki
 *     "Türkçe") muaftır: orada Türkçe metin kasıtlıdır ve beyanlıdır.
 *     Kök `<html lang="tr">` bu kurala GİRMEZ (bkz. DilDegistir.tsx) —
 *     girseydi bütün sayfa muaf olur, kapı kör kalırdı.
 *   - Çıktı kipi yalnızca İLK çizimi görür: sonuç kartı gibi koşullu dallar
 *     derlenmiş HTML'de yoktur. Onların metni sözlük kipinde denetlenir;
 *     sözlüğe girmemiş gömülü metin ise ancak tarayıcıda sürülerek görülür.
 *
 * Kullanım:
 *   node scripts/dil-denetim.cjs                 → sözlük kapısı
 *   node scripts/dil-denetim.cjs --cikti .next   → derlenmiş HTML kapısı
 *   node scripts/dil-denetim.cjs --kok <dizin>   → başka bir ağaca yönlendir
 *   node scripts/dil-denetim.cjs --negatif       → tohumlu ağaçla kendini sınar
 */
const fs = require("fs");
const os = require("os");
const path = require("path");

const argv = process.argv.slice(2);
const argDegeri = (ad) => {
  const i = argv.indexOf(ad);
  return i >= 0 ? argv[i + 1] : null;
};

/* ── Türkçe ölçütü ───────────────────────────────────────────────────── */

const TR_HARF = /[ğĞşŞıİ]/;
const TR_SOZCUK = new Set([
  "ve", "ile", "veya", "bir", "olan", "gibi", "daha", "sonra", "önce", "için",
  "yok", "evet", "hasta", "hastada", "sonuç", "hesapla", "puan", "toplam",
  "skor", "erkek", "yüksek", "kaynak", "konu", "konular", "araç", "araçlar",
  "kütüphane", "sayfa", "tamam", "geri", "bkz", "örn", "seçin", "girin",
  "kapat", "temizle", "cinsiyet",
]);
/* Branş adları Türkçede `-oloji` ile biter (Kardiyoloji, Endokrinoloji);
   İngilizcesi `-ology`. Ölçüldü: gerçek derlemede `/en/tools/bmi` tohumunun
   18 Türkçe parçasından 3'ü kaçıyordu — "Endokrinoloji", "Cinsiyet",
   "Boy (cm)". İlk ikisi bununla yakalanıyor; "Boy" İngilizce bir sözcük,
   listeye giremez (ayna hâli). */
const TR_EK = /oloji$/i;

/** İlk Türkçe işaret (açıklamalı) ya da null. */
function turkceIsaret(metin) {
  const harf = metin.match(TR_HARF);
  if (harf) return `"${harf[0]}" harfi`;
  for (const s of metin.match(/\p{L}+/gu) || []) {
    if (TR_SOZCUK.has(s.toLowerCase())) return `"${s}" sözcüğü`;
    if (TR_EK.test(s)) return `"${s}" (-oloji eki)`;
  }
  return null;
}

const kisalt = (s, n = 70) => (s.length > n ? s.slice(0, n) + "…" : s);

/* ── 1. SÖZLÜK KİPİ ──────────────────────────────────────────────────── */

function sozlukDosyalari(kok) {
  const cikti = [];
  const gez = (d) => {
    let girdiler;
    try {
      girdiler = fs.readdirSync(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of girdiler) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) {
        if (e.name === "node_modules" || e.name.startsWith(".")) continue;
        gez(p);
      } else if (e.name.endsWith(".dil.json")) cikti.push(p);
    }
  };
  for (const k of ["app", "lib", "content"]) gez(path.join(kok, k));
  return cikti.sort();
}

const yerTutucular = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");

function sozlukDenetle(kok) {
  const kusurlar = [];
  let anahtar = 0;
  const dosyalar = sozlukDosyalari(kok);
  for (const p of dosyalar) {
    const ad = path.relative(kok, p).split(path.sep).join("/");
    const kusur = (tur, ayrinti) => kusurlar.push({ ad, tur, ayrinti });
    let veri;
    try {
      veri = JSON.parse(fs.readFileSync(p, "utf8"));
    } catch (e) {
      kusur("bozuk-json", e.message);
      continue;
    }
    const nesne = (x) => x && typeof x === "object" && !Array.isArray(x);
    if (!nesne(veri) || !nesne(veri.tr) || !nesne(veri.en)) {
      kusur("bicim", "{ tr: {...}, en: {...} } bekleniyordu");
      continue;
    }
    const trA = Object.keys(veri.tr);
    const enA = Object.keys(veri.en);
    for (const k of trA.filter((k) => !(k in veri.en))) kusur("eksik-en", k);
    for (const k of enA.filter((k) => !(k in veri.tr))) kusur("fazla-en", k);
    for (const k of trA) {
      anahtar++;
      const tr = veri.tr[k];
      const en = veri.en[k];
      if (typeof tr !== "string" || !tr.trim()) kusur("bos-deger", `tr.${k}`);
      if (!(k in veri.en)) continue;
      if (typeof en !== "string" || !en.trim()) {
        kusur("bos-deger", `en.${k}`);
        continue;
      }
      if (typeof tr === "string" && yerTutucular(tr) !== yerTutucular(en)) {
        kusur("yer-tutucu", `${k}: tr {${yerTutucular(tr)}} ≠ en {${yerTutucular(en)}}`);
      }
      const isaret = turkceIsaret(en);
      if (isaret) kusur("turkce-en", `${k}: ${isaret} — "${kisalt(en)}"`);
    }
  }
  return { olculenDosya: dosyalar.length, olculenAnahtar: anahtar, kusurlar };
}

/* ── 2. ÇIKTI KİPİ ───────────────────────────────────────────────────── */

const BOS_OGE = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
  "source", "track", "wbr",
]);
const OKUNAN_NITELIK = ["alt", "aria-label", "title", "placeholder"];

function varlikCoz(s) {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

function nitelikler(ham) {
  const cikti = {};
  for (const m of ham.matchAll(/([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    cikti[m[1].toLowerCase()] = varlikCoz(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return cikti;
}

/**
 * Derlenmiş HTML'den okuyucuya giden metin parçaları. `script`/`style`
 * gövdeleri (RSC yükü, JSON-LD) okunmaz; `lang` niteliği `en` olmayan alt
 * ağaç muaftır (kök `<html>` hariç — bkz. dosya başlığı).
 */
function okunanMetinler(html) {
  const parcalar = [];
  const temiz = html
    .replace(/<!DOCTYPE[^>]*>/i, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi, "");
  const yigin = [{ ad: "#belge", muaf: false }];
  const muafMi = () => yigin[yigin.length - 1].muaf;
  for (const m of temiz.matchAll(/<(\/?)([a-zA-Z][\w:-]*)([^>]*)>|([^<]+)/g)) {
    if (m[4] !== undefined) {
      const metin = varlikCoz(m[4]).replace(/\s+/g, " ").trim();
      if (metin && !muafMi()) parcalar.push({ yer: `<${yigin[yigin.length - 1].ad}>`, metin });
      continue;
    }
    const kapanis = m[1] === "/";
    const ad = m[2].toLowerCase();
    if (kapanis) {
      const i = yigin.map((y) => y.ad).lastIndexOf(ad);
      if (i > 0) yigin.length = i;
      continue;
    }
    const n = nitelikler(m[3]);
    let muaf = muafMi();
    if (ad !== "html" && n.lang !== undefined) muaf = !/^en\b/i.test(n.lang);
    if (!muaf) {
      for (const k of OKUNAN_NITELIK) {
        if (n[k] && n[k].trim()) parcalar.push({ yer: `<${ad} ${k}>`, metin: n[k] });
      }
      if (ad === "meta" && n.content) {
        const tur = n.name || n.property || "";
        if (/^(description|og:title|og:description|og:image:alt|twitter:title|twitter:description)$/.test(tur)) {
          parcalar.push({ yer: `<meta ${tur}>`, metin: n.content });
        }
      }
    }
    if (!BOS_OGE.has(ad) && !/\/\s*$/.test(m[3])) yigin.push({ ad, muaf });
  }
  return parcalar;
}

function etiketler(html, desen) {
  return [...html.matchAll(desen)].map((m) => nitelikler(m[1]));
}

/** `/` → `index.html` (tr) / `en.html` (en); `/tools/x` → `tools/x.html`. */
function htmlYolu(dagitim, yol) {
  const koku = path.join(dagitim, "server", "app");
  if (yol === "/") return path.join(koku, "index.html");
  if (yol === "/en") return path.join(koku, "en.html");
  return path.join(koku, ...yol.slice(1).split("/")) + ".html";
}

const enYolu = (yol) => (yol === "/" ? "/en" : `/en${yol}`);
const adresYolu = (href) => {
  try {
    return new URL(href, "http://x").pathname.replace(/(.)\/$/, "$1");
  } catch {
    return null;
  }
};

function ciktiDenetle(kok, dagitim) {
  const kusurlar = [];
  let sayfalar;
  try {
    sayfalar = JSON.parse(fs.readFileSync(path.join(kok, "content", "dil-index.json"), "utf8")).sayfalar;
    if (!Array.isArray(sayfalar)) throw new Error("sayfalar dizi değil");
  } catch (e) {
    return { olculenSayfa: 0, olculenParca: 0, kusurlar: [{ ad: "content/dil-index.json", tur: "indeks", ayrinti: e.message }] };
  }
  if (!fs.existsSync(path.join(dagitim, "server", "app"))) {
    return { olculenSayfa: 0, olculenParca: 0, kusurlar: [{ ad: dagitim, tur: "dagitim", ayrinti: "server/app yok — derleme bu dizine mi yapıldı?" }] };
  }

  /* Site haritası: çevrilmiş sayfanın İngilizcesi haritada ayrı `<loc>` olarak
     durmalı (bkz. app/sitemap.ts → ikiDilli). Harita derlenmediyse bu da kusur. */
  let harita = null;
  try {
    harita = fs.readFileSync(path.join(dagitim, "server", "app", "sitemap.xml.body"), "utf8");
  } catch {
    if (sayfalar.length) kusurlar.push({ ad: "/sitemap.xml", tur: "site-haritasi", ayrinti: "derlenmiş harita yok" });
  }
  const haritaYollari = new Set(
    harita ? [...harita.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => adresYolu(varlikCoz(m[1]))) : []
  );

  let olculenSayfa = 0;
  let olculenParca = 0;
  for (const trYol of sayfalar) {
    const enY = enYolu(trYol);
    const kusur = (ad, tur, ayrinti) => kusurlar.push({ ad, tur, ayrinti });
    if (harita && !haritaYollari.has(enY)) kusur(enY, "site-haritasi", "İngilizce adres haritada yok");

    const enDosya = htmlYolu(dagitim, enY);
    if (!fs.existsSync(enDosya)) {
      kusur(enY, "derlenmedi", `${path.relative(dagitim, enDosya)} yok — İngilizce sayfa statik üretilmeli`);
    } else {
      olculenSayfa++;
      const html = fs.readFileSync(enDosya, "utf8");
      if (!/<[a-z][^>]*\slang="en"/i.test(html.replace(/<html\b[^>]*>/i, ""))) {
        kusur(enY, "lang", 'içerik lang="en" taşıyan bir kapta değil');
      }
      const kanon = etiketler(html, /<link\b([^>]*\brel="canonical"[^>]*)>/gi)[0];
      if (!kanon || adresYolu(kanon.href) !== enY) {
        kusur(enY, "canonical", `beklenen ${enY}, bulunan ${kanon ? adresYolu(kanon.href) : "yok"}`);
      }
      const diller = Object.fromEntries(
        etiketler(html, /<link\b([^>]*\bhreflang="[^"]*"[^>]*)>/gi).map((n) => [n.hreflang, adresYolu(n.href)])
      );
      for (const [dil, beklenen] of [["tr", trYol], ["en", enY], ["x-default", trYol]]) {
        if (diller[dil] !== beklenen) kusur(enY, "hreflang", `${dil}: beklenen ${beklenen}, bulunan ${diller[dil] || "yok"}`);
      }
      const ogYerel = etiketler(html, /<meta\b([^>]*\bproperty="og:locale"[^>]*)>/gi)[0];
      if (!ogYerel || ogYerel.content !== "en_US") kusur(enY, "og:locale", `bulunan ${ogYerel ? ogYerel.content : "yok"}`);
      if (!etiketler(html, /<meta\b([^>]*\bproperty="og:image"[^>]*)>/gi).length) kusur(enY, "og:image", "paylaşım görseli yok");

      const parcalar = okunanMetinler(html);
      olculenParca += parcalar.length;
      for (const { yer, metin } of parcalar) {
        const isaret = turkceIsaret(metin);
        if (isaret) kusur(enY, "turkce-metin", `${yer} ${isaret} — "${kisalt(metin)}"`);
      }
    }

    const trDosya = htmlYolu(dagitim, trYol);
    if (!fs.existsSync(trDosya)) {
      kusur(trYol, "derlenmedi", `${path.relative(dagitim, trDosya)} yok — Türkçe karşılığın hreflang'i denetlenemedi`);
    } else {
      const html = fs.readFileSync(trDosya, "utf8");
      const en = etiketler(html, /<link\b([^>]*\bhreflang="en"[^>]*)>/gi)[0];
      if (!en || adresYolu(en.href) !== enY) {
        kusur(trYol, "hreflang", `Türkçe sayfada en çifti: beklenen ${enY}, bulunan ${en ? adresYolu(en.href) : "yok"}`);
      }
    }
  }
  return { olculenSayfa, olculenParca, kusurlar };
}

/* ── rapor ───────────────────────────────────────────────────────────── */

function rapor(baslik, kusurlar) {
  if (!kusurlar.length) return;
  console.log(`\n${baslik}`);
  for (const k of kusurlar) console.log(`  KUSUR  ${k.ad} · ${k.tur} · ${k.ayrinti}`);
}

/* ── negatif + pozitif kontrol ───────────────────────────────────────── */

if (argv.includes("--negatif")) {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), "dil-negatif-"));
  const yaz = (yol, veri) => {
    const p = path.join(kok, ...yol.split("/"));
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, typeof veri === "string" ? veri : JSON.stringify(veri));
  };

  // Sözlük tohumları. Temizler İŞARETLENMEMELİ: eponimdeki ö/ü, yer tutucu,
  // İngilizce "I" (Türkçe küçültmede ı olurdu).
  yaz("app/tools/temiz/metin.dil.json", {
    tr: { baslik: "Sjögren skoru", kriter: "{n} kriter", ben: "Ben" },
    en: { baslik: "Sjögren score", kriter: "{n} criteria", ben: "I agree" },
  });
  yaz("lib/temiz.dil.json", { tr: { a: "Kapat" }, en: { a: "Close" } });
  yaz("app/tools/kusurlu/metin.dil.json", {
    tr: { a: "Hesapla", b: "Sonuç", c: "{n} puan", d: "Uyarı", e: "Hasta", f: "Boş", h: "Kardiyoloji" },
    en: { a: "Hesapla", b: "Result", c: "{n} points ({m})", d: "Uyarı", e: "Patient ve family", f: " ", g: "Fazla", h: "Kardiyoloji" },
  });
  yaz("content/bozuk.dil.json", "{ bozuk");
  yaz("lib/bicimsiz.dil.json", { tr: { a: "x" } });

  // Çıktı tohumları: indeks üç sayfa diyor.
  yaz("content/dil-index.json", { sayfalar: ["/tools/temiz", "/tools/kusurlu", "/tools/eksik"] });
  const bas = ({ lang = ' lang="en"', kanon = "/en/tools/temiz", diller = true, yerel = "en_US", gorsel = true, govde = "" }) =>
    `<!DOCTYPE html><html lang="tr"><head><title>HEART Score · MEDISEA</title>` +
    `<meta name="description" content="Chest pain risk score."/>` +
    `<link rel="canonical" href="https://x.test${kanon}"/>` +
    (diller
      ? `<link rel="alternate" hreflang="tr" href="https://x.test${kanon.slice(3)}"/>` +
        `<link rel="alternate" hreflang="en" href="https://x.test${kanon}"/>` +
        `<link rel="alternate" hreflang="x-default" href="https://x.test${kanon.slice(3)}"/>`
      : "") +
    `<meta property="og:locale" content="${yerel}"/>` +
    (gorsel ? `<meta property="og:image" content="https://x.test/en/opengraph-image"/>` : "") +
    `</head><body><script type="application/ld+json">{"ad":"Türkçe şema ve için"}</script>` +
    `<div${lang}><a href="/tools/x" hreflang="tr" lang="tr">Türkçe</a><h1>HEART Score</h1>` +
    `<p>Enter the <!-- -->5<!-- --> criteria.</p><img src="a.png" alt="Chest pain"/>${govde}</div></body></html>`;
  const trSayfa = (enY) => `<html lang="tr"><head><link rel="alternate" hreflang="en" href="https://x.test${enY}"/></head><body>Türkçe</body></html>`;
  yaz(".next/server/app/en/tools/temiz.html", bas({}));
  yaz(".next/server/app/tools/temiz.html", trSayfa("/en/tools/temiz"));
  yaz(
    ".next/server/app/en/tools/kusurlu.html",
    bas({
      lang: "",
      kanon: "/",
      diller: false,
      yerel: "tr_TR",
      gorsel: false,
      govde: `<button aria-label="Kapat">x</button><p>Hesapla</p><input placeholder="Yaş"/><noscript><p>Hesaplama çalışmıyor</p></noscript>`,
    })
  );
  yaz(".next/server/app/tools/kusurlu.html", "<html><head></head><body></body></html>");
  yaz(".next/server/app/sitemap.xml.body", "<urlset><url><loc>https://x.test/tools/temiz</loc></url><url><loc>https://x.test/en/tools/temiz</loc></url></urlset>");
  // `/tools/eksik`: iki HTML de yok.

  const s = sozlukDenetle(kok);
  const c = ciktiDenetle(kok, path.join(kok, ".next"));
  fs.rmSync(kok, { recursive: true, force: true });

  const say = (liste) => {
    const m = {};
    for (const k of liste) m[`${k.ad}|${k.tur}`] = (m[`${k.ad}|${k.tur}`] || 0) + 1;
    return m;
  };
  const beklenenSozluk = {
    "app/tools/kusurlu/metin.dil.json|fazla-en": 1,
    "app/tools/kusurlu/metin.dil.json|bos-deger": 1,
    "app/tools/kusurlu/metin.dil.json|yer-tutucu": 1,
    "app/tools/kusurlu/metin.dil.json|turkce-en": 4, // Hesapla (sözcük) · Uyarı (harf) · "ve" (sözcük) · Kardiyoloji (ek)
    "content/bozuk.dil.json|bozuk-json": 1,
    "lib/bicimsiz.dil.json|bicim": 1,
  };
  const beklenenCikti = {
    "/en/tools/kusurlu|lang": 1,
    "/en/tools/kusurlu|canonical": 1,
    "/en/tools/kusurlu|hreflang": 3,
    "/en/tools/kusurlu|og:locale": 1,
    "/en/tools/kusurlu|og:image": 1,
    "/en/tools/kusurlu|turkce-metin": 4, // aria-label · Hesapla · placeholder · noscript
    "/tools/kusurlu|hreflang": 1,
    "/en/tools/eksik|derlenmedi": 1,
    "/tools/eksik|derlenmedi": 1,
    "/en/tools/kusurlu|site-haritasi": 1,
    "/en/tools/eksik|site-haritasi": 1,
  };
  const esit = (a, b) => JSON.stringify(Object.entries(a).sort()) === JSON.stringify(Object.entries(b).sort());
  const gS = say(s.kusurlar);
  const gC = say(c.kusurlar);
  const temizIsaretli = [...s.kusurlar, ...c.kusurlar].filter((k) => /temiz/.test(k.ad));
  if (!esit(gS, beklenenSozluk) || !esit(gC, beklenenCikti) || temizIsaretli.length) {
    if (!esit(gS, beklenenSozluk)) console.log(`negatif kontrol DÜŞTÜ (sözlük)\n  beklenen ${JSON.stringify(beklenenSozluk)}\n  bulunan  ${JSON.stringify(gS)}`);
    if (!esit(gC, beklenenCikti)) console.log(`negatif kontrol DÜŞTÜ (çıktı)\n  beklenen ${JSON.stringify(beklenenCikti)}\n  bulunan  ${JSON.stringify(gC)}`);
    if (temizIsaretli.length) {
      console.log("pozitif kontrol DÜŞTÜ — temiz tohum işaretlendi:");
      temizIsaretli.forEach((k) => console.log(`  ${k.ad} · ${k.tur} · ${k.ayrinti}`));
    }
    process.exit(1);
  }
  const n = (m) => Object.values(m).reduce((a, b) => a + b, 0);
  console.log(
    `negatif + pozitif kontrol GEÇTİ — sözlük: ${s.olculenDosya} dosya / ${s.olculenAnahtar} anahtar, ${n(gS)} kusur yakalandı; ` +
      `çıktı: ${c.olculenSayfa} sayfa / ${c.olculenParca} metin parçası, ${n(gC)} kusur yakalandı; temiz tohumlar işaretlenmedi.`
  );
  process.exit(0);
}

/* ── kapı ────────────────────────────────────────────────────────────── */

const kok = path.resolve(argDegeri("--kok") || process.cwd());
const dagitim = argDegeri("--cikti");

if (dagitim) {
  const c = ciktiDenetle(kok, path.resolve(kok, dagitim));
  console.log(`ölçülen: ${c.olculenSayfa} İngilizce sayfa · ${c.olculenParca} metin parçası`);
  rapor("derlenmiş HTML:", c.kusurlar);
  if (c.kusurlar.length) {
    console.log(`\n${c.kusurlar.length} kusur — kapı KAPALI.`);
    process.exit(1);
  }
  console.log("kusur yok.");
  process.exit(0);
}

const s = sozlukDenetle(kok);
console.log(`ölçülen: ${s.olculenDosya} sözlük dosyası · ${s.olculenAnahtar} anahtar`);
rapor("sözlük:", s.kusurlar);
if (s.kusurlar.length) {
  console.log(`\n${s.kusurlar.length} kusur — kapı KAPALI.`);
  process.exit(1);
}
console.log("kusur yok.");
