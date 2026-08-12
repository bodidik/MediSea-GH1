"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import PlanBadge, { type PlanType } from "@/components/PlanBadge";
import RequirePlan from "@/components/RequirePlan";
import UpgradeCard from "@/components/UpgradeCard";

type StudyNumbers = {
  marks: number;
  notes: number;
  strokes: number;
  cards: number;
  due: number;
  streak: number;
  pages: number;
  studiedAt: string | null;
  source: "server" | "local";
};

function localStats(): StudyNumbers {
  let marks = 0;
  let noteCount = 0;
  let strokeCount = 0;
  const pages = new Set<string>();

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (k.startsWith("medisea:marks:v2:")) {
        const v = JSON.parse(localStorage.getItem(k)!);
        if (Array.isArray(v)) { marks += v.length; pages.add(k); }
      } else if (k.startsWith("medisea:notes:v1:")) {
        const v = JSON.parse(localStorage.getItem(k)!);
        if (v?.text?.trim() || v?.strokes?.length) {
          noteCount++;
          strokeCount += v.strokes?.length ?? 0;
          pages.add(k);
        }
      }
    }
  } catch {}

  let cards = 0;
  let due = 0;
  try {
    const raw = localStorage.getItem("medisea:review:v1");
    const review = raw ? JSON.parse(raw) : {};
    cards = Object.keys(review).length;
    const now = Date.now();
    due = Object.values(review).filter((s: any) => !s || (s.due ?? 0) <= now).length;
  } catch {}

  let streak = 0;
  try {
    const raw = localStorage.getItem("medisea:log:v1");
    const log = raw ? JSON.parse(raw) : {};
    const dk = (d: Date) => {
      const p = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
    };
    const d = new Date();
    if (!log[dk(d)]?.kart) d.setDate(d.getDate() - 1);
    while (log[dk(d)]?.kart) { streak++; d.setDate(d.getDate() - 1); }
  } catch {}

  return { marks, notes: noteCount, strokes: strokeCount, cards, due, streak, pages: pages.size, studiedAt: null, source: "local" };
}

type Role = "V" | "M" | "P";

function toRole(plan: string | undefined): Role {
  const p = (plan ?? "").toLowerCase();
  if (p === "premium" || p === "p" || p === "pro") return "P";
  if (p === "member" || p === "m") return "M";
  return "V";
}

export default function ProfilePage() {
  const [stats, setStats] = useState<StudyNumbers | null>(null);
  const [plan] = useState<PlanType>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      // Önce yerelden oku — anında gösterilir
      const yerel = localStats();
      if (alive) { setStats(yerel); setLoading(false); }

      // Sunucudan çek (oturum varsa)
      try {
        const r = await fetch("/api/study");
        if (r.ok) {
          const j = await r.json();
          if (j.ok && j.stat && alive) {
            setStats({
              marks: j.stat.marks ?? yerel.marks,
              notes: j.stat.notes ?? yerel.notes,
              strokes: j.stat.strokes ?? yerel.strokes,
              cards: j.stat.cards ?? yerel.cards,
              due: j.stat.due ?? yerel.due,
              streak: j.stat.streak ?? yerel.streak,
              pages: j.stat.pages ?? yerel.pages,
              studiedAt: j.stat.updatedAt ?? null,
              source: "server",
            });
          }
        }
      } catch {}
    })();
    return () => { alive = false; };
  }, []);

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
              href="/dahiliye"
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
