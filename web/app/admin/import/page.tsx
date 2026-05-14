// FILE: web/app/admin/import/page.tsx
"use client";

import React from "react";

type ImportResponse = {
  ok: boolean;
  imported?: number;
  total?: number;
  results?: Array<{ ok: boolean; id?: string; error?: string; row?: Record<string, any> }>;
  error?: string;
};

export default function AdminImportPage() {
  const [tab, setTab] = React.useState<"videos"|"notes">("videos");
  const [format, setFormat] = React.useState<"csv"|"json">("csv");
  const [useMapping, setUseMapping] = React.useState<boolean>(true); // âœ… yeni
  const [externalId, setExternalId] = React.useState<string>("");
  const [data, setData] = React.useState<string>("");
  const [resJson, setResJson] = React.useState<ImportResponse | null>(null);
  const [resText, setResText] = React.useState<string>(""); // raw
  const [loading, setLoading] = React.useState(false);

  const exampleCSV = tab === "videos"
    ? `title,url,section,sectionCode,tags,thumbnail,references,durationSec,preview,source,language,isPublic
Hipertansiyon Tedavisi,https://youtu.be/xxxx,Nephrology,NEPH,"htn;bp",https://img/1.jpg,"guideline;doi:10.1/...",600,"KÄ±sa aÃ§Ä±klama",YouTube,tr,true`
    : `title,content,section,sectionCode,tags,thumbnail,references,preview,language,authorRef,isPublic
ACE inhibitÃ¶rleri,"Markdown **notu**",Nephrology,NEPH,"acei;htn",https://img/2.jpg,"uptodate;doi:10.2/...",KÄ±sa Ã¶zet,tr,dr-xyz,true`;

  const exampleJSON = tab === "videos"
    ? `[
  { "title":"Hipertansiyon", "url":"https://youtu.be/xxxx", "section":"Nefroloji", "sectionCode":"", "tags":"htn;bp", "thumbnail":"", "references":"", "durationSec":600, "preview":"", "source":"YouTube", "language":"tr", "isPublic":true }
]`
    : `[
  { "title":"ACE inhibitÃ¶rleri", "content":"Markdown **notu**", "section":"Kardiyoloji", "sectionCode":"", "tags":"acei;htn", "thumbnail":"", "references":"", "preview":"", "language":"tr", "authorRef":"", "isPublic":true }
]`;

  function safeJSON(v: string) {
    try { return JSON.parse(v || "[]"); } catch { return []; }
  }

  async function submit() {
    setLoading(true);
    setResText("");
    setResJson(null);
    try {
      const r = await fetch(`/api/admin/import/${tab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          externalId: externalId || "seed",
          format,
          useMapping,
          data: format === "csv" ? data : safeJSON(data),
        })
      });
      const j = (await r.json()) as ImportResponse;
      setResJson(j);
      setResText(JSON.stringify(j, null, 2));
    } catch (e:any) {
      setResText(e?.message || "ERR");
    } finally {
      setLoading(false);
    }
  }

  // --- HatalÄ± satÄ±rlardan CSV Ã¼ret ---
  function toCSV(rows: any[], headers: string[]) {
    const esc = (s: any) => {
      const str = s == null ? "" : String(s);
      if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };
    const lines = [headers.join(",")];
    for (const row of rows) {
      lines.push(headers.map(h => esc(row[h])).join(","));
    }
    return lines.join("\n");
  }

  function downloadErrorsCSV() {
    if (!resJson?.results) return;
    const errs = resJson.results.filter(r => !r.ok && r.row).map(r => r.row as Record<string, any>);
    if (errs.length === 0) return;

    const headers = tab === "videos"
      ? ["title","url","section","sectionCode","tags","thumbnail","references","durationSec","preview","source","language","isPublic"]
      : ["title","content","section","sectionCode","tags","thumbnail","references","preview","language","authorRef","isPublic"];

    const csv = toCSV(errs, headers);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `import-errors-${tab}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const imported = resJson?.imported ?? 0;
  const total = resJson?.total ?? 0;
  const failed = Math.max(0, total - imported);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold">Admin Import</h1>

      <div className="rounded-2xl border p-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm">TÃ¼r:</label>
          <select value={tab} onChange={e=>setTab(e.target.value as any)} className="px-2 py-2 rounded border">
            <option value="videos">Videos</option>
            <option value="notes">Notes</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm">Format:</label>
          <select value={format} onChange={e=>setFormat(e.target.value as any)} className="px-2 py-2 rounded border">
            <option value="csv">CSV</option>
            <option value="json">JSON</option>
          </select>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={useMapping} onChange={e=>setUseMapping(e.target.checked)} />
          <span className="text-sm">TRâ†’EN bÃ¶lÃ¼m eÅŸlemesi</span>
        </label>
        <div className="flex items-center gap-2 md:col-span-3">
          <label className="text-sm">externalId (ops):</label>
          <input value={externalId} onChange={e=>setExternalId(e.target.value)} placeholder="mk_xxx (boÅŸ = seed)" className="px-3 py-2 rounded border flex-1" />
        </div>
        <div className="text-xs text-muted-foreground md:col-span-3">
          CSV baÅŸlÄ±klarÄ± â€” <b>Videos</b>: <code>title,url,section,sectionCode,tags,thumbnail,references,durationSec,preview,source,language,isPublic</code><br/>
          CSV baÅŸlÄ±klarÄ± â€” <b>Notes</b>:  <code>title,content,section,sectionCode,tags,thumbnail,references,preview,language,authorRef,isPublic</code>
        </div>
      </div>

      <div className="rounded-2xl border p-4 space-y-3">
        <div className="flex gap-2 text-sm">
          <button onClick={()=>setData(exampleCSV)} className="px-3 py-1 rounded border">CSV Ã¶rneÄŸi</button>
          <button onClick={()=>setData(exampleJSON)} className="px-3 py-1 rounded border">JSON Ã¶rneÄŸi</button>
        </div>
        <textarea
          value={data}
          onChange={e=>setData(e.target.value)}
          className="w-full h-60 border rounded p-2 font-mono text-xs"
          placeholder={format === "csv" ? "CSV verisini buraya yapÄ±ÅŸtÄ±r" : "JSON array verisini buraya yapÄ±ÅŸtÄ±r"}
        />
        <button onClick={submit} disabled={loading} className="px-4 py-2 rounded-lg border">
          {loading ? "Ä°Ã§e aktarÄ±lÄ±yorâ€¦" : "Ä°Ã§e aktar"}
        </button>
      </div>

      <div className="rounded-2xl border p-4">
        <div className="font-semibold mb-2">SonuÃ§</div>
        {resJson && (
          <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
            <span className="rounded border px-2 py-1">Toplam: <b>{total}</b></span>
            <span className="rounded border px-2 py-1">BaÅŸarÄ±lÄ±: <b>{imported}</b></span>
            <span className="rounded border px-2 py-1">HatalÄ±: <b className={failed ? "text-red-600" : ""}>{failed}</b></span>
            {failed > 0 && (
              <button onClick={downloadErrorsCSV} className="px-3 py-1 rounded border">HatalarÄ± CSV indir</button>
            )}
          </div>
        )}
        <pre className="text-xs whitespace-pre-wrap">{resText || "â€”"}</pre>
      </div>
    </div>
  );
}



