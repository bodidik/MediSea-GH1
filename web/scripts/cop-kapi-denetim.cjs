#!/usr/bin/env node
/**
 * web/scripts/cop-kapi-denetim.cjs
 *
 * "BOŞ MU" DENETİMİNİ TEK GEÇERLİLİK KAPISI SAYAN araçları arar.
 *
 * KUSUR ŞEKLİ (dört araçta ölçüldü, hepsi düzeltildi):
 *
 *   const gecerli = ham.trim() !== "" && sayi >= 0 && sayi <= 100;
 *
 * `parseLocaleNumber("abc")` 0 döndürüyor. "abc" BOŞ DEĞİL, yani ilk koşul
 * geçiyor; alt sınır 0'a izin verdiği için ikinci koşul da geçiyor. Sonuç:
 * kapı, elemek için konduğu şeyi geçiriyor ve araç ÇÖP GİRDİDEN klinik
 * etiket basıyor.
 *
 * Tarayıcıda ölçülen bedeller:
 *
 *   sofa        idrar "abc"        -> RENAL +3 · toplam 3   (hasta ANÜRİK)
 *   das28       hassas eklem "abc" -> 2.38 · "Remisyon"
 *   spot-urine  idrar üresi "abc"  -> osmolal açık 210 · "artmış NH₄⁺"
 *                                     doğrusu 67 · "yetersiz" — YORUM TERSİ
 *   anc         AYNA HÂLİ: kapı `yuzdeToplam > 0` diyerek çöpü eliyordu
 *               ama MEŞRU AGRANÜLOSİTOZU da eliyordu
 *
 * ÇARE: `sayiGirildiMi` — üç durumu birden ayırır.
 *   ""     -> false  girilmemiş
 *   "abc"  -> false  sayı değil
 *   "0"    -> true   girilmiş ve sıfır   ← korunması gereken durum
 *
 * ─────────────────────────────────────────────────────────────────────
 * ÖLÇÜT ADAY ÜRETİR, KARAR VERMEZ. Şüphe yalnızca ALT SINIRI 0'A İZİN
 * VEREN kapılarda: alt sınır `>= 1` ya da `> 0` ise çöpün ürettiği 0 zaten
 * aralıktan düşüyor ve kapı doğru çalışıyor. İlk taramada 21 dosya "boş mu"
 * denetimi taşıyordu; gerçek aday 5'ti.
 *
 * KARARA BAĞLANMIŞ ADAYLAR — yeniden kovalanmasın:
 *   sofa · das28 · spot-urine   KUSURLUYDU  -> sayiGirildiMi (düzeltildi)
 *   anc                          KUSURLUYDU  -> sayiGirildiMi (ayna hâli)
 *   fosfat-replasman             TEMİZ — sınırlar 20 ve > 0
 *   unit-converter               TEMİZ — 21 analitin hepsinde alt sınır ≥ 0.1
 *   abg                          TEMİZ — ayrı SINIRLAR makullük kapısı var
 *
 * Son ikisi KAYNAKTAN değil TARAYICIDA sürülerek kapatıldı: sınırları çeken
 * regex "0.1"in başındaki sıfırı yakalayıp sahte aday üretmişti. Kaynak
 * ayrıştırmak yerine davranışa bakmak hem ucuz hem kesin.
 *
 * CI KAPISI DEĞİL, RAPOR: bir alanın 0 alıp alamayacağı klinik bir karar.
 *
 * ─────────────────────────────────────────────────────────────────────
 * TARİHSEL KONTROL GEÇTİ — ve KAPSAM SINIRINI da gösterdi.
 *
 * Düzeltme öncesi sürümler (3896b6d) taranınca ÜÇ gerçek kusur yakalanıyor:
 * das28:40 · sofa:55 · spot-urine:195. Yani ölçüt sentetik değil, gerçek
 * kusurun şeklini tanıyor.
 *
 * `anc` YAKALANMIYOR ve bu bir eksik DEĞİL, tanım: onun kusuru bu sınıfın
 * AYNA hâliydi — kapı `yuzdeToplam > 0` diyerek çöpü doğru eliyor ama MEŞRU
 * SIFIRI (agranülositoz) da eliyordu. Bu denetim "çöp geçiyor" yönünü arar;
 * "meşru sıfır engelleniyor" yönü kaynaktan ayırt edilemez, çünkü hangi
 * alanda 0'ın fizyolojik olduğu klinik bilgi. O yön ancak aracı sürerek
 * bulunur — alana "0" yazıp sonuç basılıyor mu diye bakarak.
 *
 * Kullanım:
 *   node scripts/cop-kapi-denetim.cjs
 *   node scripts/cop-kapi-denetim.cjs --kok <dizin>
 *   node scripts/cop-kapi-denetim.cjs --negatif   (kendi kendini sınar)
 */

const fs = require("fs");
const os = require("os");
const path = require("path");

/* ── Yorumları BOŞLUKLA doldur, SİLME ────────────────────────────────
   Bu depoda yorumlar geçmiş kusurları BİREBİR alıntılıyor; elenmezse
   denetim kendi belgesini kusur sanıyor (üç kez yaşandı, bkz. CLAUDE.md).
   Satır numaraları korunsun diye silinmiyor, boşlukla dolduruluyor. */
function yorumBosalt(kaynak) {
  let cikti = "";
  let blok = false;
  for (const satir of kaynak.split("\n")) {
    let y = "";
    for (let i = 0; i < satir.length; i++) {
      if (blok) {
        if (satir[i] === "*" && satir[i + 1] === "/") { blok = false; y += "  "; i++; }
        else y += " ";
      } else if (satir[i] === "/" && satir[i + 1] === "*") { blok = true; y += "  "; i++; }
      else if (satir[i] === "/" && satir[i + 1] === "/") { y += " ".repeat(satir.length - i); break; }
      else y += satir[i];
    }
    cikti += y + "\n";
  }
  return cikti;
}

function tsxDosyalari(dizin) {
  const out = [];
  if (!fs.existsSync(dizin)) return out;
  for (const e of fs.readdirSync(dizin, { withFileTypes: true })) {
    /* Alt çizgili klasörler rotaya alınmıyor — kullanıcıya ulaşmıyorlar. */
    if (e.isDirectory()) { if (!e.name.startsWith("_")) out.push(...tsxDosyalari(path.join(dizin, e.name))); }
    else if (e.name.endsWith(".tsx")) out.push(path.join(dizin, e.name));
  }
  return out;
}

/* Kapının bulunduğu ifadeyi topla: "boş mu" satırından başlayıp
   noktalı virgüle kadar (çok satırlı kapılar bu depoda olağan). */
function ifadeTopla(satirlar, bas) {
  let s = "";
  for (let i = bas; i < Math.min(satirlar.length, bas + 8); i++) {
    s += " " + satirlar[i];
    if (satirlar[i].includes(";")) break;
  }
  return s;
}

/**
 * Alt sınır 0'ı KAPSIYOR mu?
 *
 * Aday üreten koşul bu. `>= 0` ve `> -N` çöpün ürettiği 0'ı geçirir;
 * `>= 1`, `> 0`, `>= 0.1` geçirmez.
 * Hiç sayısal alt sınır yoksa da aday sayılır (kapı yalnızca boşluğa bakıyor).
 */
function sifiriKapsiyorMu(ifade) {
  const altSinirlar = [...ifade.matchAll(/(>=?)\s*(-?\d+(?:\.\d+)?)/g)]
    .map((m) => ({ op: m[1], v: parseFloat(m[2]) }));
  if (altSinirlar.length === 0) return true;            // sınır yok -> 0 geçer
  /* Sınırlardan HERHANGİ BİRİ 0'ı dışlıyorsa kapı çöpü eliyor demektir. */
  const eleyen = altSinirlar.some((s) => (s.op === ">" ? 0 <= s.v : 0 < s.v));
  return !eleyen;
}

function tara(kok) {
  const dosyalar = tsxDosyalari(kok).filter((f) => !f.split(path.sep).includes("lib"));
  let olculenDosya = 0;
  let toplamKapi = 0;
  const adaylar = [];

  for (const dosya of dosyalar) {
    const ham = fs.readFileSync(dosya, "utf8");
    if (!ham.includes("parseLocaleNumber")) continue;
    olculenDosya++;

    const kaynak = yorumBosalt(ham);
    const satirlar = kaynak.split("\n");
    const korumali = /sayiGirildiMi\s*\(/.test(kaynak);
    const bulgular = [];

    satirlar.forEach((satir, i) => {
      if (!/\.trim\(\)\s*(===|!==)\s*""/.test(satir)) return;
      toplamKapi++;
      if (korumali) return;
      const ifade = ifadeTopla(satirlar, i);
      if (!sifiriKapsiyorMu(ifade)) return;              // alt sınır çöpü eliyor
      bulgular.push({ satir: i + 1, metin: satir.trim().slice(0, 96) });
    });

    if (bulgular.length) {
      /* Yol KÖKE GÖRE gösterilir; --kok ile başka bir ağaca yönlendirildiğinde
         mutlak geçici dizin yolu basmak raporu okunmaz yapıyordu. */
      const goreli = path.relative(kok, dosya).replace(/\\/g, "/");
      adaylar.push({
        dosya: goreli.replace(/^tools\//, "").replace(/\/page\.tsx$/, ""),
        bulgular,
      });
    }
  }

  return { olculenDosya, toplamKapi, adaylar, taranan: dosyalar.length };
}

/* ── Kendi kendini sınama ────────────────────────────────────────────
   NEGATİF: kusurlu tohum YAKALANMALI.
   POZİTİF: temiz tohum YAKALANMAMALI (ölçüt fazla geniş olmasın).
   Tohum `app/` altına YAZILMAZ — çalışan next dev sunucusunu öldürüyor
   (CLAUDE.md'de kayıtlı; bir turu bütünüyle harcamıştı). */
const KUSURLU_TOHUM = `"use client";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";
export default function KusurluArac() {
  const [ham, setHam] = React.useState("");
  const sayi = parseLocaleNumber(ham);
  const gecerli = ham.trim() !== "" && sayi >= 0 && sayi <= 100;
  const cokSatirli =
    ham.trim() !== "" &&
    sayi >= 0 &&
    sayi <= 28;
  return <div>{gecerli && cokSatirli ? sayi : "-"}</div>;
}
`;

const TEMIZ_TOHUM = `"use client";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";
export default function TemizArac() {
  const [a, setA] = React.useState("");
  const [b, setB] = React.useState("");
  const an = parseLocaleNumber(a);
  const bn = parseLocaleNumber(b);
  /* KORUNAN 1: alt sınır 0'ı dışlıyor, çöpün ürettiği 0 zaten düşüyor. */
  const kiloMakul = a.trim() !== "" && an >= 1 && an <= 400;
  /* KORUNAN 2: kapı sayiGirildiMi kullanıyor, meşru sıfır da korunuyor. */
  const yuzdeMakul = sayiGirildiMi(b) && bn >= 0 && bn <= 100;
  return <div>{kiloMakul && yuzdeMakul ? an : "-"}</div>;
}
`;

/* Bu yorum satırı ölçütün aradığı şekli TAŞIYOR: ham.trim() !== "" && n >= 0
   Denetim yorum körü DEĞİLSE bunu görmemeli — meta kontrol. */

function negatifKontrol() {
  const kok = fs.mkdtempSync(path.join(os.tmpdir(), "cop-kapi-"));
  try {
    fs.mkdirSync(path.join(kok, "kusurlu"), { recursive: true });
    fs.mkdirSync(path.join(kok, "temiz"), { recursive: true });
    fs.writeFileSync(path.join(kok, "kusurlu", "page.tsx"), KUSURLU_TOHUM);
    fs.writeFileSync(path.join(kok, "temiz", "page.tsx"), TEMIZ_TOHUM);

    const r = tara(kok);
    const kusurluAday = r.adaylar.filter((a) => a.dosya.includes("kusurlu"));
    const temizAday = r.adaylar.filter((a) => a.dosya.includes("temiz"));

    console.log("KENDİ KENDİNİ SINAMA");
    console.log("  taranan dosya            : " + r.taranan + "  (ölçülen " + r.olculenDosya + ")");
    console.log("  NEGATİF — kusurlu tohum  : " + (kusurluAday.length ? "YAKALANDI (" + kusurluAday[0].bulgular.length + " kapı)" : "KAÇTI"));
    console.log("  POZİTİF — temiz tohum    : " + (temizAday.length ? "YANLIŞ POZİTİF (" + temizAday[0].bulgular.length + ")" : "temiz"));

    /* Ölçülen sayı da raporlanır: "0 kusur" ile "0 ölçüm" aynı görünür. */
    if (r.olculenDosya === 0) {
      console.log("\n  SINANAMADI — tohum hiç ölçülmedi (parseLocaleNumber bulunamadı)");
      return 1;
    }
    const gecti = kusurluAday.length > 0 && temizAday.length === 0;
    console.log("\n  SONUÇ: " + (gecti ? "GEÇTİ" : "DÜŞTÜ"));
    return gecti ? 0 : 1;
  } finally {
    fs.rmSync(kok, { recursive: true, force: true });
  }
}

/* ── Giriş ───────────────────────────────────────────────────────── */
const argv = process.argv.slice(2);
if (argv.includes("--negatif")) {
  process.exit(negatifKontrol());
}

const kokIdx = argv.indexOf("--kok");
const KOK = kokIdx >= 0 ? argv[kokIdx + 1] : path.join(__dirname, "..", "app");

const r = tara(KOK);

console.log("ÇÖP KAPI DENETİMİ");
console.log("  taranan tsx              : " + r.taranan);
console.log("  parseLocaleNumber kullanan: " + r.olculenDosya);
console.log('  "boş mu" kapısı           : ' + r.toplamKapi);
console.log("  ADAY (alt sınır 0'ı kapsıyor, sayiGirildiMi YOK): " + r.adaylar.length);
console.log("");

if (r.adaylar.length === 0) {
  console.log("  aday yok.");
  if (r.olculenDosya === 0) console.log("  UYARI: hiç dosya ÖLÇÜLMEDİ — kapsam yanlış olabilir.");
} else {
  for (const a of r.adaylar) {
    console.log("  " + a.dosya);
    a.bulgular.forEach((b) => console.log("      " + b.satir + ": " + b.metin));
  }
  console.log("");
  console.log("  Bunlar ADAY. Alanın 0 alıp alamayacağı klinik bir karar:");
  console.log("  0 meşruysa kapı `sayiGirildiMi` olmalı, değilse alt sınır > 0 olmalı.");
}

/* CI kapısı DEĞİL — çıkış kodu her zaman 0. */
process.exit(0);
