// FILE: components/ChildLinks.tsx (veya sizdeki gerçek yol)
import fs from "fs";
import path from "path";
import Link from "next/link";

type Props = {
  /**
   * app/ altındaki subpath:
   * ör: "en/topics/endokrinoloji/endokrin-hastaliklara-yaklasim"
   * Not: "page.tsx" son eki OLMAMALI.
   *
   * Eğer verilmezse, section+slug üzerinden otomatik türetilir.
   */
  appSubPath?: string;

  /**
   * Route bazlı override (opsiyonel):
   * ör: "/en/topics/endokrinoloji/endokrin-hastaliklara-yaklasim"
   * Verilmezse appSubPath'den türetilir.
   */
  baseHref?: string;

  // Otomatik türetme için (EN/TR topics index sayfalarına uygun)
  lang?: "tr" | "en";
  section?: string;
  slug?: string;

  premiumHref?: string;
  premiumLabel?: string;
};

const toTitle = (s: string) =>
  s
    .split("-")
    .map((w) => (w ? w[0].toLocaleUpperCase("tr-TR") + w.slice(1) : ""))
    .join(" ");

function normalizeAppSubPath(p: string) {
  // "en/.../page.tsx" gelirse kırp
  let x = String(p || "").trim().replace(/^\/+|\/+$/g, "");
  if (x.endsWith("/page.tsx")) x = x.slice(0, -"/page.tsx".length);
  if (x.endsWith("/page.mdx")) x = x.slice(0, -"/page.mdx".length);
  return x;
}

function getChildren(appSubPath: string, baseHref: string) {
  const base = path.join(process.cwd(), "app", appSubPath);

  try {
    return fs
      .readdirSync(base, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .filter((child) => {
        const pageTsx = path.join(base, child, "page.tsx");
        const pageMdx = path.join(base, child, "page.mdx");
        return fs.existsSync(pageTsx) || fs.existsSync(pageMdx);
      })
      .map((child) => ({
        slug: child,
        title: toTitle(child),
        href: `${baseHref}/${child}`,
      }))
      .sort((a, b) => a.title.localeCompare(b.title, "tr"));
  } catch {
    return [];
  }
}

function inferFromParams(props: Props) {
  // EN/TR topics index sayfaları için: /{lang}/topics/{section}/{slug}
  const lang = props.lang;
  const section = props.section;
  const slug = props.slug;

  if (!lang || !section || !slug) return null;

  const appSubPath = `${lang}/topics/${section}/${slug}`;
  const baseHref = `/${lang}/topics/${section}/${slug}`;
  return { appSubPath, baseHref };
}

export default function ChildLinks(props: Props) {
  // 1) appSubPath verilmişse onu kullan
  const normalized = props.appSubPath ? normalizeAppSubPath(props.appSubPath) : "";

  // 2) baseHref: verilmişse onu kullan; yoksa appSubPath'den türet
  const baseHrefFromAppSubPath = normalized ? `/${normalized}` : "";

  // 3) appSubPath yoksa paramlardan türet
  const inferred = !normalized ? inferFromParams(props) : null;

  const appSubPath = normalized || inferred?.appSubPath || "";
  const baseHref = props.baseHref || baseHrefFromAppSubPath || inferred?.baseHref || "";

  const items = appSubPath && baseHref ? getChildren(appSubPath, baseHref) : [];

  if (!items.length && !props.premiumHref) return null;

  return (
    <section className="mt-10">
      {items.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-2">Alt Başlıklar</h2>
          <ul className="list-disc pl-5 space-y-1">
            {items.map((x) => (
              <li key={x.slug}>
                <Link href={x.href}>{x.title}</Link>
              </li>
            ))}
          </ul>
        </>
      )}

      {props.premiumHref && (
        <div className="mt-6">
          <Link
            className="inline-flex items-center rounded-2xl px-4 py-2 text-white font-semibold shadow-md transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2"
            href={props.premiumHref}
            style={{ backgroundImage: "linear-gradient(90deg,#7c3aed,#2563eb)" }}
          >
            {props.premiumLabel ?? "Premium"}
            <span className="ml-2">→</span>
          </Link>
        </div>
      )}
    </section>
  );
}
