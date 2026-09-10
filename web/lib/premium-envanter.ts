import "server-only";
import fs from "fs";
import path from "path";

/**
 * Bir premium konunun GERÇEK içerik envanteri.
 *
 * Konu dosyaları kendi sayılarını `istatistikler` alanında ilan ediyordu ve
 * arayüz bu ilana güveniyordu. Ölçüm, 38 hazır konunun 5'inde ilanla
 * gerçeğin tutmadığını gösterdi:
 *
 *   graves-hastaligi : 10 soru ilan ediyor, quiz dosyası HİÇ YOK
 *   kml              : 12 flashcard ilan ediyor, kart dosyası HİÇ YOK
 *   aml-ana          : 24 soru ilan ediyor, gerçekte 9
 *   hashimoto        :  7 ilan ediyor, gerçekte 10
 *   hkp              : 10 ilan ediyor, gerçekte 11
 *
 * İlk ikisi yalnızca yanlış sayı değil, ÇIKMAZ SOKAK: sayı tıklanabilir
 * olduğu için kullanıcı olmayan bir quize gidiyordu.
 *
 * Sayılar artık dosyalardan sayılıyor ve bağlantı yalnızca dosya gerçekten
 * varsa kuruluyor. Böylece içerik metadatası yanlış yazılsa bile arayüz
 * doğruyu gösterir — ölçüm kaynağı tek ve kendini düzeltir.
 */

/** Hızlı tekrar setinin oynatıcıya verilecek kimliği ve okunabilir adı. */
export type FlashcardSeti = {
  /** `hizli-tekrar?id=` değeri — dosya adının uzantısız hâli. */
  id: string;
  /** Dosyanın kendi `topic` alanı; yoksa "Set N". */
  baslik: string;
  sayi: number;
};

export type Envanter = {
  soru: number;
  flashcard: number;
  /** Birden fazla olabilir: `<konu>.json` + `<konu>-set-2.json`, `-set-3.json`… */
  flashcardSetleri: FlashcardSeti[];
  inci: number;
  vaka: number;
  quizVar: boolean;
  flashcardVar: boolean;
  inciVar: boolean;
  vakaVar: boolean;
};

/** Vakalar tek dosya değil, `<konu>-vaka-1.json`, `-vaka-2.json` … biçiminde. */
function vakaSayisi(kok: string, branch: string, topic: string): number {
  try {
    const dizin = path.join(kok, "vakalar", branch);
    if (!fs.existsSync(dizin)) return 0;
    return fs
      .readdirSync(dizin)
      .filter((f) => f.startsWith(`${topic}-vaka-`) && f.endsWith(".json")).length;
  } catch {
    return 0;
  }
}

/**
 * Hızlı tekrar setleri: `<konu>.json` birinci set, `<konu>-set-N.json` sonrakiler.
 *
 * Vaka tarafındaki `startsWith` kalıbı burada KULLANILMAZ: `asit` konusu
 * `asit-portal-hipertansiyon` dosyasını da yutardı. Ad birebir eşleşmeli.
 *
 * Okunamayan ya da boş dosya listeye GİRMEZ — envanterin genel kuralı:
 * oynatıcı `cards.map` çağırdığında çökmesin diye sayı da bağlantı da
 * yalnızca gerçekten kart taşıyan dosyadan çıkar.
 */
function flashcardSetleriniBul(kok: string, branch: string, topic: string): FlashcardSeti[] {
  const dizin = path.join(kok, "flashcards", branch);
  let adlar: string[];
  try {
    if (!fs.existsSync(dizin)) return [];
    adlar = fs.readdirSync(dizin);
  } catch {
    return [];
  }

  const kacinci = (ad: string): number | null => {
    if (ad === `${topic}.json`) return 1;
    const e = new RegExp(`^${topic}-set-(\\d+)\\.json$`).exec(ad);
    return e ? Number(e[1]) : null;
  };

  return adlar
    .map((ad) => ({ ad, sira: kacinci(ad) }))
    .filter((x): x is { ad: string; sira: number } => x.sira !== null)
    .sort((a, b) => a.sira - b.sira)
    .map(({ ad, sira }) => {
      const dosya = path.join(dizin, ad);
      const sayi = diziUzunlugu(dosya, ["cards"]);
      if (!sayi) return null;
      let baslik = `Set ${sira}`;
      try {
        const veri = JSON.parse(fs.readFileSync(dosya, "utf-8"));
        if (typeof veri?.topic === "string" && veri.topic.trim()) baslik = veri.topic.trim();
      } catch {
        /* başlık okunamadıysa "Set N" kalır; sayı zaten yukarıda doğrulandı. */
      }
      return { id: ad.replace(/\.json$/, ""), baslik, sayi };
    })
    .filter((s): s is FlashcardSeti => s !== null);
}

const KOK = () => path.join(process.cwd(), "content", "premium", "ydus");

function diziUzunlugu(dosya: string, alanlar: string[]): number | null {
  try {
    if (!fs.existsSync(dosya)) return null;
    const veri = JSON.parse(fs.readFileSync(dosya, "utf-8"));
    for (const alan of alanlar) {
      if (Array.isArray(veri?.[alan])) return veri[alan].length;
    }
    return 0;
  } catch {
    // Bozuk dosya "yok" sayılır: sayı da bağlantı da verilmez.
    return null;
  }
}

export function envanterAl(branch: string, topic: string): Envanter {
  const kok = KOK();

  /**
   * YALNIZCA MOTORUN OKUYABİLDİĞİ ALAN SAYILIR.
   *
   * Bu liste bir dönem her tür için iki ad kabul ediyordu
   * (`sorular|questions`, `cards|kartlar`, `pearls|inciler`) ama motorların
   * hiçbiri ikinci adı okumuyor — ölçüldü: QuizEngine `sorular`,
   * hizli-tekrar `veri.cards`, PearlsViewer `data.pearls`.
   *
   * Sonuç sessiz değil, AĞIR olurdu: sayaç "N kart" der, konu sayfası
   * bağlantıyı kurar, motor `cards.map` çağırınca `undefined` üzerinde
   * ÇÖKERDİ (inciler tarafında `data.pearls.filter` aynı). Quiz tarafında
   * bu tam olarak yaşandı — `hematoloji/aml-quiz-1.json` `questions`
   * kullanıyor ve envanter onu 10 soru diye sayıyordu.
   *
   * Motoru ikinci şemayı okuyacak şekilde genişletmek DENENDİ ve geri
   * alındı: soru içi alanlar da farklı olduğu için HTTP 500 verdi. Doğru
   * yön bu: okunamayan dosya 0 sayılır, bağlantı hiç kurulmaz.
   */
  const soru = diziUzunlugu(path.join(kok, "quizzes", branch, `${topic}-quiz-1.json`), ["sorular"]);
  const setler = flashcardSetleriniBul(kok, branch, topic);
  const kart = setler.reduce((t, s) => t + s.sayi, 0);
  const inci = diziUzunlugu(path.join(kok, "pearls", branch, `${topic}.json`), ["pearls"]);

  const vaka = vakaSayisi(kok, branch, topic);

  return {
    soru: soru ?? 0,
    flashcard: kart,
    flashcardSetleri: setler,
    inci: inci ?? 0,
    vaka,
    // "Var" demek için dosyanın bulunması YETMEZ, içinde en az bir kayıt olmalı:
    // boş bir quize göndermek de çıkmaz sokaktır.
    quizVar: (soru ?? 0) > 0,
    flashcardVar: setler.length > 0,
    inciVar: (inci ?? 0) > 0,
    vakaVar: vaka > 0,
  };
}
