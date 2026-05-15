// FILE: web/app/components/PremiumQuizToday.tsx
import React from "react";

type Props = { className?: string };

export default function PremiumQuizToday({ className = "" }: Props) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.1)] ${className}`}>
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      </div>
      <div>
        <div className="text-sm font-bold tracking-wide uppercase text-emerald-400">Günün Hedefi</div>
        <div className="text-base font-medium">Premium quiz bugün sizin için hazır!</div>
      </div>
    </div>
  );
}