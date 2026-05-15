"use client";
// FILE: web/app/guidelines/[slug]/error.tsx
export default function ErrorGuidelineDetail({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Kılavuz yüklenemedi</h1>
      <p className="text-sm text-gray-600 mt-2">Lütfen tekrar deneyin.</p>
      <button onClick={reset} className="mt-4 px-3 py-2 rounded-lg border text-sm">Tekrar Dene</button>
    </div>
  );
}





