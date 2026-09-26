import type { Metadata } from "next";
import { rotaMeta } from "@/lib/site";
import { EnAracListesi, enAraclar } from "@/lib/en-arac";

/**
 * İngilizce araç dizini — Türkçe `/tools`un karşılığı. Liste dil indeksinden
 * türüyor (bkz. lib/en-arac.tsx → enAraclar); künyesi yoksa derleme düşer.
 */
export function generateMetadata(): Metadata {
  const n = enAraclar().length;
  return rotaMeta({
    baslik: "Clinical Calculators",
    aciklama: `${n} free clinical calculators and scores for internal medicine. No sign-up required.`,
    yol: "/tools",
    dil: "en",
  });
}

export default function IngilizceAracDizini() {
  const n = enAraclar().length;
  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="border-b-2 border-blue-900/10 pb-6">
          <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
            Clinical Calculators
          </h1>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
            {`${n} scores for internal medicine, in English. Free, no sign-up.`}
          </p>
        </div>
        <EnAracListesi />
      </div>
    </div>
  );
}
