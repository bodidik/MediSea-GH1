// "C:\Users\hucig\Medknowledge\web\app\(ydus)\[lang]\premium\ydus\YdusDashboardClient.tsx"
'use client';

import React from 'react';
import Link from 'next/link';
import {
  Stethoscope, ChevronRight, Lock, PlayCircle, Award,
  FlaskConical, Droplet, Bone, Wind, Pill, HeartPulse, Microscope, Bug, Filter,
} from 'lucide-react';
import PlanBadge from "@/components/PlanBadge";
import { useUser } from "@/app/(ydus)/context/UserContext";

export interface BranchCard {
  id: string;
  baslik: string;
  emoji: string;
  renk: string;
  readyTopics: number;
  totalTopics: number;
  soru: number;
}

export interface LockedBranch {
  id: string;
  baslik: string;
}

export interface NewestTopic {
  topicId: string;
  branchId: string;
  baslik: string;
  soru: number;
}

interface Overall {
  readyTopics: number;
  totalTopics: number;
  soru: number;
}

const BRANCH_ICONS: Record<string, React.ElementType> = {
  endokrinoloji: FlaskConical,
  hematoloji: Droplet,
  romatoloji: Bone,
  'gogus-hastaliklari': Wind,
  gastroenteroloji: Pill,
  nefroloji: Filter,
  kardiyoloji: HeartPulse,
  onkoloji: Microscope,
  enfeksiyon: Bug,
};

export default function YdusDashboardClient({
  lang,
  branches,
  lockedBranches,
  newest,
  overall,
}: {
  lang: string;
  branches: BranchCard[];
  lockedBranches: LockedBranch[];
  newest: NewestTopic[];
  overall: Overall;
}) {
  const { xp, completedModules } = useUser();
  const progressPct = overall.totalTopics > 0
    ? Math.round((overall.readyTopics / overall.totalTopics) * 100)
    : 0;
  // Bu rota zaten premium erişim gerektirdiğinden (bkz. plan.guard.js) rozet sabit gösterilir
  const plan = "premium" as const;
  const featured = newest[0];
  const strip = newest.slice(featured ? 1 : 0);

  return (
    <div className="min-h-screen bg-[#f7f9fc] font-sans text-slate-800">

      {/* HEADER */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope size={16} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 leading-none">YDUS Hazırlık</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Premium sınav modülü</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <PlanBadge plan={plan} />
            <Link href={`/${lang}/premium/ydus/profil`} className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center hover:bg-slate-200 transition-colors text-sm">
              👨‍⚕️
            </Link>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* METRİK KARTLARI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[11px] text-slate-400 mb-1">Genel ilerleme</p>
            <p className="text-2xl font-semibold text-slate-800">%{progressPct}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[11px] text-slate-400 mb-1">Hazır konu</p>
            <p className="text-2xl font-semibold text-slate-800">{overall.readyTopics}<span className="text-sm text-slate-400 font-normal">/{overall.totalTopics}</span></p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[11px] text-slate-400 mb-1">Toplam soru</p>
            <p className="text-2xl font-semibold text-slate-800">{overall.soru}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-[11px] text-slate-400 mb-1 flex items-center gap-1"><Award size={12} /> Puanınız</p>
            <p className="text-2xl font-semibold text-slate-800">{xp ?? 0}<span className="text-sm text-slate-400 font-normal"> xp</span></p>
          </div>
        </div>

        {/* ÖNE ÇIKAN / YENİ EKLENEN */}
        {featured && (
          <Link
            href={`/${lang}/premium/ydus/${featured.branchId}/${featured.topicId}`}
            className="flex items-center justify-between gap-4 bg-white rounded-xl border border-blue-200 px-5 py-4 mb-6 hover:border-blue-400 transition-colors group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                <PlayCircle size={20} className="text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-slate-400">Yeni eklendi</p>
                <p className="text-sm font-semibold text-slate-800 truncate">{featured.baslik} · {featured.soru} soru</p>
              </div>
            </div>
            <span className="flex-shrink-0 flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg group-hover:bg-blue-100 transition-colors">
              Başla <ChevronRight size={14} />
            </span>
          </Link>
        )}

        {/* BRANŞLAR */}
        <p className="text-sm font-semibold text-slate-600 mb-3">Branşlar</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {branches.map((b) => {
            const Icon = BRANCH_ICONS[b.id] ?? FlaskConical;
            const pct = b.totalTopics > 0 ? Math.round((b.readyTopics / b.totalTopics) * 100) : 0;
            return (
              <div key={b.id} className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
                  style={{ background: `${b.renk}15` }}
                >
                  <Icon size={18} style={{ color: b.renk }} />
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-0.5">{b.baslik}</p>
                <p className="text-[12px] text-slate-400 mb-3">{b.readyTopics}/{b.totalTopics} konu hazır · {b.soru} soru</p>
                <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: b.renk }} />
                </div>
                <Link
                  href={`/${lang}/premium/ydus/${b.id}`}
                  className="mt-auto text-center text-xs font-medium py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Branşa git
                </Link>
              </div>
            );
          })}

          {lockedBranches.length > 0 && (
            <div className="bg-slate-50 rounded-xl border border-dashed border-slate-200 p-4 flex flex-col items-center justify-center text-center gap-1.5">
              <Lock size={16} className="text-slate-400" />
              <p className="text-[12px] text-slate-400 leading-relaxed">
                {lockedBranches.map(b => b.baslik).join(', ')}<br />yakında
              </p>
            </div>
          )}
        </div>

        {/* YENİ EKLENENLER ŞERİDİ */}
        {strip.length > 0 && (
          <>
            <p className="text-sm font-semibold text-slate-600 mb-3">Diğer yeni eklenenler</p>
            <div className="flex gap-3 overflow-x-auto pb-2 mb-8">
              {strip.map((t) => (
                <Link
                  key={t.topicId}
                  href={`/${lang}/premium/ydus/${t.branchId}/${t.topicId}`}
                  className="flex-shrink-0 w-40 bg-white rounded-xl border border-slate-200 p-3 hover:border-blue-300 transition-colors"
                >
                  <span className="text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">yeni</span>
                  <p className="text-[13px] font-medium text-slate-800 mt-2 leading-snug">{t.baslik}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t.soru} soru</p>
                </Link>
              ))}
            </div>
          </>
        )}

        {completedModules.length > 0 && (
          <p className="text-center text-[11px] text-slate-400 mt-6">
            {completedModules.length} vaka tamamladınız
          </p>
        )}

      </main>
    </div>
  );
}
