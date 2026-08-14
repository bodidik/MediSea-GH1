"use client";
// C:\Users\hucig\Medknowledge\web\app\components\ReadingHint.tsx
//
// Okuma sayfalarında BİR KEZ gösterilen tanıtım kartı.
//
// Vurgulama, not defteri ve tekrar destesi çalışıyor ama hiçbiri kendini
// duyurmuyor: metni seçmeden araç çubuğunun varlığı bilinmiyor, tekrar
// sayfası ise ancak vurgu yapıldıktan sonra dolu görünüyor. Bu kart o
// zinciri bir kez anlatıp bir daha görünmüyor.

import { useEffect, useState } from "react";

const KEY = "medisea:hint:reading:v1";

export default function ReadingHint() {
  const [goster, setGoster] = useState(false);
  const [cikis, setCikis] = useState(false);

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

  const kapat = () => {
    setCikis(true);
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
      className={`fixed inset-x-3 bottom-3 z-[53] mx-auto flex max-w-2xl items-center gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-2.5 shadow-2xl backdrop-blur transition-all duration-200 ${
        cikis ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <span className="shrink-0 text-base">🖍</span>

      {/* 13px: bu, ödeme hattı olan kişisel katmanı tanıtan TEK cümle ve
          ömür boyu bir kez görünüyor. 12px'te telefonda 130 karakterlik bir
          metin için fazla küçüktü. */}
      <p className="min-w-0 flex-1 text-[13px] leading-snug text-slate-600">
        <strong className="font-bold text-slate-800">Bu sayfayı çalışabilirsin:</strong>{" "}
        metni seçince vurgulama çubuğu çıkar, sağdaki tutamaktan not alırsın;
        vurguların tekrar kartına dönüşür.
      </p>

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
  );
}
