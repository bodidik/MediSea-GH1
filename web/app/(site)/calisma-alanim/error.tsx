"use client";

import Link from "next/link";

export default function StudyWorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const temizle = () => {
    if (
      !confirm(
        "Bozuk veriyi temizlemeyi deneyecek. Devam edilsin mi?\n\n" +
          "(Yedek aldıysan geri yükleyebilirsin.)"
      )
    )
      return;

    try {
      const silinecek: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k?.startsWith("medisea:")) continue;
        try {
          const v = localStorage.getItem(k);
          if (v) JSON.parse(v);
        } catch {
          silinecek.push(k);
        }
      }
      silinecek.forEach((k) => localStorage.removeItem(k));
      reset();
    } catch {
      // localStorage erişimi de çökerse yapılacak bir şey yok
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] px-4 py-8 font-sans sm:px-6">
      <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-white p-10 text-center sm:p-14">
        <div className="mb-3 text-4xl">⚠️</div>
        <h2 className="mb-2 text-lg font-black uppercase italic tracking-tight text-blue-950">
          Çalışma verileri yüklenemedi
        </h2>
        <p className="mx-auto mb-2 max-w-md text-sm leading-relaxed text-slate-500">
          Tarayıcıdaki kayıtlı veriler bozulmuş olabilir. Yedek aldıysan endişelenme
          — temizleyip geri yükleyebilirsin.
        </p>
        <p className="mx-auto mb-6 max-w-md rounded-lg bg-rose-50 px-3 py-2 font-mono text-[11px] text-rose-600">
          {error.message}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button
            onClick={reset}
            className="rounded-full bg-blue-950 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-900 active:scale-95"
          >
            Tekrar dene
          </button>
          <button
            onClick={temizle}
            className="rounded-full border border-rose-300 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-rose-600 transition-all hover:bg-rose-50 active:scale-95"
          >
            Bozuk veriyi temizle
          </button>
          <Link
            href="/topics"
            className="rounded-full border border-slate-200 px-6 py-2.5 text-[11px] font-black uppercase tracking-widest text-slate-500 transition-all hover:border-blue-300 hover:text-blue-600"
          >
            Kütüphaneye git
          </Link>
        </div>
      </div>
    </div>
  );
}
