// FILE: web/app/en/topics/[section]/page.tsx
export const revalidate = 3600;

import Link from "next/link";
import TopicsFilters from "@/app/topics/_components/TopicsFilters";
import { backendBase } from "@/lib/backend";

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

function safeStr(v: any) {
  return typeof v === "string" ? v : "";
}

export default async function ENTopicsSectionPage({
  params,
  searchParams,
}: {
  params: { section: string };
  searchParams?: { q?: string; sort?: string };
}) {
  const q = String(searchParams?.q || "").trim();
  const sort = String(searchParams?.sort || "title_asc").trim();
  const section = decodeURIComponent(params.section || "").toLowerCase().trim();

  const backend = backendBase();
  const url = new URL("/api/topics", backend);

  url.searchParams.set("section", section);
  url.searchParams.set("lang", "EN");
  url.searchParams.set("limit", "200");

  if (q) url.searchParams.set("q", q);

  // UI → backend sort map
  switch (sort) {
    case "title_desc":
      url.searchParams.set("sort", "title_desc");
      break;
    case "updated_desc":
      url.searchParams.set("sort", "updatedAt:desc");
      break;
    case "updated_asc":
      url.searchParams.set("sort", "updatedAt:asc");
      break;
    case "title_asc":
    default:
      url.searchParams.set("sort", "title_asc");
      break;
  }

  let items: TopicListItem[] = [];
  let apiOk = true;

  try {
    const r = await fetch(url.toString(), { next: { revalidate: 3600 } });
    const j = await r.json().catch(() => null);
    apiOk = r.ok;

    const raw = safeArrayFromApi(j);
    items = raw
      .map((x: any) => ({
        slug: safeStr(x?.slug).trim(),
        title: safeStr(x?.title) || safeStr(x?.name),
        section: safeStr(x?.section).toLowerCase(),
        summary: safeStr(x?.summary),
        updatedAt: safeStr(x?.updatedAt),
      }))
      .filter((x) => !!x.slug);
  } catch {
    apiOk = false;
    items = [];
  }

  return (
    <main className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm opacity-70">
            <Link className="underline" href="/en/topics">
              Topics
            </Link>{" "}
            / {section}
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link href="/en/sections" className="underline opacity-80 hover:opacity-100">
              Sections →
            </Link>
          </div>
        </div>

        <h1 className="text-2xl font-bold">{section}</h1>
        <p className="opacity-70">English topics in this section</p>
      </header>

      <form
        className="flex gap-2 items-center"
        action={`/en/topics/${encodeURIComponent(section)}`}
        method="get"
      >
        <TopicsFilters lang="EN" q={q} sort={sort} />
        <button type="submit" className="border rounded-lg px-3 py-2 bg-white hover:shadow-sm">
          Search
        </button>
      </form>

      {!apiOk ? (
        <section className="border rounded-xl p-5 bg-white">
          <h2 className="text-lg font-semibold">Cannot load list</h2>
          <p className="opacity-70 mt-2">Check backend/proxy availability.</p>
          <div className="text-xs opacity-60 mt-2">GET {url.toString()}</div>
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
              <Link
                className="underline font-semibold block"
                href={`/en/topics/${encodeURIComponent(section)}/${encodeURIComponent(t.slug)}`}
              >
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
