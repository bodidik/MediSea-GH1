// FILE: web/app/sections/page.tsx
export const revalidate = 0;
export const dynamic = "force-dynamic";

import fs from "fs";
import path from "path";
import Link from "next/link";

type Item = { slug: string; title: string; href: string };

const toTitleTR = (slug: string) =>
  slug
    .split("-")
    .map((w) => (w ? w[0].toLocaleUpperCase("tr-TR") + w.slice(1) : w))
    .join(" ");

function getSections(): Item[] {
  const base = path.join(process.cwd(), "app", "sections");
  try {
    const dirs = fs
      .readdirSync(base, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      // internal/system folders:
      .filter((name) => !name.startsWith("_"))
      // dynamic route folder:
      .filter((name) => name !== "[section]")
      // ensure it has page.tsx:
      .filter((name) => fs.existsSync(path.join(base, name, "page.tsx")));

    return dirs
      .map((slug) => ({
        slug,
        title: toTitleTR(slug),
        href: `/tr/sections/${encodeURIComponent(slug)}`,
      }))
      .sort((a, b) => a.title.localeCompare(b.title, "tr"));
  } catch {
    return [];
  }
}

export default function SectionsIndex() {
  const items = getSections();

  return (
    <main className="mx-auto max-w-5xl p-6 space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold">Bölümler</h1>
        <p className="opacity-70">
          Bu sayfalar tıbbi eğitim amaçlıdır. Bazı içerikler AI destekli placeholder olabilir.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="border rounded-xl p-5 bg-white">
          <div className="font-semibold">Bölüm bulunamadı</div>
          <div className="text-sm opacity-70 mt-1">
            app/sections altında section klasörleri ve page.tsx kontrol edilmeli.
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((it) => (
            <Link
              key={it.slug}
              href={it.href}
              className="border rounded-xl p-4 bg-white hover:shadow-sm transition"
            >
              <div className="font-semibold">{it.title}</div>
              <div className="text-sm opacity-70 mt-1">{it.slug}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
