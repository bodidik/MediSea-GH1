"use client";

import { createContext, useContext, type ReactNode } from "react";
import { VARSAYILAN_DIL, type Dil } from "@/lib/dil";

/**
 * Sayfanın dili — istemci bileşenleri için.
 *
 * Varsayılan Türkçe: sağlayıcı YALNIZCA `app/en/layout.tsx`te duruyor, yani
 * 257 aracın ve ortak bileşenlerin Türkçe çıktısı bu bağlamdan etkilenmiyor.
 * İngilizce sayfa, Türkçe aracın AYNI bileşenini bu sağlayıcının içinde
 * çizer; hesap mantığı iki dilde tek kopyadır (iki gerçeklik yok).
 *
 * Dil adresten (`usePathname`) de okunabilirdi; bağlam seçildi çünkü
 * bileşenin dili yerleşimin açık bir beyanı olsun, adres biçimine gizlice
 * bağlı kalmasın.
 */
const DilBaglami = createContext<Dil>(VARSAYILAN_DIL);

export function DilSaglayici({ dil, children }: { dil: Dil; children: ReactNode }) {
  return <DilBaglami.Provider value={dil}>{children}</DilBaglami.Provider>;
}

export function useDil(): Dil {
  return useContext(DilBaglami);
}
