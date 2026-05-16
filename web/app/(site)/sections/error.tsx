"use client";
import Link from "next/link";

export default function ErrorSectionsIndex(
  { error, reset }: { error: Error & { digest?: string }; reset: () => void }
) {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-3">
      <h1 className="text-xl font-bold">Bir şeyler ters gitti</h1>
      <p className="text-sm text-gray-600">{error?.message ?? "Beklenmeyen bir hata"}</p>

      <div className="flex items-center gap-3">
        <button
          onClick={() => reset()}
          className="px-3 py-2 rounded bg-gray-900 text-white"
        >
          Tekrar dene
        </button>

        <Link href="/sections" className="px-3 py-2 rounded border">
          Bölümlere dön
        </Link>
      </div>
    </div>
  );
}


