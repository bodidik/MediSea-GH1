// C:\Users\hucig\Medknowledge\web\app\components\NavCard.tsx
import Link from "next/link";
import * as React from "react";

type Props = {
  href: string;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

export default function NavCard({
  href,
  title,
  description,
  badge,
  className = "",
  children,
}: Props) {
  return (
    <Link
      href={href}
      className={
        "group block rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 hover:bg-slate-700/60 hover:border-blue-500/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all duration-300 " + className
      }
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="text-lg font-bold text-slate-200 group-hover:text-blue-400 transition-colors">{title}</div>
        {badge ? (
          <div className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900/50 border border-slate-600 text-slate-300 shadow-inner">
            {badge}
          </div>
        ) : null}
      </div>
      {description && (
        <p className="mt-1 text-sm text-slate-400 leading-relaxed group-hover:text-slate-300 transition-colors">{description}</p>
      )}
      {children && (
        <div className="mt-4">
          {children}
        </div>
      )}
    </Link>
  );
}