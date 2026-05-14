export const revalidate = 0;
export const dynamic = "force-dynamic";

import Link from "next/link";

export default function Page() {
  return (
    <main className="max-w-3xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Romatoloji Bölümü</h1>
      <p className="opacity-70">
        Bölüm girişi. Ayrıntılı konu dizinine aşağıdan ulaşabilirsiniz.
      </p>
      <div>
        <Link href="/topics/romatoloji" className="underline text-blue-600">
          → Romatoloji — Konu Dizini
        </Link>
      </div>
    </main>
  );
}


