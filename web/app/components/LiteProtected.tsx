// C:\Users\hucig\Medknowledge\web\app\components\LiteProtected.tsx
"use client";

import React, { useEffect } from "react";

export default function LiteProtected({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId?: string;
}) {
  // Sağ tık, kopyalama ve kesme işlemlerini engelleme (Korsan Kalkanı)
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    document.addEventListener("contextmenu", prevent);
    document.addEventListener("copy", prevent);
    document.addEventListener("cut", prevent);
    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("copy", prevent);
      document.removeEventListener("cut", prevent);
    };
  }, []);

  // Temizlenmiş filigran (watermark) metni
  const mark = `MedKnowledge • ${userId || "guest"} • ${new Date().toLocaleDateString()}`;

  return (
    <div className="relative select-none overflow-hidden rounded-xl">
      {/* Asıl içerik */}
      <div className="relative z-10">{children}</div>

      {/* Şeffaf filigran (watermark) katmanı */}
      <div
        className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center opacity-[0.04] mix-blend-overlay"
        aria-hidden="true"
      >
        {/* Ekranı kaplayan, tekrar eden, açılı filigran deseni */}
        <div className="absolute inset-[-50%] flex flex-wrap items-center justify-center gap-12 rotate-[-30deg]">
          {/* Performansı yormamak adına CSS ile tekrarlı görünüm */}
          {Array.from({ length: 40 }).map((_, i) => (
            <span key={i} className="text-xl font-bold tracking-widest text-slate-100 uppercase whitespace-nowrap">
              {mark}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}