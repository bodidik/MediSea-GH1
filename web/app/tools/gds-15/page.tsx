"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

// Yanıt "Evet" depresyon puanı veriyorsa scored=true, "Hayır" veriyorsa scored=false
const ITEMS: { id: string; q: string; scored: "evet" | "hayir" }[] = [
  { id: "q1",  q: "Hayatınızdan genel olarak memnun musunuz?",                    scored: "hayir" },
  { id: "q2",  q: "Aktivite ve ilgi alanlarınızı büyük ölçüde bıraktınız mı?",   scored: "evet" },
  { id: "q3",  q: "Hayatınızın boş olduğunu hissediyor musunuz?",                 scored: "evet" },
  { id: "q4",  q: "Sıklıkla sıkılıyor musunuz?",                                  scored: "evet" },
  { id: "q5",  q: "Çoğu zaman iyi ruh halinde misiniz?",                          scored: "hayir" },
  { id: "q6",  q: "Başınıza kötü bir şey geleceğinden korkuyor musunuz?",         scored: "evet" },
  { id: "q7",  q: "Çoğu zaman kendinizi mutlu hissediyor musunuz?",               scored: "hayir" },
  { id: "q8",  q: "Çoğu zaman çaresiz hissediyor musunuz?",                       scored: "evet" },
  { id: "q9",  q: "Dışarı çıkmak ve yeni şeyler denemek yerine evde kalmayı tercih ediyor musunuz?", scored: "evet" },
  { id: "q10", q: "Bellek sorunlarınızın olduğunu düşünüyor musunuz?",            scored: "evet" },
  { id: "q11", q: "Şu an hayatta olmanın güzel bir şey olduğunu düşünüyor musunuz?", scored: "hayir" },
  { id: "q12", q: "Kendinizi şu anki halinizle oldukça değersiz hissediyor musunuz?", scored: "evet" },
  { id: "q13", q: "Kendinizi enerjik hissediyor musunuz?",                         scored: "hayir" },
  { id: "q14", q: "Durumunuzun umutsuz olduğunu düşünüyor musunuz?",             scored: "evet" },
  { id: "q15", q: "Çoğu kişinin sizden daha iyi durumda olduğunu düşünüyor musunuz?", scored: "evet" },
];

export default function GDS15Page() {
  const [sel, setSel] = React.useState<Record<string, "evet" | "hayir" | null>>(
    Object.fromEntries(ITEMS.map(i => [i.id, null]))
  );

  const toggle = (id: string, val: "evet" | "hayir") =>
    setSel(s => ({ ...s, [id]: s[id] === val ? null : val }));

  const answered = ITEMS.filter(i => sel[i.id] !== null).length;
  const total = answered === 15
    ? ITEMS.reduce((s, i) => s + (sel[i.id] === i.scored ? 1 : 0), 0)
    : null;

  const getBand = (v: number) =>
    v <= 4  ? { label: "NORMAL",           sub: "Depresyon düşük olasılıklı", color: "emerald" } :
    v <= 8  ? { label: "HAFİF DEPRESYON",  sub: "Klinik değerlendirme önerilir", color: "amber" } :
    v <= 11 ? { label: "ORTA DEPRESYON",   sub: "Tedavi planlaması yapılmalı", color: "amber" } :
              { label: "AĞIR DEPRESYON",   sub: "Acil psikiyatri değerlendirmesi", color: "rose" };

  const band  = total !== null ? getBand(total) : null;
  const COLOR = {
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
    amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
    rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
  };
  const c = band ? COLOR[band.color as keyof typeof COLOR] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="gds-15" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🌤️</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">GDS-15</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Geriatrik Depresyon Ölçeği · Kısa Form · 15 Madde</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{answered}/15 soru yanıtlandı</span>
          <div className="flex flex-wrap gap-0.5">
            {ITEMS.map(i => (
              <div key={i.id} className={`w-4 h-2 rounded-sm transition-all ${sel[i.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Son bir haftanıza göre yanıtlayın</p>
          {ITEMS.map((item, idx) => (
            <div key={item.id} className="border border-slate-100 rounded-2xl p-3 bg-slate-50">
              <p className="text-[11px] font-bold text-blue-950 mb-2">
                <span className="font-black text-slate-400 mr-1.5">{idx + 1}.</span>{item.q}
              </p>
              <div className="flex gap-2">
                {(["evet", "hayir"] as const).map(opt => {
                  const active = sel[item.id] === opt;
                  const scores = active && opt === item.scored;
                  return (
                    <button key={opt} type="button" onClick={() => toggle(item.id, opt)}
                      className={`flex-1 py-2 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all
                        ${active ? scores ? "border-rose-500 bg-rose-500 text-white" : "border-blue-900 bg-blue-900 text-white"
                                 : "border-slate-200 bg-white text-slate-500 hover:border-blue-200"}`}>
                      {opt === "evet" ? "Evet" : "Hayır"}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {total !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-3`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[8px] font-black text-blue-300 uppercase">SKOR</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 15</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-[8px]">
              {[
                { l: "Normal", r: "0–4", col: "emerald" },
                { l: "Hafif", r: "5–8", col: "amber" },
                { l: "Orta", r: "9–11", col: "amber" },
                { l: "Ağır", r: "12–15", col: "rose" },
              ].map(b => (
                <div key={b.l} className={`rounded-lg p-1.5 font-black uppercase
                  ${b.l === band.label.split(" ")[0] ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.l}</div><div className="font-bold normal-case">{b.r}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 15 soruyu yanıtlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={Object.fromEntries(ITEMS.map(i => [i.id, sel[i.id] ?? ""]))} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              GDS-15 tarama aracıdır; tanı koymaz. Pozitif sonuçlarda DSM-5 kriterleriyle kapsamlı psikiyatrik değerlendirme gereklidir. Yesavage et al., 1986.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
