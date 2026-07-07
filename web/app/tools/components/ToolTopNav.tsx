"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getToolBranchSlugs } from "@/app/lib/tools";
import { getSpecialty } from "@/app/lib/specialties";

/**
 * Hesaplayıcı sayfalarının üst navigasyon çubuğu.
 * app/tools/* sayfaları (site) route grubunun DIŞINDA olduğu için SiteHeader/AppShell
 * almıyorlar — bu yüzden buradan çıkışta hiçbir yere gidilemiyordu. Bu bileşen
 * her araç sayfasına: Ana Sayfa, ilgili Branş Sayfası/Sayfaları ve "Geri" bağlantısı ekler.
 */
export default function ToolTopNav({ toolSlug }: { toolSlug: string }) {
  const router = useRouter();
  const branchSlugs = getToolBranchSlugs(toolSlug);

  return (
    <div className="flex flex-wrap items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest">
      <button
        type="button"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:border-blue-900/30 hover:text-blue-900 transition-all shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
        Geri
      </button>

      <Link
        href="/"
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:border-blue-900/30 hover:text-blue-900 transition-all shadow-sm"
      >
        🏠 Ana Sayfa
      </Link>

      <Link
        href="/tools"
        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:border-blue-900/30 hover:text-blue-900 transition-all shadow-sm"
      >
        📂 Tüm Araçlar
      </Link>

      {branchSlugs.map((slug) => {
        const specialty = getSpecialty(slug);
        return (
          <Link
            key={slug}
            href={`/topics/${slug}`}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border transition-all shadow-sm bg-white border-slate-200 text-slate-500 ${specialty.color}`}
          >
            {specialty.icon} {specialty.title}
          </Link>
        );
      })}
    </div>
  );
}
