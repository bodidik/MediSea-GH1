/**
 * İÇERİK HTML'İNİ KENDİ KABINDA TUTMAK
 *
 * Konu içerikleri kendi HTML'ini taşıyor ve bu HTML kapatılmamış etiketlerle
 * dolu — özellikle `<strong class="…">`. Elle yazıldığı için doğal; tarayıcı
 * da kapatılmamış etiketi affeder. Affetme biçimi sorun çıkarıyor.
 *
 * Kapatılmamış `<strong>` HTML ayrıştırıcısının "etkin biçimlendirme ögeleri"
 * listesinde kalır. Kabı kapandığında yığından düşer ama LİSTEDEN düşmez;
 * ayrıştırıcı sonraki her metin düğümünden önce listeyi yeniden kurar, yani
 * o `<strong>`u SINIFIYLA BİRLİKTE tekrar tekrar üretir. Sınıf bir renk
 * taşıyorsa renk de belgenin geri kalanına yayılır.
 *
 * Ölçüldü — /topics/endokrinoloji/ektopik-acth-sendromu:
 * içerikte 2 tane `text-amber-300` var, ikisi de `bg-slate-800` kartın
 * içinde (yani doğru kullanım). Tarayıcının ürettiği belgede aynı sınıf
 * 47 ögeye çıkıyor; 36'sı okuma kabının tamamen DIŞINDA — ilgili konular
 * bloğunda, tanıtım şeridinde, alt bilgide. Aynı sayfada `text-emerald-300`
 * ve `text-sky-300` de kaçıyor: kap dışına toplam 112 öge.
 *
 * Görünen sonuç: beyaz kartın üstünde açık sarı yazı, kontrast 1.44
 * (eşik 4.5) — pratikte okunmuyor.
 *
 * NEDEN CSS İLE ÇÖZÜLMEDİ: kaçan sınıf `[data-readable]` kabının dışına da
 * çıkıyor, yani okuma alanına kapsanan bir kural yetişemiyor. Genel bir
 * kural ise alt bilgideki koyu zeminli `text-amber-400`ü de bozardı — ve
 * "koyu ata varsa muaf tut" tahmini bu projede iki kez geri tepti
 * (gerekçesi `globals.css` içinde yazılı). Üstelik kusur amber'a özgü
 * değil: renk hangisi olursa olsun aynı mekanizma sızdırıyor.
 *
 * HİDRASYON NEDEN GİZLİYOR: React istemcide bu kabı kendi ağacıyla yeniden
 * kuruyor ve sızıntıyı siliyor. Yani kusur ilk boyamadan hidrasyon bitene
 * kadar duruyor — yavaş telefonda saniyeler — ve betik çalışmayan her
 * tüketicide (tarayıcı okuma kipleri, metne bakan araçlar) kalıcı.
 * Ölçerken bunu unutma: hidrasyon sonrası bakan bir tarama "temiz" der.
 */

/** İçerik almayan etiketler; yığına hiç girmezler. */
const BOS_ETIKET = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);

/** İçi ham metin sayılan etiketler; içindeki `<` etiket değildir. */
const HAM_ETIKET = new Set(["script", "style", "textarea", "title"]);

/**
 * `</p>` yazılmaz. HTML kuralı gereği açık bir `p` yokken gelen `</p>`
 * BOŞ BİR `<p>` ÜRETİR — kapatmaya çalışırken sayfaya boşluk ekleriz.
 * Zaten gereksiz: `p`, atası kapanınca örtük olarak kapanıyor ve
 * biçimlendirme ögeleri gibi sonraya sızmıyor.
 */
const KAPATMA_YAZILMAZ = new Set(["p"]);

/**
 * Açılışı, kendinden öncekini örtük olarak kapatan etiketler.
 *
 * Bunlar olmadan da sonuç DOĞRU olurdu — karşılığı olmayan kapanış etiketi
 * yok sayılıyor — ama yığın gerçekte açık olmayan ögeleri biriktirir ve
 * kuyruk gereksiz uzar (`<li>a<li>b` için iki `</li>`). Ölçmesi zor bir
 * kusur değil, yalnızca çıktı gürültüsü; yığını gerçeğe yakın tutmak
 * hata ayıklamayı da kolaylaştırıyor.
 *
 * `p` bilerek listede yok: `p` yığında kalsa bile kuyruğa yazılmıyor ve
 * üstündeki ögelerin kapanma sırasını bozmuyor.
 */
const ORTUK_KAPATIR: Record<string, Set<string>> = {
  li: new Set(["li"]),
  dt: new Set(["dt", "dd"]),
  dd: new Set(["dt", "dd"]),
  tr: new Set(["td", "th", "tr"]),
  td: new Set(["td", "th"]),
  th: new Set(["td", "th"]),
  thead: new Set(["td", "th", "tr"]),
  tbody: new Set(["td", "th", "tr"]),
  tfoot: new Set(["td", "th", "tr"]),
  option: new Set(["option"]),
};

/**
 * Sızdıran öge sınıfı: HTML'in "etkin biçimlendirme ögeleri". Yalnızca
 * bunlar kap kapandıktan sonra yeniden üretilir; `div`/`span`/`ul` üretilmez.
 *
 * `a` bilerek DIŞARIDA: HTML5'te bağlantı blok içeriği sarabiliyor
 * (`<a><div>…</div></a>` geçerli ve bilinçli bir kalıp). Erken kapatsaydık
 * kasıtlı blok bağlantıları bölerdik. Parçanın sonunda yine de kapatılıyor.
 */
const BICIMLENDIRME = new Set([
  "b", "big", "code", "em", "font", "i", "nobr", "s", "small", "strike", "strong", "tt", "u",
]);

/**
 * Açık bir biçimlendirme ögesinin bitmiş sayıldığı yer: bir sonraki blok.
 *
 * Kapatmayı parçanın SONUNA yazmak sızıntıyı durduruyor ama görünümü
 * değiştiriyor — ölçüldü: `</strong>` sona konunca ayrıştırıcı "yanlış
 * yuvalanmış biçimlendirme" onarımını çalıştırıyor ve `<strong>`u sonraki
 * paragrafların İÇİNDE yeniden kuruyor. Ektopik ACTH sayfasında iki gövde
 * paragrafı böylece slate-200 yerine kalın amber basıldı; okunuyordu ama
 * içerik bunu istememişti.
 *
 * Doğrusu, kapanışı ait olduğu yere yazmak: `<strong>Başlık<p>Gövde` →
 * `<strong>Başlık</strong><p>Gövde`. Sonuç, kullanıcının bugün hidrasyondan
 * SONRA gördüğü görünümün aynısı — üstelik sızıntı olmadan.
 */
const BLOK = new Set([
  "address", "article", "aside", "blockquote", "details", "div", "dl", "fieldset",
  "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6",
  "header", "hgroup", "hr", "li", "main", "nav", "ol", "p", "pre", "section",
  "table", "tbody", "td", "tfoot", "th", "thead", "tr", "ul",
]);

const ETIKET =
  /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<![^>]*>|<\/([a-zA-Z][^\s/>]*)[^>]*>|<([a-zA-Z][^\s/>]*)((?:"[^"]*"|'[^']*'|[^>"'])*)>/g;

/**
 * Açık kalan etiketleri kapatır: biçimlendirme ögelerini bir sonraki bloğun
 * önünde, kalanları parçanın sonunda.
 *
 * Amaç iyi biçimli HTML üretmek DEĞİL — sızıntıyı kabın içinde tutmak ve
 * bunu yaparken görünümü OLDUĞU GİBİ bırakmak. Tarayıcının örtük kapattığı
 * bir etiket için fazladan kapanış yazmış olsak bile zararsız: karşılığı
 * olmayan kapanış etiketi yok sayılır (tek istisna `</p>`, o da eleniyor).
 */
export function htmlKapat(html: string): string {
  if (!html || !html.includes("<")) return html;

  const yigin: string[] = [];
  const parca: string[] = [];
  let yazilan = 0;   // html'in kaçıncı karakterine kadar çıktıya alındı
  ETIKET.lastIndex = 0;
  let esl: RegExpExecArray | null;

  while ((esl = ETIKET.exec(html))) {
    const kapanis = esl[1];
    const acilis = esl[2];

    if (kapanis) {
      const ad = kapanis.toLowerCase();
      // En içteki eşleşmeye kadar aç; eşleşme yoksa yok say.
      for (let i = yigin.length - 1; i >= 0; i--) {
        if (yigin[i] === ad) { yigin.length = i; break; }
      }
      continue;
    }
    if (!acilis) continue; // yorum / doctype

    const ad = acilis.toLowerCase();
    if (BOS_ETIKET.has(ad)) continue;
    if ((esl[3] ?? "").trimEnd().endsWith("/")) continue; // <foo />

    if (HAM_ETIKET.has(ad)) {
      const kapa = new RegExp(`</${ad}\\s*>`, "i");
      const kalan = html.slice(ETIKET.lastIndex);
      const yer = kalan.search(kapa);
      ETIKET.lastIndex = yer === -1
        ? html.length
        : ETIKET.lastIndex + yer + kalan.match(kapa)![0].length;
      continue;
    }

    // Blok başlıyorsa, üstte açık kalan biçimlendirme ögelerini burada kapat.
    if (BLOK.has(ad) && BICIMLENDIRME.has(yigin[yigin.length - 1])) {
      let ek = "";
      while (yigin.length && BICIMLENDIRME.has(yigin[yigin.length - 1])) {
        ek += `</${yigin.pop()}>`;
      }
      parca.push(html.slice(yazilan, esl.index), ek);
      yazilan = esl.index;
    }

    const ortuk = ORTUK_KAPATIR[ad];
    if (ortuk) {
      while (yigin.length && ortuk.has(yigin[yigin.length - 1])) yigin.pop();
    }

    yigin.push(ad);
  }

  let kuyruk = "";
  for (let i = yigin.length - 1; i >= 0; i--) {
    if (!KAPATMA_YAZILMAZ.has(yigin[i])) kuyruk += `</${yigin[i]}>`;
  }

  if (!parca.length && !kuyruk) return html;
  parca.push(html.slice(yazilan), kuyruk);
  return parca.join("");
}
