/**
 * Global klavye kısayollarının odaktaki ögeyi ezmemesi için iki koruma.
 *
 * Neden gerekti: flashcard oynatıcısı `window` üzerinde keydown dinleyip
 * Space ve Enter'da `preventDefault()` çağırıyordu, hedefi hiç kontrol
 * etmeden. Sonuç ölçüldü — "Biliyorum" düğmesine Tab'layıp Enter'a basınca
 * HİÇBİR ŞEY olmuyordu (fareyle tıklayınca sayaç 0'dan 1'e çıkıyor).
 * Yani ücretli yüzeydeki dört düğmenin hiçbiri klavyeyle çalıştırılamıyordu:
 * odaklanılabiliyor ama tetiklenemiyordu.
 *
 * Koruma bilerek DAR tutuldu. Rakam kısayolları (tekrar sayfasındaki 1-4)
 * bir düğmeyi çalıştırmadığı için, düğme odaktayken de çalışmaya devam
 * etmeli; hepsini birden susturmak gereksiz bir gerileme olurdu.
 */

/** Yazı yazılan bir alanda mıyız? Orada HİÇBİR kısayol çalışmamalı. */
export function yaziAlaninda(e: KeyboardEvent): boolean {
  const el = e.target as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  return el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT";
}

/**
 * Bu tuş, odaktaki ögeyi çalıştıran tuş mu?
 *
 * Space ve Enter düğme/bağlantı üzerindeyken tarayıcının kendi işi; kısayol
 * onları yutmamalı. `code === "Space"` de kontrol ediliyor çünkü kimi düzen
 * ve tarayıcılarda `key` boşluk yerine farklı gelebiliyor.
 */
export function odaktakiniCalistirir(e: KeyboardEvent): boolean {
  const calistirmaTusu = e.key === " " || e.key === "Enter" || e.code === "Space";
  if (!calistirmaTusu) return false;
  const el = e.target as HTMLElement | null;
  if (!el) return false;
  if (el.tagName === "BUTTON" || el.tagName === "A" || el.tagName === "SUMMARY") return true;
  return el.getAttribute?.("role") === "button" || el.getAttribute?.("role") === "link";
}

/** İkisini birden: kısayol bu olayda susmalı mı? */
export function kisayolSusmali(e: KeyboardEvent): boolean {
  return yaziAlaninda(e) || odaktakiniCalistirir(e);
}
