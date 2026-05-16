export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

export default function Page() {
  return (
    <article className="prose prose-neutral max-w-4xl mx-auto p-6">
      <h1>Safra Yollari Ve Safra Kesesi — Pathogenesis</h1>
      <p className="opacity-70">This page is a placeholder. Content will be added soon.</p>
      <hr />
      <p>
        <Link className="underline" href="/topics/gastroenteroloji/safra-yollari-ve-safra-kesesi">← Back to TR topic</Link>
      </p>
    </article>
  );
}


