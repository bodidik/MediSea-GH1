"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { pickAd } from "@/app/tools/data/ads";

const ACCENT_CLASSES: Record<string, { border: string; badge: string; cta: string; dot: string }> = {
  blue:   { border: "border-blue-200",   badge: "bg-blue-900 text-white",          cta: "bg-blue-900 text-white hover:bg-blue-800",         dot: "bg-blue-400" },
  indigo: { border: "border-indigo-200", badge: "bg-indigo-900 text-white",        cta: "bg-indigo-900 text-white hover:bg-indigo-800",     dot: "bg-indigo-400" },
  rose:   { border: "border-rose-200",   badge: "bg-rose-700 text-white",          cta: "bg-rose-700 text-white hover:bg-rose-600",         dot: "bg-rose-400" },
  red:    { border: "border-red-200",    badge: "bg-red-700 text-white",           cta: "bg-red-700 text-white hover:bg-red-600",           dot: "bg-red-400" },
  amber:  { border: "border-amber-200",  badge: "bg-amber-600 text-white",         cta: "bg-amber-600 text-white hover:bg-amber-500",       dot: "bg-amber-400" },
  sky:    { border: "border-sky-200",    badge: "bg-sky-700 text-white",           cta: "bg-sky-700 text-white hover:bg-sky-600",           dot: "bg-sky-400" },
  purple: { border: "border-purple-200", badge: "bg-purple-700 text-white",        cta: "bg-purple-700 text-white hover:bg-purple-600",     dot: "bg-purple-400" },
  green:  { border: "border-green-200",  badge: "bg-green-700 text-white",         cta: "bg-green-700 text-white hover:bg-green-600",       dot: "bg-green-400" },
};

export default function AdBanner() {
  const pathname = usePathname();
  const toolSlug = pathname.split("/").filter(Boolean).pop() ?? "";

  // Sayfa başına bir kez seç (slug değişince yenile)
  const ad = React.useMemo(() => pickAd(toolSlug), [toolSlug]);
  const [dismissed, setDismissed] = React.useState(false);
  const [visible, setVisible]     = React.useState(false);

  // Sayfaya girilince küçük gecikmeyle göster
  React.useEffect(() => {
    setDismissed(false);
    const t = setTimeout(() => setVisible(true), 600);
    return () => clearTimeout(t);
  }, [toolSlug]);

  if (dismissed || !visible) return null;

  const c = ACCENT_CLASSES[ad.accent] ?? ACCENT_CLASSES.blue;

  return (
    <div
      className={`
        rounded-[1.5rem] border-2 ${c.border} bg-white shadow-sm
        flex items-start gap-4 p-5
        transition-all duration-500 ease-out
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}
      role="complementary"
      aria-label="Duyuru"
    >
      {/* Emoji + dot */}
      <div className="relative shrink-0 mt-0.5">
        <span className="text-2xl">{ad.emoji}</span>
        {ad.type === "announcement" && (
          <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${c.dot} border-2 border-white`} />
        )}
      </div>

      {/* İçerik */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          {ad.badge && (
            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${c.badge}`}>
              {ad.badge}
            </span>
          )}
        </div>
        <p className="text-sm font-black text-blue-950 leading-snug">{ad.title}</p>
        <p className="text-[11px] font-bold text-slate-500 leading-relaxed">{ad.body}</p>
        {ad.cta && (
          <Link
            href={ad.cta.href}
            className={`inline-block text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${c.cta}`}
          >
            {ad.cta.label}
          </Link>
        )}
      </div>

      {/* Kapat */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Kapat"
        className="shrink-0 w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-all mt-0.5"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
