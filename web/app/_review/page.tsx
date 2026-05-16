// FILE: web/app/review/page.tsx
"use client";

import React from "react";
import PremiumCard from "@/components/PremiumCard";
import PlanBadge, { type PlanType } from "@/components/PlanBadge";

type Card = {
  id: string;
  contentId?: string;
  section?: string;
  type?: string;
  dueAt: string;
  interval: number;
  ease: number;
};

type NextResp = { ok: boolean; items: Card[]; error?: string };
type SubmitResp = { ok: boolean; updated: number; error?: string };

// Premium bileşenlerinin beklediği rol harfleri
type Role = "V" | "M" | "P";

// "free" | "premium" | "pro" -> "V" | "M" | "P"
function toRole(plan: string | undefined): Role {
  const p = (plan ?? "").toLowerCase();
  if (p === "premium" || p === "p" || p === "pro") return "P";
  if (p === "member" || p === "m") return "M"; // PlanType'ta olmasa da role için destekliyoruz
  return "V";
}

export default function ReviewPage() {
  // Rozet için PlanType kullan (member yok)
  const [plan, setPlan] = React.useState<PlanType>("premium");

  const [items, setItems] = React.useState<Card[] | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/review/next?limit=10", { cache: "no-store" });
      const j = (await r.json()) as NextResp;
      if (!j.ok) throw new Error(j.error || "Yükleme hatası");
      setItems(j.items || []);
      setErr(null);
      // Eğer ileride backend plan dönerse, burada sanitize ederek setPlan çağır:
      // const srvPlan = (await (await fetch("/api/counts")).json()).user?.plan as string|undefined;
      // setPlan((srvPlan === "pro" || srvPlan === "premium") ? (srvPlan as PlanType) : "free");
    } catch (e: any) {
      setErr(e?.message || "ERR");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    load();
  }, []);

  async function submitQuality(id: string, quality: number) {
    try {
      const r = await fetch("/api/review/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ results: [{ id, quality }] }),
      });
      const j = (await r.json()) as SubmitResp;
      if (!j.ok) throw new Error(j.error || "Gönderim hatası");
      setItems((prev) => (prev || []).filter((it) => it.id !== id));
    } catch (e: any) {
      setErr(e?.message || "ERR");
    }
  }

  // PremiumCard/RequirePlan için normalize edilmiş rol:
  const role = toRole(plan);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-bold">Günlük Tekrar</h1>
        <PlanBadge plan={plan} />
      </div>

      {err && <div className="rounded-xl border p-3 text-sm text-red-600">{err}</div>}

      <PremiumCard plan={role} title="Vadesi Gelen Kartlar" min="P">
        {!items ? (
          <div className="h-20 bg-gray-100 rounded" />
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">Şu an için vadesi gelen kart yok.</div>
        ) : (
          <ul className="space-y-3">
            {items.map((it) => (
              <li key={it.id} className="rounded border p-3">
                <div className="text-sm">
                  <b>{it.section || "-"}</b> · {it.type || "-"}
                </div>
                <div className="text-xs text-gray-500">
                  Son tarih: {new Date(it.dueAt).toLocaleString("tr-TR")}
                  {" · "}Aralık: {it.interval} gün
                  {" · "}Ease: {it.ease.toFixed(2)}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5].map((q) => (
                    <button
                      key={q}
                      onClick={() => submitQuality(it.id, q)}
                      className="px-2 py-1 rounded border text-sm"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <button onClick={load} disabled={loading} className="px-4 py-2 rounded-lg border">
            {loading ? "Yükleniyor..." : "Yenile"}
          </button>
        </div>
      </PremiumCard>
    </div>
  );
}



