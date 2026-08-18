#!/usr/bin/env node
/**
 * Yetim premium içerik denetimi.
 *
 * Kendini onaran okumalar (lib/premium-brans.ts) ters yöndeki sorunu çözüyor:
 * konu dosyası VAR ama branş listesinde adı geçmiyorsa yine de gösteriliyor.
 * Bu denetim öbür yönü kontrol ediyor: quiz / kart / vaka dosyası VAR ama
 * ait olduğu KONU dosyası yok. Böyle bir dosyaya hiçbir yerden ulaşılamaz —
 * içerik yazılmış, emek harcanmış, kimse göremiyor.
 *
 * Ayrıca sayıları da bozuyor: lib/icerik-sayaci.ts bütün quiz dosyalarını
 * sayıyor, pano ise yalnızca erişilebilir konuları topluyor. Satış sayfasında
 * bir dönem üst yazı "362 soru", panonun kendisi "352" diyordu — aynı
 * sayfada iki yüzey aynı sayıyı farklı söylüyordu. Farkın tamamı tek bir
 * yetim dosyaydı.
 *
 * Kullanım:  node scripts/yetim-denetim.cjs
 * Çıkış kodu 0 — bu bir CI kapısı DEĞİL: yetim dosya bir kod hatası değil,
 * içerik kararı (ya konu dosyası yazılacak ya da dosya silinecek) ve içerik
 * kullanıcının sorumluluğunda.
 */

const fs = require("fs");
const path = require("path");

const KOK = path.join(__dirname, "..", "content", "premium", "ydus");

/** `<konu>-quiz-1.json` → `konu`, `<konu>.json` → `konu` */
function konuAdi(dosya) {
  return dosya
    .replace(/\.json$/, "")
    .replace(/-(quiz|vaka|kart|flashcard)-\d+$/, "");
}

function kayitSay(veri) {
  for (const alan of ["sorular", "questions", "cards", "kartlar", "adimlar", "stages", "pearls", "inciler"]) {
    if (Array.isArray(veri?.[alan])) return veri[alan].length;
  }
  return 0;
}

function tur(ad) {
  const yetim = [];
  const saglam = [];
  let dizinler;
  try {
    dizinler = fs
      .readdirSync(path.join(KOK, ad), { withFileTypes: true })
      .filter((d) => d.isDirectory());
  } catch {
    return { yetim, saglam };
  }

  for (const brans of dizinler) {
    const dizin = path.join(KOK, ad, brans.name);
    for (const dosya of fs.readdirSync(dizin).filter((f) => f.endsWith(".json"))) {
      const konu = konuAdi(dosya);
      let adet = 0;
      try {
        adet = kayitSay(JSON.parse(fs.readFileSync(path.join(dizin, dosya), "utf-8")));
      } catch {
        // Bozuk dosyayı soru-denetim.cjs zaten yakalıyor.
      }
      const konuVar = fs.existsSync(path.join(KOK, "topics", brans.name, `${konu}.json`));
      const kayit = { yol: `${brans.name}/${dosya}`, konu: `${brans.name}/${konu}`, adet, brans: brans.name, ad: konu, dosya };
      (konuVar ? saglam : yetim).push(kayit);
    }
  }
  return { yetim, saglam };
}

/* ── AD SAPMASI: konu VAR ama adı tutmuyor ────────────────────────────────
 *
 * "Konu dosyası yok" teşhisi tek başına yanıltıcı çıktı. Ölçüldü: beş
 * yetimin ÜÇÜNDE konu dosyası duruyor, yalnızca adı sapmış:
 *
 *   pearls/hematoloji/aml.json        → topics/hematoloji/aml-ana.json VAR
 *   quizzes/hematoloji/aml-quiz-1.json→ topics/hematoloji/aml-ana.json VAR
 *   flashcards/nefroloji/hiperf-kbh   → topics/nefroloji/kbh-hiperfosfatemi VAR
 *
 * Fark önemli: eksik konu TIBBİ İÇERİK yazmayı gerektiriyor, ad sapması
 * ise dosyayı yeniden adlandırmayı. İkisini "yetim" diye tek torbaya
 * koymak, on dakikalık işi haftalık iş gibi gösteriyordu.
 *
 * Eşleştirme ölçütü BULANIK BENZERLİK DEĞİL. Denendi ve tehlikeli çıktı:
 * difflib benzeri bir ölçü `aml`yi 0.67 ile **`kml`**ye eşledi — akut ve
 * kronik lösemi, bambaşka hastalıklar. Klinik içerikte "birbirine benzeyen
 * ad" bir kanıt değil.
 *
 * Ölçüt yerine bu depodaki gerçek adlandırma kalıbı kullanılıyor: adlar
 * tirelerle parçalanır ve KISA olanın her parçası, uzun olanın bir
 * parçasının BAŞLANGICI olmalı.
 *   aml          ⊂ aml-ana              ✓  (aml = aml)
 *   hiperf-kbh   ⊂ kbh-hiperfosfatemi   ✓  (kbh = kbh, hiperf ⊂ hiperfosfatemi)
 *   aml          ⊄ kml                  ✗  (aml, kml'nin başlangıcı değil)
 */
function parcala(ad) {
  return ad.split("-").filter((x) => x.length >= 2);
}

/** Kısa adın her parçası, uzun adın bir parçasının başlangıcı mı? */
function adSapmasi(konu, aday) {
  if (konu === aday) return false;
  const [a, b] = parcala(konu).length <= parcala(aday).length
    ? [parcala(konu), parcala(aday)]
    : [parcala(aday), parcala(konu)];
  if (!a.length) return false;
  return a.every((x) => b.some((y) => y.startsWith(x) || x.startsWith(y)));
}

function yakinKonu(brans, konu) {
  const dizin = path.join(KOK, "topics", brans);
  let adaylar = [];
  try {
    adaylar = fs.readdirSync(dizin).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
  } catch { return null; }
  return adaylar.find((a) => adSapmasi(konu, a)) ?? null;
}

const TURLER = [
  ["quizzes", "soru"],
  ["flashcards", "kart"],
  ["vakalar", "adım"],
  ["pearls", "inci"],
];

let toplamYetim = 0;
let sapmaSayisi = 0;
const satirlar = [];

for (const [ad, birim] of TURLER) {
  const { yetim, saglam } = tur(ad);
  const sTop = saglam.reduce((a, b) => a + b.adet, 0);
  const yTop = yetim.reduce((a, b) => a + b.adet, 0);
  satirlar.push(
    `${ad.padEnd(11)} erişilebilir: ${String(saglam.length).padStart(3)} dosya / ` +
      `${String(sTop).padStart(4)} ${birim}   ·   yetim: ${yetim.length} dosya / ${yTop} ${birim}`
  );
  for (const y of yetim) {
    toplamYetim++;
    const yakin = yakinKonu(y.brans, y.ad);
    if (!yakin) {
      satirlar.push(`    ${y.yol}  →  konu dosyası YOK: topics/${y.konu}.json  (${y.adet} ${birim})`);
      continue;
    }
    /* Hedef konunun bu TÜRDE dosyası zaten varsa yeniden adlandırma üzerine
     * yazar — o zaman iş "ad düzelt" değil "iki dosyayı birleştir"dir ve
     * hangi kaydın kalacağı bir içerik kararıdır. Ölçüldü: nefroloji kart
     * dosyalarının ikisi de 70 kart taşıyor, ilk 10'u aynı, kalan 60'ı
     * tamamen farklı — yani körlemesine yeniden adlandırma 60 kart siler. */
    const hedefDosya = y.dosya.replace(y.ad, yakin);
    const carpisma = fs.existsSync(path.join(KOK, ad, y.brans, hedefDosya));
    sapmaSayisi++;
    satirlar.push(
      `    ${y.yol}  →  AD SAPMASI: topics/${y.brans}/${yakin}.json VAR  (${y.adet} ${birim})`
    );
    satirlar.push(
      carpisma
        ? `        ⚠ ${hedefDosya} ZATEN VAR — yeniden adlandırma üzerine yazar, birleştirme kararı gerekiyor`
        : `        çare: ${y.dosya} → ${hedefDosya}`
    );
  }
}

console.log(satirlar.join("\n"));

/* ── İKİNCİ SINIF: hiçbir kodun OKUMADIĞI dizin ──────────────────────────
 *
 * Yukarıdaki denetim "dosya var, konusu yok" durumunu buluyor. Bundan daha
 * sessiz bir hâl daha var: dizinin KENDİSİNİ hiçbir kod okumuyor. O zaman
 * dosyaların konusu olsa bile hiçbir yerden ulaşılamazlar.
 *
 * Ölçüldü: `content/premium/ydus/questions/` altında 12 dosya var (11 MEN1
 * sorusu + 1 nefroloji) ve depoda tek bir okuyucu yok. Biçim de farklı —
 * dosya başına TEK soru ve alan adları İngilizce (`question`, `options`,
 * `answer`), oysa `quizzes/` tek dosyada dizi tutuyor ve alanlar Türkçe
 * (`metin`, `secenekler`, `dogru`). Yani şema ayrışması.
 *
 * Liste ELLE tutuluyor çünkü "okunuyor mu" sorusunun cevabı grep'le güvenilir
 * biçimde alınamıyor: `"questions"` kaynakta bir ALAN adı olarak da geçiyor
 * ve dizin okumasıyla karışıyor. Nitekim ilk ölçümde `cases/` de yetim
 * sanıldı; oysa soru çözüm kokpiti onu okuyor (soru-cozum/page.tsx).
 * Yeni bir dizin eklerken burayı da güncelle.
 */
const OKUNAN_DIZINLER = new Set([
  "topics",     // premium konu sayfaları
  "branches",   // branş listeleri
  "quizzes",    // premium-envanter + quiz-coz
  "flashcards", // premium-envanter + hizli-tekrar
  "pearls",     // premium-envanter + inciler
  "vakalar",    // premium-envanter + vaka-coz
  "cases",      // soru-cozum kokpiti
  "videos",
  "kaynaklar",
]);

const okunmayan = [];
for (const e of fs.readdirSync(KOK, { withFileTypes: true })) {
  if (!e.isDirectory() || OKUNAN_DIZINLER.has(e.name)) continue;
  let adet = 0;
  const gez = (p) => {
    for (const x of fs.readdirSync(p, { withFileTypes: true })) {
      const q = path.join(p, x.name);
      if (x.isDirectory()) gez(q);
      else if (x.name.endsWith(".json")) adet++;
    }
  };
  try { gez(path.join(KOK, e.name)); } catch {}
  if (adet) okunmayan.push({ ad: e.name, adet });
}

if (okunmayan.length) {
  console.log("\nHİÇBİR KODUN OKUMADIĞI DİZİN:");
  for (const d of okunmayan) {
    console.log(`    ${d.ad}/  →  ${d.adet} dosya, hiçbir yerden ulaşılamıyor`);
  }
}

/* İki sınıf ayrı ayrı raporlanıyor: çareleri farklı. Yetim dosyaya KONU
 * yazmak yetiyor; okunmayan dizin ise ya bir okuyucu ya da şema dönüşümü
 * istiyor. Tek sayıda toplamak hangi işin gerektiğini gizlerdi. */
const okunmayanDosya = okunmayan.reduce((a, b) => a + b.adet, 0);

if (toplamYetim === 0 && !okunmayan.length) {
  console.log("\nyetim dosya yok — her içerik dosyasının bir konusu var.");
} else {
  const parcalar = [];
  if (toplamYetim) {
    /* Çareleri farklı olduğu için iki sayı AYRI veriliyor. Tek sayıda
     * toplamak, dosya adı düzeltmekle tıbbi konu yazmayı aynı iş gibi
     * gösteriyordu. */
    const eksik = toplamYetim - sapmaSayisi;
    if (sapmaSayisi) {
      parcalar.push(
        `${sapmaSayisi} dosyada AD SAPMASI — konu dosyası var, adı tutmuyor. ` +
          `Çarpışma yoksa yeniden adlandırma yeter; varsa hangi kaydın kalacağı içerik kararı.`
      );
    }
    if (eksik) {
      parcalar.push(
        `${eksik} dosyanın konusu GERÇEKTEN yok — ya konu dosyası yazılmalı ya da dosya kaldırılmalı.`
      );
    }
  }
  if (okunmayan.length) {
    parcalar.push(
      `${okunmayanDosya} dosya okunmayan dizinde — bunlara konu dosyası eklemek YETMEZ, ` +
        `dizini okuyan bir kod ya da şema dönüşümü gerekiyor.`
    );
  }
  console.log("\n" + parcalar.join("\n"));
}
