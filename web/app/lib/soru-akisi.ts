import { useEffect, useRef } from "react";

/**
 * SORU AKIŞI — soru motoru (`quiz-coz`) ve vaka motoru (`vaka-coz`) için
 * ORTAK davranış. Bir motorda kapatılıp ötekinde açık kalmasın diye tek yerde:
 * ilk kez soru motorunda ölçülüp düzeltildi, vaka motorunda aynı üç kusur
 * birebir tekrar ölçüldü (sonuç başlığı görünür alanın 713/768. pikselinde,
 * adım geçişinde odak BODY'ye düşüyor, klavye yok).
 */

/**
 * Cevaptan sonra sonuç kartı görünür alanın alt %40'ındaysa başına kaydırır;
 * zaten yukarıdaysa sayfa oynatılmaz. Hareket azaltmada anlık.
 * (`scroll-padding-top` html'de — başlık üst şeridin altında kalır.)
 */
export function useSonucuGoster<T extends HTMLElement>(cevapVerildi: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!cevapVerildi) return;
    const kart = ref.current;
    if (!kart || kart.getBoundingClientRect().top < window.innerHeight * 0.6) return;
    const azHareket = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    kart.scrollIntoView({ block: "start", behavior: azHareket ? "auto" : "smooth" });
  }, [cevapVerildi]);
  return ref;
}

/**
 * KLAVYE — A–E ya da 1–9 şıkkı işaretler (`secilebilir` iken); Enter ya da →
 * `ileri` eylemini çalıştırır (null ise hiçbir şey yapmaz). Yazı alanında
 * (not defteri) ve Ctrl/Alt/Meta ile basılan tuşa karışmaz; odak bir bağlantı
 * ya da etkin düğmedeyken Enter o ögenin kendi işidir.
 */
export function useSoruKlavyesi({
  harfler,
  secilebilir,
  sec,
  ileri,
}: {
  harfler: string[];
  secilebilir: boolean;
  sec: (harf: string) => void;
  ileri: (() => void) | null;
}) {
  const harfAnahtari = harfler.join("");
  useEffect(() => {
    const liste = harfAnahtari.split("");
    function tus(e: KeyboardEvent) {
      if (e.defaultPrevented || e.ctrlKey || e.metaKey || e.altKey) return;
      const hedef = e.target as HTMLElement | null;
      if (hedef && (hedef.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(hedef.tagName))) return;
      if (secilebilir) {
        const k = e.key.length === 1 ? e.key.toLocaleUpperCase("en") : "";
        const harf = /^[1-9]$/.test(k) ? liste[Number(k) - 1] : liste.includes(k) ? k : undefined;
        if (harf) {
          e.preventDefault();
          sec(harf);
          return;
        }
      }
      if (!ileri) return;
      const etkilesimli =
        hedef && /^(A|BUTTON)$/.test(hedef.tagName) && hedef.getAttribute("aria-disabled") !== "true";
      if (e.key === "ArrowRight" || (e.key === "Enter" && !etkilesimli)) {
        e.preventDefault();
        ileri();
      }
    }
    document.addEventListener("keydown", tus);
    return () => document.removeEventListener("keydown", tus);
  }, [harfAnahtari, secilebilir, sec, ileri]);
}

/**
 * GEÇİŞTE BAŞA DÖN — `anahtar` değişince sayfa en üste döner ve odak
 * `hedefId`li ögeye (tabIndex=-1) taşınır. Ölçüldü: sayfa sonundaki düğmeye
 * basınca kaydırma yerinde kalıyor, yeni soru ortasından okunuyordu; düğme
 * sökülünce odak BODY'ye düşüyordu.
 *
 * İlk çizimde çalışmaz (odak çalınmaz). Sayaç değil ÖNCEKİ ANAHTAR: StrictMode
 * etkiyi iki kez çalıştırıyor. `sessiz` true iken yapılan değişiklik (ör.
 * sürdürmenin imleci ayarlaması) bir geçiş sayılmaz.
 */
export function useGecisteBasaDon(anahtar: string, hedefId: string, sessiz?: { current: boolean }) {
  const onceki = useRef(anahtar);
  useEffect(() => {
    if (onceki.current === anahtar) return;
    onceki.current = anahtar;
    if (sessiz?.current) {
      sessiz.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    document.getElementById(hedefId)?.focus({ preventScroll: true });
  }, [anahtar, hedefId, sessiz]);
}
