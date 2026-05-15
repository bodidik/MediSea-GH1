// C:\Users\hucig\Medknowledge\web\app\components\ProtectedContent.tsx
"use client";

import React from "react";

type Props = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  isAllowed: boolean;
};

export default function ProtectedContent({ children, fallback, isAllowed }: Props) {
  // Eğer kullanıcının izni yoksa (Premium değilse veya giriş yapmamışsa)
  if (!isAllowed) {
    return (
      <>
        {/* Eğer component çağrılırken özel bir fallback verilmişse onu kullan, verilmemişse bu şık kilitli kartı göster */}
        {fallback ?? (
          <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-800/40 border border-slate-700/50 rounded-2xl backdrop-blur-sm shadow-lg">
            
            {/* Şık bir kilit ikonu (SVG) */}
            <div className="w-14 h-14 bg-slate-700/50 text-slate-300 rounded-full flex items-center justify-center mb-4 border border-slate-600/50">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            
            <h3 className="text-lg font-bold text-slate-200 mb-2">Bu İçerik Kilitli</h3>
            <p className="text-sm text-slate-400 max-w-sm mb-4">
              Bu içeriği görüntülemek için yetkiniz bulunmuyor. Lütfen giriş yapın veya Premium plana yükseltin.
            </p>
            
          </div>
        )}
      </>
    );
  }

  // Eğer izin varsa içeriği aynen göster
  return <>{children}</>;
}