"use client";

import { useEffect, useState } from "react";

/**
 * ROTA ÇİZGİSİ — konu sayfasında okuma ilerlemesi (27 Eylül 2026).
 *
 * Yapışkan başlığın hemen altında, haritadaki rota gibi kesikli ince bir
 * çizgi; okunan kısım dolu çizgiye döner, ucunda küçük bir yelkenli ilerler.
 * Süs ve yön duygusu: `aria-hidden`, tıklamayı almaz, baskıda basılmaz.
 * İlerleme okuma kabından (`[data-readable]`) ölçülür, sayfanın tamamından
 * değil — alttaki kaynaklar ve kenar çubuğu okunacak metin sayılmasın.
 *
 * NEDEN YOKLAMA DA VAR: `BasaDon` ve `KaydirDurumu` ile aynı gerekçe — bu
 * ortamda `scroll` olayı her zaman atılmıyor. Olay dinleniyor (gerçek
 * tarayıcıda anında), 600 ms'lik yoklama garantiyi veriyor; değer
 * değişmediyse React yeniden çizmiyor.
 *
 * Hareket yok, yalnız konum: hareket azaltma tercihinde de aynı çalışır.
 */
export default function RotaCizgisi({ hedef = "[data-readable]" }: { hedef?: string }) {
  const [oran, setOran] = useState(0);

  useEffect(() => {
    let kare = 0;
    const olc = () => {
      kare = 0;
      const el = document.querySelector<HTMLElement>(hedef);
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      // Okuma çizgisi görünümün üçte biri: kabın başı oraya gelince 0,
      // sonu oraya gelince 1.
      const toplam = r.height;
      const gecen = vh * 0.33 - r.top;
      const o = toplam > 0 ? Math.min(1, Math.max(0, gecen / toplam)) : 0;
      setOran(Math.round(o * 400) / 400);
    };
    const iste = () => {
      if (!kare) kare = window.requestAnimationFrame(olc);
    };
    olc();
    const yoklama = window.setInterval(olc, 600);
    window.addEventListener("scroll", iste, { passive: true });
    window.addEventListener("resize", iste);
    return () => {
      window.clearInterval(yoklama);
      if (kare) window.cancelAnimationFrame(kare);
      window.removeEventListener("scroll", iste);
      window.removeEventListener("resize", iste);
    };
  }, [hedef]);

  const yuzde = oran * 100;

  return (
    <div
      aria-hidden="true"
      data-rota-cizgisi
      className="pointer-events-none fixed inset-x-0 top-[65px] z-40 h-4 print:hidden"
    >
      {/* rotanın tamamı — kesikli */}
      <div className="absolute inset-x-0 top-0 h-px bg-[repeating-linear-gradient(90deg,rgba(14,116,144,0.28)_0_6px,transparent_6px_12px)]" />
      {/* okunan kısım */}
      <div className="absolute left-0 top-0 h-[2px] rounded-r bg-sky-600/60" style={{ width: `${yuzde}%` }} />
      {/* rotanın ucundaki yelkenli — kenardan taşmasın diye kendi genişliği kadar geri */}
      <svg
        className="absolute top-[2px] h-3.5 w-4 text-blue-900/70"
        style={{ left: `calc(${yuzde}% - ${(oran * 16).toFixed(1)}px)` }}
        viewBox="0 0 16 14"
        fill="currentColor"
      >
        <path d="M8 1 Q12 5.5 12.5 9.5 H8 Z" />
        <path d="M7 3 Q4.5 6.5 3.5 9.5 H7 Z" fillOpacity="0.6" />
        <path d="M1.5 10.5 H14.5 L12.5 13 H3.5 Z" />
      </svg>
    </div>
  );
}
