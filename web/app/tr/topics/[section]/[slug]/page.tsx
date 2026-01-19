// FILE: web/app/tr/topics/[section]/[slug]/page.tsx
export const revalidate = 3600; // 1 saat
export const dynamic = "force-dynamic";

import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

function getOrigin() {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

type SectionBlock = { title: string; html: string; visibility?: "V" | "M" | "P" };
type TopicItem = {
  slug: string;
  title: string;
  section?: string;
  summary?: string;
  sections?: SectionBlock[];
  references?: { label: string; url?: string; year?: number }[];
  updatedAt?: string;
};

function anchorize(s: string) {
  return String(s || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function TopicPage({
  params,
}: {
  params: { section: string; slug: string };
}) {
  const sectionParam = String(params.section || "").toLowerCase();
  const slug = String(params.slug || "").trim();

  const origin = getOrigin();
  const url = new URL(`/api/topics/${encodeURIComponent(slug)}`, origin);

  let item: TopicItem | null = null;

  try {
    const r = await fetch(url.toString(), { next: { revalidate: 3600 } });
    const j = await r.json();
    item = j?.ok && j?.item ? (j.item as TopicItem) : null;
  } catch {
    item = null;
  }

  if (!item) {
    return (
      <main className="mx-auto max-w-3xl p-6 space-y-4">
        <div className="text-sm opacity-70">
          <Link href={`/tr/topics/${sectionParam}`} className="underline">
            {sectionParam}
          </Link>{" "}
          / {slug}
        </div>
        <h1 className="text-2xl font-bold">Konu bulunamadı</h1>
        <p className="opacity-70">Slug: {slug}</p>
      </main>
    );
  }

  // 1) Kanonik URL düzeltmesi: item.section varsa, URL'deki section ile uyumlu olsun
  const itemSection = String(item.section || "").toLowerCase();
  if (itemSection && itemSection !== sectionParam) {
    redirect(`/tr/topics/${encodeURIComponent(itemSection)}/${encodeURIComponent(item.slug)}`);
  }

  const blocks = Array.isArray(item.sections) ? item.sections : [];
  const toc = blocks
    .map((b) => ({ title: b.title, id: anchorize(b.title) }))
    .filter((t) => !!t.id);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Sol: TOC */}
        <aside className="lg:sticky lg:top-6 h-fit border rounded-xl p-4 bg-white">
          <div className="text-sm opacity-70 mb-2">İçindekiler</div>
          <ul className="space-y-1 text-sm">
            {toc.map((t) => (
              <li key={t.id}>
                <a className="underline opacity-80 hover:opacity-100" href={`#${t.id}`}>
                  {t.title}
                </a>
              </li>
            ))}
            {toc.length === 0 ? <li className="opacity-70">Bölüm yok.</li> : null}
          </ul>

          <div className="mt-4 text-xs opacity-60">
            <div>
              <Link className="underline" href={`/tr/topics/${itemSection || sectionParam}`}>
                ← {(itemSection || sectionParam) + " listesi"}
              </Link>
            </div>
          </div>
        </aside>

        {/* Sağ: içerik */}
        <article className="space-y-6">
          <header className="space-y-2">
            <div className="text-sm opacity-70">
              <Link href={`/tr/topics/${itemSection || sectionParam}`} className="underline">
                {itemSection || sectionParam}
              </Link>{" "}
              / {item.slug}
            </div>

            <h1 className="text-3xl font-bold">{item.title}</h1>
            {item.summary ? <p className="opacity-70">{item.summary}</p> : null}
          </header>

          {blocks.length === 0 ? (
            <section className="border rounded-xl p-5 bg-white">
              <h2 className="text-xl font-semibold">Placeholder</h2>
              <p className="opacity-70 mt-2">Bu konu için içerik henüz eklenmemiş olabilir.</p>
            </section>
          ) : (
            blocks.map((b, idx) => (
              <section key={idx} id={anchorize(b.title)} className="border rounded-xl p-5 bg-white">
                <h2 className="text-xl font-semibold">{b.title}</h2>
                <div
                  className="prose max-w-none mt-3"
                  dangerouslySetInnerHTML={{ __html: b.html || "" }}
                />
              </section>
            ))
          )}

          {Array.isArray(item.references) && item.references.length > 0 ? (
            <section className="border rounded-xl p-5 bg-white">
              <h2 className="text-xl font-semibold">Kaynaklar</h2>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {item.references.map((r, i) => (
                  <li key={i} className="text-sm">
                    {r.url ? (
                      <a className="underline" href={r.url} target="_blank" rel="noreferrer">
                        {r.label}
                      </a>
                    ) : (
                      r.label
                    )}
                    {typeof r.year === "number" ? ` (${r.year})` : ""}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </article>
      </div>
    </main>
  );
}
