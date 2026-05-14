// C:\Users\hucig\Medknowledge\web\app\components\SectionsTable.tsx
"use client";
import React from "react";
import Link from "next/link";

export default function SectionsTable({
  rows,
}: {
  rows: Array<{
    section: string;
    topics: number;
    boardQuestions: number;
    cases: number;
    videos: number;
    notes: number;
    total: number;
  }>;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-700/60 bg-slate-800/40 shadow-lg backdrop-blur-sm">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-700/60">
          <tr>
            <th className="py-4 pl-6 pr-4 font-semibold">Bölüm</th>
            <th className="py-4 pr-4 font-semibold">Topik</th>
            <th className="py-4 pr-4 font-semibold">Board</th>
            <th className="py-4 pr-4 font-semibold">Vaka</th>
            <th className="py-4 pr-4 font-semibold">Video</th>
            <th className="py-4 pr-4 font-semibold">Not</th>
            <th className="py-4 pr-6 font-bold text-blue-400">Toplam</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700/50 text-slate-300">
          {rows.map((r) => (
            <Link
              key={r.section}
              href={`/sections/${encodeURIComponent(r.section)}`}
              className="contents group"
            >
              <tr className="hover:bg-slate-700/40 transition-colors cursor-pointer">
                <td className="py-3 pl-6 pr-4 font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{r.section}</td>
                <td className="py-3 pr-4">{r.topics}</td>
                <td className="py-3 pr-4">{r.boardQuestions}</td>
                <td className="py-3 pr-4">{r.cases}</td>
                <td className="py-3 pr-4">{r.videos}</td>
                <td className="py-3 pr-4">{r.notes}</td>
                <td className="py-3 pr-6 font-bold text-blue-400/90">{r.total}</td>
              </tr>
            </Link>
          ))}
        </tbody>
      </table>
      
      {/* Eğer veri yoksa boş durumu */}
      {rows.length === 0 && (
        <div className="p-8 text-center text-slate-500">
          Gösterilecek bölüm bulunamadı.
        </div>
      )}
    </div>
  );
}