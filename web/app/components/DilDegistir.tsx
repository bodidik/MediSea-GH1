"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { dilSeciminiKaydet, karsiYol, yoldanDil } from "@/lib/dil";

/**
 * Dil değiştirici — her sayfada. Hedef `lib/dil.ts`ten: İngilizce sayfada
 * Türkçesi; Türkçe sayfada çevrildiyse İngilizcesi, değilse İngilizce ana
 * sayfa (İngilizce site kendi içinde kapalı bir ikiz — 27 Eyl kararı).
 * Eski `LangSwitch` kullanıcıyı `/en` önekli ama var olmayan adrese
 * gönderiyordu; burada hedef her zaman VAR olan bir sayfa.
 *
 * Tıklamak AÇIK SEÇİMDİR ve çereze yazılır: otomatik yönlendirme (middleware)
 * bu seçimi her şeyin üstünde tutar — İngilizceye atılmış bir Türk hekim
 * "Türkçe"ye bir kez basınca bir daha yönlendirilmez.
 *
 * Dil adı KENDİ dilinde yazılır ("English", "Türkçe") ve `lang` taşır:
 * Türkçe okuyamayan biri "İngilizce" yazısını tanımaz, ekran okuyucu da
 * "Türkçe"yi İngilizce sesle okur. `kisa` biçimi dar üst menü içindir
 * ("EN"/"TR"); erişilebilir ad yine dilin tam adı.
 */
/* `className` verilirse varsayılanın YERİNE geçer, eklenmez: Tailwind'de
   çakışan iki sınıftan (px-3 / px-3.5) hangisinin kazanacağını sınıf sırası
   değil CSS sırası belirler — birleştirmek öngörülemez görünüm üretir. */
const VARSAYILAN_SINIF =
  "inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-bold text-blue-900 underline-offset-2 hover:underline";

export default function DilDegistir({
  className = VARSAYILAN_SINIF,
  kisa = false,
  onSecim,
}: {
  className?: string;
  kisa?: boolean;
  /** Menü panelini kapatmak gibi çağıranın ek işi. */
  onSecim?: () => void;
}) {
  const yol = usePathname() || "/";
  const hedef = karsiYol(yol);

  const ad = hedef.dil === "en" ? "English" : "Türkçe";
  return (
    <Link
      href={hedef.yol}
      hrefLang={hedef.dil}
      lang={hedef.dil}
      aria-label={kisa ? ad : undefined}
      onClick={() => {
        dilSeciminiKaydet(hedef.dil);
        onSecim?.();
      }}
      className={className}
    >
      {kisa ? hedef.dil.toUpperCase() : ad}
    </Link>
  );
}

/**
 * `<html lang>` gezinmeyle eşitlenir.
 *
 * Kök düzen `lang="tr"` basıyor ve Next'te kök `<html>`i rotaya göre
 * değiştirmenin bedeli ağır: ya bütün sayfalar dinamik olur (`headers()`)
 * ya da 257 araç klasörü dahil tüm ağaç bir rota grubuna taşınır. Onun
 * yerine İngilizce ağaç `app/en/layout.tsx`te içeriğini `lang="en"` taşıyan
 * bir kaba sarar — sunucu HTML'inde doğru, JS'siz okuyucuda da doğru — ve bu
 * bileşen belge düzeyindeki değeri (başlık, tarayıcı çevirisi önerisi)
 * istemcide eşitler.
 */
export function DilEsitle() {
  const yol = usePathname() || "/";
  useEffect(() => {
    document.documentElement.lang = yoldanDil(yol);
  }, [yol]);
  return null;
}
