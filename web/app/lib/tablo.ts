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
// `role="region"` + `aria-label`: `tabindex="0"` tek başına kaydırmayı açar
// ama odaklanan kabın adı olmaz; ekran okuyucu adsız bir grup duyurur.

/** CSS ve ölçüm bu nitelikten tutunuyor. */
const NITELIK = "data-tablo-kaydir";
const ETIKET = "Tablo (yatay kaydırılabilir)";
const EK = ` ${NITELIK} tabindex="0" role="region" aria-label="${ETIKET}"`;

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

/**
 * Bölüm HTML'indeki her `<table>`ı klavyeyle kaydırılabilir bir kaba alır.
 * Zaten `overflow-x-auto` sarmalayıcısı olan tabloda YENİ kap açmaz,
 * var olan kaba nitelikleri ekler.
 */
export function tabloKaydir(html: string): string {
  if (!html || html.indexOf("<table") === -1) return html;

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
        sonuc += html.slice(imlec, ae - 1) + EK + html.slice(ae - 1, tabloSonu);
      }
    } else {
      sonuc += html.slice(imlec, bas) + `<div${EK} style="overflow-x:auto">` + html.slice(bas, tabloSonu) + "</div>";
    }
    imlec = tabloSonu;
  }

  return sonuc + html.slice(imlec);
}
