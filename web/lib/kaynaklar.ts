/**
 * KONU KAYNAKLARI — `meta.kaynaklar` ve `meta.kaynakca`
 *
 * Uzman okuyucunun ilk sorusu "bu hangi kılavuza göre?" ve 515 konunun
 * hiçbirinde yapılandırılmış bir cevap yoktu (26 Eyl 2026 ölçümü: kaynak
 * bölümü taşıyan konu 0, metinde yıllı kılavuz adı geçen 40).
 *
 * Şema (içerik dosyasında, hepsi isteğe bağlı ama `ad` şart):
 *
 *   "meta": { "kaynaklar": [
 *     { "ad": "2023 ESC Guidelines for the management of acute coronary syndromes",
 *       "yil": 2023, "url": "https://doi.org/10.1093/eurheartj/ehad191" }
 *   ] }
 *
 * ORTAK KAYNAKÇA — `meta.kaynakca: "hipofiz"`. Bir kaynak defterinden
 * (ör. 33 künyelik bir NotebookLM defteri) üretilmiş bir konu AİLESİ aynı
 * listeyi paylaşır. Liste `content/kaynakca.json`da TEK YERDE durur: her
 * konuya kopyalansaydı bir künye düzeltmesi onlarca dosyaya yayılırdı
 * ("iki gerçeklik"). Sayfa bunu "bu konu şu kaynakçadan hazırlandı" diye
 * sunar — her künyenin o sayfaya dayandığını İDDİA ETMEZ, çünkü öyle
 * değil. Konuya özgü kaynak varsa `meta.kaynaklar` yanında durur.
 *
 * Sayfa ve JSON-LD (`citation`) AYNI normalleştirmeden okur — iki ayrı
 * okuma "iki gerçeklik" sınıfını açardı. Kapı: `scripts/kaynak-denetim.cjs`
 * (var olmayan kaynakçayı gösteren konu orada düşer).
 *
 * Bozuk kayıt sayfayı düşürmez, sessizce de yutulmaz: `ad`ı olmayan kayıt
 * atlanır; `url` yalnızca https ise bağlantı olur (javascript: ya da http
 * adresi metin olarak kalır, bağlantıya dönüşmez).
 */
import kaynakcaVeri from "@/content/kaynakca.json";

/**
 * Kaynakçada gruplama için; konu kaynağında kullanılmaz.
 * `uptodate`: sürekli güncellenen konu — künyedeki tarih SON GÜNCELLEMEdir,
 * defterin okuduğu sürüm değil (o doğrulanamaz; başlık ve yazar kamuya açık
 * uçtan doğrulanır).
 */
export type KaynakTuru = "makale" | "kitap" | "uptodate";
const TURLER: KaynakTuru[] = ["makale", "kitap", "uptodate"];
export type Kaynak = { ad: string; yil?: string; url?: string; tur?: KaynakTuru };

export type Kaynakca = {
  /** Adres ve konu dosyasındaki anahtar: `/kaynakca/<ad>`. */
  ad: string;
  baslik: string;
  aciklama?: string;
  kaynaklar: Kaynak[];
};

/** Gruplama sırası ve başlıkları — sayfada ve kaynakça sayfasında aynı. */
export const KAYNAK_GRUPLARI: { tur: KaynakTuru | undefined; baslik: string }[] = [
  { tur: "makale", baslik: "Makaleler ve kılavuzlar" },
  { tur: "kitap", baslik: "Kitaplar ve kitap bölümleri" },
  // Tarihin "son güncelleme" olduğu künyenin kendisinde yazıyor.
  { tur: "uptodate", baslik: "UpToDate konuları" },
  { tur: undefined, baslik: "Diğer" },
];

function kayitNormallestir(k: unknown): Kaynak | null {
  if (!k || typeof k !== "object") return null;
  const { ad, yil, url, tur } = k as Record<string, unknown>;
  if (typeof ad !== "string" || !ad.trim()) return null;
  const yilYazi =
    typeof yil === "number" || (typeof yil === "string" && yil.trim())
      ? String(yil).trim()
      : undefined;
  const guvenliUrl =
    typeof url === "string" && /^https:\/\/[^\s]+$/.test(url.trim()) ? url.trim() : undefined;
  const turDegeri = TURLER.includes(tur as KaynakTuru) ? (tur as KaynakTuru) : undefined;
  return { ad: ad.trim(), yil: yilYazi, url: guvenliUrl, tur: turDegeri };
}

function listeNormallestir(ham: unknown): Kaynak[] {
  if (!Array.isArray(ham)) return [];
  return ham.map(kayitNormallestir).filter((k): k is Kaynak => k !== null);
}

export function kaynaklariAl(meta: unknown): Kaynak[] {
  return listeNormallestir((meta as { kaynaklar?: unknown } | null | undefined)?.kaynaklar);
}

/** Adıyla kaynakça; yoksa ya da geçerli kaydı yoksa null. */
export function kaynakcaGetir(ad: string): Kaynakca | null {
  const ham = (kaynakcaVeri as Record<string, unknown>)[ad] as
    | { baslik?: unknown; aciklama?: unknown; kaynaklar?: unknown }
    | undefined;
  if (!ham || typeof ham !== "object" || typeof ham.baslik !== "string") return null;
  const kaynaklar = listeNormallestir(ham.kaynaklar);
  if (!kaynaklar.length) return null;
  return {
    ad,
    baslik: ham.baslik,
    aciklama: typeof ham.aciklama === "string" ? ham.aciklama : undefined,
    kaynaklar,
  };
}

/** Konunun bağlı olduğu ortak kaynakça (`meta.kaynakca`). */
export function kaynakcaAl(meta: unknown): Kaynakca | null {
  const ad = (meta as { kaynakca?: unknown } | null | undefined)?.kaynakca;
  return typeof ad === "string" && ad.trim() ? kaynakcaGetir(ad.trim()) : null;
}

export function kaynakcaAdlari(): string[] {
  return Object.keys(kaynakcaVeri).filter((ad) => kaynakcaGetir(ad) !== null);
}

/** Boş grupları atarak türe göre gruplar. */
export function kaynaklariGrupla(kaynaklar: Kaynak[]) {
  return KAYNAK_GRUPLARI.map((g) => ({
    baslik: g.baslik,
    kaynaklar: kaynaklar.filter((k) => k.tur === g.tur),
  })).filter((g) => g.kaynaklar.length > 0);
}
