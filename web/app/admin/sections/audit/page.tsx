"use client";
import React from "react";

type Report = {
  generatedAt: string;
  summary: { ok: boolean; warnings: number; errors: number };
  details: Array<{ section: string; message: string; level: "info" | "warn" | "error" }>;
};

export default function AuditPage() {
  const [data, setData] = React.useState<Report | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/admin/sections/audit", { cache: "no-store" });
      const j = await r.json();
      if (!j?.ok) throw new Error(j?.error || "YÃ¼kleme hatasÄ±");
      setData(j.report as Report);
    } catch (e: any) {
      setErr(e?.message || "ERR");
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => { load(); }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">BÃ¶lÃ¼m EÅŸleme Raporu</h1>

      <div className="rounded-2xl border p-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-sm">
        <button onClick={load} disabled={loading} className="px-3 py-2 rounded-lg border">
          {loading ? "YÃ¼kleniyorâ€¦" : "Yenile"}
        </button>
        <div className="text-xs text-muted-foreground md:col-span-3">
          {data ? `OluÅŸturma: ${new Date(data.generatedAt).toLocaleString("tr-TR")}` : "â€”"}
        </div>
      </div>

      {err && <div className="rounded-xl border p-3 text-sm text-red-600">{err}</div>}

      {!data ? (
        <div className="h-24 bg-gray-100 rounded" />
      ) : (
        <>
          <div className="rounded-2xl border p-4 text-sm grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>Durum: <b>{data.summary.ok ? "OK" : "Sorun"}</b></div>
            <div>UyarÄ±: <b>{data.summary.warnings}</b></div>
            <div>Hata: <b>{data.summary.errors}</b></div>
            <div>Toplam kayÄ±t: <b>{data.details.length}</b></div>
          </div>

          <div className="rounded-2xl border p-4">
            <div className="font-semibold mb-2">Detaylar</div>
            {data.details.length === 0 ? (
              <div className="text-sm text-muted-foreground">KayÄ±t bulunmuyor.</div>
            ) : (
              <ul className="text-sm space-y-2">
                {data.details.map((d, i) => (
                  <li key={i} className="rounded border p-2 flex items-center justify-between">
                    <span>
                      <b>{d.section}</b> â€” {d.message}
                    </span>
                    <span className="text-xs opacity-70">{d.level}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}



