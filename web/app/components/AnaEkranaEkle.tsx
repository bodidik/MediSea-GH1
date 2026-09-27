"use client";

import React from "react";

/**
 * "Ana ekrana ekle" düğmesi — yalnızca tarayıcı kurulumu GERÇEKTEN
 * sunabildiğinde çizilir (Android Chrome / Samsung Internet / Edge).
 *
 * Tarayıcı kurulabilirliği `beforeinstallprompt` olayıyla bildiriyor; olay
 * sayfa yüklenirken, React daha kurulmadan gelebildiği için kök layout'taki
 * satır içi betik yakalayıp `window.__kurulumIstemi`ne koyuyor (bkz.
 * `app/lib/kurulum.ts`). Olay yoksa (iOS, zaten kurulu, masaüstü Firefox)
 * düğme HİÇ çizilmez — basınca hiçbir şey yapmayan düğme, olmamasından kötü.
 * Menüdeki "Ana ekrana ekle" yolu her durumda açık.
 *
 * Olay, yakalandığı andaki MANİFESTE aittir. Site sayfasında yakalanan olay
 * bir araç sayfasına taşınırsa ana sayfayı kurardı; bu yüzden düğme yalnızca
 * sayfanın şu anki manifesti olayınkiyle aynıysa görünür.
 */
type KurulumOlayi = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

declare global {
  interface Window {
    __kurulumIstemi?: { olay: KurulumOlayi; manifest: string | null } | null;
  }
}

function gecerliIstem(): KurulumOlayi | null {
  const k = window.__kurulumIstemi;
  if (!k) return null;
  const l = document.querySelector('link[rel="manifest"]');
  return l && l.getAttribute("href") === k.manifest ? k.olay : null;
}

export default function AnaEkranaEkle({
  etiket,
  className,
}: {
  etiket: string;
  className: string;
}) {
  const [istem, setIstem] = React.useState<KurulumOlayi | null>(null);

  React.useEffect(() => {
    const oku = () => setIstem(gecerliIstem());
    oku();
    window.addEventListener("kurulum-hazir", oku);
    return () => window.removeEventListener("kurulum-hazir", oku);
  }, []);

  if (!istem) return null;

  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        await istem.prompt();
        await istem.userChoice;
        /* Olay tek kullanımlık; reddedilirse tarayıcı sonra yenisini atar. */
        window.__kurulumIstemi = null;
        setIstem(null);
      }}
    >
      <span aria-hidden="true">📲</span>
      {" " + etiket}
    </button>
  );
}
