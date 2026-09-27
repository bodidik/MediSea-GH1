import aracIndex from "@/content/arac-index.json";
import { aracManifesti } from "@/lib/uygulama-manifest";

/**
 * Bir hesaplayıcının kendi manifesti: `/manifest/arac/<slug>`.
 * Araç sayfasının layout'u bunu bağlıyor (`scripts/arac-metadata.cjs`).
 *
 * Liste `content/arac-index.json`dan — çalışma zamanında `app/tools`
 * okunamıyor (sunucusuz ortamda kaynak dizin yok). Derlemede statik
 * üretilir; indekste olmayan slug 404.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return aracIndex.map((a) => ({ slug: a.slug }));
}

export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const arac = aracIndex.find((a) => a.slug === slug);
  if (!arac) return new Response("Bulunamadı", { status: 404 });
  return new Response(JSON.stringify(aracManifesti(arac)), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  });
}
