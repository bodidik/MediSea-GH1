// C:\Users\hucig\Medknowledge\web\app\components\Lock.tsx
"use client";
import React from "react";

export default function Lock({ children }: { children?: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-800/40 text-slate-400 text-sm font-medium backdrop-blur-sm">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
      {children ?? "Kilitli İçerik"}
    </div>
  );
}