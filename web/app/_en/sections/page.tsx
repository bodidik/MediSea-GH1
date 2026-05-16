// FILE: web/app/en/sections/page.tsx
export const revalidate = 3600;

import Link from "next/link";
import navConfig from "@/app/config/nav";

function trSectionSlugFromHref(href: string) {
  const parts = String(href || "").split("/").filter(Boolean); // ["sections","nefroloji"]
  if (parts.length >= 2 && parts[0] === "sections") return parts[1];
  return parts[parts.length - 1] || "";
}

/**
 * EN section routing is not 1:1 with TR slugs in all cases.
 * This mapping prevents 404 links while keeping navConfig as the single source for ordering.
 */
const EN_SECTIONS: Record<string, { href: string; title: string; note?: string }> = {
  romatoloji: { href: "/en/sections/romatoloji", title: "Rheumatology" },
  hematoloji: { href: "/en/sections/hematoloji", title: "Hematology" },
  endokrinoloji: { href: "/en/sections/endokrinoloji", title: "Endocrinology" },
  nefroloji: { href: "/en/sections/nefroloji", title: "Nephrology" },
  gastroenteroloji: { href: "/en/sections/gastroenteroloji", title: "Gastroenterology" },
  kardiyoloji: { href: "/en/sections/kardiyoloji", title: "Cardiology" },

  // TR navConfig: infeksiyon -> EN route differs
  infeksiyon: { href: "/en/sections/enfeksiyon-hastaliklari", title: "Infectious Diseases" },

  // TR navConfig: gogus -> EN route differs
  gogus: { href: "/en/sections/pulmonoloji", title: "Pulmonology" },

  // TR navConfig: immunoloji -> EN route differs
  immunoloji: { href: "/en/sections/alerji-immunoloji", title: "Allergy & Immunology" },

  // TR navConfig: geriatri -> EN route differs
  geriatri: {
    href: "/en/sections/geriatri-genel-dahiliye",
    title: "Geriatrics & General Medicine",
  },

  // TR navConfig: onkoloji -> EN route differs
  onkoloji: {
    href: "/en/sections/onkoloji-hematolojik-onkoloji",
    title: "Oncology & Hematologic Oncology",
  },

  // EN-only extras (optional, keep at the bottom)
  __extra_icu__: {
    href: "/en/sections/yogun-bakim-acil-dahiliye",
    title: "Critical Care & Emergency Medicine",
    note: "EN-only",
  },
  __extra_palliative__: {
    href: "/en/sections/palyatif-bakim",
    title: "Palliative Care",
    note: "EN-only",
  },
};

export default function EnSectionsIndex() {
  const seen = new Set<string>();

  const fromNav = navConfig.sections
    .map((s) => trSectionSlugFromHref(s.href))
    .filter((slug) => {
      if (!slug) return false;
      if (seen.has(slug)) return false;
      seen.add(slug);
      return true;
    })
    .map((slug) => EN_SECTIONS[slug])
    .filter(Boolean) as { href: string; title: string; note?: string }[];

  // Extras: add only if not already in fromNav
  const existingHrefs = new Set(fromNav.map((x) => x.href));
  const extras = [EN_SECTIONS.__extra_icu__, EN_SECTIONS.__extra_palliative__]
    .filter(Boolean)
    .filter((x) => !existingHrefs.has(x.href)) as { href: string; title: string; note?: string }[];

  const sections = [...fromNav, ...extras];

  return (
    <main className="p-6 md:p-10 max-w-6xl mx-auto space-y-6">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold">Sections</h1>
        <Link href="/en/topics" className="text-sm underline opacity-80 hover:opacity-100">
          Topics →
        </Link>
      </header>

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {sections.map((s) => (
          <li key={s.href} className="rounded-2xl border p-4 bg-white hover:shadow-sm">
            <Link href={s.href} className="text-base font-semibold underline block">
              {s.title}
            </Link>
            <div className="text-xs opacity-60 mt-1">
              Section area{ s.note ? <span className="ml-2 opacity-60">• {s.note}</span> : null}
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
