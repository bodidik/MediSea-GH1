"use client";

import React from "react";
import { useParams, useSearchParams } from "next/navigation";
import QuestionRunComp from "@/components/QuestionRun"; // default export
import type { Question } from "@/types/question";
export const revalidate = 0;
export const dynamic = "force-dynamic";
type QuestionRunProps = {
  questions: Question[];
  onExhausted?: () => void;
  onNextBatch?: () => Promise<void>;
};
const QuestionRun = QuestionRunComp as React.ComponentType<QuestionRunProps>;

type BackendOk = {
  ok: true;
  planLevel: "P" | "M" | "V";
  visibleCount: number;
  remaining?: number;
  message?: string;
  questions: Question[];
};
type BackendErr = { ok: false; error: string };
type BackendResp = BackendOk | BackendErr;

export default function SectionQuestionsPage() {
  const params = useParams<{ section: string }>();
  const search = useSearchParams();

  const raw = params?.section ?? "";
  const section = decodeURIComponent(Array.isArray(raw) ? raw[0] ?? "" : raw);

  const [data, setData] = React.useState<BackendOk | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const planLevel = search.get("planLevel") || "";
      const qs = new URLSearchParams({ module: section });
      if (planLevel) qs.set("planLevel", planLevel);

      const r = await fetch(`/api/questions?${qs.toString()}`, { cache: "no-store" });
      const j = (await r.json()) as BackendResp;

      if (!r.ok || j.ok === false) throw new Error((j as BackendErr).error || "load_failed");
      setData(j as BackendOk);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "ERR");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [search, section]);

  React.useEffect(() => {
    if (section) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section]);

  async function onNextBatch() {
    await load();
  }

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">{section} — Sorular</h1>
        <button onClick={load} className="px-3 py-2 rounded-lg border text-sm" disabled={loading}>
          {loading ? "Yükleniyor…" : "Yenile"}
        </button>
      </div>

      {err && <div className="rounded-xl border p-3 text-sm text-red-600">{err}</div>}

      {!data ? (
        <div className="h-24 bg-gray-100 rounded" />
      ) : (
        <>
          <div className="rounded-2xl border p-4 text-sm flex flex-wrap gap-3 items-center">
            <div>Plan: <b>{data.planLevel}</b></div>
            {typeof data.remaining === "number" && <div>Kalan günlük hak: <b>{data.remaining}</b></div>}
            <div>Gösterilen: <b>{typeof data.visibleCount === "number" ? data.visibleCount : 0}</b></div>
            {data.message && <div className="text-xs text-muted-foreground">({data.message})</div>}
          </div>

          <QuestionRun
            questions={data.questions || []}
            onExhausted={() => {}}
            onNextBatch={onNextBatch}
          />
        </>
      )}
    </div>
  );
}



