export const revalidate = 0;
export const dynamic = "force-dynamic";

import Link from "next/link";
import fs from "fs";
import path from "path";

type Item = { slug: string; title: string; href: string };

function toTitle(slug: string){
  return slug.replace(/-/g," ").replace(/\p{L}[\p{L}\p{Mn}\p{Nd}]*/gu, w => w[0].toUpperCase()+w.slice(1));
}

async function getItems(): Promise<Item[]> {
  const dir = path.join(process.cwd(), "app", "topics", "romatoloji");
  let entries: string[] = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .filter(slug => fs.existsSync(path.join(dir, slug, "page.tsx")));
  } catch { entries = []; }
  const sectionEn = 'rheumatology';
  const items = entries.map(slug => ({ slug, title: toTitle(slug), href: `/en/topics/${sectionEn}/${slug}` }));
  items.sort((a,b)=>a.title.localeCompare(b.title));
  return items;
}

export default async function Page() {
  const items = await getItems();
  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Rheumatology</h1>
      {items.length===0 ? (
        <p className="opacity-70">No topics found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(it=>(
            <Link key={it.slug} href={it.href} className="block border rounded-xl p-4 hover:shadow">
              <div className="font-semibold">{it.title}</div>
              <div className="text-xs opacity-60">{it.slug}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}


