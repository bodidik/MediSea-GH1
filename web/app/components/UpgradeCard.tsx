// C:\Users\hucig\Medknowledge\web\app\components\UpgradeCard.tsx
"use client";
import React, { useState } from "react";

export default function UpgradeCard() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | undefined>();

  async function upgrade() {
    setLoading(true);
    try {
      const r = await fetch("/api/plan/upgrade", { method: "POST" });
      if (!r.ok) throw new Error("Yükseltme işlemi başarısız oldu");
      const j = await r.json();
      setMsg(j.message || "Plan başarıyla yükseltildi!");
      window.location.reload();
    } catch (e: any) {
      setMsg(e?.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-r from-slate-900 to-slate-800 p-5 flex items-center justify-between shadow-[0_0_20px_rgba(245,158,11,0.1)] relative overflow-hidden group transition-all hover:border-amber-500/50">
      
      {/* Premium Parıltı Efekti */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-amber-500/20 transition-all duration-500"></div>
      
      <div className="relative z-10 flex flex-col">
        <span className="text-lg font-bold text-amber-400 mb-0.5 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          Premium'a Geç
        </span>
        <span className="text-xs font-medium text-slate-400">
          Tüm ayrıcalıkların ve özel içeriklerin kilidini açın.
        </span>
      </div>
      
      <div className="relative z-10 flex items-center gap-4">
        {msg && <span className="text-xs font-bold text-amber-300 animate-pulse">{msg}</span>}
        <button 
          onClick={upgrade} 
          disabled={loading} 
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold transition-all duration-300 disabled:opacity-50 shadow-lg shadow-amber-500/20"
        >
          {loading ? "İşleniyor..." : "Yükselt"}
        </button>
      </div>
      
    </div>
  );
}