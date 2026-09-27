import type { ReactNode } from "react";
import KaydirDurumu from "@/app/components/KaydirDurumu";

/**
 * İngilizce araç kabuğu — `app/tools/layout.tsx`in karşılığı.
 *
 * `/en/tools/*` Türkçe araç ağacının DIŞINDA olduğu için oradaki JS'siz
 * uyarı şeridi buraya miras gelmiyor; burada İngilizce kuruluyor. Üst şerit,
 * `<main>` ve altbilgi bütün İngilizce site için `app/en/layout.tsx`te.
 */
export default function IngilizceAracDuzen({ children }: { children: ReactNode }) {
  return (
    <>
      <KaydirDurumu />
      <noscript>
        <div className="mx-auto max-w-3xl px-4 pt-6">
          <div className="rounded-2xl border-2 border-amber-600 bg-amber-50 p-5 text-blue-950">
            <p className="text-sm font-black uppercase tracking-widest text-amber-800">
              Calculation is not working right now
            </p>
            <p className="mt-2 text-sm font-bold leading-relaxed">
              The calculations on this page run in your browser; because JavaScript is
              disabled or failed to load, the values you enter will not change the result.
              If you see a result on screen, it belongs to the STARTING values — not yours.
            </p>
          </div>
        </div>
      </noscript>
      {children}
    </>
  );
}
