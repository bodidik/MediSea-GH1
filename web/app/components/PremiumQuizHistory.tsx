"use client";
import React from "react";

type Item = { id: string; date: string; total: number; correct: number };
type Resp = { ok: boolean; days: number; items: Item[]; error?: string };

// ZIRH: Performans ve hata yönetimi için optimize edilmiş veri çekme kancası
function useQuizHistory(days = 30) {
  const [data, setData] = React.useState<Resp | null>(null);
  const [err, setErr] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const r = await fetch(`/api/premium/quiz/history?days=${days}`, { 
          cache: "no-store", 
          signal: ac.signal 
        });
        if (!r.ok) throw new Error("İstihbarat hattında kopukluk var");
        const j = (await r.json()) as Resp;
        setData(j);
      } catch (e: any) {
        if (e.name !== 'AbortError') {
          setErr(e?.message || "Bağlantı Hatası");
        }
      }
    })();
    return () => ac.abort();
  }, [days]);
  return { data, err };
}

// ZIRH: Neon efektli, derinlikli yeni nesil grafik motoru
function Sparkline({ values, width = 320, height = 60, stroke = 2.5 }: { values: number[]; width?: number; height?: number; stroke?: number }) {
  if (!values.length) return <div className="h-[60px] flex items-center justify-center text-[10px] text-slate-700 font-bold uppercase tracking-widest">Veri Bekleniyor...</div>;
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = width / Math.max(values.length - 1, 1);

  const points = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - stroke) - stroke / 2;
    return `${x},${y}`;
  }).join(" ");

  const pathD = values.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - stroke) - stroke / 2;
    return `${i === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ") + ` L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="relative overflow-hidden rounded-xl">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Neon Gölge Alt Katman */}
        <path d={pathD} fill="url(#gradient-bg)" className="opacity-30" />
        <polyline 
          points={points} 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth={stroke} 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"
        />
        <defs>
          <linearGradient id="gradient-bg" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function PremiumQuizHistory({ days = 30 }: { days?: number }) {
  const { data, err } = useQuizHistory(days);

  if (err) return (
    <div className="text-[10px] font-bold text-rose-400 bg-rose-950/20 p-4 rounded-2xl border border-rose-500/20 flex items-center gap-2">
      <span>⚠️ RADAR HATASI:</span> {err}
    </div>
  );

  if (!data) return (
    <div className="h-44 bg-slate-900/50 rounded-3xl animate-pulse border border-slate-800 flex flex-col items-center justify-center gap-3">
      <div className="w-12 h-12 rounded-full border-2 border-slate-800 border-t-blue-500 animate-spin"></div>
      <span className="text-[10px] text-slate-600 font-black tracking-widest uppercase">Performans Verileri Okunuyor</span>
    </div>
  );

  const items = [...(data.items || [])].reverse(); // eski → yeni
  const accuracy = items.map(it => (it.total ? Math.round((it.correct / it.total) * 100) : 0));
  const avgAccuracy = accuracy.length ? Math.round(accuracy.reduce((a, b) => a + b, 0) / accuracy.length) : 0;

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 shadow-2xl relative overflow-hidden group hover:border-blue-500/40 transition-all duration-500">
      
      {/* Arka Plan Dekorasyonu */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-[50px] pointer-events-none group-hover:bg-indigo-500/20 transition-all"></div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="font-black text-white text-lg flex items-center gap-3 tracking-tighter">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 text-blue-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
          </div>
          GELİŞİM İVMESİ
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Ort. Başarı</span>
          <div className="px-3 py-1 bg-slate-950 rounded-lg border border-slate-800 shadow-inner">
            <span className={`text-sm font-black ${avgAccuracy > 70 ? 'text-emerald-400' : avgAccuracy > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
              %{avgAccuracy}
            </span>
          </div>
        </div>
      </div>

      <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-ping"></span>
        SON {data.days} GÜNLÜK VERİ ANALİZİ
      </div>
      
      <div className="mb-8 relative px-2">
        <Sparkline values={accuracy} />
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide relative z-10">
        {items.slice(-5).map((it) => (
          <div key={it.id} className="border border-slate-800 bg-slate-950/80 rounded-xl p-3 min-w-[85px] text-center shrink-0 hover:border-slate-600 transition-colors shadow-lg">
            <div className="text-[10px] text-slate-500 font-bold mb-1.5 uppercase tracking-tighter border-b border-slate-800 pb-1">
              {it.date.split('.')[0]}/{it.date.split('.')[1]}
            </div>
            <div className="text-sm font-black text-slate-200">
              {it.correct}<span className="text-slate-600 font-medium">/{it.total}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}