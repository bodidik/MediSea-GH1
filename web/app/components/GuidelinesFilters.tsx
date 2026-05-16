// FILE: web/app/components/GuidelinesFilters.tsx
"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React from "react";

const SECTION_OPTIONS = [
  "",
  "romatoloji",
  "nefroloji",
  "gastroenteroloji",
  "hematoloji",
  "endokrinoloji",
  "kardiyoloji",
  "infeksiyon",
  "göğüs",
];

function buildQuery(base: URLSearchParams, patch: Record<string, string | number>) {
  const sp = new URLSearchParams(base.toString());
  Object.entries(patch).forEach(([k, v]) => {
    const val = String(v ?? "");
    if (val) sp.set(k, val);
    else sp.delete(k);
  });
  return sp.toString();
}

export default function GuidelinesFilters({
  lang,
  section,
  q,
  total,
}: {
  lang: string;
  section: string;
  q: string;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [qLocal, setQLocal] = React.useState(q);
  const [isPending, startTransition] = React.useTransition();

  React.useEffect(() => setQLocal(q), [q]);

  // debounce arama (Orijinal mantık KORUNDU)
  React.useEffect(() => {
    const id = setTimeout(() => {
      if (qLocal !== q) {
        const qs = buildQuery(searchParams, { q: qLocal });
        startTransition(() => router.push(`${pathname}?${qs}`));
      }
    }, 350);
    return () => clearTimeout(id);
  }, [qLocal]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <form
      className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 grid grid-cols-1 md:grid-cols-5 gap-4 shadow-lg backdrop-blur-sm"
      onSubmit={(e) => {
        e.preventDefault();
        const qs = buildQuery(searchParams, { q: qLocal });
        router.push(`${pathname}?${qs}`);
      }}
    >
      <select
        name="lang"
        defaultValue={lang}
        className="px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-900/50 text-slate-200 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors appearance-none [&>option]:bg-slate-800"
        aria-label="Dil"
        onChange={(e) => {
          const qs = buildQuery(searchParams, { lang: e.target.value });
          router.push(`${pathname}?${qs}`);
        }}
      >
        <option value="TR">TR</option>
        <option value="EN">EN</option>
      </select>

      <select
        name="section"
        defaultValue={section}
        className="px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-900/50 text-slate-200 text-sm md:col-span-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors appearance-none capitalize [&>option]:bg-slate-800"
        aria-label="Bölüm"
        onChange={(e) => {
          const qs = buildQuery(searchParams, { section: e.target.value });
          router.push(`${pathname}?${qs}`);
        }}
      >
        {SECTION_OPTIONS.map((s) => (
          <option key={s || "all"} value={s}>
            {s ? s : "Bölüm: Hepsi"}
          </option>
        ))}
      </select>

      <input
        name="q"
        value={qLocal}
        onChange={(e) => setQLocal(e.target.value)}
        placeholder="Ara: KDIGO, EULAR, ESC, ADA…"
        className="px-4 py-2.5 rounded-xl border border-slate-600 bg-slate-900/50 text-slate-200 text-sm md:col-span-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors placeholder:text-slate-500"
        aria-label="Arama"
      />

      <div className="md:col-span-5 flex items-center gap-4 pt-2 mt-2 border-t border-slate-700/50">
        <button 
          className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors shadow-lg shadow-blue-900/20 disabled:opacity-50" 
          type="submit" 
          disabled={isPending}
        >
          {isPending ? "Uygulanıyor..." : "Uygula"}
        </button>
        <button
          type="button"
          className="text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          onClick={() => {
            setQLocal("");
            const qs = new URLSearchParams();
            qs.set("lang", lang || "TR");
            router.push(`${pathname}?${qs.toString()}`);
          }}
        >
          Sıfırla
        </button>
        <div className="ml-auto flex items-center gap-3 text-xs font-medium text-slate-400">
          <span>{typeof total === "number" ? `Toplam ${total} kayıt` : ""}</span>
          <span className={`text-blue-400 ${isPending ? "animate-pulse" : ""}`}>
            {isPending ? "Filtreleniyor…" : ""}
          </span>
        </div>
      </div>
    </form>
  );
}