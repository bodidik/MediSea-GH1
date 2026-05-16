"use client";

import React from "react";

type Params = Record<string, string | number | boolean | null | undefined>;

export default function ToolShare({ params = {} }: { params?: Params }) {
  const [copied, setCopied] = React.useState(false);

  const buildUrl = React.useCallback(() => {
    if (typeof window === "undefined") return "";
    const url = new URL(window.location.href);
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") url.searchParams.delete(k);
      else url.searchParams.set(k, String(v));
    });
    return url.toString();
  }, [params]);

  const copy = React.useCallback(async () => {
    const link = buildUrl();
    if (!link) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const el = document.createElement("textarea");
        el.value = link;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      setCopied(true);
    } catch { /* no-op */ }
  }, [buildUrl]);

  React.useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1200);
    return () => clearTimeout(t);
  }, [copied]);

  return (
    <div className="flex flex-col items-center gap-3 w-full" aria-live="polite">
      <button 
        type="button" 
        onClick={copy}
        className={`
          flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all
          ${copied 
            ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-blue-500/50 shadow-lg active:scale-95'}
        `}
      >
        {copied ? (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
            KONSÜLTASYON LİNKİ HAZIR!
          </>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
            BULGULARI PAYLAŞ
          </>
        )}
      </button>
      
      {copied && (
        <span className="text-[9px] font-bold text-emerald-400 animate-in fade-in zoom-in duration-300 tracking-widest uppercase italic">
          Link panoya kopyalandı; vaka konsültasyonu için hazırsınız.
        </span>
      )}
    </div>
  );
}