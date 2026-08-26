"use client";

import Link from "next/link";

/**
 * Kılavuz sayfasının hata kartı.
 *
 * Önceden yalnızca bir başlık, "Lütfen tekrar deneyin." ve bir "Tekrar Dene"
 * düğmesi vardı — ÇIKIŞ YOLU YOKTU. Yenileme işe yaramazsa kullanıcı
 * çıkmazda kalıyordu; projenin hata durumu kuralı bunu açıkça yasaklıyor
 * (her hata kartında geri dönülecek bir bağlantı olmalı).
 *
 * Diğer iki ölçüt zaten sağlanıyordu ve korundu: sistem iç adı sızmıyor
 * (hata ayrıntısı `console.error`'a gidiyor, ekrana değil) ve kullanıcı
 * suçlanmıyor.
 */
export default function KilavuzHatasi({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Teknik ayrıntı geliştiriciye; kullanıcıya değil.
  console.error("Kılavuz yüklenemedi:", error);

  return (
    <div className="min-h-screen bg-[#F8F9FC] px-4 py-8 font-sans sm:px-6">
      <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-white p-10 text-center sm:p-14">
        <div aria-hidden="true" className="mb-3 text-4xl">⚠️</div>
        <h1 className="mb-2 text-lg font-black uppercase italic tracking-tight text-blue-950">
          Kılavuz yüklenemedi
        </h1>
        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-slate-500">
          Sayfa açılırken bir sorun çıktı. Sorun bizde — birkaç saniye sonra
          yeniden denemek çoğu zaman yetiyor.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={reset}
            className="rounded-full bg-blue-950 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-900"
          >
            Tekrar dene
          </button>
          <Link
            href="/topics"
            className="rounded-full border border-slate-200 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-blue-900/30 hover:text-blue-900"
          >
            Kütüphane
          </Link>
          <Link
            href="/"
            className="rounded-full border border-slate-200 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-blue-900/30 hover:text-blue-900"
          >
            Ana sayfa
          </Link>
        </div>
      </div>
    </div>
  );
}
