// C:\Users\hucig\Medknowledge\web\app\lib\tablo.ts
//
// İÇERİKTEKİ TABLOLARI KLAVYEYLE KAYDIRILABİLİR YAPAR.
//
// Ölçülen kusur iki katmanlıydı ve ikisi de telefonda görünüyor (375px):
//
//   1) SARMALI tablolar (49 tane) `<div class="overflow-x-auto">` içinde ve
//      kayıyor — ama o div odaklanabilir DEĞİL ve içinde odaklanabilir bir
//      öge de yok. Klavyeyle çalışan kullanıcı orayı hiç kaydıramıyor,
//      yani kırpılan kolonlar erişilemez kalıyor (WCAG 2.1.1).
//
//   2) SARMASIZ tablolar (14 tane) daha ağır: okuma kartı
//      `overflow-x: hidden` ile KIRPIYOR. Ölçüldü — `sarkoidoz-ayirici-tani`
//      sayfasında 547px'lik bir tablo 342px'lik kartın içinde duruyor ve
//      ÜÇ KOLONUN İKİSİ tümden görünmez; belge yatay kaymıyor, kartın
//      kendisi de kaydırılamıyor. Yani içerik HİÇBİR girdi kipiyle
//      ulaşılamıyordu (fare, dokunma, klavye — üçü de).
//
// Çare içerik dosyasına DOKUNMUYOR; dönüşüm render tarafında, tıpkı
// `metin.tsx` (kalın işareti), `kisaltma.ts` (kısaltma açılımı) ve
// `baslik.ts` (başlık düzeyleri) gibi.
//
// NİTELİK EKLEMEK `textContent`i DEĞİŞTİRMEZ — vurgular karakter ofsetiyle
// saklandığı için bu şart, ve sarmalayıcı `<div>` de metin taşımıyor.
// (Aynı gerekçe içindekiler bloğu eklenirken de ölçülmüştü.)
//
// `role="region"` + ad: `tabindex="0"` tek başına kaydırmayı açar ama
// odaklanan kabın adı olmaz; ekran okuyucu adsız bir grup duyurur.
//
// ─────────────────────────────────────────────────────────────────────────
// AD SABİT OLAMAZ — aynı sayfada iki tablo varsa iki AYNI ADLI landmark
// oluşuyordu. ARIA aynı rolü paylaşan landmark'ların ayırt edilebilir ad
// taşımasını ister; iki "Tablo (yatay kaydırılabilir)" bölgesi arasında
// gezinen kullanıcı hangisinde olduğunu bilemiyordu. Ölçüldü (canlı):
// `asit-baz-kompanzasyon-ilkeleri` 3, `sarkoidoz-ayirici-tani` 2 özdeş ad.
//
// Ad kaynağı ÖLÇÜLEREK seçildi (63 tablo, 52 konu):
//
//   | kaynak                              | kapsam | sayfa içi çakışma |
//   |-------------------------------------|--------|-------------------|
//   | tablonun ilk `<th>` metni           | 63/63  | 2 sayfada VAR     |
//   | en yakın önceki başlık (+ bölüm b.) | 63/63  | **0**             |
//
// İlk `<th>` çoğu zaman satır etiketi kolonudur ("Bozukluk", "Belirteç") ve
// aynı sayfada tekrar ediyor; başlık hem benzersiz hem betimleyici
// ("Acil Müdahale Algoritması"). Yine de son çare olarak sıra eki var:
// ad tekrar ederse " (2)" alıyor.

/** CSS ve ölçüm bu nitelikten tutunuyor. */
const NITELIK = "data-tablo-kaydir";
/** Adı çıkarılamayan tablo için — bu depoda ölçüldü: 0 tablo buna düşüyor. */
const GENEL_ETIKET = "Tablo (yatay kaydırılabilir)";
/** Uzun bir başlık ekran okuyucuda gürültü olur. */
const AZAMI_AD = 70;

function nitelikler(etiket: string): string {
  return ` ${NITELIK} tabindex="0" role="region" aria-label="${etiket}"`;
}

/**
 * Başlık HTML'inden ad üretir.
 *
 * Varlıklar ÖNCE çözülüp SONRA yeniden kaçırılıyor: `&amp;` taşıyan bir
 * başlığı olduğu gibi niteliğe koymak `&amp;amp;` üretirdi, hiç kaçırmamak
 * ise ham `&` bırakırdı.
 */
function adTemizle(ham: string): string {
  const duz = ham
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#0*39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

  // Baştaki süsleme (emoji, madde işareti) ada girmemeli: ekran okuyucu onu
  // "grafik artan çubuk grafik" diye okuyor. Rakam ve harf korunuyor, yani
  // "📊 5. Referans Verileri" -> "5. Referans Verileri".
  const suslemesiz = duz.replace(/^[^\p{L}\p{N}]+/u, "").trim();
  // `slice` VEKİL ÇİFTİNİ ortadan bölebiliyor: kesim noktasında bir emoji
  // varsa geriye yalnız yüksek vekil kalıyor ve nitelik geçersiz UTF-16
  // taşıyor. Ölçüldü (68 harf + emoji): `"AAAA\ud83d…"`. Yalnız kalan vekil
  // atılıyor.
  const kirpik =
    suslemesiz.length > AZAMI_AD
      ? suslemesiz.slice(0, AZAMI_AD - 1).replace(/[\uD800-\uDBFF]$/, "").trimEnd() + "…"
      : suslemesiz;

  return kirpik
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Tablodan ÖNCEKİ en yakın başlığın metni (aynı bölüm içinde). */
function oncekiBaslik(html: string, tabloBas: number): string {
  const once = html.slice(0, tabloBas);
  const hepsi = [...once.matchAll(/<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/g)];
  if (!hepsi.length) return "";
  return adTemizle(hepsi[hepsi.length - 1][1]);
}

/**
 * Tablo hemen öncesinde `overflow-x-auto` taşıyan bir `<div>` var mı?
 * Varsa onun açılış etiketinin [başlangıç, bitiş) aralığını döndürür.
 */
function oncekiKaydiranSarmalayici(html: string, tabloBas: number): [number, number] | null {
  const once = html.slice(0, tabloBas);
  const kirpik = once.replace(/\s+$/, "");
  if (!kirpik.endsWith(">")) return null;
  const acilis = kirpik.lastIndexOf("<div");
  if (acilis === -1) return null;
  const etiket = kirpik.slice(acilis);
  // Aradaki metin yalnızca bu açılış etiketi olmalı; başka etiket varsa
  // sarmalayıcı doğrudan tablonun anası değildir.
  if (etiket.indexOf(">") !== etiket.length - 1) return null;
  // Yatay kaydıran her biçim sayılır. `overflow-x:auto` ve kendi niteliğimiz
  // de burada: yoksa iki kez çalıştırıldığında kendi sarmalayıcımızı
  // tanımayıp üstüne bir tane daha açardı (ölçüldü — 14 tabloda oluyordu).
  if (!/overflow-x-auto|overflow-x:\s*auto|data-tablo-kaydir/.test(etiket)) return null;
  return [acilis, kirpik.length];
}

export type TabloAdBaglami = {
  /** Bölümün kendi başlığı — bölüm içinde satır içi başlık yoksa ad buradan. */
  bolumBasligi?: string;
  /**
   * SAYFA ömrü boyunca kullanılan adlar. Bölüm bölüm çağrıldığı için kümenin
   * çağrı yerinde tutulması gerekiyor — `kisaltmaAc`taki `gorulenKisaltmalar`
   * ile aynı kalıp.
   */
  kullanilanAdlar?: Set<string>;
};

/**
 * Bölüm HTML'indeki her `<table>`ı klavyeyle kaydırılabilir bir kaba alır.
 * Zaten `overflow-x-auto` sarmalayıcısı olan tabloda YENİ kap açmaz,
 * var olan kaba nitelikleri ekler.
 */
export function tabloKaydir(html: string, baglam?: TabloAdBaglami): string {
  if (!html || html.indexOf("<table") === -1) return html;

  const kullanilan = baglam?.kullanilanAdlar;
  const bolumAdi = baglam?.bolumBasligi ? adTemizle(baglam.bolumBasligi) : "";

  const etiketUret = (tabloBas: number): string => {
    const ad = oncekiBaslik(html, tabloBas) || bolumAdi;
    // "Tablo: Klinik Tablo: …" olmasın diye: başlık zaten "tablo" diyorsa
    // önek eklenmiyor. Ölçüt BAŞTA değil İÇİNDE arıyor — ölçüldü, 63 adın
    // 0'ı "Tablo" ile başlıyor ama 4'ü içinde geçiriyor ("Klinik Tablo: …",
    // "Özet Karşılaştırma Tablosu"). Başa bakan bir koşul ölü kalırdı.
    const taban = !ad ? GENEL_ETIKET : /\btablo/i.test(ad) ? ad : `Tablo: ${ad}`;
    if (!kullanilan) return taban;
    if (!kullanilan.has(taban)) {
      kullanilan.add(taban);
      return taban;
    }
    let n = 2;
    while (kullanilan.has(`${taban} (${n})`)) n++;
    const benzersiz = `${taban} (${n})`;
    kullanilan.add(benzersiz);
    return benzersiz;
  };

  let sonuc = "";
  let imlec = 0;

  for (;;) {
    const bas = html.indexOf("<table", imlec);
    if (bas === -1) break;
    // `<tablex` gibi bir etiketi yakalamayalım
    const sonrakiKarakter = html.charAt(bas + 6);
    if (sonrakiKarakter !== " " && sonrakiKarakter !== ">" && sonrakiKarakter !== "\n" && sonrakiKarakter !== "\t") {
      sonuc += html.slice(imlec, bas + 6);
      imlec = bas + 6;
      continue;
    }

    const kapanis = html.indexOf("</table>", bas);
    if (kapanis === -1) break; // dengesiz işaretleme — dokunma
    const tabloSonu = kapanis + "</table>".length;

    const sarmalayici = oncekiKaydiranSarmalayici(html, bas);
    if (sarmalayici) {
      const [ab, ae] = sarmalayici;
      if (html.slice(ab, ae).includes(NITELIK)) {
        sonuc += html.slice(imlec, tabloSonu);
      } else {
        sonuc += html.slice(imlec, ae - 1) + nitelikler(etiketUret(bas)) + html.slice(ae - 1, tabloSonu);
      }
    } else {
      sonuc +=
        html.slice(imlec, bas) +
        `<div${nitelikler(etiketUret(bas))} style="overflow-x:auto">` +
        html.slice(bas, tabloSonu) +
        "</div>";
    }
    imlec = tabloSonu;
  }

  return sonuc + html.slice(imlec);
}
