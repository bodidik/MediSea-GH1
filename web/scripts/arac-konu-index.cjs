#!/usr/bin/env node
/**
 * ARAÇ ↔ KONU BAĞ ÜRETECİ
 *
 * Amaç iki yönlü: CHA₂DS₂-VASc'ı arama motorundan bulan kişi ilgili açık
 * konulara, konuyu okuyan kişi de hesaplayıcıya ulaşsın.
 *
 * Bağ ELLE YAZILMAZ, OKUNUR: konu metni aracın adını gerçekten geçiriyorsa
 * o araç o konuya ilgilidir. Elle tutulan liste bu depoda tarihsel olarak
 * bayatlıyor (bkz. `arac-metadata`, `ilgili-index`).
 *
 * ÖLÇÜLMÜŞ ÖLÇÜT TUZAKLARI — üçü de gerçek yanlış pozitif üretti:
 *
 *  1. Türkçe kelime çakışması. `ESAS` aracı Türkçe "esas" kelimesiyle
 *     eşleşiyordu (10 sahte konu). Çare: tamamı BÜYÜK harf ve kısa olan
 *     takma adlar küçük/büyük harf DUYARLI aranır.
 *
 *  2. Parantez içindeki kısaltma ayırt edici DEĞİL. "(PPI)" proton pompa
 *     inhibitörüyle, "(DVT)" hastalığın kendisiyle eşleşiyordu. Çare:
 *     parantezin İÇİ takma ad sayılmaz, yalnızca ÖNÜ alınır
 *     ("Wells Skoru (DVT)" → "Wells Skoru" · "Wells").
 *
 *  3. JS `\b` ASCII'ye göre çalışıyor — `Ü`, `ş`, `ı` sınırı delmiyor.
 *     Kelime sınırı ELLE kuruluyor.
 *
 *  5. UZUN TİRE parantezle aynı işi görür. "4T Skoru — HIT" adının tek
 *     takma adı kendisiydi; uzun tiresiyle birlikte hiçbir metinde
 *     geçmediği için bu araç HİÇBİR konuya bağlanamıyordu (Behçet ve
 *     Kt/V de aynı durumdaydı). Çare: tirenin de yalnızca ÖNÜ alınır. *
 *  4. Kısaltma BİLEŞİK ÖZEL ADIN parçası olabilir. `TIMI` aracı
 *     "ENGAGE AF-TIMI 48" ÇALIŞMA ADINDAN eşleşiyordu; sayfanın TIMI
 *     risk skoruyla ilgisi yok. Üç harf eleyicisi (tuzak 3 altındaki
 *     `belirsizKisaltma`) TIMI dört harf olduğu için tutmadı. Çare:
 *     tire ile bir alfanümerik komşuya bağlanmış geçiş SAYILMAZ
 *     (`AF-TIMI`, `TIMI-48`); aynı takma ad metinde başka bir yerde
 *     serbest geçiyorsa bağ yine kurulur. *
 * NADİRLİK ÇALIŞMIYOR, denendi: `Anafilaksi` 9 konuda geçiyor ve DOĞRU,
 * `PPI` 10 konuda geçiyor ve YANLIŞ. Ayraç sıklık değil, takma adın
 * kaynağı (parantez içi mi, asıl ad mı).
 *
 * Kullanım:
 *   node scripts/arac-konu-index.cjs            → content/arac-konu.json yazar
 *   node scripts/arac-konu-index.cjs --kontrol  → yazmaz, bayat mı bakar (çıkış 1)
 *   node scripts/arac-konu-index.cjs --kok <yol> → başka bir ağaca yönlendir
 */
const fs = require("fs");
const path = require("path");

const argv = process.argv.slice(2);
const KONTROL = argv.includes("--kontrol");
const kokIdx = argv.indexOf("--kok");
const KOK = kokIdx >= 0 ? argv[kokIdx + 1] : process.cwd();

const ARAC_INDEX = path.join(KOK, "content", "arac-index.json");
const KONU_KOK = path.join(KOK, "content", "canonical");
const CIKTI = path.join(KOK, "content", "arac-konu.json");

/** Konu başına en çok bu kadar araç, araç başına en çok bu kadar konu gösterilir. */
const KONU_BASINA = 6;
const ARAC_BASINA = 8;

const ALT = { "₀":"0","₁":"1","₂":"2","₃":"3","₄":"4","₅":"5","₆":"6","₇":"7","₈":"8","₉":"9" };
const duzle = (s) => String(s || "").replace(/[₀-₉]/g, (c) => ALT[c]);

/** Ad sonundaki tür sözcüğü: "Wells Skoru" → "Wells" de aransın. */
const TUR = /\s+(Skoru|Skor|Kriterleri|Kriteri|İndeksi|Indeksi|Ölçeği|Olcegi|Sınıflaması|Siniflamasi|Hesaplayıcı|Hesaplayici|Testi|Anketi)$/i;

function takmaAdlar(name) {
  const set = new Set();
  const ekle = (s) => { s = String(s).trim(); if (s.length >= 3) set.add(s); };
  const temel = duzle(name);
  ekle(temel);
  // Parantezin yalnızca ÖNÜ. İÇİ alınmaz — tuzak 2.
  const par = temel.match(/^(.*?)\s*\([^)]*\)\s*$/);
  if (par) ekle(par[1]);
  // UZUN TİRE de parantezle aynı işi görüyor: sağındaki niteleyici adın
  // parçası değil (tuzak 5). "4T Skoru — HIT" · "Behçet — ICBD 2014" ·
  // "Kt/V — Daugirdas II" — üçü de yalnızca tam adıyla aranıyordu ve o ad
  // uzun tiresiyle birlikte metinde HİÇ geçmiyor, yani üç araç da hiçbir
  // konuya bağlanamıyordu.
  const tire = temel.match(/^(.*?)\s*[—–]\s*.+$/);
  if (tire) ekle(tire[1]);
  for (const s of [...set]) ekle(s.replace(TUR, ""));
  return [...set].filter((a) => !belirsizKisaltma(a));
}

const HARF = "0-9A-Za-zÀ-ÿıİşŞğĞüÜöÖçÇ";
const kacir = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Tamamı büyük harf ve kısa → küçük/büyük duyarlı ara (tuzak 1). */
const kisaltmaMi = (a) => a.length <= 6 && a === a.toLocaleUpperCase("tr");
/**
 * ÜÇ HARFLİ KISALTMA AYIRT EDİCİ DEĞİL — ölçüldü. "CAT" aracın adından
 * ("CAT Skoru") türüyor ama antikoagülasyon konusunda kansere bağlı
 * trombozu (cancer-associated thrombosis) işaret ediyor; "ACT" de aynı
 * şekilde çok anlamlı. Dört harften kısa büyük-harf takma ad elenir;
 * aracın tam adı ("CAT Skoru") hâlâ eşleşebilir.
 */
const belirsizKisaltma = (a) => kisaltmaMi(a) && a.replace(/[^A-Z0-9]/g, "").length <= 3;
const desenle = (a) =>
  new RegExp(`(^|[^${HARF}])${kacir(a)}([^${HARF}]|$)`, kisaltmaMi(a) ? "" : "i");
/**
 * Tire ile bir alfanümerik komşuya bağlanmış geçiş, takma adın kendisi
 * değil BİLEŞİK BİR ÖZEL ADIN parçasıdır (tuzak 4). Metinde en az bir
 * SERBEST geçiş aranır; hiç yoksa bağ kurulmaz.
 */
const HARF_RE = new RegExp(`[${HARF}]`);
function serbestGecisVarMi(a, govde) {
  const re = new RegExp(kacir(a), kisaltmaMi(a) ? "g" : "gi");
  for (let m; (m = re.exec(govde)); ) {
    const bas = m.index;
    const son = bas + m[0].length;
    // Kelime sınırı (tuzak 3: `\b` ASCII'ye göre çalışıyor, elle kuruyoruz).
    if (bas > 0 && HARF_RE.test(govde[bas - 1])) continue;
    if (son < govde.length && HARF_RE.test(govde[son])) continue;
    // Bileşik özel ad: "AF-TIMI" ya da "TIMI-48".
    if (govde[bas - 1] === "-" && bas > 1 && HARF_RE.test(govde[bas - 2])) continue;
    if (govde[son] === "-" && HARF_RE.test(govde[son + 1] || "")) continue;
    return true;
  }
  return false;
}

function konulariOku() {
  const cikti = [];
  (function yur(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { yur(p); continue; }
      if (!e.name.endsWith(".json")) continue;
      let j;
      try { j = JSON.parse(fs.readFileSync(p, "utf8")); } catch { continue; }
      const yol = path.relative(KONU_KOK, p).split(path.sep).join("/").replace(/\.json$/, "");
      const govde = duzle(
        [j.title || "", ...(j.sections || []).map((s) => `${s.heading || ""} ${s.html || ""}`)].join(" ")
      );
      cikti.push({ yol, baslik: j.title || yol, govde });
    }
  })(KONU_KOK);
  return cikti.sort((a, b) => a.yol.localeCompare(b.yol, "tr"));
}

function uret() {
  const araclar = JSON.parse(fs.readFileSync(ARAC_INDEX, "utf8"));
  if (!Array.isArray(araclar) || araclar.length === 0) {
    // Ayrıştırmaya dayanan üreteç boş sonucu MEŞRU SAYMAZ (bkz. arac-metadata
    // bir kez 114 kayıtlık indeksi [] ile ezdi).
    throw new Error("arac-index.json boş ya da okunamadı — yazma iptal.");
  }
  const konular = konulariOku();
  if (konular.length === 0) throw new Error("hiç konu okunamadı — yazma iptal.");

  const adlar = araclar
    .map((a) => ({ slug: a.slug, name: a.name, alias: takmaAdlar(a.name) }))
    .sort((a, b) => a.slug.localeCompare(b.slug, "tr"));

  const konuArac = {};
  const aracKonu = {};
  for (const k of konular) {
    for (const a of adlar) {
      // En UZUN eşleşen takma ad en ayırt edicisidir.
      const bulunan = a.alias
        .filter((x) => desenle(x).test(k.govde) && serbestGecisVarMi(x, k.govde))
        .sort((x, y) => y.length - x.length)[0];
      if (!bulunan) continue;
      (konuArac[k.yol] ||= []).push({ slug: a.slug, name: a.name, eslesen: bulunan });
      (aracKonu[a.slug] ||= []).push({ yol: k.yol, baslik: k.baslik, eslesen: bulunan });
    }
  }
  // Ayırt ediciliğe göre sırala (uzun eşleşme önce), sonra kırp.
  for (const l of Object.values(konuArac)) l.sort((x, y) => y.eslesen.length - x.eslesen.length);
  for (const l of Object.values(aracKonu)) l.sort((x, y) => y.eslesen.length - x.eslesen.length);
  for (const k of Object.keys(konuArac)) konuArac[k] = konuArac[k].slice(0, KONU_BASINA);

  /**
   * ARAÇ TARAFINDA KIRPMA BRANŞLARA YAYILIR — düz `slice` ÖLÇÜLDÜ ve
   * kusurluydu. `egfr` 28 konuda geçiyor ve altı branşa yayılmış
   * (nefroloji 10 · endokrinoloji 8 · kardiyoloji 5 · journal-club 2 ·
   * onkoloji 2 · klinik-nutrisyon 1). Eşleşen takma ad hepsinde aynı
   * ("eGFR") olduğu için sıralama eşitti ve eşitliği alfabetik yol sırası
   * bozuyordu: sayfada gösterilen 8 konunun HEPSİ endokrinolojiydi, en
   * ilgili branş olan nefroloji hiç görünmüyordu.
   *
   * Çare: branşlar arasında sırayla (round-robin) seç. Deterministik —
   * `--kontrol` kararlı kalsın diye rastgelelik YOK. Branş sırası önce
   * konu sayısına, eşitlikte ada göre.
   *
   * Aynı sınıf `ilgili-index`te de yaşandı ve orada kararlı bir kaydırmayla
   * çözülmüştü; burada eksen branş.
   */
  for (const k of Object.keys(aracKonu)) {
    const kovalar = new Map();
    for (const x of aracKonu[k]) {
      const brans = x.yol.split("/")[0];
      (kovalar.get(brans) ?? kovalar.set(brans, []).get(brans)).push(x);
    }
    const sira = [...kovalar.entries()].sort(
      (a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], "tr")
    );
    const secilen = [];
    for (let i = 0; secilen.length < ARAC_BASINA; i++) {
      let eklendi = false;
      for (const [, liste] of sira) {
        if (i >= liste.length) continue;
        secilen.push(liste[i]);
        eklendi = true;
        if (secilen.length === ARAC_BASINA) break;
      }
      if (!eklendi) break; // bütün kovalar tükendi
    }
    aracKonu[k] = secilen;
  }

  return {
    uretilme: "scripts/arac-konu-index.cjs",
    konuArac,
    aracKonu,
    olcum: {
      konu: konular.length,
      arac: adlar.length,
      araciOlanKonu: Object.keys(konuArac).length,
      konusuOlanArac: Object.keys(aracKonu).length,
      bag: Object.values(konuArac).reduce((a, x) => a + x.length, 0),
    },
  };
}

const yeni = uret();
const metin = JSON.stringify(yeni, null, 2) + "\n";

if (KONTROL) {
  let eski = null;
  try { eski = fs.readFileSync(CIKTI, "utf8"); } catch {}
  if (eski === metin) {
    console.log(`arac-konu indeksi güncel — ${yeni.olcum.bag} bağ, ${yeni.olcum.araciOlanKonu} konu, ${yeni.olcum.konusuOlanArac} araç`);
    process.exit(0);
  }
  if (eski === null) {
    console.error("arac-konu.json YOK. `node scripts/arac-konu-index.cjs` çalıştır.");
    process.exit(1);
  }
  const e = JSON.parse(eski);
  const fark = (a, b, ad) => {
    const A = new Set(Object.keys(a || {})), B = new Set(Object.keys(b || {}));
    const eksik = [...B].filter((x) => !A.has(x)), fazla = [...A].filter((x) => !B.has(x));
    if (eksik.length) console.error(`  ${ad} EKSİK (${eksik.length}): ${eksik.slice(0, 8).join(", ")}`);
    if (fazla.length) console.error(`  ${ad} FAZLA (${fazla.length}): ${fazla.slice(0, 8).join(", ")}`);
  };
  console.error("arac-konu indeksi BAYAT:");
  fark(e.konuArac, yeni.konuArac, "konu");
  fark(e.aracKonu, yeni.aracKonu, "araç");
  console.error(`  bağ: ${e.olcum && e.olcum.bag} → ${yeni.olcum.bag}`);
  console.error("Çare: node scripts/arac-konu-index.cjs");
  process.exit(1);
}

fs.writeFileSync(CIKTI, metin, "utf8");
const o = yeni.olcum;
console.log(`arac-konu.json yazıldı — konu ${o.konu} · araç ${o.arac}`);
console.log(`  aracı olan konu: ${o.araciOlanKonu}  ·  konusu olan araç: ${o.konusuOlanArac}  ·  bağ: ${o.bag}`);
