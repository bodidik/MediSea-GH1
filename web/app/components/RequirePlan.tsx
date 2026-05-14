// C:\Users\hucig\Medknowledge\web\app\components\RequirePlan.tsx
"use client";
import React from "react";

export default function RequirePlan({
  min = "V",
  plan = "P",
  children,
}: { min?: "V"|"M"|"P"; plan?: "V"|"M"|"P"; children: React.ReactNode }) {
  
  // Orijinal VIP Kapı Mantığı (Bozulmadı)
  const ok = (min === "V") || (min === "M" && (plan === "M" || plan === "P")) || (min === "P" && plan === "P");
  
  if (!ok) {
    return (
      <div className="flex items-center gap-4 p-4 my-2 rounded-xl border border-blue-900/50 bg-slate-800/50 shadow-inner backdrop-blur-sm transition-all duration-300 hover:bg-slate-800">
        
        {/* VIP / Premium Yıldız İkonu */}
        <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
          </svg>
        </div>
        
        <div>
          <h4 className="text-sm font-bold text-slate-200 mb-0.5">Özel İçerik</h4>
          <p className="text-xs text-slate-400 font-medium">
            Bu içeriği görüntülemek için daha yüksek bir üyelik planı gerekiyor.
          </p>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}