"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const LEVELS: { score: number; label: string; detail: string; color: string }[] = [
  { score: 4,  label: "+4 — Çok Ajite",   detail: "Agresif, endotrakeal tüpü veya kateterleri çekiyor, personele saldırıyor", color: "rose" },
  { score: 3,  label: "+3 — Çok Ajite",   detail: "Sık hareket, uyarılara rağmen endotrakeal tüpü çekiyor", color: "rose" },
  { score: 2,  label: "+2 — Ajite",        detail: "Sık, amaçsız hareketler, ventilatörle uyumsuz", color: "orange" },
  { score: 1,  label: "+1 — Huzursuz",     detail: "Kaygılı, hareketler hızlı ama agresif değil", color: "amber" },
  { score: 0,  label: "0 — Uyanık & Sakin","detail": "Uyarı yok, spontan uyanık ve sakin", color: "emerald" },
  { score: -1, label: "-1 — Uykuya Meyilli","detail": "Sesli uyarıya > 10 sn açık göz ile tam uyanış", color: "sky" },
  { score: -2, label: "-2 — Hafif Sedasyon","detail": "Sesli uyarıya < 10 sn açık göz ile uyanış", color: "sky" },
  { score: -3, label: "-3 — Orta Sedasyon","detail": "Sesli uyarıya hareket var ama göz açmıyor", color: "blue" },
  { score: -4, label: "-4 — Derin Sedasyon","detail": "Sesli uyarıya yanıt yok; fiziksel uyarıya hareket var", color: "violet" },
  { score: -5, label: "-5 — Uyanmaz",      detail: "Sesli ve fiziksel uyarıya yanıt yok", color: "slate" },
];

const COLOR_MAP: Record<string, { bg: string; border: string; badge: string; text: string }> = {
  rose:   { bg: "bg-rose-50",   border: "border-rose-300",   badge: "bg-rose-700 text-white",   text: "text-rose-700" },
  orange: { bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-600 text-white", text: "text-orange-700" },
  amber:  { bg: "bg-amber-50",  border: "border-amber-200",  badge: "bg-amber-600 text-white",  text: "text-amber-700" },
  emerald:{ bg: "bg-emerald-50",border: "border-emerald-200",badge: "bg-emerald-700 text-white",text: "text-emerald-700" },
  sky:    { bg: "bg-sky-50",    border: "border-sky-200",    badge: "bg-sky-700 text-white",    text: "text-sky-700" },
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   badge: "bg-blue-700 text-white",   text: "text-blue-700" },
  violet: { bg: "bg-violet-50", border: "border-violet-200", badge: "bg-violet-700 text-white", text: "text-violet-700" },
  slate:  { bg: "bg-slate-100", border: "border-slate-300",  badge: "bg-slate-700 text-white",  text: "text-slate-700" },
};

const TARGET_RANGE = "−1 ile 0 arası (hafif sedasyon veya uyanık/sakin)";

export default function RASSPage() {
  const [selected, setSelected] = React.useState<number | null>(null);
  const level = selected !== null ? LEVELS.find(l => l.score === selected) : null;
  const c = level ? COLOR_MAP[level.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="rass" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">😴</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">RASS</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Richmond Ajitasyon–Sedasyon Skalası · YBÜ · −5 / +4</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-3">
          <p className="text-[10px] font-bold text-blue-800">📌 Hedef: Mekanik ventilasyondaki hastalarda RASS −1 ile 0 (hafif sedasyon). Aşırı sedasyon morbiditeyi artırır. Günlük sedasyon tatili değerlendirin.</p>
        </div>

        <div className="space-y-2">
          {LEVELS.map(lvl => {
            const col = COLOR_MAP[lvl.color];
            const isSelected = selected === lvl.score;
            return (
              <button key={lvl.score} type="button"
                onClick={() => setSelected(s => s === lvl.score ? null : lvl.score)}
                className={`w-full text-left flex items-center gap-4 p-3 rounded-2xl border-2 transition-all
                  ${isSelected ? `${col.border} ${col.bg}` : "border-slate-200 bg-white hover:border-blue-200"}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0
                  ${isSelected ? col.badge.split(" ")[0] + " " + col.badge.split(" ")[1] : "bg-slate-100 text-slate-500"}`}>
                  {lvl.score > 0 ? `+${lvl.score}` : lvl.score}
                </div>
                <div>
                  <p className={`font-black text-sm ${isSelected ? col.text : "text-blue-900"}`}>{lvl.label}</p>
                  <p className="text-[9px] font-bold text-slate-400 mt-0.5">{lvl.detail}</p>
                </div>
              </button>
            );
          })}
        </div>

        {selected !== null && level && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg}`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">RASS</span>
                <span className="text-4xl font-black text-white leading-none">{selected > 0 ? `+${selected}` : selected}</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{level.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{level.detail}</p>
                <p className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest">Hedef aralık: {TARGET_RANGE}</p>
                {selected >= 2 && <p className="text-[9px] font-bold text-rose-600 mt-0.5">Sedatif + analjezi titrasyonu gerekli</p>}
                {selected <= -3 && <p className="text-[9px] font-bold text-violet-600 mt-0.5">Sedasyon azaltma veya tatil planlanmalı</p>}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bir RASS seviyesi seçin</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={{ rass: selected ?? 0 }} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              RASS, PAD kılavuzu (2013) tarafından önerilen standart ajitasyon–sedasyon skalasıdır. CAM-ICU ile kombine kullanım deliryum takibini optimize eder. Sessler et al., AJRCCM 2002.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
