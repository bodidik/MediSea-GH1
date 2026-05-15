// FILE: web/app/programs/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Program = {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  track: "TUS" | "YDUS" | "USMLE";
  durationDays: number;
  isActive: boolean;
  createdAt: string;
};

type ProgramsResponse = {
  ok: boolean;
  programs: Program[];
  error?: string;
};

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [track, setTrack] = useState<"TUS" | "YDUS" | "USMLE" | "">("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const q = track ? `?track=${track}` : "";
        const r = await fetch(`/api/programs${q}`, { cache: "no-store" });
        if (!r.ok) throw new Error("programs fetch failed");
        const j = (await r.json()) as ProgramsResponse;
        if (alive) {
          if (j.ok) {
            setPrograms(j.programs);
            setErr(null);
          } else {
            setErr(j.error || "Bilinmeyen hata");
          }
        }
      } catch (e: any) {
        if (alive) setErr(e.message || "ERR");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [track]);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Programlar</h1>
        <select
          value={track}
          onChange={(e) => setTrack(e.target.value as any)}
          className="border rounded-lg p-2 text-sm"
        >
          <option value="">TÃ¼mÃ¼</option>
          <option value="TUS">TUS</option>
          <option value="YDUS">YDUS</option>
          <option value="USMLE">USMLE</option>
        </select>
      </div>

      {loading && <div className="text-muted-foreground">YÃ¼kleniyor...</div>}
      {err && <div className="text-red-600 text-sm">{err}</div>}

      <div className="grid gap-4">
        {programs.map((p) => (
          <Link
            key={p._id}
            href={`/programs/${p.slug}`}
            className="block rounded-2xl border p-4 hover:bg-gray-50 transition"
          >
            <div className="font-semibold text-lg">{p.title}</div>
            {p.description && (
              <div className="text-sm text-muted-foreground mt-1">
                {p.description}
              </div>
            )}
            <div className="text-xs mt-2 text-gray-500">
              {p.track} Â· {p.durationDays} gÃ¼n
            </div>
          </Link>
        ))}
        {!loading && programs.length === 0 && !err && (
          <div className="text-sm text-muted-foreground">KayÄ±tlÄ± program yok.</div>
        )}
      </div>
    </div>
  );
}



