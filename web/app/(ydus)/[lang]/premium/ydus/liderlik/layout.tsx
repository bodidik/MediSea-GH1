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
  title: "Liderlik Tablosu — YDUS",
  description: "YDUS hazırlık sıralaması ve rütbeler.",
  alternates: { canonical: "/tr/premium/ydus/liderlik" },
};

export default function Duzen({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
