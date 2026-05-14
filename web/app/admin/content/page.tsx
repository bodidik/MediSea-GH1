// FILE: web/app/admin/content/page.tsx
"use client";
import React, { useEffect, useMemo, useState } from "react";
import AddToSRButton from "@/components/AddToSRButton";
import Link from "next/link";

type ContentItem = {
  id: string;
  title: string;
  type: string;     // "topic" | "board" | "case" | "video" | "note"
  section: string;  // Ã¶r. "Nephrology"
  createdAt: string;
};

export default function AdminContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // SeÃ§imler
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const allSelected = useMemo(
    () => items.length > 0 && items.every((x) => selected[x.id]),
    [items, selected]
  );
  const selectedIds = useMemo(
    () => items.filter((x) => selected[x.id]).map((x) => x.id),
    [items, selected]
  );

  // Basit arama/filtre
  const [q, setQ] = useState("");
  const [type, setType] = useState<string>("");     // boÅŸ = hepsi
  const [section, setSection] = useState<string>(""); // boÅŸ = hepsi

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return items.filter((x) => {
      const okQ = !s || x.title.toLowerCase().includes(s) || x.id.includes(s);
      const okT = !type || x.type === type;
      const okS = !section || x.section?.toLowerCase() === section.toLowerCase();
      return okQ && okT && okS;
    });
  }, [items, q, type, section]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        // Kendi admin endpointâ€™in: proxy /api/admin/content (JSON dizi dÃ¶ndÃ¼rÃ¼yor)
        const r = await fetch("/api/admin/content", { signal: ac.signal, cache: "no-store" });
        if (!r.ok) throw new Error("Liste alÄ±namadÄ±");
        const j = (await r.json()) as ContentItem[];
        setItems(j);
      } catch (e: any) {
        setErr(e?.message || "Hata");
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  function toggleOne(id: string) {
    setSelected((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleAll() {
    if (allSelected) {
      // Hepsini kaldÄ±r
      const next: Record<string, boolean> = {};
      setSelected(next);
    } else {
      // Filtrelenen hepsini seÃ§
      const next: Record<string, boolean> = {};
      for (const x of filtered) next[x.id] = true;
      setSelected(next);
    }
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl md:text-3xl font-bold">Admin Â· Ä°Ã§erik Listesi</h1>

        {/* SeÃ§ilenleri toplu SR'ye ekle */}
        <AddToSRButton
          contentIds={selectedIds}
          section={section || undefined}
          type={type || undefined}
          label={`SeÃ§ilenleri SRâ€™ye ekle (${selectedIds.length})`}
          className="px-3 py-2 rounded-lg border text-sm"
        />
      </div>

      {/* Filtreler */}
      <div className="rounded-2xl border p-4 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ara (baÅŸlÄ±k/ID)â€¦"
          className="px-3 py-2 rounded-lg border text-sm"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm"
        >
          <option value="">TÃ¼r: Hepsi</option>
          <option value="topic">topic</option>
          <option value="board">board</option>
          <option value="case">case</option>
          <option value="video">video</option>
          <option value="note">note</option>
        </select>
        <input
          value={section}
          onChange={(e) => setSection(e.target.value)}
          placeholder="BÃ¶lÃ¼m (Ã¶rn: Nephrology)"
          className="px-3 py-2 rounded-lg border text-sm"
        />
        <button
          onClick={() => {
            setQ(""); setType(""); setSection("");
          }}
          className="px-3 py-2 rounded-lg border text-sm"
        >
          SÄ±fÄ±rla
        </button>
      </div>

      {err && <div className="text-sm text-red-500">{err}</div>}

      {loading ? (
        <div className="h-32 bg-gray-100 rounded" />
      ) : (
        <div className="rounded-2xl border overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left px-3 py-2">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                </th>
                <th className="text-left px-3 py-2">ID</th>
                <th className="text-left px-3 py-2">BaÅŸlÄ±k</th>
                <th className="text-left px-3 py-2">TÃ¼r</th>
                <th className="text-left px-3 py-2">BÃ¶lÃ¼m</th>
                <th className="text-left px-3 py-2">Tarih</th>
                <th className="text-left px-3 py-2">SR</th>
		<th className="text-left px-3 py-2">Edit</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((x) => {
                const isSel = !!selected[x.id];
                return (
                  <tr key={x.id} className={`border-b ${isSel ? "bg-gray-50" : ""}`}>
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={isSel}
                        onChange={() => toggleOne(x.id)}
                      />
                    </td>
                    <td className="px-3 py-2 font-mono text-xs">{x.id}</td>
                    <td className="px-3 py-2">{x.title}</td>
                    <td className="px-3 py-2">{x.type}</td>
                    <td className="px-3 py-2">{x.section}</td>
                    <td className="px-3 py-2">
                      {new Date(x.createdAt).toLocaleDateString("tr-TR")}
                    </td>
                    <td className="px-3 py-2">
                      <AddToSRButton
                        contentIds={[x.id]}
                        section={x.section}
                        type={x.type}
                        label="SR"
                        className="px-2 py-1 rounded-lg border text-xs"
		     <td className="px-3 py-2">
  		       {x.type === "topic" ? (
    		         <Link
      			   className="underline text-xs"
   			   href={`/admin/content/topics/${encodeURIComponent(x.id)}`}
    			  >
    			    Düzenle
 		          </Link>
  			) : (
  			  <span className="text-xs opacity-50">—</span>
 			)}
		      </td>
                      />
                    </td>
                  </tr>
                );
              })}
              {!filtered.length && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-sm text-gray-500">
                    Kriterlere uygun iÃ§erik bulunamadÄ±.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



