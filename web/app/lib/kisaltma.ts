/**
 * Kısaltmaları konu sayfasında İLK KULLANIMDA açılımıyla verir.
 *
 * İçerik dosyasına DOKUNULMAZ — dönüşüm render tarafında yapılır. Bu, depodaki
 * `**kalın**` işlemesiyle (app/lib/metin.tsx) aynı karar: içerik dizgesi diskte
 * olduğu gibi kalır, biçimlendirme okuma anında uygulanır.
 *
 * ── Neden sözlük elle seçiliyor ────────────────────────────────────────────
 * Ölçüldü: 456 konuda ham tarama 2298 "kısaltma gibi görünen" dizi buluyor.
 * İçinde ürün adı (YDUS), Roma rakamı (II, III), büyük harfle yazılmış Türkçe
 * kelimeler (VEYA) ve kesilmiş gen adları (TP53'ten TP5) var. Yani her büyük
 * harf dizisini açan otomatik bir mekanizma yanlış açılım basardı.
 *
 * Sözlükte OLMAYAN hiçbir şey açılmaz. Kullanıcının kuralı da bu:
 * "EKG, LDL-c gibi bildiklere gerek yok" — bilinenler listeye hiç girmez.
 *
 * ── Bu liste eksiktir ve öyle olması normaldir ─────────────────────────────
 * Yalnızca açılımı TARTIŞMASIZ olanlar konuldu. Açılımı bağlama göre değişen
 * (CD, PD, CR, OS, AI…), kurum adı olan (KDIGO, ECOG) ya da ilaç/gen adı olan
 * (PCSK9, DDAVP, JAK2) girdiler bilerek DIŞARIDA — yanlış bir açılım
 * kullanıcıya konuyu yanlış öğretir ve bu bir içerik kararıdır.
 *
 * Listeyi genişletmek için buraya satır eklemek yeterli; başka hiçbir yeri
 * değiştirmek gerekmez.
 */
export const KISALTMALAR: Record<string, string> = {
  ACTH: "adrenokortikotropik hormon",
  ARB: "anjiyotensin reseptör blokeri",
  ASCVD: "aterosklerotik kardiyovasküler hastalık",
  AML: "akut miyeloid lösemi",
  BOS: "beyin omurilik sıvısı",
  BT: "bilgisayarlı tomografi",
  DXA: "çift enerjili X-ışını absorpsiyometrisi",
  GFR: "glomerüler filtrasyon hızı",
  GİS: "gastrointestinal sistem",
  HSCT: "hematopoetik kök hücre nakli",
  IVIG: "intravenöz immünoglobulin",
  KBH: "kronik böbrek hastalığı",
  KMY: "kemik mineral yoğunluğu",
  LDH: "laktat dehidrogenaz",
  MACE: "majör advers kardiyak olay",
  MDS: "miyelodisplastik sendrom",
  MRG: "manyetik rezonans görüntüleme",
  NHL: "non-Hodgkin lenfoma",
  NSAİİ: "nonsteroid antiinflamatuar ilaç",
  PTH: "paratiroid hormon",
  RAAS: "renin-anjiyotensin-aldosteron sistemi",
  SDBY: "son dönem böbrek yetmezliği",
  SGLT2: "sodyum-glukoz kotransporter 2",
  SIADH: "uygunsuz ADH sendromu",
  SSS: "santral sinir sistemi",
  TSH: "tiroid stimülan hormon",
  USG: "ultrasonografi",
  YBÜ: "yoğun bakım ünitesi",
};

/**
 * Premium konu gövdesindeki blokları işler (aynı küme, aynı "ilk kullanım" kuralı).
 *
 * Kapsam bilerek DAR — yalnızca düzyazı:
 *  - metin bloklarının satırları
 *  - bilgi kutularının gövdesi
 *
 * DIŞARIDA bırakılanlar ve nedeni:
 *  - **başlıklar**: açık tarafta da bölüm başlıkları işlenmiyor; başlık bir
 *    etikettir, cümle değil.
 *  - **tablolar** (kolon adları ve hücreler): hücreler dar ve bu depoda
 *    tablolar zaten 320px'te kolon başına en az 110px ile ancak sığıyor
 *    (bkz. CLAUDE.md). "KBH" yerine "kronik böbrek hastalığı (KBH)" basmak
 *    hücreyi üç katına çıkarır ve taşma üretir.
 *
 * Quiz ve flashcard içeriği bu yoldan HİÇ geçmez — orası ölçme yüzeyi ve
 * kısaltmayı açmak cevabın parçasını peşinen verir.
 */
export function kisaltmaAcBloklar<T>(bloklar: T[], gorulen: Set<string>): T[] {
  if (!Array.isArray(bloklar)) return bloklar;

  return bloklar.map((b) => {
    const blok = b as Record<string, unknown>;
    if (!blok || typeof blok !== "object") return b;

    if (blok.tip === "metin" && Array.isArray(blok.satirlar)) {
      return {
        ...blok,
        satirlar: blok.satirlar.map((s: Record<string, unknown>) =>
          typeof s?.metin === "string" ? { ...s, metin: kisaltmaAc(s.metin, gorulen) } : s
        ),
      } as T;
    }

    if (blok.tip === "bilgi_kutusu" && typeof blok.metin === "string") {
      return { ...blok, metin: kisaltmaAc(blok.metin, gorulen) } as T;
    }

    return b;
  });
}

/** Türkçe harfler dahil "kelime karakteri" — JS'in \b sınırı ASCII'ye göre çalışır. */
const HARF = "A-Za-zÇĞİıÖŞÜçğöşü0-9";

function kacir(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Uzun anahtar önce denenmeli: "SGLT2" varken "SGLT" eşleşirse açılım yanlış olur.
 * Desen bir kez kurulur, her çağrıda yeniden derlenmez.
 */
const ANAHTARLAR = Object.keys(KISALTMALAR).sort((a, b) => b.length - a.length);
const DESEN = new RegExp(
  `(?<![${HARF}])(${ANAHTARLAR.map(kacir).join("|")})(?![${HARF}])`,
  "g"
);

/**
 * Bir HTML parçasındaki kısaltmaların İLK geçişini açılımıyla değiştirir.
 *
 * `gorulen` çağıran tarafından tutulur ve bölümler arasında taşınır; ilk kullanım
 * SAYFA başına olmalı, bölüm başına değil.
 *
 * Etiketlerin İÇİNE girilmez: içerik `dangerouslySetInnerHTML` ile basıldığı için
 * bir `<a href="...ACTH...">` ya da `<img alt>` içinde yapılan değişiklik biçimi
 * bozar. Metin, `<...>` parçalarına bölünüp yalnızca etiket dışı kısımlar işlenir.
 */
export function kisaltmaAc(html: string, gorulen: Set<string>): string {
  if (!html) return html;

  return html
    .split(/(<[^>]*>)/)
    .map((parca) => {
      if (parca.startsWith("<")) return parca; // etiket — dokunma
      return parca.replace(DESEN, (tam, anahtar: string) => {
        if (gorulen.has(anahtar)) return tam;
        gorulen.add(anahtar);
        const acilim = KISALTMALAR[anahtar];
        // Açılımlar düz Türkçe metin; yine de HTML'e giren bir değer olduğu için
        // etiket açabilecek karakter taşıyan bir girdi olduğu gibi bırakılır.
        if (/[<>&]/.test(acilim)) return tam;
        return `${acilim} (${anahtar})`;
      });
    })
    .join("");
}
