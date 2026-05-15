"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
// ZIRH: Modernize ettiğimiz diğer bileşenleri entegre ediyoruz
import PlanBadge from "./PlanBadge";

type ProgItem = { section: string; type: string; qty: number; href?: string };
type Resp = { 
  locked: boolean; 
  reason?: string; 
  program?: { items: ProgItem[]; total: number }; 
  lastUpdatedISO?: string 
};

export default function PremiumDailyProgram() {
  const [data, setData] = useState<Resp | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController(); // ZIRH: Signal Aborted hatasını önlemek için
    (async () => {
      try {
        const r = await fetch("/api/premium/daily-program", { 
          cache: "no-store",
          signal: controller.signal 
        });
        if (!r.ok) throw new Error("Veri ambarına ulaşılamadı");
        const j = await r.json() as Resp;
        setData(j);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setErr(e?.message || "Bağlantı Hatası");
        }
      }
    })();
    return () => controller.abort();
  }, []);

  // HATA EKRANI: Radar arızası görünümü
  if (err) return (
    <div className="text-sm text-rose-400 bg-rose-950/20 p-5 rounded-2xl border border-rose-500/20 flex items-center gap-3">
      <span className="text-xl">⚠️</span>
      <div>
        <p className="font-bold">Radar Bağlantısı Kesildi</p>
        <p className="text-[10px] opacity-70 uppercase tracking-widest">{err}</p>
      </div>
    </div>
  );

  // LOADING: Pulse efektiyle derinlik kazandırıldı
  if (!data) return (
    <div className="h-48 bg-slate-900/50 rounded-3xl animate-pulse border border-slate-800 shadow-inner flex items-center justify-center">
      <div className="text-slate-700 font-black tracking-widest uppercase text-xs">Sinyal taranıyor...</div>
    </div>
  );

  // KİLİTLİ EKRAN: PremiumGate mantığıyla modernize edildi
  if (data.locked) {
    return (
      <div className="rounded-3xl border border-blue-900/30 bg-slate-900 p-6 text-slate-300 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <div className="relative z-10">
           <PlanBadge plan="free" />
           <h3 className="text-lg font-black text-white mt-4 mb-1">Günlük Program Kilitli</h3>
           <p className="text-xs text-slate-500 mb-4 font-medium">Bu özellik sadece Premium rütbesindeki kaptanlara özeldir.</p>
           <Link href="/tr/premium/upgrade" className="inline-block px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition-all shadow-lg shadow-blue-900/20 uppercase tracking-widest">
             Planı Yükselt
           </Link>
        </div>
      </div>
    );
  }

  const items = data.program?.items || [];
  const total = data.program?.total || 0;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden group hover:border-blue-500/40 transition-all duration-500">
      
      {/* Kozmetik Neon Parlama */}
      <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none group-hover:bg-blue-500/20 transition-all duration-700"></div>
      
      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="font-black text-white text-xl flex items-center gap-3 tracking-tight">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          GÜNLÜK PROGRAM
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Toplam Hedef</span>
          <div className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 shadow-inner">
             <span className="text-blue-400 font-black text-sm">{total}</span>
             <span className="text-slate-600 text-[10px] ml-1 font-bold">MODÜL</span>
          </div>
        </div>
      </div>

      <div className="grid gap-3 relative z-10">
        {items.length > 0 ? items.map((it, idx) => (
          <Link 
            key={idx} 
            href={it.href || `/tr/premium/ydus/${it.section.toLowerCase()}`}
            className="group/item rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4 flex items-center justify-between hover:bg-slate-800/60 hover:border-blue-500/30 transition-all duration-300"
          >
            <div className="flex flex-col gap-1">
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest group-hover/item:text-blue-400 transition-colors">
                {it.section}
              </span>
              <span className="text-sm font-bold text-slate-200">
                {it.type}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 shadow-sm group-hover/item:border-slate-700">
                {it.qty} ADET
              </span>
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center border border-slate-800 group-hover/item:bg-blue-600 group-hover/item:border-blue-500 transition-all">
                 <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-slate-600 group-hover/item:text-white transition-colors"><path d="m9 18 6-6-6-6"/></svg>
              </div>
            </div>
          </Link>
        )) : (
          <div className="py-10 text-center border-2 border-dashed border-slate-800 rounded-2xl">
            <p className="text-slate-600 font-bold text-xs uppercase tracking-widest">Bugün için atanmış bir görev bulunmuyor.</p>
          </div>
        )}
      </div>

      {data.lastUpdatedISO && (
        <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-center">
          <span className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
            Son Güncelleme: {new Date(data.lastUpdatedISO).toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
}