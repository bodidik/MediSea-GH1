"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { karsiYol, yoldanDil } from "@/lib/dil";

/**
 * Dil değiştirici — YALNIZCA sayfanın öteki dilde bir karşılığı varsa çizilir.
 *
 * Eski `LangSwitch` her sayfada iki düğme gösterip kullanıcıyı `/en` önekli
 * ama var olmayan (ya da içi Türkçe) bir adrese gönderiyordu. Burada hedef
 * `lib/dil.ts`in indeksinden geliyor: çevrilmemiş sayfada bileşen hiçbir şey
 * basmaz.
 *
 * Dil adı KENDİ dilinde yazılır ("English", "Türkçe") ve `lang` taşır:
 * Türkçe okuyamayan biri "İngilizce" yazısını tanımaz, ekran okuyucu da
 * "Türkçe"yi İngilizce sesle okur.
 */
export default function DilDegistir({ className = "" }: { className?: string }) {
  const yol = usePathname() || "/";
  const hedef = karsiYol(yol);
  if (!hedef) return null;

  const ad = hedef.dil === "en" ? "English" : "Türkçe";
  return (
    <Link
      href={hedef.yol}
      hrefLang={hedef.dil}
      lang={hedef.dil}
      className={`inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-bold text-blue-900 underline-offset-2 hover:underline ${className}`}
    >
      {ad}
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
