// FILE: web/app/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import PlanBadge, { type PlanType } from "@/components/PlanBadge";
import RequirePlan from "@/components/RequirePlan";
import UpgradeCard from "@/components/UpgradeCard";

type CountsResponse = {
  totals: {
    topics: number;
    boardQuestions: number;
    cases: number;
    videos: number;
    notes: number;
  };
  user: {
    solved: number;
    accuracy: number;        // 0–100
    streakDays: number;
    rankPercentile: number;  // 0–100
    todaySolved: number;
    plan?: PlanType;         // "free" | "member" | "premium" | "pro"
  };
  lastUpdatedISO: string;
};

type Role = "V" | "M" | "P";

function toRole(plan: string | undefined): Role {
  const p = (plan ?? "").toLowerCase();
  if (p === "premium" || p === "p" || p === "pro") return "P";
  if (p === "member" || p === "m") return "M";
  return "V";
}

export default function ProfilePage() {
  const [data, setData] = useState<CountsResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const r = await fetch("/api/counts", { cache: "no-store" });
        if (!r.ok) throw new Error("Veriler alınırken bir hata oluştu.");
        const j = (await r.json()) as CountsResponse;
        if (alive) setData(j);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Bilinmeyen Hata");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const plan = (data?.user.plan ?? "free") as PlanType;
  const role = toRole(plan);

  const updated = data?.lastUpdatedISO
    ? new Date(data.lastUpdatedISO).toLocaleString("tr-TR")
    : "";

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
      
      {/* Profil Başlığı ve Badge */}
      <div className="flex items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Profil Özeti</h1>
          {updated && (
            <div className="text-xs font-medium text-slate-500 mt-1">
              Son Senkronizasyon: {updated}
            </div>
          )}
        </div>
        <PlanBadge plan={plan} />
      </div>

      {err && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-600">
          ⚠️ {err}
        </div>
      )}

      {plan === "free" && <UpgradeCard />}

      {/* Kullanıcı Metrikleri (Şık Grid Kartları) */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 px-2">Klinik İstatistiklerin</h2>
        
        {loading || !data ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <StatCard label="Çözülen Soru" value={data.user.solved} />
            <StatCard label="Doğruluk Oranı" value={`%${Math.round(data.user.accuracy ?? 0)}`} />
            <StatCard label="Çalışma Serisi" value={`${data.user.streakDays} Gün`} />
            <StatCard label="Bugün Çözülen" value={data.user.todaySolved} />
            <StatCard label="Başarı Dilimi" value={`Top %${Math.round(100 - (data.user.rankPercentile ?? 0))}`} />
            <StatCard label="Mevcut Plan" value={(plan || "Free").toUpperCase()} highlight />
          </div>
        )}
      </div>

      {/* Premium Özel Alanı */}
      <RequirePlan plan={role} min="P">
        <div className="rounded-3xl border border-blue-100 bg-gradient-to-b from-blue-50/50 to-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🌟</span>
            <h3 className="text-lg font-bold text-blue-950">Premium Analiz</h3>
          </div>
          <p className="text-sm font-medium text-slate-600">
            Son klinik vaka çözümlerine göre yapay zeka destekli kişiselleştirilmiş eksik konu analizlerin yakında burada listelenecek.
          </p>
        </div>
      </RequirePlan>
      
    </div>
  );
}

// Yeni: Dashboard istatistiklerini daha şık göstermek için alt bileşen
function StatCard({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`flex flex-col justify-center p-4 rounded-2xl border ${highlight ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</span>
      <span className={`text-2xl font-black ${highlight ? 'text-blue-700' : 'text-slate-800'}`}>{value}</span>
    </div>
  );
}