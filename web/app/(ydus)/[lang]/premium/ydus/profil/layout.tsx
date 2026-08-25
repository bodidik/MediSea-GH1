import type { Metadata } from "next";
import type { ReactNode } from "react";

/**
 * Sayfa `"use client"` olduğu için metadata'yı DIŞA AKTARAMIYOR — bir
 * istemci bileşeninden `metadata` vermek çalışma zamanında 500 üretiyor
 * ve lint/typecheck/build üçü de bunu GÖRMÜYOR (ölçüldü). O yüzden
 * metadata bu ince layout'a konuyor; araç sayfalarındaki kalıbın aynısı.
 *
 * Layout ROTAYA ÖZEL: ortak `[lang]/premium/layout.tsx` `ydus/` altının
 * tamamını sardığı için oraya canonical konsaydı yanlış iddia bütün alt
 * sayfalara yayılırdı.
 */
export const metadata: Metadata = {
  title: "Profil — YDUS",
  description: "YDUS hazırlık ilerlemen: puan, rütbe ve rozetler.",
  alternates: { canonical: "/tr/premium/ydus/profil" },
};

export default function Duzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
