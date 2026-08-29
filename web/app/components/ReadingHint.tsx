"use client";
// C:\Users\hucig\Medknowledge\web\app\components\ReadingHint.tsx
//
// Okuma sayfalarında BİR KEZ gösterilen tanıtım kartı.
//
// Vurgulama, not defteri ve tekrar destesi çalışıyor ama hiçbiri kendini
// duyurmuyor: metni seçmeden araç çubuğunun varlığı bilinmiyor, tekrar
// sayfası ise ancak vurgu yapıldıktan sonra dolu görünüyor. Bu kart o
// zinciri bir kez anlatıp bir daha görünmüyor.

import { useEffect, useRef, useState } from "react";

const KEY = "medisea:hint:reading:v1";

/**
 * Kartın görünüm penceresinde kaplayabileceği en fazla dikey pay.
 *
 * Sayı ölçümden geldi. Aşağıdaki "şerit" tasarımı kartın YÜKSEKLİĞİNİ
 * genişliğe bırakıyor ve dar ekranda paragraf sütunu daralıp satır sayısı
 * patlıyordu — ölçüldü (canlı, 320px genişlik): paragraf sütunu **105px**,
 * **10 satır**, kart **225px**. Sonuç:
 *
 *   320x256 (%400 yakınlaştırma)  kaplama %81.2  tamamen örtülen odak: 17
 *   320x568 (küçük telefon)       kaplama %39.6  tamamen örtülen odak:  8
 *   375x812                       kaplama %17.7
 *
 * Yani "yalnızca alt kenarı kaplar" iddiası dar ekranda tutmuyordu.
 * Yığılmış yerleşim payı düşürüyor; bu eşik ise kalan uç durumu kapatıyor.
 */
const EN_FAZLA_PAY = 0.35;

export default function ReadingHint() {
  const [goster, setGoster] = useState(false);
  const [cikis, setCikis] = useState(false);
  const kartRef = useRef<HTMLDivElement>(null);
  /** Ölçüm bitene kadar kart görünmez durur — tek kare bile taşkın gösterme. */
  const [olculdu, setOlculdu] = useState(false);
  const [sigmiyor, setSigmiyor] = useState(false);

  useEffect(() => {
    let iptal = false;
    let deneme = 0;

    try {
      if (localStorage.getItem(KEY)) return; // daha önce kapatılmış
    } catch {
      return; // depo yoksa hiç gösterme
    }

    // okuma sayfası mı? içerik basılana kadar birkaç kare bekle
    const bak = () => {
      if (iptal) return;
      if (document.querySelector("[data-readable]")) {
        // sayfa yerleşsin, açılışla yarışmasın
        setTimeout(() => !iptal && setGoster(true), 1200);
        return;
      }
      if (deneme++ < 20) requestAnimationFrame(bak);
    };
    bak();

    return () => {
      iptal = true;
    };
  }, []);

  /* ── Kart bir ŞERİT olarak kalıyor mu? ────────────────────────────────
   *
   * Yükseklik içeriğe ve genişliğe bağlı, yani tahmin edilemez — ÖLÇÜLÜYOR.
   * Payı aşıyorsa kart görünmez oluyor (`visibility: hidden`), böylece odak
   * sırasından ve erişilebilirlik ağacından da düşüyor: ölçümde 320x256'da
   * 17, 320x568'de 8 odak durağı TAMAMEN bu kartın altında kalıyordu
   * (WCAG 2.2 · 2.4.11). Bileşenin kendi kuralı da bu yönde: "tıbbi metnin
   * üstünü kapatmak, bir kullanım ipucunun ödeyebileceğinden pahalı."
   *
   * Kart bu durumda SÖKÜLMÜYOR ve depo anahtarı da YAZILMIYOR: pencere
   * büyüyünce yeniden ölçülüp görünür oluyor, ve kullanıcı ipucu hakkını
   * göremediği bir karta harcamamış oluyor.
   */
  useEffect(() => {
    if (!goster) return;
    const olc = () => {
      const el = kartRef.current;
      if (!el) return;
      const h = el.offsetHeight;
      const tasiyor = h > window.innerHeight * EN_FAZLA_PAY;
      setSigmiyor(tasiyor);
      setOlculdu(true);
      /* Odak alan öge şeridin ALTINA kaymasın: kaydırma kabına şerit kadar
       * dolgu bırakılıyor. Ölçüldü — dolgusuz hâlde 320x568'de dört odak
       * durağı (iki "İleri Okuma" bağı ve iki alt bilgi bağı) tam olarak
       * şeridin altında kalıyordu; tarayıcı onları görünümün ALT kenarına
       * hizalıyor ve şerit tam orada. */
      document.documentElement.style.scrollPaddingBottom = tasiyor ? "" : `${h + 20}px`;
    };
    olc();
    window.addEventListener("resize", olc);
    return () => {
      window.removeEventListener("resize", olc);
      document.documentElement.style.scrollPaddingBottom = "";
    };
  }, [goster]);

  const kapat = () => {
    setCikis(true);
    document.documentElement.style.scrollPaddingBottom = "";
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setTimeout(() => setGoster(false), 200);
  };

  if (!goster) return null;

  return (
    <div
      data-ms-ui
      role="note"
      /**
       * ALT ŞERİT — daha önce sol altta 310×175 px'lik bir karttı.
       *
       * Ölçümde şu görüldü: masaüstünde içerik sütunu neredeyse tüm genişliği
       * kaplıyor, dolayısıyla sol altta sabitlenen kart bir içerik kutusunun
       * TAMAMINI örtüyordu (konu sayfasında "1. Prerenal" kutusu görünmez
       * oluyordu) ve arkada bir şey olduğuna dair hiçbir iz yoktu.
       *
       * Tıbbi metnin üstünü kapatmak, bir kullanım ipucunun ödeyebileceğinden
       * pahalı. Şerit hâlinde yalnızca alt kenarı kaplıyor: öğretici değer
       * duruyor, içerik görünür kalıyor.
       */
      ref={kartRef}
      /* DAR EKRANDA YIĞILIYOR: yatay dizilimde paragraf sütunu 320px'te
       * 105px'e düşüp 10 satıra çıkıyordu (ölçüldü). `sm` ve üstünde
       * yerleşim aynen eski hâli. */
      className={`fixed inset-x-3 bottom-3 z-[53] mx-auto flex max-w-2xl flex-col gap-2 rounded-xl border border-slate-200 bg-white/95 px-4 py-2.5 shadow-2xl backdrop-blur transition-[opacity,transform] duration-200 sm:flex-row sm:items-center sm:gap-3 ${
        !olculdu || sigmiyor ? "invisible pointer-events-none" : ""
      } ${cikis ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"}`}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2 sm:items-center sm:gap-3">
        <span className="shrink-0 text-base">🖍</span>

        {/* 13px: bu, ödeme hattı olan kişisel katmanı tanıtan TEK cümle ve
            ömür boyu bir kez görünüyor. 12px'te telefonda 130 karakterlik bir
            metin için fazla küçüktü. */}
        <p className="min-w-0 flex-1 text-[13px] leading-snug text-slate-600">
          <strong className="font-bold text-slate-800">Bu sayfayı çalışabilirsin:</strong>{" "}
          metni seçince vurgulama çubuğu çıkar, sağdaki tutamaktan not alırsın;
          vurguların tekrar kartına dönüşür.
        </p>
      </div>

      <div className="flex shrink-0 items-center justify-end gap-3">
        <button
          onClick={kapat}
          className="shrink-0 rounded-lg bg-blue-950 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-blue-900"
        >
          Anladım
        </button>

        <button
          onClick={kapat}
          aria-label="Kapat"
          className="shrink-0 rounded-full px-1.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
