// C:\Users\hucig\Medknowledge\web\app\components\StudyQuickActions.tsx
"use client";
import React, { useState } from "react";

async function post(url: string) {
  const r = await fetch(url, { method: "POST" });
  if (!r.ok) throw new Error(await r.text());
  return r.json();
}

export default function StudyQuickActions() {
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function hit(correct: boolean) {
    try {
      setBusy(true);
      setMsg(null);
      await post(`/api/progress/tick?correct=${correct}`);
      setMsg(correct ? "✔️ Doğru işlendi" : "❌ Yanlış işlendi");
      // Sayfalardaki sayımları güncellemek için:
      try { window.location.reload(); } catch {}
    } catch (e: any) {
      setMsg(e?.message || "Hata oluştu");
    } finally {
      setBusy(false);
    }
  }

  async function reset() {
    try {
      setBusy(true);
      setMsg(null);
      await post(`/api/progress/reset`);
      setMsg("🔄 Bugün sıfırlandı");
      try { window.location.reload(); } catch {}
    } catch (e: any) {
      setMsg(e?.message || "Hata oluştu");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-4 flex flex-wrap items-center gap-3 text-sm shadow-lg backdrop-blur-sm">
      <span className="font-bold text-slate-300 mr-2 hidden sm:inline-block uppercase tracking-wider text-xs">
        Hızlı İşlemler:
      </span>
      
      <button 
        disabled={busy} 
        onClick={() => hit(true)} 
        className="px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors disabled:opacity-50 font-medium"
      >
        Doğru (+)
      </button>
      
      <button 
        disabled={busy} 
        onClick={() => hit(false)} 
        className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors disabled:opacity-50 font-medium"
      >
        Yanlış (-)
      </button>
      
      <button 
        disabled={busy} 
        onClick={reset} 
        className="px-4 py-2 rounded-xl border border-slate-600 bg-slate-700/50 hover:bg-slate-600 text-slate-300 transition-colors disabled:opacity-50 font-medium ml-auto sm:ml-0"
      >
        Bugünü Sıfırla
      </button>
      
      {msg && <span className="ml-2 text-xs font-bold text-blue-400 animate-pulse">{msg}</span>}
    </div>
  );
}