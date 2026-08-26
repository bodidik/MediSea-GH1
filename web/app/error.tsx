"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * KÖK HATA SINIRI — bundan önce yoktu.
 *
 * Ölçüldü: depoda üç `error.tsx` vardı ve üçü de `(site)` altındaki tek tek
 * sayfalarda (`calisma-alanim`, `tekrar`, `guidelines`). Kökte hiçbiri
 * olmadığı için ana sayfa, konu sayfaları, 114 araç ve bütün premium
 * yüzeyler bir çalışma zamanı hatasında Next'in VARSAYILAN ekranına
 * düşüyordu: İngilizce, markasız ve çıkış bağlantısı olmayan bir sayfa.
 *
 * Bu depodaki hata metni kuralı üç maddeydi ve varsayılan ekran üçünü de
 * çiğniyor. Buradaki karşılıkları:
 *
 * 1. Sistem iç adı geçmiyor. `error.message` ve `digest` KULLANICIYA
 *    BASILMIYOR; ikisi de `console.error`a gidiyor. Yığın izi, dosya yolu
 *    ya da hata kodu okuyanın işine yaramaz, yalnızca korkutur.
 * 2. Kullanıcı suçlanmıyor — hata bizim tarafımızda ve cümle öyle kuruluyor.
 * 3. Çıkış yolu var: yeniden dene, ana sayfa, kütüphane.
 *
 * `app/layout.tsx`in KENDİSİ hata verirse bu sınır devreye girmez; onun
 * karşılığı `app/global-error.tsx`.
 */
export default function KokHata({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Teknik ayrıntı bakım içindir, kullanıcı arayüzü için değil.
    console.error("[kök hata sınırı]", error?.message, error?.digest);
  }, [error]);

  return (
    /**
     * <main>: bu sınır KÖK düzeyinde, yani AppShell'in `<main id="icerik">`
     * sarmalayıcısının ÜSTÜNDE devreye giriyor ve onu değiştiriyor.
     * Ölçüldü (üretim derlemesi + gerçek fırlatan rota): hata ekranında
     * main 0 · nav 0 · header 0 · h1 0 idi — sayfada tek bir landmark ve
     * tek bir üst başlık yoktu.
     *
     * Bölüm sınırları (calisma-alanim, tekrar, guidelines) AppShell'in
     * İÇİNDE çiziliyor; onlara <main> EKLENMEDİ, yoksa belgede kayıtlı
     * "çift main landmark" kusuru oluşurdu.
     */
    <main className="min-h-screen bg-[#F8F9FC] px-4 py-8 font-sans sm:px-6">
      <div className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-10 text-center sm:p-14">
        <div className="mb-3 text-4xl" aria-hidden="true">
          ⚓
        </div>
        <h1 className="mb-2 text-lg font-black uppercase italic tracking-tight text-blue-950">
          Bu sayfa açılamadı
        </h1>
        <p className="mx-auto mb-6 max-w-md text-sm leading-relaxed text-slate-600">
          Bizim tarafımızda bir aksaklık oldu. Çalışman ve notların yerinde
          duruyor — bu sayfayı yeniden denemen yeterli.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={reset}
            className="rounded-full bg-blue-950 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-900 active:scale-95"
          >
            Tekrar dene
          </button>
          <Link
            href="/"
            className="rounded-full border border-slate-200 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all hover:border-blue-300 hover:text-blue-700"
          >
            Ana sayfa
          </Link>
          <Link
            href="/topics"
            className="rounded-full border border-slate-200 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-600 transition-all hover:border-blue-300 hover:text-blue-700"
          >
            Kütüphane
          </Link>
        </div>
      </div>
    </main>
  );
}
