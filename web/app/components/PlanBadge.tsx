// C:\Users\hucig\Medknowledge\web\app\components\PlanBadge.tsx
"use client";
import React from "react";

export type PlanType = "free" | "premium" | "pro";
interface BadgeConfig { title: string; color: string; description: string; }

// Temizlenmiş Türkçe karakterler ve Premium Koyu Tema renkleri
export const PLAN_BADGES: Record<PlanType, BadgeConfig> = {
  free: { 
    title: "Free", 
    color: "bg-slate-800 text-slate-300 border border-slate-600", 
    description: "Temel özellikler, sınırlı erişim" 
  },
  premium: { 
    title: "Premium", 
    color: "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.1)]", 
    description: "Tüm içeriklere erişim, gelişmiş özellikler" 
  },
  pro: { 
    title: "Pro", 
    color: "bg-blue-600/10 text-blue-400 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]", 
    description: "Premium + özel mentorluk ve ek modüller" 
  }
};

export default function PlanBadge({ plan }: { plan: PlanType }) { 
  const cfg = PLAN_BADGES[plan]; 
  return (
    <span 
      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-bold tracking-widest uppercase transition-all ${cfg.color}`}
      title={cfg.description} // Hover olunca açıklama görünsün
    >
      {cfg.title}
    </span>
  ); 
}