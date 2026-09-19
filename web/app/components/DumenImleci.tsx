"use client";

/**
 * Meşgul dümen (19 Eylül 2026, kullanıcı isteği) — tıklanabilir bir ögeye
 * tıklayınca imleçteki dümen bir tur döner; tıklama bir sayfa geçişi
 * başlattıysa geçiş bitene kadar dönmeye devam eder.
 *
 * Neden ayrı bir öge: CSS imleci canlandırılamıyor. Meşgulken gerçek imleç
 * `html.imlec-mesgul` ile gizlenir, aynı resim (`--imlec-dumen`, tek kaynak
 * globals.css) fare konumunda dönen `.imlec-donen` olarak çizilir.
 *
 * Devreye girmediği yerler: dokunmatik (`pointer: fine` değil), hareket
 * azaltma tercihi, klavyeyle yapılan tıklama (fare konumu yok).
 */

import { useEffect, useRef, useState } from "react";

const TEK_TUR_MS = 700;
/* Geçiş hiç başlamazsa (bağlantının kendi işleyicisi engelledi) ya da çok
   uzarsa dönüş burada kesilir; imleç sonsuza dek gizli kalmasın. İlk tavan
   12 sn'ydi ve geliştirme sunucusunun İLK derlemesinde tamamen doldu —
   üretimde geçişler bunun çok altında, 6 sn yeterli pay. */
const GECIS_TAVANI_MS = 6_000;
const TIKLANABILIR = 'a[href], button:not(:disabled), [role="button"], summary, label[for], .cursor-pointer';

export default function DumenImleci() {
  const [mesgul, setMesgul] = useState(false);
  const oge = useRef<HTMLDivElement>(null);
  const konum = useRef({ x: -100, y: -100 });

  // Fare konumu — dönen dümen gerçek imlecin tam yerine otursun.
  // `left/top` ile, `transform` ile DEĞİL: dönüş `rotate` özelliğiyle ve
  // tarayıcı onu `transform`dan SONRA uygular — konum transform'la
  // verilince dümen kendi merkezi yerine ekranın köşesi etrafında dönüp
  // bütün sayfada daire çiziyordu (kullanıcı gördü).
  useEffect(() => {
    const yerlestir = () => {
      const o = oge.current;
      if (!o) return;
      o.style.left = `${konum.current.x - 15}px`;
      o.style.top = `${konum.current.y - 15}px`;
    };
    const hareket = (e: PointerEvent) => {
      konum.current = { x: e.clientX, y: e.clientY };
      yerlestir();
    };
    window.addEventListener("pointermove", hareket, { passive: true });
    return () => window.removeEventListener("pointermove", hareket);
  }, []);

  useEffect(() => {
    if (!mesgul) return;
    const o = oge.current;
    if (o) {
      o.style.left = `${konum.current.x - 15}px`;
      o.style.top = `${konum.current.y - 15}px`;
    }
    document.documentElement.classList.add("imlec-mesgul");
    return () => document.documentElement.classList.remove("imlec-mesgul");
  }, [mesgul]);

  useEffect(() => {
    if (!matchMedia("(pointer: fine)").matches) return;

    let bitis: number | undefined;
    let yoklama: number | undefined;

    const durdur = () => {
      window.clearTimeout(bitis);
      window.clearInterval(yoklama);
      setMesgul(false);
    };

    const tikla = (e: MouseEvent) => {
      if (e.button !== 0 || e.detail === 0) return; // klavye tıklaması
      if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const hedef = (e.target as Element | null)?.closest?.(TIKLANABILIR);
      if (!hedef) return;
      // Konu (okuma) sayfalarında dümen yok — orada ince ok var (globals.css).
      if (document.querySelector("[data-readable]")) return;

      durdur();
      konum.current = { x: e.clientX, y: e.clientY };
      setMesgul(true);
      const baslangic = Date.now();
      const onceki = location.href;

      // Site içi bir sayfaya gidiliyorsa: adres değişene dek dön.
      const a = hedef.closest("a[href]") as HTMLAnchorElement | null;
      const gecis =
        a &&
        !e.defaultPrevented &&
        !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey &&
        (!a.target || a.target === "_self") &&
        !a.hasAttribute("download") &&
        a.origin === location.origin &&
        (a.pathname !== location.pathname || a.search !== location.search);

      if (!gecis) {
        bitis = window.setTimeout(durdur, TEK_TUR_MS);
        return;
      }
      yoklama = window.setInterval(() => {
        const gecen = Date.now() - baslangic;
        if ((location.href !== onceki && gecen >= TEK_TUR_MS) || gecen > GECIS_TAVANI_MS) durdur();
      }, 100);
    };

    // Yakalama evresinde: sayfanın kendi işleyicisi olayı durdursa da görülür.
    document.addEventListener("click", tikla, true);
    // Geri/ileri tuşu ya da sekme değişimi yarım kalan dönüşü sonlandırır.
    window.addEventListener("popstate", durdur);
    window.addEventListener("blur", durdur);
    return () => {
      document.removeEventListener("click", tikla, true);
      window.removeEventListener("popstate", durdur);
      window.removeEventListener("blur", durdur);
      durdur();
    };
  }, []);

  return <div ref={oge} aria-hidden="true" className="imlec-donen" hidden={!mesgul} />;
}
