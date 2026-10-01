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
 * Görünme kuralı: her cihazda (kullanıcı kararı, 30 Eyl: masaüstünde de
 * kısayol önerilsin). Masaüstünde ad "Masaüstüne kısayol ekle" olur, tarif
 * tarayıcıya göre (chrome · edge · safari · firefox). Uygulama olarak
 * açılmışsa (standalone) hiç çizilmez — zaten kısayoldan gelinmiş.
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

type Platform =
  | "android" | "samsung" | "ios" | "diger"
  | "chrome" | "edge" | "safari" | "firefox" | "masaustuDiger";

function platformBul(dokunmatik: boolean): Platform {
  const ua = navigator.userAgent;
  if (dokunmatik) {
    if (/SamsungBrowser/i.test(ua)) return "samsung";
    // iPadOS 13+ kendini Mac olarak tanıtıyor; dokunma noktası ayırıyor.
    if (/iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)) return "ios";
    if (/Android/i.test(ua)) return "android";
    return "diger";
  }
  // Sıra önemli: Edge ve Opera "Chrome" dizesini de taşıyor.
  if (/Edg\//.test(ua)) return "edge";
  if (/Firefox\//.test(ua)) return "firefox";
  if (/Chrome\/|Chromium\//.test(ua)) return "chrome";
  if (/Macintosh/.test(ua) && /Safari\//.test(ua)) return "safari";
  return "masaustuDiger";
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
  ikon = false,
  masaustuEtiket,
}: {
  etiket: string;
  /** Masaüstünde gösterilecek ad; verilmezse sözlükteki genel ad. */
  masaustuEtiket?: string;
  className: string;
  /** Tarif paragrafının sınıfı — açık ve koyu zeminde farklı. */
  tarifClassName: string;
  /** Yalnız simge çizilir, etiket erişilebilir ad olur (dar başlık şeridi). */
  ikon?: boolean;
}) {
  const t = M(useDil());
  const [istem, setIstem] = React.useState<KurulumOlayi | null>(null);
  /* Sunucuda ve ilk istemci render'ında null: düğme hidrasyondan SONRA
     belirir, sunucu HTML'i cihazdan bağımsız kalır. */
  const [tarifYolu, setTarifYolu] = React.useState<Platform | null>(null);
  const [acik, setAcik] = React.useState(false);
  const [masaustu, setMasaustu] = React.useState(false);
  const tarifId = React.useId();
  /* Masaüstünde "ana ekran" yok — aynı düğme masaüstü kısayolu önerir. */
  const ad = masaustu ? (masaustuEtiket ?? t.masaustu) : etiket;

  React.useEffect(() => {
    const oku = () => setIstem(gecerliIstem());
    oku();
    if (!uygulamaIcinde()) {
      const dokunmatik = window.matchMedia("(pointer: coarse)").matches;
      setMasaustu(!dokunmatik);
      setTarifYolu(platformBul(dokunmatik));
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
        aria-label={ikon ? ad : undefined}
        title={ikon ? ad : undefined}
        aria-expanded={istem ? undefined : acik}
        /* Tarif KOŞULLU çiziliyor; kapalıyken var olmayan kimliği gösterme. */
        aria-controls={!istem && acik ? tarifId : undefined}
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
        {ikon ? null : " " + ad}
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
