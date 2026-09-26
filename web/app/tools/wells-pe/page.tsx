"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { bicimle, sozluk } from "@/lib/dil";
import { useDil } from "@/app/components/DilBaglami";
import metin from "./metin.dil.json";

const M = sozluk(metin);
type Metin = ReturnType<typeof M>;

type Item = { key: string; label: string; pts: number; sub?: string };

/* Metin `metin.dil.json`da (TR + EN); puanlar, eşikler ve kimlikler burada, TEK kopya. */
const itemsOf = (t: Metin): Item[] => [
  { key: "dvt",        label: t.dvt,        pts: 3,   sub: t.dvt_sub },
  { key: "altHigher",  label: t.altHigher,  pts: 3,   sub: t.altHigher_sub },
  { key: "tachy",      label: t.tachy,      pts: 1.5, sub: t.tachy_sub },
  { key: "immob",      label: t.immob,      pts: 1.5, sub: t.immob_sub },
  { key: "prevVTE",    label: t.prevVTE,    pts: 1.5, sub: t.prevVTE_sub },
  { key: "hemoptysis", label: t.hemoptysis, pts: 1,   sub: t.hemoptysis_sub },
  { key: "malignancy", label: t.malignancy, pts: 1,   sub: t.malignancy_sub },
];

const PE_MAX = 12.5;
/* Bölge ve eylem KİMLİKLE eşleşir (`id`), etiketle değil: etiket dile göre değişiyor. */
const zonesOf = (t: Metin) => [
  { id: "dusuk",  from: 0, to: 2,    label: t.dusuk,  prob: t.prob_dusuk,  fill: "#10b981", koyu: "#047857", text: "#065f46", band: "< 2 pt", action: t.eylem_dusuk },
  { id: "orta",   from: 2, to: 6,    label: t.orta,   prob: t.prob_orta,   fill: "#f59e0b", koyu: "#b45309", text: "#78350f", band: "2–6 pt", action: t.eylem_orta },
  { id: "yuksek", from: 6, to: 12.5, label: t.yuksek, prob: t.prob_yuksek, fill: "#f43f5e", koyu: "#be123c", text: "#881337", band: "> 6 pt", action: t.eylem_yuksek },
];

function round(n: number, dp = 1) {
  return Math.round(n * Math.pow(10, dp)) / Math.pow(10, dp);
}

export default function WellsPEPage() {
  const t = M(useDil());
  const ITEMS = itemsOf(t);
  const ZONES = zonesOf(t);
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const initial: Record<string, boolean> = {};
  ITEMS.forEach(i => { initial[i.key] = (search?.get(i.key) === "1"); });

  const [sel, setSel] = React.useState<Record<string, boolean>>(initial);
  function toggle(k: string) { setSel(s => ({ ...s, [k]: !s[k] })); }

  const score = round(ITEMS.reduce((sum, it) => sum + (sel[it.key] ? it.pts : 0), 0), 1);

  const activeZone = [...ZONES].reverse().find(z => score >= z.from) ?? ZONES[0];

  const params: Record<string, string | number> = {};
  ITEMS.forEach(i => { if (sel[i.key]) params[i.key] = 1; });

  // SVG gauge
  const W = 400; const H = 68; const R = 10;
  const clampedPct = Math.max(0, Math.min(score / PE_MAX, 1));
  const indX = clampedPct * W;
  const zoneRects = ZONES.map(z => ({ ...z, x: (z.from / PE_MAX) * W, w: ((z.to - z.from) / PE_MAX) * W }));

  // Seçili kriter katkı barları
  const selectedItems = ITEMS.filter(it => sel[it.key]);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <ToolTopNav toolSlug="wells-pe" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span className="drop-shadow-sm">🫁</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Wells (PE)</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{t.altBaslik}</p>
          </div>
        </div>

        {/* KRİTERLER */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid gap-2">
            {ITEMS.map((it) => (
              <label key={it.key}
                className={`focus-within:ring-2 focus-within:ring-blue-700 focus-within:ring-offset-2 flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
                  ${sel[it.key] ? "bg-blue-900 border-blue-900 text-white shadow-md" : "bg-slate-50 border-slate-100 hover:border-blue-900/30"}`}>
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all
                    ${sel[it.key] ? "bg-amber-400 border-amber-400 text-blue-900 shadow-[0_0_8px_rgba(245,158,11,0.5)]" : "bg-white border-slate-200 text-transparent"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <div>
                    <span className={`text-sm font-bold block transition-colors ${sel[it.key] ? "text-white" : "text-blue-900/80 group-hover:text-blue-900"}`}>{it.label}</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${sel[it.key] ? "text-blue-200" : "text-slate-400"}`}>{it.sub}</span>
                  </div>
                </div>
                <input type="checkbox" className="sr-only" checked={!!sel[it.key]} onChange={() => toggle(it.key)} />
                <span className={`text-[10px] font-black tracking-widest ${sel[it.key] ? "text-amber-400" : "text-slate-400"}`}>+{it.pts}</span>
              </label>
            ))}
          </div>
        </div>

        {/* GRAFİK SKOR KARTI */}
        <SonucDuyuru metin={bicimle(t.duyuru, { label: activeZone.label, prob: activeZone.prob })} />

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-6">

          {/* Skor + risk özet */}
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
              <span className="text-[8px] font-black text-blue-300 uppercase tracking-widest">{t.skor}</span>
              <span className="text-4xl font-black text-white leading-none">{score}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{t.kategori}</p>
              <p className="text-2xl font-black italic tracking-tight" style={{ color: activeZone.text }}>
                {activeZone.label}{t.riskEk}<span className="text-sm font-bold">{activeZone.prob}</span>
              </p>
              <p className="text-[10px] font-bold text-slate-500 mt-1">{activeZone.action}</p>
            </div>
          </div>

          {/* SVG Gauge Bar */}
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">{t.skala}</p>
            <svg viewBox={`-2 -2 ${W + 4} ${H + 28}`} className="w-full" style={{ overflow: "visible" }}>
              <defs>
                <clipPath id="pe-bar-outer"><rect x="0" y="0" width={W} height={H} rx={R} ry={R} /></clipPath>
                <clipPath id="pe-bar-fill"><rect x="0" y="0" width={Math.max(indX, 0)} height={H} /></clipPath>
              </defs>

              {/* Zone arka plan */}
              <g clipPath="url(#pe-bar-outer)">
                {zoneRects.map(z => (
                  <rect key={z.id + "bg"} x={z.x} y={0} width={z.w} height={H} fill={z.fill} opacity={0.12} />
                ))}
              </g>

              {/* Dolu dolgu */}
              <g clipPath="url(#pe-bar-outer)">
                <g clipPath="url(#pe-bar-fill)">
                  {zoneRects.map(z => (
                    <rect key={z.id + "fill"} x={z.x} y={0} width={z.w} height={H} fill={z.fill} opacity={0.55} />
                  ))}
                </g>
              </g>

              {/* Zone ayırıcı çizgiler */}
              <g clipPath="url(#pe-bar-outer)">
                {zoneRects.slice(1).map(z => (
                  <line key={z.id + "div"} x1={z.x} y1={0} x2={z.x} y2={H} stroke="white" strokeWidth="2" opacity={0.7} />
                ))}
              </g>

              {/* Zone etiketleri */}
              {zoneRects.map(z => (
                <g key={z.id + "lbl"}>
                  <text x={z.x + z.w / 2} y={H / 2 - 6} textAnchor="middle"
                    fill={z.fill} fontSize={10} fontWeight="900" fontFamily="sans-serif"
                    style={{ letterSpacing: 1.5, textTransform: "uppercase" }}>{z.label}</text>
                  <text x={z.x + z.w / 2} y={H / 2 + 10} textAnchor="middle"
                    fill={z.text} fontSize={9} fontWeight="700" fontFamily="sans-serif" opacity={0.7}>{z.band}</text>
                </g>
              ))}

              {/* Çerçeve */}
              <rect x="0" y="0" width={W} height={H} rx={R} ry={R} fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* İndikatör */}
              {score > 0 && (
                <>
                  <line x1={indX} y1={4} x2={indX} y2={H - 4} stroke="white" strokeWidth="2.5" opacity={0.9} />
                  <circle cx={indX} cy={H / 2} r={13} fill={activeZone.fill} stroke="white" strokeWidth="2.5" />
                  <text x={indX} y={H / 2 + 5} textAnchor="middle" fill="white" fontSize={10} fontWeight="900" fontFamily="sans-serif">{score}</text>
                </>
              )}

              {/* Ölçek etiketi */}
              <text x={0}      y={H + 18} textAnchor="start"  fill="#94a3b8" fontSize={9} fontWeight="700" fontFamily="sans-serif">0</text>
              <text x={(2/PE_MAX)*W} y={H + 18} textAnchor="middle" fill="#94a3b8" fontSize={9} fontWeight="700" fontFamily="sans-serif">2</text>
              <text x={(6/PE_MAX)*W} y={H + 18} textAnchor="middle" fill="#94a3b8" fontSize={9} fontWeight="700" fontFamily="sans-serif">6</text>
              <text x={W}      y={H + 18} textAnchor="end"    fill="#94a3b8" fontSize={9} fontWeight="700" fontFamily="sans-serif">12.5</text>
              {/* Ölçek tik */}
              {[0, 2, 6, 12.5].map(v => (
                <line key={v} x1={(v/PE_MAX)*W} y1={H+1} x2={(v/PE_MAX)*W} y2={H+6} stroke="#cbd5e1" strokeWidth="1.5" />
              ))}
            </svg>
          </div>

          {/* Seçili kriter katkı listesi */}
          {selectedItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.secili}</p>
              {selectedItems.map(it => {
                const barPct = (it.pts / PE_MAX) * 100;
                return (
                  <div key={it.key} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-blue-900 truncate flex-1">{it.label}</span>
                    <div className="w-28 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                      <div className="h-full rounded-full bg-blue-900 transition-all" style={{ width: `${barPct}%` }} />
                    </div>
                    <span className="text-[10px] font-black text-amber-700 w-6 text-right shrink-0">+{it.pts}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3-zone özet bantlar */}
          <div className="grid grid-cols-3 gap-2">
            {ZONES.map(z => {
              const active = z.id === activeZone.id;
              return (
                <div key={z.id}className="rounded-xl p-3 text-center border transition-all"
                  style={{
                    background: active ? z.koyu : `${z.fill}18`,
                    borderColor: active ? z.fill : `${z.fill}40`,
                  }}>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: active ? "white" : z.text }}>{z.label}</p>
                  <p className="text-[8px] font-bold" style={{ color: active ? "white" : z.text }}>{z.band}</p>
                  <p className="text-[9px] font-black mt-0.5" style={{ color: active ? "white" : z.koyu }}>{z.prob}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ALT PANEL */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {t.uyari}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
