// SUNUCU TARAFI — fs kullanır, istemci bileşeninden içe aktarılamaz.
import fs from "fs";
import path from "path";
import duzen from "@/content/brans-icindekiler.json";
import { ebeveynleriCoz } from "@/lib/slug-eslestir";

/**
 * Branş sayfasının "İçindekiler"i — ders kitabı düzeni.
 *
 * Eski branş sayfası yalnızca parent'ı olmayan konuları listeliyordu.
 * Ölçüldü (27 Eyl 2026): gastroenterolojide 38 görünür konunun 2'si
 * üst düzeydeydi; kalan 36'nın 12'si ebeveyni içerikte hiç olmayan
 * "Diğer Konular" kovasındaydı, 24'ü ise ancak iki tık derinde
 * bulunabiliyordu. Endokrinolojide 134 konunun 7'si görünüyordu.
 *
 * Çare hiyerarşiyi DEĞİŞTİRMEK değil (parent/order içerik kararı), onu
 * GÖSTERMEK: üst düzey konular `content/brans-icindekiler.json`daki
 * kısımlara (Özofagus · Mide · … gibi) dağıtılır, her bölüm alt başlıklarıyla
 * birlikte basılır.
 *
 * Kendini onaran okuma: düzen dosyasında adı geçmeyen üst düzey konu ya da
 * asılı grup kaybolmaz, "Diğer Konular" kısmına düşer. Düzen dosyasında adı
 * geçip içerikte karşılığı olmayan kimlik sessizce atlanır (boş kısım
 * basılmaz). Ölçüt: kısımlardaki konu toplamı = görünür konu sayısı.
 */

export type TocKonu = {
  slug: string;
  baslik: string;
  /** Doğrudan çocuklar (birincil ebeveyni bu konu olanlar). */
  cocuklar: TocKonu[];
  /** Bütün torunlar dahil alt konu sayısı. */
  altToplam: number;
};

export type TocBolum = {
  no: number;
  /** Gerçek konu slug'ı; sanal bölümde null (bağlantı yok). */
  slug: string | null;
  baslik: string;
  cocuklar: TocKonu[];
  altToplam: number;
};

export type TocKisim = { no: number; baslik: string; bolumler: TocBolum[] };

export type DuzKonu = { slug: string; baslik: string; yol: string };

export type Icindekiler = {
  kisimlar: TocKisim[];
  /** Görünür konu sayısı (gizliler hariç) — `getTopicCounts()` ile aynı ölçüt. */
  konuSayisi: number;
  /** Arama için: her görünür konu + üst bölüm/kısım yolu. */
  duz: DuzKonu[];
};

type Ham = { slug: string; baslik: string; order: number; ebeveynler: string[]; gizli: boolean };

type DuzenGirdisi = {
  kisimlar: { baslik: string; bolumler: string[] }[];
  sanal?: Record<string, string>;
};

function konulariOku(brans: string): Ham[] {
  const dizin = path.join(process.cwd(), "content", "canonical", brans);
  let dosyalar: string[] = [];
  try {
    dosyalar = fs.readdirSync(dizin).filter((f) => f.endsWith(".json"));
  } catch {
    return [];
  }
  const ham: (Ham & { hamParent: unknown })[] = [];
  for (const f of dosyalar) {
    try {
      const veri = JSON.parse(fs.readFileSync(path.join(dizin, f), "utf-8"));
      ham.push({
        slug: f.replace(/\.json$/, ""),
        baslik: veri.title || f.replace(/\.json$/, ""),
        order: Number(veri.meta?.order ?? 999),
        hamParent: veri.meta?.parent ?? null,
        ebeveynler: [],
        gizli: veri.meta?.hidden === true,
      });
    } catch {
      // bozuk dosya listeyi düşürmesin
    }
  }
  const sluglar = new Set(ham.map((h) => h.slug));
  for (const h of ham) h.ebeveynler = ebeveynleriCoz(h.hamParent, sluglar, h.slug);
  // Branş sayfasının eski sıralamasıyla aynı: order → başlık → slug.
  ham.sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    const t = a.baslik.localeCompare(b.baslik, "tr", { sensitivity: "base" });
    if (t) return t;
    return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
  });
  return ham.map(({ hamParent: _h, ...k }) => k);
}

export function bransIcindekiler(brans: string): Icindekiler {
  const tum = konulariOku(brans);
  const gorunur = tum.filter((k) => !k.gizli);
  const bySlug = new Map(gorunur.map((k) => [k.slug, k]));

  // Ağaç, GÖRÜNÜR ilk ebeveyn üzerinden kurulur. Çok ebeveynli konu yalnızca
  // bir kez basılır — İçindekiler'de aynı konu iki kez geçmesin. Birincil
  // ebeveyn içerikte yoksa sıradaki görünür ebeveyn kullanılır (motilite:
  // ["mide-hastaliklari" (yok), "ozofagus-hastaliklari" (yok),
  // "bagirsak-hastaliklari"] — birincile bakınca hiçbir yere düşmüyordu).
  const cocukMap = new Map<string, Ham[]>();
  for (const k of gorunur) {
    const e = k.ebeveynler.find((x) => bySlug.has(x));
    if (!e) continue;
    if (!cocukMap.has(e)) cocukMap.set(e, []);
    cocukMap.get(e)!.push(k);
  }

  const agac = (slug: string, gorulen: Set<string>): TocKonu[] =>
    (cocukMap.get(slug) || [])
      .filter((c) => !gorulen.has(c.slug))
      .map((c) => {
        const g = new Set(gorulen).add(c.slug);
        const cocuklar = agac(c.slug, g);
        return {
          slug: c.slug,
          baslik: c.baslik,
          cocuklar,
          altToplam: cocuklar.reduce((t, x) => t + 1 + x.altToplam, 0),
        };
      });

  // Bölüm adayları: (1) üst düzey görünür konular, (2) HİÇBİR ebeveyni
  // görünür olmayan konuların oluşturduğu gruplar (birincil ebeveyn adına göre).
  const ustDuzey = gorunur.filter((k) => k.ebeveynler.length === 0);
  const asiliGrup = new Map<string, Ham[]>();
  for (const k of gorunur) {
    const e = k.ebeveynler[0];
    if (!e || k.ebeveynler.some((x) => bySlug.has(x))) continue;
    if (!asiliGrup.has(e)) asiliGrup.set(e, []);
    asiliGrup.get(e)!.push(k);
  }

  const d = (duzen as unknown as Record<string, DuzenGirdisi | string>)[brans];
  const girdi: DuzenGirdisi | null = d && typeof d === "object" ? d : null;
  const sanalAd = girdi?.sanal || {};

  const kullanilan = new Set<string>();
  const bolumYap = (kimlik: string): Omit<TocBolum, "no"> | null => {
    if (kullanilan.has(kimlik)) return null;
    const gercek = bySlug.get(kimlik);
    if (gercek && gercek.ebeveynler.length === 0) {
      kullanilan.add(kimlik);
      const cocuklar = agac(kimlik, new Set([kimlik]));
      return {
        slug: kimlik,
        baslik: gercek.baslik,
        cocuklar,
        altToplam: cocuklar.reduce((t, x) => t + 1 + x.altToplam, 0),
      };
    }
    const grup = asiliGrup.get(kimlik);
    if (grup && grup.length) {
      kullanilan.add(kimlik);
      const cocuklar: TocKonu[] = grup.map((k) => {
        const alt = agac(k.slug, new Set([k.slug]));
        return { slug: k.slug, baslik: k.baslik, cocuklar: alt, altToplam: alt.reduce((t, x) => t + 1 + x.altToplam, 0) };
      });
      return {
        slug: null,
        baslik: sanalAd[kimlik] || kimlik.replace(/-/g, " "),
        cocuklar,
        altToplam: cocuklar.reduce((t, x) => t + 1 + x.altToplam, 0),
      };
    }
    return null;
  };

  const kisimlar: TocKisim[] = [];
  for (const k of girdi?.kisimlar || []) {
    const bolumler = k.bolumler.map(bolumYap).filter(Boolean) as Omit<TocBolum, "no">[];
    if (bolumler.length) kisimlar.push({ no: 0, baslik: k.baslik, bolumler: bolumler as TocBolum[] });
  }

  // Düzende adı geçmeyenler — kaybolmasın.
  const kalan: Omit<TocBolum, "no">[] = [];
  for (const k of ustDuzey) {
    const b = bolumYap(k.slug);
    if (b) kalan.push(b);
  }
  for (const e of asiliGrup.keys()) {
    const b = bolumYap(e);
    if (b) kalan.push(b);
  }
  if (kalan.length) {
    kisimlar.push({
      no: 0,
      // Düzeni hiç olmayan branşta tek kısım; varsa artık kova.
      baslik: kisimlar.length ? "Diğer Konular" : "Konular",
      bolumler: kalan as TocBolum[],
    });
  }

  let bolumNo = 0;
  kisimlar.forEach((k, i) => {
    k.no = i + 1;
    for (const b of k.bolumler) b.no = ++bolumNo;
  });

  // Arama listesi: ağaçta görünen HER konu, yolu ile.
  const duz: DuzKonu[] = [];
  const gez = (liste: TocKonu[], yol: string) => {
    for (const x of liste) {
      duz.push({ slug: x.slug, baslik: x.baslik, yol });
      gez(x.cocuklar, yol);
    }
  };
  for (const k of kisimlar) {
    for (const b of k.bolumler) {
      if (b.slug) duz.push({ slug: b.slug, baslik: b.baslik, yol: k.baslik });
      gez(b.cocuklar, b.slug ? `${k.baslik} › ${b.baslik}` : k.baslik);
    }
  }

  return { kisimlar, konuSayisi: gorunur.length, duz };
}

/** Ana sayfa / kütüphane için: branşın kısım adları (düzen dosyasından). */
export function kisimAdlari(brans: string): string[] {
  const d = (duzen as unknown as Record<string, DuzenGirdisi | string>)[brans];
  if (!d || typeof d !== "object") return [];
  return d.kisimlar.map((k) => k.baslik);
}

/** Roma rakamı — kısım numarası için (I–XX yeterli). */
export function roma(n: number): string {
  const t: [number, string][] = [[10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];
  let s = "";
  for (const [v, r] of t) while (n >= v) { s += r; n -= v; }
  return s;
}
