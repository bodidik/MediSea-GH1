import Link from "next/link";
import { backendBase } from "@/lib/backend";

type Props = {
  section: string;
  lang?: "tr" | "en";
};

type TopicListItem = {
  slug: string;
  title?: string;
  summary?: string;
};

function titleCaseTR(s: string) {
  return s.charAt(0).toLocaleUpperCase("tr-TR") + s.slice(1);
}

function sectionTitleTR(section: string) {
  const s = section.toLowerCase();
  if (s === "behcet") return "Behçet Hastalığı";
  return titleCaseTR(section);
}

function sectionTitleEN(section: string) {
  const s = section.toLowerCase();
  if (s === "behcet") return "Behçet Disease";
  return section.charAt(0).toUpperCase() + section.slice(1);
}

function pickItems(j: any): any[] {
  return Array.isArray(j?.items)
    ? j.items
    : Array.isArray(j?.list)
    ? j.list
    : Array.isArray(j?.data)
    ? j.data
    : [];
}

export default async function SectionPageView({ section, lang = "tr" }: Props) {
  const s = String(section || "").trim().toLowerCase();
  const base = lang === "en" ? "/en" : "/tr";
  const apiLang = lang === "en" ? "EN" : "TR";

  const title = lang === "en" ? sectionTitleEN(section) : sectionTitleTR(section);

  // DB: section topics preview (ISR)
  const backend = backendBase();
  const url = new URL("/api/topics", backend);
  url.searchParams.set("section", s);
  url.searchParams.set("lang", apiLang);
  url.searchParams.set("limit", "12");
  url.searchParams.set("sort", "-updatedAt");

  let apiOk = true;
  let items: TopicListItem[] = [];

  try {
    const r = await fetch(url.toString(), { next: { revalidate: 3600 } });
    apiOk = r.ok;
    const j = await r.json().catch(() => null);
    const raw = pickItems(j);

    items = raw
      .map((x: any) => ({
        slug: String(x?.slug || "").trim(),
        title: String(x?.title || "").trim(),
        summary: String(x?.summary || "").trim(),
      }))
      .filter((x: any) => !!x.slug);
  } catch {
    apiOk = false;
    items = [];
  }

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <header className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <div className="text-sm opacity-70">
            <Link className="underline" href={`${base}/sections`}>
              {lang === "en" ? "Sections" : "Bölümler"}
            </Link>{" "}
            / {s}
          </div>

          <div className="flex items-center gap-3 text-sm">
            <Link className="underline opacity-80 hover:opacity-100" href={`${base}/topics/${encodeURIComponent(s)}`}>
              {lang === "en" ? "All topics →" : "Tüm konular →"}
            </Link>
          </div>
        </div>

        <h1 className="text-3xl font-bold">{title}</h1>

        <p className="opacity-70">
          {lang === "en"
            ? "This page shows a quick preview of topics in this section."
            : "Bu sayfa bölüm altındaki konuların hızlı bir önizlemesini gösterir."}
        </p>
      </header>

      {/* Behçet özel kürasyon (korunsun) */}
      {s === "behcet" ? (
        <section className="border rounded-xl p-5 bg-white space-y-2">
          <div className="font-semibold">{lang === "en" ? "Quick links" : "Hızlı linkler"}</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <Link className="underline" href={`${base}/topics/romatoloji/behcet`}>
                Romatoloji → Behçet
              </Link>
            </li>
            <li>
              <Link className="underline" href={`${base}/topics/romatoloji/behcet/tromboz`}>
                Behçet ve Tromboz
              </Link>
            </li>
            <li>
              <Link className="underline" href={`${base}/topics/romatoloji/behcet/behcet-disbiyoz`}>
                Behçet ve Mikrobiyota
              </Link>
            </li>
          </ul>
        </section>
      ) : null}

      {/* DB preview */}
      {!apiOk ? (
        <section className="border rounded-xl p-5 bg-white space-y-2">
          <h2 className="text-lg font-semibold">
            {lang === "en" ? "Cannot load preview" : "Önizleme yüklenemedi"}
          </h2>
          <p className="opacity-70">
            {lang === "en" ? "Check backend availability." : "Backend erişimini kontrol edin."}
          </p>
          <div className="text-xs opacity-60">GET {url.toString()}</div>
        </section>
      ) : items.length === 0 ? (
        <section className="border rounded-xl p-5 bg-white space-y-2">
          <h2 className="text-lg font-semibold">{lang === "en" ? "No content yet" : "Henüz içerik yok"}</h2>
          <p className="opacity-70">
            {lang === "en"
              ? "This section may not have content in this language yet."
              : "Bu bölümde bu dilde içerik henüz olmayabilir."}
          </p>
          <Link className="underline text-sm" href={`${base}/topics/${encodeURIComponent(s)}`}>
            {lang === "en" ? "Go to topic list →" : "Konu listesine git →"}
          </Link>
        </section>
      ) : (
        <section className="space-y-3">
          <div className="text-sm opacity-70">{lang === "en" ? "Latest topics" : "Son eklenen konular"}</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((t) => (
              <Link
                key={t.slug}
                href={`${base}/topics/${encodeURIComponent(s)}/${encodeURIComponent(t.slug)}`}
                className="block border rounded-xl p-4 bg-white hover:shadow-sm transition"
              >
                <div className="font-semibold">{t.title || t.slug}</div>
                {t.summary ? <div className="text-sm opacity-70 mt-2 line-clamp-3">{t.summary}</div> : null}
                <div className="text-xs opacity-50 mt-2">{t.slug}</div>
              </Link>
            ))}
          </div>

          <div className="pt-2">
            <Link className="underline text-sm opacity-80 hover:opacity-100" href={`${base}/topics/${encodeURIComponent(s)}`}>
              {lang === "en" ? "View all topics in this section →" : "Bu bölümdeki tüm konular →"}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
