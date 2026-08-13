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

export type Envanter = {
  soru: number;
  flashcard: number;
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

  const soru = diziUzunlugu(path.join(kok, "quizzes", branch, `${topic}-quiz-1.json`), ["sorular", "questions"]);
  const kart = diziUzunlugu(path.join(kok, "flashcards", branch, `${topic}.json`), ["cards", "kartlar"]);
  const inci = diziUzunlugu(path.join(kok, "pearls", branch, `${topic}.json`), ["pearls", "inciler"]);

  const vaka = vakaSayisi(kok, branch, topic);

  return {
    soru: soru ?? 0,
    flashcard: kart ?? 0,
    inci: inci ?? 0,
    vaka,
    // "Var" demek için dosyanın bulunması YETMEZ, içinde en az bir kayıt olmalı:
    // boş bir quize göndermek de çıkmaz sokaktır.
    quizVar: (soru ?? 0) > 0,
    flashcardVar: (kart ?? 0) > 0,
    inciVar: (inci ?? 0) > 0,
    vakaVar: vaka > 0,
  };
}
