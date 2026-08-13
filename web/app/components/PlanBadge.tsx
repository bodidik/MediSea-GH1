// C:\Users\hucig\Medknowledge\web\app\components\PlanBadge.tsx
"use client";
import React from "react";

export type PlanType = "free" | "premium" | "pro";
interface BadgeConfig { title: string; color: string; description: string; }

/**
 * Rozet renkleri OPAK.
 *
 * Önceki set koyu tema için yapılmıştı: yarı saydam zemin (bg-amber-500/10)
 * üstünde açık metin (text-amber-400) ve parıltı gölgesi. Rozet ise hem koyu
 * sayfalarda (/tr/premium, günlük program: bg-slate-950) hem AÇIK sayfalarda
 * (YDUS panosu: bg-[#f7f9fc], profil: bg-white) kullanılıyor.
 *
 * Yarı saydam zemin, altındaki sayfanın rengini geçirdiği için açık
 * sayfalarda kontrast çöküyordu: ölçümde "Premium" rozeti eşiğin altında
 * çıktı (amber-400 neredeyse beyaz üstünde).
 *
 * Opak zeminle rozet kendi kontrastını taşıyor ve sayfanın rengi önemsiz
 * hâle geliyor — iki temada da aynı ve okunur görünüyor.
 */
export const PLAN_BADGES: Record<PlanType, BadgeConfig> = {
  free: {
    title: "Free",
    color: "bg-slate-200 text-slate-800 border border-slate-300",
    description: "Temel özellikler, sınırlı erişim"
  },
  premium: {
    title: "Premium",
    color: "bg-amber-400 text-amber-950 border border-amber-500",
    description: "Tüm içeriklere erişim, gelişmiş özellikler"
  },
  pro: {
    title: "Pro",
    color: "bg-blue-600 text-white border border-blue-700",
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