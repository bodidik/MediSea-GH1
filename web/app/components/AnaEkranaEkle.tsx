"use client";

import React from "react";
import { sozluk } from "@/lib/dil";
import { useDil } from "@/app/components/DilBaglami";
import metin from "@/app/components/ana-ekran.dil.json";

const M = sozluk(metin);

/**
 * "Ana ekrana ekle" düğmesi.
 *
 * İki yol:
 * 1. Tarayıcı kurulumu sunuyorsa (`beforeinstallprompt`) düğme doğrudan
 *    kurulum penceresini açar.
 * 2. Sunmuyorsa düğme o tarayıcının menü yolunu TARİF eder.
 *
 * Bir dönem yalnız (1) vardı ve düğme olay gelmeden hiç çizilmiyordu.
 * Telefonda denendi, düğme bulunamadı: Chrome olayı ancak sayfaya dokunulup
 * ~30 sn kalındıktan sonra atıyor; iOS Safari ve Firefox hiç atmıyor. Yani
 * düğme tam da ilk bakışta YOKTU. Tarif, basınca hiçbir şey yapmayan bir
 * düğme değil — ekleme yolunu gösteren bir düğme.
 *
 * Görünme kuralı: kurulum olayı varsa her cihazda; yoksa yalnız dokunmatik
 * cihazda (masaüstünde tarif gürültü). Uygulama olarak açılmışsa (standalone)
 * hiç çizilmez — zaten ana ekrandan gelinmiş.
 *
 * Olay kök layout'taki satır içi betikle yakalanır (`app/lib/kurulum.ts`) ve
 * yakalandığı andaki MANİFESTE aittir: site sayfasında yakalanan olay bir araç
 * sayfasına taşınırsa ana sayfayı kurardı. Manifest uyuşmazsa tarif yoluna
 * düşülür.
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

type Platform = "android" | "samsung" | "ios" | "diger";

function platformBul(): Platform {
  const ua = navigator.userAgent;
  if (/SamsungBrowser/i.test(ua)) return "samsung";
  // iPadOS 13+ kendini Mac olarak tanıtıyor; dokunma noktası ayırıyor.
  if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
  if (/Android/i.test(ua)) return "android";
  return "diger";
}

function uygulamaIcinde(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

export default function AnaEkranaEkle({
  etiket,
  className,
  tarifClassName,
}: {
  etiket: string;
  className: string;
  /** Tarif paragrafının sınıfı — açık ve koyu zeminde farklı. */
  tarifClassName: string;
}) {
  const t = M(useDil());
  const [istem, setIstem] = React.useState<KurulumOlayi | null>(null);
  /* Sunucuda ve ilk istemci render'ında null: düğme hidrasyondan SONRA
     belirir, sunucu HTML'i cihazdan bağımsız kalır. */
  const [tarifYolu, setTarifYolu] = React.useState<Platform | null>(null);
  const [acik, setAcik] = React.useState(false);
  const tarifId = React.useId();

  React.useEffect(() => {
    const oku = () => setIstem(gecerliIstem());
    oku();
    if (!uygulamaIcinde() && window.matchMedia("(pointer: coarse)").matches) {
      setTarifYolu(platformBul());
    }
    window.addEventListener("kurulum-hazir", oku);
    return () => window.removeEventListener("kurulum-hazir", oku);
  }, []);

  if (!istem && !tarifYolu) return null;

  return (
    <>
      <button
        type="button"
        className={className}
        aria-expanded={istem ? undefined : acik}
        aria-controls={istem ? undefined : tarifId}
        onClick={async () => {
          if (!istem) {
            setAcik((a) => !a);
            return;
          }
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
      {!istem && acik && tarifYolu && (
        <p id={tarifId} className={tarifClassName}>
          {t[tarifYolu]}{" "}
          <button type="button" className="inline-block min-h-[24px] px-1 underline font-bold" onClick={() => setAcik(false)}>
            {t.kapat}
          </button>
        </p>
      )}
    </>
  );
}
