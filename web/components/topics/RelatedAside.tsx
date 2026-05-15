// FILE: web/components/topics/RelatedAside.tsx
type SimilarLite = { slug: string; title: string; section?: string; updatedAt?: string; summary?: string };

export default function RelatedAside({ items = [] as SimilarLite[] }) {
  if (!items.length) return null;
  return (
    <div className="rounded-2xl border p-4 bg-white">
      <h3 className="text-base font-semibold">Benzer Konular</h3>
      <ul className="mt-2 space-y-2">
        {items.map((s) => (
          <li key={s.slug}>
            <a className="underline" href={`/topics/${encodeURIComponent(s.slug)}`}>
              {s.title}
            </a>
            <div className="text-[11px] text-gray-500">
              {(s.section || "-")} · {s.updatedAt ? new Date(s.updatedAt).toLocaleDateString("tr-TR") : ""}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}


