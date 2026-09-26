/**
 * DİL — sitenin hangi sayfasının hangi dilde olduğunu bilen TEK yer.
 *
 * Karar (26 Eylül 2026, kullanıcı): Türkiye öncelik, yurtdışında iddiasız
 * bir varlık. Düzen şu:
 *
 *   Türkçe   → bugünkü adresler, ÖNEKSİZ (`/tools/heart`). Arama sıralaması
 *              ve dışarıdaki bağlantılar bozulmasın diye hiçbir Türkçe adres
 *              değişmiyor.
 *   İngilizce → `/en` öneki (`/en/tools/heart`), YALNIZCA gerçekten çevrilmiş
 *              sayfalar için. İçi Türkçe olan bir `/en` sayfası arama
 *              motoruna kopya içerik olarak görünür; o yüzden çevrilmemiş
 *              sayfanın İngilizce adresi YOKTUR.
 *
 * Hangi Türkçe sayfanın İngilizcesi var: `content/dil-index.json`. Liste
 * elle yazılmıyor — `scripts/dil-index.cjs` `app/en` ağacından üretiyor,
 * CI `--kontrol` ile bayatlığını yakalıyor. Çalışma zamanında `app/`
 * okunamadığı için (sunucusuz ortamda kaynak dizin yok) indeks `content/`te
 * duruyor ve statik JSON olarak pakete giriyor; istemci bileşeni de okuyabilir.
 *
 * Dil ÇEREZDEN değil ADRESTEN okunur. Eski `app/lib/i18n.ts` dili çerezden
 * alıyordu: sunucu sayfayı hangi dilde basacağını bilemiyor, arama motoru da
 * aynı adreste tek dil görüyordu. Hiçbir yerde kullanılmadığı için silindi.
 */
import dilIndex from "@/content/dil-index.json";

export type Dil = "tr" | "en";

export const VARSAYILAN_DIL: Dil = "tr";

/** Open Graph yerel kodları — `og:locale` ve `og:locale:alternate`. */
export const OG_YEREL: Record<Dil, string> = { tr: "tr_TR", en: "en_US" };

const CEVRILMIS: ReadonlySet<string> = new Set<string>(dilIndex.sayfalar);

/** Adres hangi dilde? Yalnızca `/en` ve `/en/...` İngilizcedir (`/english` DEĞİL). */
export function yoldanDil(yol: string): Dil {
  return yol === "/en" || yol.startsWith("/en/") ? "en" : "tr";
}

/** İngilizce adresin Türkçe karşılığı; Türkçe adres olduğu gibi döner. */
export function trYolu(yol: string): string {
  if (yol === "/en") return "/";
  return yol.startsWith("/en/") ? yol.slice(3) : yol;
}

/** Türkçe adresin İngilizce BİÇİMİ — var olup olmadığını söylemez (bkz. `ceviriVar`). */
export function enYolu(trYol: string): string {
  return trYol === "/" ? "/en" : `/en${trYol}`;
}

/** Bu Türkçe sayfanın yayında bir İngilizcesi var mı? */
export function ceviriVar(trYol: string): boolean {
  return CEVRILMIS.has(trYol);
}

/** Çevrilmiş Türkçe adreslerin listesi (site haritası için). */
export function cevrilmisSayfalar(): string[] {
  return [...CEVRILMIS];
}

/**
 * Türkçe sayfanın İngilizce hedefi: çevrildiyse karşılığı, çevrilmediyse
 * İngilizce ANA SAYFA. Kullanıcı kararı (27 Eyl 2026): İngilizce site kendi
 * içinde kapalı bir ikiz; Türk olmayan okuyucu Türkçe sayfa görmeden devam
 * edebilmeli. Çevrilmemiş sayfadan İngilizceye geçen kişi o sayfanın
 * İngilizcesini değil, İngilizce sitenin girişini bulur — `hreflang` ise
 * yalnız GERÇEK çiftte basılır (bkz. `dilAlternatifleri`).
 */
export function ingilizceHedef(trYol: string): string {
  return ceviriVar(trYol) ? enYolu(trYol) : "/en";
}

/**
 * Dil değiştiricinin hedefi. İngilizce sayfada Türkçesi (her zaman vardır —
 * indeks üreteci Türkçesi olmayan İngilizce sayfayı reddeder); Türkçe
 * sayfada `ingilizceHedef`. Değiştirici bu yüzden HER sayfada çizilir.
 */
export function karsiYol(yol: string): { dil: Dil; yol: string } {
  if (yoldanDil(yol) === "en") return { dil: "tr", yol: trYolu(yol) };
  return { dil: "en", yol: ingilizceHedef(yol) };
}

/* ── YÖNLENDİRME ──────────────────────────────────────────────────────────
 *
 * Kullanıcı kararı (27 Eyl 2026): Türk olmayan ziyaretçi OTOMATİK olarak
 * İngilizce siteye gönderilir. Karar kasıtlı olarak dar tutuldu; her kural
 * bir riski kapatıyor:
 *
 *   1. Açık seçim her şeyi ezer — dil değiştiriciye basan kişinin seçimi
 *      çerezde (`DIL_CEREZI`) durur. `tr` seçmiş biri bir daha yönlendirilmez.
 *   2. Yalnız Türkçe → İngilizce yönlendirilir; İngilizce sayfa kimseyi
 *      Türkçeye atmaz (İngilizce adres herkese açık kalır).
 *   3. Bot ve bağlantı önizleyicisi yönlendirilmez: aksi hâlde Türkçe
 *      sayfalar arama dizininden düşer ve WhatsApp'ta paylaşılan Türkçe
 *      bağlantı İngilizce kartla görünür.
 *   4. İKİ şart birden: ülke Türkiye DEĞİL (Vercel `x-vercel-ip-country`)
 *      VE tarayıcı dilleri arasında Türkçe YOK. Yalnız dile bakılsaydı
 *      İngilizce tarayıcı kullanan Türk hekim İngilizceye atılırdı; yalnız
 *      ülkeye bakılsaydı yurtdışındaki Türk hekim atılırdı.
 *   5. Bilgi eksikse yönlendirme YOK: ülke başlığı ya da Accept-Language
 *      gelmemişse (yerel geliştirme, Accept-Language göndermeyen Googlebot)
 *      Türkçe kalınır. Belirsizlikte ana dil kazanır.
 */
export const DIL_CEREZI = "medisea_dil";

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|whatsapp|telegram|twitterbot|linkedin|discord|slack|preview|lighthouse|headless/i;

/** Yönlendirmenin HİÇ dokunmadığı yollar: API, oturum akışları, yönetim, dosyalar. */
const DOKUNMA = /^\/(api|_next|admin|giris|kayit|sifre|kayseritip|profile)(\/|$)|^\/(sitemap\.xml|robots\.txt)$|\/opengraph-image|\.[a-z0-9]{2,5}$/i;

export function yonlendirmeHedefi(istek: {
  yol: string;
  arama: string;
  cerez?: string | null;
  ulke?: string | null;
  acceptLanguage?: string | null;
  userAgent?: string | null;
}): string | null {
  const { yol, arama, cerez, ulke, acceptLanguage, userAgent } = istek;
  if (yoldanDil(yol) === "en" || DOKUNMA.test(yol)) return null;
  if (cerez === "tr") return null;
  const hedef = () => ingilizceHedef(yol) + (ceviriVar(yol) ? arama : "");
  if (cerez === "en") return hedef();
  if (userAgent && BOT.test(userAgent)) return null;
  if (!ulke || ulke.toUpperCase() === "TR") return null;
  if (!acceptLanguage || !acceptLanguage.trim()) return null;
  const turkceVar = acceptLanguage
    .split(",")
    .some((p) => /^\s*tr(-|;|\s*$)/i.test(p));
  return turkceVar ? null : hedef();
}

/** Açık dil seçimini bir yıl hatırlar (istemci). */
export function dilSeciminiKaydet(dil: Dil): void {
  if (typeof document === "undefined") return;
  document.cookie = `${DIL_CEREZI}=${dil}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax`;
}

/**
 * `hreflang` çifti — Next metadata'sının `alternates.languages` alanı.
 * Çevrilmemiş sayfada `undefined`: tek dilli sayfanın `hreflang` basması
 * gereksiz, var olmayan bir karşılığı göstermesi ise arama motoruna hata.
 * `x-default` Türkçe: sitenin ana dili ve dil tercihi bilinmeyen okuyucu
 * oraya düşmeli.
 */
export function dilAlternatifleri(trYol: string): Record<string, string> | undefined {
  if (!ceviriVar(trYol)) return undefined;
  return { tr: trYol, en: enYolu(trYol), "x-default": trYol };
}

/* ── SÖZLÜK ──────────────────────────────────────────────────────────────
 *
 * Arayüz metinleri `*.dil.json` dosyalarında durur, biçimi:
 *
 *   { "tr": { "hesapla": "Hesapla", "kriter": "{n} kriter" },
 *     "en": { "hesapla": "Calculate", "kriter": "{n} criteria" } }
 *
 * Neden JSON, neden bu biçim: `scripts/dil-denetim.cjs` her `*.dil.json`u
 * TS ayrıştırmadan okuyabiliyor — anahtar eşitliğini, yer tutucu eşitliğini
 * ve İngilizce değerde Türkçe harf kalmadığını CI'da denetliyor. Metin
 * bileşenin içine gömülü dururken bunların hiçbiri ölçülemiyordu (257 araçta
 * ~12.900 Türkçe satır, 26 Eyl ölçümü).
 *
 * Tip de korur: `en` bloğunda EKSİK anahtar `tsc`de düşer. FAZLA anahtarı
 * tip göremez (JSON içe aktarımı taze nesne değil) — onu kapı yakalar.
 */
type Metinler = Record<string, string>;

export function sozluk<T extends Metinler>(kaynak: { tr: T; en: { [K in keyof T]: string } }) {
  return (dil: Dil): T => (dil === "en" ? (kaynak.en as T) : kaynak.tr);
}

/**
 * `{ad}` yer tutucularını doldurur: `bicimle("{n} kriter", { n: 5 })`.
 * Bilinmeyen yer tutucu OLDUĞU GİBİ kalır — sessizce boş dizeye dönmesi
 * eksik değeri gizlerdi; ekranda `{n}` görmek hatayı hemen gösterir.
 */
export function bicimle(sablon: string, degerler: Record<string, string | number>): string {
  return sablon.replace(/\{(\w+)\}/g, (tam, ad: string) =>
    Object.prototype.hasOwnProperty.call(degerler, ad) ? String(degerler[ad]) : tam
  );
}
