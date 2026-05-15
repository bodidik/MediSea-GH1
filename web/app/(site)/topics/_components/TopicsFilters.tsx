"use client";

import React, { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Props = {
  q?: string;
  sort?: string;
};

export default function TopicsFilters({ q = "", sort = "title_asc" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(q);
  const [sortValue, setSortValue] = useState(sort);

  function applyFilters(nextQ = query, nextSort = sortValue) {
    const params = new URLSearchParams(searchParams.toString());

    if (nextQ.trim()) {
      params.set("q", nextQ.trim());
    } else {
      params.delete("q");
    }

    if (nextSort) {
      params.set("sort", nextSort);
    } else {
      params.delete("sort");
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    applyFilters();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Konu ara..."
        className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-900"
      />

      <select
        value={sortValue}
        onChange={(e) => {
          const v = e.target.value;
          setSortValue(v);
          applyFilters(query, v);
        }}
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-900"
      >
        <option value="title_asc">Başlık A-Z</option>
        <option value="title_desc">Başlık Z-A</option>
        <option value="newest">En yeni</option>
        <option value="oldest">En eski</option>
      </select>

      <button
        type="submit"
        className="rounded-2xl bg-blue-900 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
      >
        Filtrele
      </button>
    </form>
  );
}