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
      /* bottom-24 her boyutta: sağ alttaki vurgu rozeti (🖍) belirdiğinde
         mobilde kartın altına giriyordu. Duyarlı bir override (sm:bottom-5)
         denendi ama geliştirme derlemesinde CSS parçalanması yüzünden
         basamaklamada güvenilir kazanmıyor — tek değer hem sağlam hem yeterli. */
      className={`fixed bottom-24 left-5 z-[53] w-[min(310px,calc(100vw-2.5rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl transition-all duration-200 ${
        cikis ? "translate-y-2 opacity-0" : "translate-y-0 opacity-100"
      }`}
    >
      <div className="mb-2.5 flex items-start gap-2">
        <span className="text-base">🖍</span>
        <div className="flex-1">
          <div className="text-[11px] font-black uppercase tracking-tight text-blue-950">
            Bu sayfayı çalışabilirsin
          </div>
        </div>
        <button
          onClick={kapat}
          aria-label="Kapat"
          className="-mt-1 shrink-0 rounded-full px-1.5 py-0.5 text-slate-300 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          ✕
        </button>
      </div>

      <ul className="mb-3 space-y-1.5">
        {[
          ["🖍", "Metni seç", "renkli vurgulama çubuğu çıkar"],
          ["📝", "Sağdaki Not tutamağı", "yazı ve kalemle çizim"],
          ["⚡", "Vurguların", "otomatik tekrar kartına dönüşür"],
        ].map(([ikon, baslik, aciklama]) => (
          <li key={baslik} className="flex items-start gap-2">
            <span className="mt-px shrink-0 text-[11px]">{ikon}</span>
            <span className="text-[11.5px] leading-snug text-slate-500">
              <strong className="font-bold text-slate-700">{baslik}</strong> — {aciklama}
            </span>
          </li>
        ))}
      </ul>

      <button
        onClick={kapat}
        className="w-full rounded-lg bg-blue-950 py-2 text-[10px] font-black uppercase tracking-widest text-white transition-colors hover:bg-blue-900"
      >
        Anladım
      </button>
    </div>
  );
}
