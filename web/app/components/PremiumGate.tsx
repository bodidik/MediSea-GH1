// FILE: web/app/components/PremiumGate.tsx
"use client";

import React from "react";

type Plan = "V" | "M" | "P";
const order: Plan[] = ["V", "M", "P"];

export default function PremiumGate({
  plan,
  min = "P",
  children,
}: {
  plan: Plan;
  min?: Plan;
  children: React.ReactNode;
}) {
  const ok = order.indexOf(plan) >= order.indexOf(min);
  if (ok) return <>{children}</>;

  const planName = min === "P" ? "Premium" : min === "M" ? "Üye" : "Ziyaretçi";

  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl border border-blue-900/50 bg-slate-800/60 shadow-inner backdrop-blur-sm">
      
      {/* Şık Kilit/Kalkan İkonu */}
      <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl bg-slate-900/50 border border-slate-700/50 text-slate-400">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
      </div>
      
      <div>
        <h3 className="text-base font-bold text-slate-200 mb-1">
          Kilitli İçerik
        </h3>
        <div className="text-sm font-medium text-slate-400 mb-2 leading-relaxed">
          Bu içerik <span className="text-blue-400 font-bold">{planName}</span> ve üzeri planlarda erişilebilir.
        </div>
        <div className="text-xs text-slate-500">
          Planınızı yükselterek bu kilidi açabilir ve tüm ayrıcalıklardan faydalanabilirsiniz.
        </div>
      </div>

    </div>
  );
}