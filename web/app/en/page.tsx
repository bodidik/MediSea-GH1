// FILE: web/app/en/page.tsx
export const revalidate = 900; // 15 dk (ISR)

import Link from "next/link";
import navConfig from "@/app/config/nav";

// EN section whitelist / mapping (TR slug -> EN route + title)
const EN_SECTIONS: Record<string, { href: string; title: string }> = {
  romatoloji: { href: "/en/sections/romatoloji", title: "Rheumatology" },
  hematoloji: { href: "/en/sections/hematoloji", title: "Hematology" },
  endokrinoloji: { href: "/en/sections/endokrinoloji", title: "Endocrinology" },
  nefroloji: { href: "/en/sections/nefroloji", title: "Nephrology" },
  gastroenteroloji: { href: "/en/sections/gastroenteroloji", title: "Gastroenterology" },
  kardiyoloji: { href: "/en/sections/kardiyoloji", title: "Cardiology" },

  // TR navConfig'de "infeksiyon" var; EN'de route farklı
  infeksiyon: { href: "/en/sections/enfeksiyon-hastaliklari", title: "Infectious Diseases" },

  // TR navConfig'de "onkoloji" var; EN'de route farklı
  onkoloji: { href: "/en/sections/onkoloji-hematolojik-onkoloji", title: "Oncology & Hematologic Oncology" },

  // TR navConfig'de "gogus" var; EN'de pulmonoloji
  gogus: { href: "/en/sections/pulmonoloji", title: "Pulmonology" },

  // TR navConfig'de "immunoloji" var; EN'de allergy & immunology
  immunoloji: { href: "/en/sections/alerji-immunoloji", title: "Allergy & Immunology" },

  // TR navConfig'de "geriatri" var; EN'de geriatrics & general medicine
  geriatri: { href: "/en/sections/geriatri-genel-dahiliye", title: "Geriatrics & General Medicine" },

  // EN'e özel ekler
  __extra_icu__: { href: "/en/sections/yogun-bakim-acil-dahiliye", title: "Critical Care & Emergency Medicine" },
  __extra_palliative__: { href: "/en/sections/palyatif-bakim", title: "Palliative Care" },
};

function sectionSlugFromHref(href: string) {
  const parts = String(href || "").split("/").filter(Boolean);
  const idx = parts.indexOf("sections");
  if (idx >= 0 && parts[idx + 1]) return parts[idx + 1];
  return parts[parts.length - 1] || "";
}

export default function Page() {
  // navConfig sırasını koru; sadece EN_SECTIONS'da olanlar
  const fromNav = navConfig.sections
    .map((s) => sectionSlugFromHref(s.href))
    .map((slug) => EN_SECTIONS[slug])
    .filter(Boolean) as { href: string; title: string }[];

  // EN'e özel ekler
  const extras = [EN_SECTIONS.__extra_icu__, EN_SECTIONS.__extra_palliative__].filter(Boolean) as {
    href: string;
    title: string;
  }[];

  const sections = [...fromNav, ...extras];

  // dedupe by href (in case of repeated entries)
  const seen = new Set<string>();
  const uniqueSections = sections.filter((x) => (seen.has(x.href) ? false : (seen.add(x.href), true)));


  return (
    <main className="max-w-6xl mx-auto p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">MediSea — Internal Medicine (EN)</h1>
        <p className="opacity-70">Pick a section to browse its topics in English.</p>
        <div className="text-sm">
          <Link href="/en/sections" className="underline opacity-80 hover:opacity-100">
            Sections index →
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {uniqueSections.map((it) => (
          <Link key={it.href} href={it.href} className="block border rounded-xl p-4 hover:shadow bg-white">
            <div className="font-semibold">{it.title}</div>
            <div className="text-xs opacity-60">{it.href}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
