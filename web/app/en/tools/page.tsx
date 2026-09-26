import type { Metadata } from "next";
import Link from "next/link";
import { rotaMeta } from "@/lib/site";
import { cevrilmisSayfalar } from "@/lib/dil";
import { enAracKunye } from "@/lib/en-arac";
import DilDegistir from "@/app/components/DilDegistir";

/**
 * İngilizce araç dizini — Türkçe `/tools`un karşılığı.
 *
 * Liste ELLE yazılmıyor: dil indeksindeki `/tools/<slug>` yolları (yani
 * GERÇEKTEN çevrilmiş araçlar) ve adları `content/arac-en.json`dan. Yeni bir
 * araç çevrildiğinde dizine kendiliğinden girer; künyesi yoksa derleme düşer.
 */
const araclar = () =>
  cevrilmisSayfalar()
    .filter((y) => y.startsWith("/tools/"))
    .map((y) => y.slice("/tools/".length))
    .map((slug) => ({ slug, ...enAracKunye(slug) }))
    .sort((a, b) => a.ad.localeCompare(b.ad, "en"));

export function generateMetadata(): Metadata {
  const n = araclar().length;
  return rotaMeta({
    baslik: "Clinical Calculators",
    aciklama: `${n} free clinical calculators and scores for internal medicine. No sign-up required.`,
    yol: "/tools",
    dil: "en",
  });
}

export default function IngilizceAracDizini() {
  const liste = araclar();
  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">MEDISEA</p>
          <DilDegistir className="inline-flex min-h-[44px] items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-blue-900 shadow-sm hover:border-blue-900/30" />
        </div>
        <div className="border-b-2 border-blue-900/10 pb-6">
          <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">
            Clinical Calculators
          </h1>
          <p className="mt-2 text-sm font-semibold leading-relaxed text-slate-600">
            {`${liste.length} scores for internal medicine, in English. Free, no sign-up.`}
          </p>
        </div>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {liste.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/en/tools/${a.slug}`}
                className="block h-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-blue-900/30"
              >
                <span className="block text-sm font-black text-blue-900">{a.ad}</span>
                <span className="mt-1 block text-xs font-semibold leading-relaxed text-slate-600">{a.aciklama}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
