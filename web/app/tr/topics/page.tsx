// FILE: web/app/tr/topics/page.tsx
export const revalidate = 3600; // public hub: hafif cache
export const dynamic = "force-dynamic";

import Link from "next/link";
import navConfig from "@/app/config/nav";

function sectionSlugFromHref(href: string) {
  // beklenen: "/sections/nefroloji"
  if (!href) return "";
  const parts = String(href).split("/").filter(Boolean); // ["sections","nefroloji"]
  if (parts.length >= 2 && parts[0] === "sections") return parts[1];
  // fallback: "/nefroloji" gibi bir şey gelirse
  if (parts.length >= 1) return parts[parts.length - 1];
  return "";
}

export default function TRTopicsHome() {
  const seen = new Set<string>();

  const sections = navConfig.sections
    .map((s) => {
      const slug = sectionSlugFromHref(s.href);
      return { slug, title: s.label };
    })
    .filter((s) => {
      if (!s.slug) return false;
      if (seen.has(s.slug)) return false;
      seen.add(s.slug);
      return true;
    });

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Konular (TR)</h1>
          <Link href="/tr/sections" className="text-sm underline opacity-80 hover:opacity-100">
            Bölümler →
          </Link>
        </div>
        <p className="opacity-70">Bölüm seçerek konu anlatımlarına geç.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link
            key={s.slug}
            href={`/tr/topics/${s.slug}`}
            className="block border rounded-xl p-4 hover:shadow bg-white"
          >
            <div className="font-semibold">{s.title}</div>
            <div className="text-xs opacity-60">/tr/topics/{s.slug}</div>
          </Link>
        ))}
      </section>

      <section className="text-sm opacity-70">
        <p>
          Not: İçerik geçiş sürecinde olabilir. Bazı detay sayfaları geçici olarak eski
          yapıya yönlenebilir.
        </p>
      </section>
    </main>
  );
}
