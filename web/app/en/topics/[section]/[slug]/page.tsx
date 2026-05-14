// FILE: web/app/en/topics/[section]/[slug]/page.tsx
export const revalidate = 3600; // ISR: 1 hour

import Link from "next/link";
import { redirect } from "next/navigation";
import { backendBase } from "@/lib/backend";

/* ========= Linkify types & helpers (UpToDate-like) ========= */
type LinkDictItem = {
  title: string;
  slug: string;
  section: string;
  visibility?: "V" | "M" | "P";
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenizeHtml(html: string): string[] {
  return String(html || "").split(/(<[^>]+>)/g).filter(Boolean);
}

function getTagName(tag: string) {
  const m = tag.match(/^<\/?\s*([a-zA-Z0-9:-]+)/);
  return m ? m[1].toLowerCase() : "";
}

function isOpenTag(tag: string) {
  return /^<\s*[a-zA-Z0-9:-]+/.test(tag) && !/^<\s*\//.test(tag);
}

function isCloseTag(tag: string) {
  return /^<\s*\//.test(tag);
}

function normText(s: string) {
  return String(s || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’]/g, "'"); // curly apostrophe
}

function buildWordBoundaryRegex(needle: string) {
  const esc = escapeRegExp(needle);
  return new RegExp(`(^|[^\\p{L}\\p{N}])(${esc})(?=[^\\p{L}\\p{N}]|$)`, "giu");
}

function tierRank(v?: "V" | "M" | "P") {
  if (v === "P") return 3;
  if (v === "M") return 2;
  return 1; // V (default)
}

// For now: Visitor. Later we can bind to cookie/session.
const CURRENT_TIER: "V" | "M" | "P" = "V";

function linkifyHtmlWithDict(opts: {
  html: string;
  dict: LinkDictItem[];
  basePath: "/tr" | "/en";
  currentSlug?: string;
  currentSection?: string;
  pageLinkedKeys?: Set<string>; // page-wide dedupe
  currentTier?: "V" | "M" | "P";
}) {
  const { html, dict, basePath, currentSlug, currentSection, pageLinkedKeys, currentTier } = opts;
  const tier = currentTier || "V";
  const linked = pageLinkedKeys || new Set<string>();

  if (!html || !Array.isArray(dict) || dict.length === 0) return String(html || "");

  const seen = new Set<string>();
  const cleaned = dict
    .filter((x) => x?.title && x?.slug)
    .filter((x) => String(x.slug) !== String(currentSlug || ""))
    .map((x) => {
      const title = String(x.title).trim();
      const slug = String(x.slug).trim();
      const section = String(x.section || currentSection || "").toLowerCase();
      const key = normText(title).toLowerCase();
      const visibility = x.visibility;
      return { title, slug, section, key, visibility };
    })
    .filter((x) => x.title.length >= 4 && x.slug && x.section)
    .filter((x) => {
      if (seen.has(x.key)) return false;
      seen.add(x.key);
      return true;
    })
    .slice(0, 200)
    .sort((a, b) => b.title.length - a.title.length);

  const tokens = tokenizeHtml(html);

  let inAnchor = false;
  const tagStack: string[] = [];
  const blockTags = new Set(["code", "pre", "script", "style", "h1", "h2", "h3", "h4", "h5", "h6"]);
  const out: string[] = [];

  let linksAdded = 0;
  const MAX_LINKS_PER_BLOCK = 25;

  for (const tok of tokens) {
    if (tok.startsWith("<")) {
      const name = getTagName(tok);

      if (name === "a") {
        if (isOpenTag(tok)) inAnchor = true;
        if (isCloseTag(tok)) inAnchor = false;
      }

      if (blockTags.has(name)) {
        if (isOpenTag(tok)) tagStack.push(name);
        if (isCloseTag(tok)) {
          for (let i = tagStack.length - 1; i >= 0; i--) {
            if (tagStack[i] === name) {
              tagStack.splice(i, 1);
              break;
            }
          }
        }
      }

      out.push(tok);
      continue;
    }

    let text = tok;

    if (!text || inAnchor || tagStack.length > 0) {
      out.push(text);
      continue;
    }

    for (const it of cleaned) {
      if (linksAdded >= MAX_LINKS_PER_BLOCK) break;

      const targetVis = it.visibility as ("V" | "M" | "P" | undefined);
      if (tierRank(targetVis) > tierRank(tier)) continue;

      const title = it.title;
      if (!title || title.length < 4) continue;

      // page-wide: same title only once
      if (linked.has(it.key)) continue;

      // skip very generic single short words
      const wcount = title.trim().split(/\s+/).length;
      if (wcount === 1 && title.length < 8) continue;

      const href = `${basePath}/topics/${encodeURIComponent(it.section)}/${encodeURIComponent(it.slug)}`;
      const re = buildWordBoundaryRegex(title);

      if (!re.test(text)) {
        re.lastIndex = 0;
        continue;
      }
      re.lastIndex = 0;

      let didOneInThisToken = false;
      text = text.replace(re, (m, g1, g2) => {
        if (linksAdded >= MAX_LINKS_PER_BLOCK) return m;
        if (didOneInThisToken) return m;
        didOneInThisToken = true;

        linksAdded += 1;
        linked.add(it.key);

        return `${g1}<a class="underline" href="${href}">${g2}</a>`;
      });
    }

    out.push(text);
  }

  return out.join("");
}

/* ========= Topic types ========= */
type SectionBlock = { title: string; html: string; visibility?: "V" | "M" | "P" };
type TopicListItem = { slug: string; title?: string; summary?: string };
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

export default async function Page({
  params,
}: {
  params: { section: string; slug: string };
}) {
  const sectionParam = String(params.section || "").toLowerCase();
  const slug = String(params.slug || "").trim();

  const backend = backendBase();
  const url = new URL(`/api/topics/${encodeURIComponent(slug)}`, backend);
  url.searchParams.set("lang", "EN");
  url.searchParams.set("section", sectionParam);

  let item: TopicItem | null = null;
  try {
    const r = await fetch(url.toString(), { next: { revalidate: 3600 } });
    if (!r.ok) {
      item = null;
    } else {
      const j = await r.json().catch(() => null);
      item = j?.ok && j?.item ? (j.item as TopicItem) : null;
    }
  } catch {
    item = null;
  }

  if (!item) {
    return (
      <main className="mx-auto max-w-3xl p-6 space-y-4">
        <div className="text-sm opacity-70">
          <Link href={`/en/topics/${sectionParam}`} className="underline">
            {sectionParam}
          </Link>{" "}
          / {slug}
        </div>
        <h1 className="text-2xl font-bold">Topic not found</h1>
        <p className="opacity-70">Slug: {slug}</p>
        <div className="text-sm opacity-70">
          <Link className="underline" href={`/en/topics/${sectionParam}`}>
            ← Back to {sectionParam} index
          </Link>
        </div>
      </main>
    );
  }

  // Canonical: if backend returns a different section, redirect to it
  const itemSection = String(item.section || "").toLowerCase();
  if (itemSection && itemSection !== sectionParam) {
    redirect(`/en/topics/${encodeURIComponent(itemSection)}/${encodeURIComponent(item.slug)}`);
  }

  // 2) Link dict: get up to 200 titles from same section (EN)
  let dict: LinkDictItem[] = [];
  try {
    const listUrl = new URL("/api/topics", backend);
    listUrl.searchParams.set("section", itemSection || sectionParam);
    listUrl.searchParams.set("lang", "EN");
    listUrl.searchParams.set("limit", "200");
    listUrl.searchParams.set("sort", "title");

    const lr = await fetch(listUrl.toString(), { next: { revalidate: 3600 } });
    const lj = await lr.json().catch(() => null);
    const raw = Array.isArray(lj?.items) ? lj.items : [];

    dict = raw
      .map((x: any) => ({
        title: String(x?.title || "").trim(),
        slug: String(x?.slug || "").trim(),
        section: String(x?.section || itemSection || sectionParam).toLowerCase(),
        visibility: x?.visibility === "P" || x?.visibility === "M" || x?.visibility === "V" ? x.visibility : undefined,
      }))
      .filter((x: any) => x.title && x.slug);
  } catch {
    dict = [];
  }

  // Placeholder list (EN)
  let sectionItems: TopicListItem[] = [];
  try {
    const listUrl = new URL("/api/topics", backend);
    listUrl.searchParams.set("section", itemSection || sectionParam);
    listUrl.searchParams.set("lang", "EN");
    listUrl.searchParams.set("limit", "24");
    listUrl.searchParams.set("sort", "updatedAt");

    const lr = await fetch(listUrl.toString(), { next: { revalidate: 3600 } });
    const lj = await lr.json().catch(() => null);
    const raw = Array.isArray(lj?.items) ? lj.items : [];

    sectionItems = raw
      .map((x: any) => ({
        slug: String(x?.slug || "").trim(),
        title: String(x?.title || "").trim(),
        summary: String(x?.summary || "").trim(),
      }))
      .filter((x: any) => x.slug && x.slug !== item.slug);
  } catch {
    sectionItems = [];
  }
  
  // Similar topics (DB)
  let similar: Array<{ slug: string; title?: string; section?: string }> = [];
  try {
    const simUrl = new URL(`/api/topics/${encodeURIComponent(item.slug)}/similar`, backend);
    simUrl.searchParams.set("limit", "10");
    // İsteğe bağlı: backend destekliyorsa dili gönder
    simUrl.searchParams.set("lang", "EN");
    const sr = await fetch(simUrl.toString(), { next: { revalidate: 3600 } });
    const sj = await sr.json().catch(() => null);
    similar = Array.isArray(sj?.items) ? sj.items : [];
  } catch {
    similar = [];
  }

  // Visibility-filtered blocks for current tier
  const blocksAll = Array.isArray(item.sections) ? item.sections : [];
  const blocks = blocksAll.filter((b) => {
    const vis = (b?.visibility as any) as ("V" | "M" | "P" | undefined);
    return tierRank(vis) <= tierRank(CURRENT_TIER);
  });

  const toc = blocks
    .map((b) => ({ title: b.title, id: anchorize(b.title) }))
    .filter((t) => !!t.id);

  const pageLinkedKeys = new Set<string>();

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="lg:sticky lg:top-6 h-fit border rounded-xl p-4 bg-white">
          <div className="text-sm opacity-70 mb-2">Contents</div>
          <ul className="space-y-1 text-sm">
            {toc.map((t) => (
              <li key={t.id}>
                <a className="underline opacity-80 hover:opacity-100" href={`#${t.id}`}>
                  {t.title}
                </a>
              </li>
            ))}
            {toc.length === 0 ? <li className="opacity-70">No sections.</li> : null}
          </ul>

          <div className="mt-4 text-xs opacity-60">
            <Link className="underline" href={`/en/topics/${itemSection || sectionParam}`}>
              ← {(itemSection || sectionParam) + " index"}
            </Link>
          </div>
        </aside>

        <article className="space-y-6">
          <header className="space-y-2">
            <div className="text-sm opacity-70">
              <Link href={`/en/topics/${itemSection || sectionParam}`} className="underline">
                {itemSection || sectionParam}
              </Link>{" "}
              / {item.slug}
            </div>

            <h1 className="text-3xl font-bold">{item.title}</h1>
            {item.summary ? <p className="opacity-70">{item.summary}</p> : null}
            <p className="text-xs opacity-60">GET {url.toString()}</p>
          </header>

          {blocks.length === 0 ? (
            <section className="border rounded-xl p-5 bg-white space-y-3">
              <h2 className="text-xl font-semibold">Other topics in this section</h2>
              <p className="opacity-70">
                Content may not be available yet for this topic. You can navigate to other topics in the same section below.
              </p>

              {sectionItems.length === 0 ? (
                <p className="text-sm opacity-70">Cannot load list.</p>
              ) : (
                <ul className="list-disc pl-5 space-y-1">
                  {sectionItems.map((t) => (
                    <li key={t.slug}>
                      <Link
                        className="underline"
                        href={`/en/topics/${encodeURIComponent(itemSection || sectionParam)}/${encodeURIComponent(t.slug)}`}
                      >
                        {t.title || t.slug}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="pt-2">
                <Link
                  className="underline text-sm opacity-80 hover:opacity-100"
                  href={`/en/topics/${encodeURIComponent(itemSection || sectionParam)}`}
                >
                  View all {(itemSection || sectionParam) + " topics"} →
                </Link>
              </div>
            </section>
          ) : (
            blocks.map((b, idx) => (
              <section key={idx} id={anchorize(b.title)} className="border rounded-xl p-5 bg-white">
                <h2 className="text-xl font-semibold">{b.title}</h2>
                <div
                  className="prose max-w-none mt-3"
                  dangerouslySetInnerHTML={{
                    __html: linkifyHtmlWithDict({
                      html: b.html || "",
                      dict,
                      basePath: "/en",
                      currentSlug: item.slug,
                      currentSection: itemSection || sectionParam,
                      pageLinkedKeys,
                      currentTier: CURRENT_TIER,
                    }),
                  }}
                />
              </section>
            ))
          )}
	  
          {Array.isArray(item.references) && item.references.length > 0 ? (
            <section className="border rounded-xl p-5 bg-white">
              <h2 className="text-xl font-semibold">References</h2>
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
