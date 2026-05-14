// C:\Users\hucig\Medknowledge\web\app\components\PremiumCard.tsx
"use client";
import React from "react";
import RequirePlan from "@/components/RequirePlan";

export default function PremiumCard({
  title,
  children,
  min = "P",
  plan = "P",
}: {
  title: string;
  children: React.ReactNode;
  min?: "V" | "M" | "P";
  plan?: "V" | "M" | "P";
}) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/30 p-5 shadow-lg backdrop-blur-sm transition-all hover:bg-slate-800/50">
      <div className="flex items-center justify-between mb-4 border-b border-slate-700/50 pb-3">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          {/* Şık Premium Kupa İkonu */}
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
          </svg>
          {title}
        </h2>
      </div>
      
      <RequirePlan min={min} plan={plan}>
        <div className="text-slate-300">
          {children}
        </div>
      </RequirePlan>
    </div>
  );
}