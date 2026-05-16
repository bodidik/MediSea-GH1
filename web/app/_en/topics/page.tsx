// FILE: web/app/en/topics/page.tsx
export const revalidate = 3600; // 1 saat (ISR)

import Link from "next/link";
import navConfig from "@/app/config/nav";

function sectionSlugFromHref(href: string) {
  const parts = String(href || "").split("/").filter(Boolean); // ["sections","nefroloji"]
  if (parts.length >= 2 && parts[0] === "sections") return parts[1];
  return parts[parts.length - 1] || "";
}

// Optional: EN labels for UI
const EN_LABEL: Record<string, string> = {
  romatoloji: "Rheumatology",
  hematoloji: "Hematology",
  endokrinoloji: "Endocrinology",
  nefroloji: "Nephrology",
  gastroenteroloji: "Gastroenterology",
  kardiyoloji: "Cardiology",
  infeksiyon: "Infectious Diseases",
  gogus: "Pulmonology",
  geriatri: "Geriatrics",
  immunoloji: "Allergy & Immunology",
  onkoloji: "Oncology",
};

export default function ENTopicsHome() {
  const seen = new Set<string>();

  const sections = navConfig.sections
    .map((s) => sectionSlugFromHref(s.href))
    .filter((slug) => {
      if (!slug) return false;
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    })
    .map((slug) => ({
      slug,
      title: EN_LABEL[slug] || slug,
    }));

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-2xl font-bold">Topics (EN)</h1>
          <Link href="/en/sections" className="text-sm underline opacity-80 hover:opacity-100">
            Sections →
          </Link>
        </div>
        <p className="opacity-70">Pick a section to browse topics in English.</p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((s) => (
          <Link
            key={s.slug}
            href={`/en/topics/${s.slug}`}
            className="block border rounded-xl p-4 hover:shadow bg-white"
          >
            <div className="font-semibold">{s.title}</div>
            <div className="text-xs opacity-60">/en/topics/{s.slug}</div>
          </Link>
        ))}
      </section>
    </main>
  );
}
