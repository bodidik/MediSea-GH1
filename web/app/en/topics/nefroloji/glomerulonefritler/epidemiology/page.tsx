export const revalidate = 0;
export const dynamic = "force-dynamic";
import Link from "next/link";

export default function Page() {
  return (
    <article className="prose prose-neutral max-w-4xl mx-auto p-6">
      <h1>Glomerulonefritler — Epidemiology</h1>
      <p className="opacity-70">This page is a placeholder. Content will be added soon.</p>
      <hr />
      <p>
        <Link className="underline" href="/topics/nefroloji/glomerulonefritler">← Back to TR topic</Link>
      </p>
    </article>
  );
}


