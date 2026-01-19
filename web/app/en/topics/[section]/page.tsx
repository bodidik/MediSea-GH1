// FILE: web/app/en/topics/[section]/page.tsx
export const revalidate = 3600;
export const dynamic = "force-dynamic";

import Link from "next/link";
import { headers } from "next/headers";

function getOrigin() {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

type TopicListItem = {
  slug: string;
  title?: string;
  section?: string;
  summary?: string;
  updatedAt?: string;
};

function safeArrayFromApi(j: any): TopicListItem[] {
  const candidates = [
    j?.items,
    j?.list,
    j?.data,
    j?.rows,
    j?.result,
    j?.topics,
    j?.payload?.items,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c as TopicListItem[];
  return [];
}

export default async function ENTopicsSectionPage({
  params,
}: {
  params: { section: string };
}) {
  const section = decodeURIComponent(params.section || "").toLowerCase().trim();

  const origin = getOrigin();
  const url = new URL("/api/topics", origin);

  url.searchParams.set("section", section);
  url.searchParams.set("lang", "en");
  url.searchParams.set("limit", "200");

  let items: TopicListItem[] = [];
  let apiOk = true;

  try {
    const r = await fetch(url.toString(), { next: { revalidate: 3600 } });
    const j = await r.json();
    apiOk = r.ok;
    items = safeArrayFromApi(j);
  } catch {
    apiOk = false;
    items = [];
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="space-y-2">
        <div className="text-sm opacity-70">
          <Link className="underline" href="/en/topics">
            Topics
          </Link>{" "}
          / {section}
        </div>
        <h1 className="text-2xl font-bold">{section}</h1>
        <p className="opacity-70">English topics in this section</p>
      </header>

      {!apiOk ? (
        <section className="border rounded-xl p-5 bg-white">
          <h2 className="text-lg font-semibold">Cannot load list</h2>
          <p className="opacity-70 mt-2">Check backend/proxy availability.</p>
          <div className="text-xs opacity-60 mt-2">GET {url.pathname}?{url.searchParams.toString()}</div>
        </section>
      ) : items.length === 0 ? (
        <section className="border rounded-xl p-5 bg-white">
          <h2 className="text-lg font-semibold">No content yet</h2>
          <p className="opacity-70 mt-2">This section may not have English topics yet.</p>
        </section>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {items.map((t) => (
            <li key={t.slug} className="rounded-2xl border p-4 bg-white hover:shadow-sm">
              <Link className="underline font-semibold block" href={`/en/topics/${section}/${t.slug}`}>
                {t.title || t.slug}
              </Link>
              {t.summary ? <div className="text-sm opacity-70 mt-1">{t.summary}</div> : null}
              <div className="text-xs opacity-60 mt-2">/en/topics/{section}/{t.slug}</div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
