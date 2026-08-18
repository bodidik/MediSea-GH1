import "server-only";
import fs from "fs";
import path from "path";
import { listelenmeyenKategori } from "@/lib/premium-brans";

/**
 * Sitedeki içeriğin GERÇEK sayıları.
 *
 * Üyelik sayfası gibi yüzeylerde bu sayılar elle yazılıyordu ("13 branşta",
 * "114 skor"). Bu oturumda aynı kalıp birkaç yerde daha bulundu ve hepsinde
 * aynı sonucu verdi: içerik büyürken sabit yazılan sayı sessizce yalana
 * dönüşüyor. Ana sayfa "6+ araç" derken 114 araç vardı.
 *
 * Sayımlar süreç ömrü boyunca bir kez yapılıp saklanıyor: içerik yalnızca
 * dağıtımda değişiyor, her istekte yüzlerce dosya ayrıştırmanın anlamı yok.
 */

export type IcerikSayilari = {
  brans: number;
  konu: number;
  arac: number;
  /** Premium branş dosyası sayısı — açık taraftaki `brans` ile aynı şey DEĞİL. */
  premiumBrans: number;
  premiumKonu: number;
  premiumSoru: number;
  premiumKart: number;
  premiumVaka: number;
};

let onbellek: IcerikSayilari | null = null;

/** `<konu>-quiz-1.json` → `konu`, `<konu>.json` → `konu` */
function konuAdi(dosya: string): string {
  return dosya.replace(/\.json$/, "").replace(/-(quiz|vaka|kart|flashcard)-\d+$/, "");
}

/**
 * ULAŞILABİLİR kayıtları sayar — konu dosyası olmayan içerik sayılmaz.
 *
 * Eskiden dizindeki her dosya sayılıyordu ve bu, satış sayfasında iki
 * yüzeyin aynı sayıyı farklı söylemesine yol açtı: üst yazı (buradan)
 * "362 soru", panonun kendisi (erişilebilir konuları toplayarak) "352".
 * Farkın tamamı tek bir yetim dosyaydı — `hematoloji/aml-quiz-1.json`,
 * karşılığında `topics/hematoloji/aml.json` yok, yani o 10 soruya hiçbir
 * yerden ulaşılamıyor.
 *
 * Reklam edilen sayı, kullanıcının gerçekten açabildiği içerik olmalı.
 * Yetim dosyaları listelemek için: `node scripts/yetim-denetim.cjs`
 */
function jsonSay(
  dizin: string,
  konuKoku: string,
  alanlar: string[]
): { dosya: number; kayit: number } {
  let dosya = 0;
  let kayit = 0;
  try {
    for (const brans of fs.readdirSync(dizin, { withFileTypes: true }).filter((d) => d.isDirectory())) {
      for (const f of fs.readdirSync(path.join(dizin, brans.name)).filter((f) => f.endsWith(".json"))) {
        if (!fs.existsSync(path.join(konuKoku, brans.name, `${konuAdi(f)}.json`))) continue;
        dosya++;
        try {
          const veri = JSON.parse(fs.readFileSync(path.join(dizin, brans.name, f), "utf-8"));
          for (const alan of alanlar) {
            if (Array.isArray(veri?.[alan])) {
              kayit += veri[alan].length;
              break;
            }
          }
        } catch {
          // Bozuk dosya sayıma girmesin.
        }
      }
    }
  } catch {
    // Dizin yoksa sıfır.
  }
  return { dosya, kayit };
}

export function icerikSayilari(): IcerikSayilari {
  if (onbellek) return onbellek;

  const kok = process.cwd();
  const canonical = path.join(kok, "content", "canonical");
  const premium = path.join(kok, "content", "premium", "ydus");

  // Açık kütüphane: gizli konular sayılmaz (kullanıcı onları göremiyor).
  let brans = 0;
  let konu = 0;
  try {
    const branslar = fs.readdirSync(canonical, { withFileTypes: true }).filter((d) => d.isDirectory());
    brans = branslar.length;
    for (const b of branslar) {
      for (const f of fs.readdirSync(path.join(canonical, b.name)).filter((f) => f.endsWith(".json"))) {
        try {
          const v = JSON.parse(fs.readFileSync(path.join(canonical, b.name, f), "utf-8"));
          if (v?.meta?.hidden !== true) konu++;
        } catch {}
      }
    }
  } catch {}

  // Araçlar: kaynak app/ dizini çalışma zamanında bulunmadığı için
  // content/arac-index.json'dan (bkz. getToolCount'taki not).
  let arac = 0;
  try {
    const liste = JSON.parse(fs.readFileSync(path.join(kok, "content", "arac-index.json"), "utf-8"));
    arac = Array.isArray(liste) ? liste.length : 0;
  } catch {}

  /**
   * Premium konu sayısı: "hazır" işaretliler + listede adı geçmeyen konu
   * dosyaları.
   *
   * İkinci kısım şart, çünkü pano ve branş sayfası da aynı onarımı yapıyor
   * (bkz. lib/premium-brans.ts). Onarımı burada uygulamayınca üyelik sayfası
   * "38 başlık" derken pano "39" diyordu — aynı ürünü iki yüzey farklı
   * anlatıyordu.
   */
  let premiumKonu = 0;
  let premiumBrans = 0;
  try {
    const bdir = path.join(premium, "branches");
    for (const f of fs.readdirSync(bdir).filter((f) => f.endsWith(".json"))) {
      premiumBrans++;
      const brans = f.replace(/\.json$/, "");
      const v = JSON.parse(fs.readFileSync(path.join(bdir, f), "utf-8"));
      const kategoriler = v?.kategoriler ?? [];
      for (const kat of kategoriler) {
        for (const k of kat?.konular ?? []) if (k?.hazir) premiumKonu++;
      }
      const ek = listelenmeyenKategori(brans, kategoriler);
      if (ek) premiumKonu += ek.konular.length;
    }
  } catch {}

  const konuKoku = path.join(premium, "topics");
  /**
   * ALAN ADLARI MOTORLARLA AYNI OLMALI — `lib/premium-envanter.ts`teki
   * notun kardeşi.
   *
   * Burası bir dönem her tür için iki ad sayıyordu (`questions`, `kartlar`,
   * `stages`) ama hiçbir motor onları okumuyor: QuizEngine `sorular`,
   * hizli-tekrar `veri.cards`, VakaEngine `adimlar`. Reklam edilen sayının
   * ölçütü zaten "kullanıcının gerçekten açabildiği içerik" (yukarıdaki
   * yetim notu) ve okunamayan şema da açılamıyor — motor ya boş ekran
   * basar ya çöker.
   *
   * Ölçüldü: daraltma bugün hiçbir sayıyı değiştirmiyor (soru 353,
   * kart 1492, vaka 35 — ikisinde de aynı). Yani bu, davranışı koruyan
   * bir hizalama; ileride ayrık şemalı bir dosya eklenirse satış sayfası
   * onu saymayacak.
   */
  const soru = jsonSay(path.join(premium, "quizzes"), konuKoku, ["sorular"]);
  const kart = jsonSay(path.join(premium, "flashcards"), konuKoku, ["cards"]);
  const vaka = jsonSay(path.join(premium, "vakalar"), konuKoku, ["adimlar"]);

  onbellek = {
    brans,
    konu,
    arac,
    premiumBrans,
    premiumKonu,
    premiumSoru: soru.kayit,
    premiumKart: kart.kayit,
    premiumVaka: vaka.dosya,
  };
  return onbellek;
}
