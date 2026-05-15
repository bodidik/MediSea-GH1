"use client";

import React, { useEffect, useMemo, useState } from "react";
import PlanBadge, { type PlanType } from "@/app/components/PlanBadge";
import PremiumCard from "@/app/components/PremiumCard";
import { 
  Activity, Flame, Target, Zap, BrainCircuit, 
  PlaySquare, Stethoscope, Map, AlertTriangle, Layers, Crown 
} from 'lucide-react';

type CountsResponse = {
  totals?: {
    topics: number;
    boardQuestions: number;
    cases: number;
    videos: number;
    notes: number;
  };
  user?: {
    solved: number;
    accuracy: number;
    streakDays: number;
    rankPercentile: number;
    todaySolved: number;
    plan?: PlanType; 
  };
  lastUpdatedISO?: string;
};

type ReviewStats = {
  ok: boolean;
  dueTotal?: number;
  totalCards?: number;
  reviewedToday?: number;
  postponedToday?: number;
  ts?: string;
  error?: string;
};

type Role = "V" | "M" | "P";

function toRole(plan: string | undefined): Role {
  const p = (plan ?? "").toLowerCase();
  if (p === "premium" || p === "p" || p === "pro") return "P";
  if (p === "member" || p === "m") return "M";
  return "V";
}

// ZIRH 1: Eğer 'u' (user) yoksa sistemi çökertme, direkt 0 puan dön.
function computePoints(u?: CountsResponse["user"]) {
  if (!u) return 0;
  return (u.solved || 0) * 10 + (u.streakDays || 0) * 5 + Math.round((u.accuracy ?? 0) * 20);
}

export default function PremiumPage() {
  const [data, setData] = useState<CountsResponse | null>(null);
  const [review, setReview] = useState<ReviewStats | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r1 = await fetch("/api/counts", { cache: "no-store" });
        if (r1.ok) setData(await r1.json());
      } catch (e) {
        console.error("Counts API Hatası:", e);
      }
      
      try {
        const r2 = await fetch("/api/review/stats", { cache: "no-store" });
        if (r2.ok) setReview(await r2.json());
      } catch (e) {
        console.error("Review API Hatası:", e);
      }
    })();
  }, []);

  // ZIRH 2: data.user varsa hesapla, yoksa 0 dön.
  const points = useMemo(() => (data?.user ? computePoints(data.user) : 0), [data]);

  // ZIRH 3: plan ve role güvenli okuma
  const plan = (data?.user?.plan ?? "free") as PlanType;
  const role = toRole(plan);

  return (
    <div className="min-h-screen bg-[#0a0f1c] text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* 1. ÜST HEADER PANELİ */}
      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50 shadow-2xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(245,158,11,0.4)] border border-amber-400">
              <Crown size={24} className="text-amber-950" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase italic leading-none">
                MediSea <span className="text-amber-400">Premium</span>
              </h1>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Ana Komuta Merkezi</p>
            </div>
          </div>
          <PlanBadge plan={plan} />
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        
        {/* 2. KULLANICI METRİKLERİ (ZIRHLI: data veya data.user yoksa Loading gösterir) */}
        {!data || !data.user ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-slate-900 rounded-2xl animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col items-center justify-center relative overflow-hidden group hover:border-blue-500/50 transition-colors">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity"><Layers size={80}/></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">Çözülen Soru</span>
              <span className="text-3xl font-black text-white relative z-10">{data.user.solved || 0}</span>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col items-center justify-center relative overflow-hidden group hover:border-orange-500/50 transition-colors">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 text-orange-500 transition-opacity"><Flame size={80}/></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">Çalışma Serisi (Streak)</span>
              <span className="text-3xl font-black text-orange-400 relative z-10">{data.user.streakDays || 0} <span className="text-sm text-orange-500/50">Gün</span></span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col items-center justify-center relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 text-emerald-500 transition-opacity"><Target size={80}/></div>
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 relative z-10">Doğruluk Oranı</span>
              <span className="text-3xl font-black text-emerald-400 relative z-10">%{data.user.accuracy || 0}</span>
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-[0_0_20px_rgba(245,158,11,0.1)] flex flex-col items-center justify-center relative overflow-hidden group hover:border-amber-400 transition-colors">
              <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 text-amber-500 transition-opacity"><Zap size={80}/></div>
              <span className="text-[10px] font-black text-amber-500/70 uppercase tracking-widest mb-1 relative z-10">Premium Puan</span>
              <span className="text-3xl font-black text-amber-400 relative z-10">{points}</span>
            </div>
          </div>
        )}

        {/* 3. REVIEW İSTATİSTİKLERİ */}
        <PremiumCard plan={role} title="Spaced Repetition (Aralıklı Tekrar) Radarı" min="P">
          {!review ? (
            <div className="h-20 bg-slate-800/50 rounded-xl animate-pulse" />
          ) : !review.ok ? (
            <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-sm font-bold text-red-400 flex items-center gap-2">
              <AlertTriangle size={18} /> {review.error || "İstatistikler çekilirken bir hata oluştu."}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-center shadow-inner">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Vadesi Gelen (Due)</span>
                <span className="text-2xl font-black text-rose-400">{review.dueTotal ?? 0}</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-center shadow-inner">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Toplam Kart</span>
                <span className="text-2xl font-black text-slate-300">{review.totalCards ?? 0}</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-center shadow-inner">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Bugün Çözülen</span>
                <span className="text-2xl font-black text-emerald-400">{review.reviewedToday ?? 0}</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col justify-center shadow-inner">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Ertelenen</span>
                <span className="text-2xl font-black text-amber-400">{review.postponedToday ?? 0}</span>
              </div>
            </div>
          )}
        </PremiumCard>

        {/* 4. DİĞER PREMIUM İÇERİK KARTLARI */}
        <div className="mt-8 mb-4 border-l-4 border-blue-600 pl-4">
          <h2 className="text-xl font-black text-white uppercase tracking-tight">Klinik Operasyonlar</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Yapay Zeka Destekli Çalışma Modülleri</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <PremiumCard plan={role} title="Günlük Program (AI)" min="P">
            <div className="flex items-start gap-4 mt-2">
              <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center text-blue-400 shrink-0"><BrainCircuit size={20}/></div>
              <p className="text-sm font-medium text-slate-400 italic">Haftalık zayıf alanlarına göre yapay zeka tarafından hazırlanan 20 soruluk odaklı çalışma seti.</p>
            </div>
          </PremiumCard>
          
          <PremiumCard plan={role} title="Zor Soru Analizi" min="P">
            <div className="flex items-start gap-4 mt-2">
              <div className="w-10 h-10 rounded-lg bg-rose-900/30 flex items-center justify-center text-rose-400 shrink-0"><Activity size={20}/></div>
              <p className="text-sm font-medium text-slate-400 italic">En çok yanlış yapılan 10 soru, çeldirici analizleri ve konunun nokta atışı özetleri.</p>
            </div>
          </PremiumCard>

          <PremiumCard plan={role} title="Video Radar" min="P">
            <div className="flex items-start gap-4 mt-2">
              <div className="w-10 h-10 rounded-lg bg-purple-900/30 flex items-center justify-center text-purple-400 shrink-0"><PlaySquare size={20}/></div>
              <p className="text-sm font-medium text-slate-400 italic">Son çözdüğün denemelere ve ilerlemene göre sistemin önerdiği 3 kritik kısa video.</p>
            </div>
          </PremiumCard>

          <PremiumCard plan={role} title="Sınav Simülatörü" min="P">
            <div className="flex items-start gap-4 mt-2">
              <div className="w-10 h-10 rounded-lg bg-emerald-900/30 flex items-center justify-center text-emerald-400 shrink-0"><Target size={20}/></div>
              <p className="text-sm font-medium text-slate-400 italic">Gerçek sınav süresi, optik form ve soru dağılımıyla tam zamanlı YDUS/USMLE simülasyonu.</p>
            </div>
          </PremiumCard>

          <PremiumCard plan={role} title="Vaka Kokpiti" min="P">
            <div className="flex items-start gap-4 mt-2">
              <div className="w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center text-amber-400 shrink-0"><Stethoscope size={20}/></div>
              <p className="text-sm font-medium text-slate-400 italic">Güncel 5 karmaşık klinik vaka üzerinden interaktif tanı ve tedavi tartışma akışı.</p>
            </div>
          </PremiumCard>

          <PremiumCard plan={role} title="Konu Haritası" min="P">
            <div className="flex items-start gap-4 mt-2">
              <div className="w-10 h-10 rounded-lg bg-indigo-900/30 flex items-center justify-center text-indigo-400 shrink-0"><Map size={20}/></div>
              <p className="text-sm font-medium text-slate-400 italic">Tıbbi konular arası bağlantı grafiği (Knowledge Graph) ile eksiklerini harita üzerinde gör.</p>
            </div>
          </PremiumCard>
        </div>

      </div>
    </div>
  );
}