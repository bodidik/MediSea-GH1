"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import PlanBadge, { type PlanType } from "@/components/PlanBadge";
import RequirePlan from "@/components/RequirePlan";
import UpgradeCard from "@/components/UpgradeCard";
import { type StudyNumbers, localStats, fetchServerStats } from "@/app/lib/study-stats";
import { planCoz } from "@/app/lib/plan";

type Role = "V" | "M" | "P";

function toRole(plan: string | undefined): Role {
  const p = (plan ?? "").toLowerCase();
  if (p === "premium" || p === "p" || p === "pro") return "P";
  if (p === "member" || p === "m") return "M";
  return "V";
}

export default function ProfilePage() {
  const [stats, setStats] = useState<StudyNumbers | null>(null);
  /* Plan OTURUMDAN okunuyor. Bir dönem burada sabit "free" vardı ve ödeme
     yapmış bir üye KENDİ PROFİLİNDE "Free" rozeti görüyordu. Okuma tek yerde
     (app/lib/plan.ts); aynı sabit /tr/premium sayfasında da duruyordu. */
  const [loading, setLoading] = useState(true);
  const { data: session, status } = useSession();
  const plan: PlanType = planCoz(session?.user);

  useEffect(() => {
    if (status === "loading") return;
    let alive = true;
    (async () => {
      // Önce yerelden oku — anında gösterilir
      const yerel = localStats();
      if (alive) { setStats(yerel); setLoading(false); }

      if (status !== "authenticated") return;
      const sunucu = await fetchServerStats(yerel);
      if (alive && sunucu.source === "server") setStats(sunucu);
    })();
    return () => { alive = false; };
  }, [status]);

  const role = toRole(plan);

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">

      <div className="flex items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-3xl shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Profil Özeti</h1>
          {stats?.studiedAt && (
            <div className="text-xs font-medium text-slate-500 mt-1">
              Son Senkronizasyon: {new Date(stats.studiedAt).toLocaleString("tr-TR")}
            </div>
          )}
        </div>
        <PlanBadge plan={plan} />
      </div>

      {plan === "free" && <UpgradeCard />}

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-800 px-2">Çalışma İstatistiklerin</h2>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : !stats || (stats.marks === 0 && stats.notes === 0 && stats.cards === 0) ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="text-sm font-bold text-slate-700">
              Henüz çalışma verin yok
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-slate-600">
              Bir konu sayfasını aç, metin seç ve vurgula. Notlarını yaz, çizimlerini
              yap — hepsi burada görünecek.
            </p>
            <Link
              href="/topics"
              className="mt-3 inline-block rounded-full bg-slate-800 px-4 py-2 text-[11px] font-black uppercase tracking-widest text-white transition-colors hover:bg-slate-700"
            >
              Konulara Git →
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <StatCard label="Vurgu" value={stats.marks} />
              <StatCard label="Notlu Sayfa" value={stats.notes} />
              <StatCard label="El Çizimi" value={stats.strokes} />
              <StatCard label="Tekrar Kartı" value={stats.cards} />
              <StatCard label="Çalışılacak" value={stats.due} highlight={stats.due > 0} />
              <StatCard label="Seri" value={`${stats.streak} Gün`} highlight={stats.streak >= 3} />
            </div>
            <div className="flex items-center gap-3 px-1">
              <span className="text-[11px] font-medium text-slate-400">
                {stats.pages} konu sayfasına dokundun
                {stats.source === "server" ? " · sunucuyla senkron" : " · yerel veri"}
              </span>
              <Link
                href="/calisma-alanim"
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
              >
                Çalışma Alanım →
              </Link>
            </div>
          </>
        )}
      </div>

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

function StatCard({ label, value, highlight = false }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className={`flex flex-col justify-center p-4 rounded-2xl border ${highlight ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-white'}`}>
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</span>
      <span className={`text-2xl font-black ${highlight ? 'text-blue-700' : 'text-slate-800'}`}>{value}</span>
    </div>
  );
}
