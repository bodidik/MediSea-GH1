/**
 * KAVŞAK TERİMLERİ — konu metninde geçen bir hastalık adını o hastalığın
 * konu sayfasına bağlar ("SIADH" → /topics/endokrinoloji/siadh-sendromu).
 *
 * Kısaltma açılımıyla (app/lib/kisaltma.ts) aynı karar: içerik dosyasına
 * DOKUNULMAZ, dönüşüm render anında yapılır; sözlük elle seçilir
 * (`content/kavsak-terim.json`). Kullanıcı kararı (5 Eki 2026): otomatik
 * başlık taraması değil elle sözlük — "MEN", "AF", "gut" gibi kısa/çok
 * anlamlı terimler otomatikte yanlış bağ üretirdi.
 *
 * Kurallar:
 *  - Sayfa başına her HEDEF yalnızca İLK geçişte bağlanır (kullanıcı kararı).
 *  - Sayfanın kendisine bağ verilmez.
 *  - Hedef görünür bir konu değilse (gizli, silinmiş, yeniden adlandırılmış)
 *    bağ KURULMAZ — `baslik-index.json` yalnız görünür konuları taşır.
 *    Bayat sözlük kaydını `link-denetim` CI'da düşürür.
 *  - `<a>`, başlık, `<pre>` (ASCII şema), `<code>`, `<button>`, `<summary>`
 *    içine girilmez.
 *  - Bağ yalnız etiket EKLER, metni değiştirmez — vurgu ofsetleri
 *    (textContent tabanlı) kaymaz.
 *
 * Eşleşme:
 *  - Küçük harf taşımayan terim (SIADH, AML, MEN1) BÜYÜK/küçük harfe duyarlı,
 *    ek almaz; sonrası harf olamaz ("SIADH'de" eşleşir, "AMLx" eşleşmez).
 *  - Küçük harf taşıyan terim Türkçe küçük harfe indirgenmiş metinde aranır
 *    ve ek alabilir ("osteoporozda", "sarkoidozlu"). Sözlükte kök yazılır;
 *    -k ile biten kök ğ'yi de kabul eder ("adrenal yetmezlik" →
 *    "adrenal yetmezliği", "Addison hastalık" → "Addison hastalığında").
 *    Bağ eki de kapsar (bütün sözcük).
 */
import sozlukVeri from "@/content/kavsak-terim.json";
import baslikIndex from "@/content/baslik-index.json";

const SOZLUK = sozlukVeri as Record<string, string>;
const GORUNUR = baslikIndex as Record<string, string>;

/** Türkçe harfler dahil "kelime karakteri" — JS'in \b sınırı ASCII'ye göre çalışır. */
const HARF = "A-Za-zÇĞİıÖŞÜçğöşü0-9";
const KUCUK_EK = "[a-zçğıöşü]*";

function kacir(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

type Terim = { anahtar: string; hedef: string };

const KISALTMA: Terim[] = [];
const SOZCUK: Terim[] = [];
for (const [anahtar, hedef] of Object.entries(SOZLUK)) {
  if (!GORUNUR[hedef]) continue; // görünür olmayan hedefe bağ yok
  (/[a-zçğıöşü]/.test(anahtar) ? SOZCUK : KISALTMA).push({ anahtar, hedef });
}

// Uzun önce: "santral adrenal yetmezlik" "adrenal yetmezlik"ten önce denenmeli.
const uzunOnce = (a: Terim, b: Terim) => b.anahtar.length - a.anahtar.length;
KISALTMA.sort(uzunOnce);
SOZCUK.sort(uzunOnce);

const KISALTMA_DESEN = KISALTMA.length
  ? new RegExp(`(?<![${HARF}])(?:${KISALTMA.map((t) => `(${kacir(t.anahtar)})`).join("|")})(?![${HARF}])`, "g")
  : null;

function sozcukKalibi(anahtar: string): string {
  const k = anahtar.toLocaleLowerCase("tr");
  const kok = k.endsWith("k") ? `${kacir(k.slice(0, -1))}[kğ]` : kacir(k);
  return `(${kok}${KUCUK_EK})`;
}
const SOZCUK_DESEN = SOZCUK.length
  ? new RegExp(`(?<![${HARF}])(?:${SOZCUK.map((t) => sozcukKalibi(t.anahtar)).join("|")})(?![${HARF}])`, "g")
  : null;

/** İçine bağ konmayacak etiketler. */
const ATLA = /^(a|h[1-6]|pre|code|button|summary)$/i;

type Eslesme = { bas: number; son: number; hedef: string };

function eslesmeler(metin: string): Eslesme[] {
  const sonuc: Eslesme[] = [];
  if (KISALTMA_DESEN) {
    for (const m of metin.matchAll(KISALTMA_DESEN)) {
      const i = m.slice(1).findIndex((g) => g !== undefined);
      sonuc.push({ bas: m.index!, son: m.index! + m[0].length, hedef: KISALTMA[i].hedef });
    }
  }
  if (SOZCUK_DESEN) {
    const kucuk = metin.toLocaleLowerCase("tr");
    // Türkçe küçültme uzunluğu korur (İ→i, I→ı); korumazsa ofsetler kayar — atla.
    if (kucuk.length === metin.length) {
      for (const m of kucuk.matchAll(SOZCUK_DESEN)) {
        const i = m.slice(1).findIndex((g) => g !== undefined);
        sonuc.push({ bas: m.index!, son: m.index! + m[0].length, hedef: SOZCUK[i].hedef });
      }
    }
  }
  // Çakışmada önce başlayan, eşitse uzun olan kazanır.
  sonuc.sort((a, b) => a.bas - b.bas || b.son - a.son);
  const temiz: Eslesme[] = [];
  let sinir = -1;
  for (const e of sonuc) {
    if (e.bas >= sinir) {
      temiz.push(e);
      sinir = e.son;
    }
  }
  return temiz;
}

/**
 * HTML parçasında kavşak terimlerinin ilk geçişini konu sayfasına bağlar.
 *
 * @param gorulen  sayfa ömrü boyunca taşınan HEDEF kümesi (ilk geçiş kuralı)
 * @param buSayfa  "<branş>/<konu>" — kendine bağ verilmez
 */
export function kavsakBagla(html: string, gorulen: Set<string>, buSayfa: string): string {
  if (!html || (!KISALTMA_DESEN && !SOZCUK_DESEN)) return html;
  gorulen.add(buSayfa);

  const yigin: string[] = [];
  return html
    .split(/(<[^>]*>)/)
    .map((parca) => {
      if (parca.startsWith("<")) {
        const m = parca.match(/^<\s*(\/)?\s*([a-zA-Z0-9]+)/);
        if (m && ATLA.test(m[2])) {
          if (m[1]) {
            const i = yigin.lastIndexOf(m[2].toLowerCase());
            if (i >= 0) yigin.splice(i, 1);
          } else if (!/\/\s*>$/.test(parca)) {
            yigin.push(m[2].toLowerCase());
          }
        }
        return parca;
      }
      if (yigin.length || !parca.trim()) return parca;

      let cikti = "";
      let imlec = 0;
      for (const e of eslesmeler(parca)) {
        if (gorulen.has(e.hedef)) continue;
        gorulen.add(e.hedef);
        cikti +=
          parca.slice(imlec, e.bas) +
          `<a href="/topics/${e.hedef}" class="kavsak-bag">${parca.slice(e.bas, e.son)}</a>`;
        imlec = e.son;
      }
      return imlec ? cikti + parca.slice(imlec) : parca;
    })
    .join("");
}
