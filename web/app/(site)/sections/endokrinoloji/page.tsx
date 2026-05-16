export const revalidate = 0;
export const dynamic = "force-dynamic";

import Link from "next/link";
import fs from "fs";
import path from "path";

type Item = { slug: string; title: string; href: string };

// İsteğe bağlı manuel kürasyon (doldurursan sadece buradakiler listelenir)
const curated: Array<{ slug: string; title?: string }> = [
  // Ör: { slug: "behcet-sendromu", title: "Behçet Sendromu" },
];

const BASE = "/topics/endokrinoloji/";
const UPPER = new Set(["sle","ra","aps","igg4","kbh","aki","mgüs","gis","ibd","ibs","hp","tsh","t3","t4","men","ppgl","dm","dka","hhs"]);

function toTitleTR(slug: string) {
  let t = slug.replace(/-/g, " ");
  t = t.replace(/\p{L}[\p{L}\p{Mn}\p{Nd}]*/gu, (w) => {
    const lw = w.toLocaleLowerCase("tr-TR");
    if (UPPER.has(lw)) return w.toUpperCase();
    return w[0].toLocaleUpperCase("tr-TR") + w.slice(1);
  });
  return t;
}

async function getItems(): Promise<Item[]> {
  if (curated.length > 0) {
    return curated.map(c => ({
      slug: c.slug,
      title: c.title ?? toTitleTR(c.slug),
      href: BASE + c.slug
    }));
  }
  const dir = path.join(process.cwd(), "app", "topics", "endokrinoloji");
  let entries: string[] = [];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => d.name)
      .filter(slug => fs.existsSync(path.join(dir, slug, "page.tsx")));
  } catch { entries = []; }
  const items = entries.map(slug => ({ slug, title: toTitleTR(slug), href: BASE + slug }));
  items.sort((a,b)=>a.title.localeCompare(b.title,"tr"));
  return items;
}

export default async function Page() {
  const title = "endokrinoloji"[0].toLocaleUpperCase("tr-TR") + "endokrinoloji".slice(1);
  const items = await getItems();

  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">{title}</h1>
      <p className="opacity-70 mb-6">
        Aşağıda endokrinoloji konu başlıkları listelenmiştir. İsterseniz sayfanın en üstündeki
        <span className="px-1 font-mono">curated</span> dizisini doldurarak manuel sıralama/adlandırma yapabilirsiniz.
      </p>

      {items.length === 0 ? (
        <p className="opacity-70">Konu bulunamadı. (Henüz dizinler oluşturulmamış olabilir.)</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map(it => (
            <Link key={it.slug} href={it.href} className="block border rounded-xl p-4 hover:shadow focus:outline-none focus:ring">
              <div className="font-semibold">{it.title}</div>
              <div className="text-xs opacity-60">{it.slug}</div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}


