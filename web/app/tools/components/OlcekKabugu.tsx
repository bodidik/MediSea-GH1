"use client";

import type { ReactNode } from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

/**
 * Ölçek sayfasının çerçevesi: gezinme, başlık, içerik, paylaşım + kaynak notu.
 * Kütüphanedeki araçların (frail · barthel) görünümünü birebir izliyor.
 */
export default function OlcekKabugu({
  slug,
  ikon,
  baslik,
  altBaslik,
  paylasim,
  not,
  children,
}: {
  slug: string;
  ikon: string;
  baslik: string;
  altBaslik: string;
  paylasim: Record<string, string | number | boolean | null | undefined>;
  not: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug={slug} />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl shrink-0">
            {ikon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none break-words [overflow-wrap:anywhere] min-w-0">{baslik}</h1>
            </div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-snug mt-1">{altBaslik}</p>
          </div>
        </div>

        {children}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={paylasim} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <div className="text-[11px] text-slate-700 leading-relaxed space-y-2">{not}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
