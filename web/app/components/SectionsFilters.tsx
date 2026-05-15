// C:\Users\hucig\Medknowledge\web\app\components\SectionsFilters.tsx
"use client";
import React from "react";

type Row = { section: string; topics: number; boardQuestions: number; cases: number; videos: number; notes: number; total: number };

type SortKey = keyof Row;
const SORT_OPTS: { key: SortKey; label: string }[] = [
  { key: "total", label: "Toplam" },
  { key: "topics", label: "Topik" },
  { key: "boardQuestions", label: "Board" },
  { key: "cases", label: "Vaka" },
  { key: "videos", label: "Video" },
  { key: "notes", label: "Not" },
];

export default function SectionsFilters({ rows, onChange }: { rows: Row[]; onChange: (rows: Row[]) => void }){
  const [q, setQ] = React.useState("");
  const [sortKey, setSortKey] = React.useState<SortKey>("total");
  const [desc, setDesc] = React.useState(true);

  React.useEffect(() => {
    let arr = [...rows];
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      arr = arr.filter((r) => r.section.toLowerCase().includes(s));
    }
    arr.sort((a, b) => {
      const va = a[sortKey] as number | string;
      const vb = b[sortKey] as number | string;
      const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
      return desc ? -cmp : cmp;
    });
    onChange(arr);
  }, [q, sortKey, desc, rows, onChange]);

  return (
    <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between mb-6 p-4 rounded-2xl border border-slate-700/60 bg-slate-800/40 shadow-lg backdrop-blur-sm">
      
      {/* Arama Çubuğu */}
      <div className="relative w-full md:w-72">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          <circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/>
        </svg>
        <input
          placeholder="Bölüm ara..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-600 bg-slate-900/50 text-slate-200 text-sm w-full focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors placeholder:text-slate-500"
        />
      </div>

      {/* Sıralama Kontrolleri */}
      <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
        <label className="hidden sm:inline-block">Sırala:</label>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select 
            value={sortKey} 
            onChange={(e) => setSortKey(e.target.value as SortKey)} 
            className="flex-1 px-3 py-2.5 rounded-xl border border-slate-600 bg-slate-900/50 text-slate-200 text-sm focus:border-blue-500 outline-none transition-colors appearance-none [&>option]:bg-slate-800"
          >
            {SORT_OPTS.map((o) => (
              <option key={o.key} value={o.key}>{o.label}</option>
            ))}
          </select>
          <button 
            onClick={() => setDesc((d) => !d)} 
            className="flex items-center justify-center w-10 h-10 rounded-xl border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors shadow-sm"
            title="Sıralama Yönünü Değiştir"
          >
            {desc ? "