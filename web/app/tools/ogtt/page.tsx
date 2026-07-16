"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

const CONTEXTS = [
  { id: "dm", label: "T2DM / Prediyabet Taraması", icon: "🩸" },
  { id: "gdm", label: "Gestasyonel Diyabet (GDM)", icon: "🤰" },
  { id: "acro", label: "Akromegali — GH Süpresyon", icon: "📏" },
] as const;
type Ctx = typeof CONTEXTS[number]["id"];

function DmResult({ fasting, twoHour }: { fasting: number; twoHour: number }) {
  const interpret = (fg: number, h2: number) => {
    const fgCat = fg < 100 ? 0 : fg < 126 ? 1 : 2;
    const h2Cat = h2 === 0 ? -1 : h2 < 140 ? 0 : h2 < 200 ? 1 : 2;
    const cat = Math.max(fgCat, h2Cat === -1 ? 0 : h2Cat);
    if (cat === 0) return { label: "NORMAL", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", sub: "Açlık < 100 mg/dL · 2.saat < 140 mg/dL" };
    if (cat === 1) return { label: "PREDİYABET", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", sub: fg >= 100 && fg < 126 ? "Bozulmuş Açlık Glukozu (BAG)" : "Bozulmuş Glukoz Toleransı (BGT)" };
    return { label: "DİYABET MELLİTUS", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", sub: "Tanı doğrulama gerekli (semptom yoksa)" };
  };
  const r = interpret(fasting, twoHour);
  return (
    <div className={`p-6 rounded-[2rem] border-2 border-dashed ${r.border} ${r.bg}`}>
      <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">SONUÇ (ADA Kriterleri)</div>
      <p className={`text-2xl font-black italic tracking-tight ${r.color}`}>{r.label}</p>
      <p className={`text-sm font-bold mt-1 ${r.color} opacity-80`}>{r.sub}</p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { label: "Açlık", ref: "< 100 normal · 100–125 BAG · ≥ 126 DM" },
          { label: "2. Saat", ref: "< 140 normal · 140–199 BGT · ≥ 200 DM" },
        ].map(({ label, ref }) => (
          <div key={label} className="bg-white/60 rounded-xl p-3 border border-white">
            <div className="text-[9px] font-black text-blue-900/50 uppercase tracking-widest mb-0.5">{label}</div>
            <div className="text-[10px] font-bold text-blue-900/70">{ref}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GdmResult({ fasting, oneHour, twoHour, threeHour }: { fasting: number; oneHour: number; twoHour: number; threeHour: number }) {
  const iadpsg = [
    { label: "Açlık", val: fasting, cut: 92, ok: fasting > 0 && fasting < 92 },
    { label: "1. Saat", val: oneHour, cut: 180, ok: oneHour > 0 && oneHour < 180 },
    { label: "2. Saat", val: twoHour, cut: 153, ok: twoHour > 0 && twoHour < 153 },
  ];
  const cc = [
    { label: "Açlık", val: fasting, cut: 95 },
    { label: "1. Saat", val: oneHour, cut: 180 },
    { label: "2. Saat", val: twoHour, cut: 155 },
    { label: "3. Saat", val: threeHour, cut: 140 },
  ];
  const iadpsgPos = iadpsg.filter(i => i.val > 0 && i.val >= i.cut).length >= 1;
  const ccPos = cc.filter(i => i.val > 0 && i.val >= i.cut).length >= 2;

  return (
    <div className="space-y-4">
      {[
        { name: "IADPSG (75g OGTT — 1 anormal yeterli)", items: iadpsg.map(i => ({ ...i, positive: i.val > 0 && i.val >= i.cut })), positive: iadpsgPos },
        { name: "Carpenter-Coustan (100g OGTT — ≥2 anormal)", items: cc.map(i => ({ ...i, positive: i.val > 0 && i.val >= i.cut })), positive: ccPos },
      ].map(({ name, items, positive }) => (
        <div key={name} className={`p-5 rounded-2xl border-2 border-dashed ${positive ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="text-[9px] font-black uppercase tracking-widest text-blue-900/40 mb-2">{name}</div>
          <p className={`text-lg font-black italic mb-3 ${positive ? 'text-rose-700' : 'text-emerald-700'}`}>
            {positive ? "GDM TANISI" : "GDM YOK"}
          </p>
          <div className="flex flex-wrap gap-2">
            {items.map(i => (
              <span key={i.label} className={`text-[10px] font-bold px-2 py-1 rounded-lg border ${i.val > 0 ? (i.positive ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200') : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                {i.label}: {i.val > 0 ? `${i.val}` : "–"} {i.val > 0 && `(eşik ${i.cut})`}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function AcroResult({ nadir, assay }: { nadir: number; assay: "standard" | "sensitive" }) {
  const cutoff = assay === "sensitive" ? 0.4 : 1.0;
  const suppressed = nadir > 0 && nadir < cutoff;
  return (
    <div className={`p-6 rounded-[2rem] border-2 border-dashed ${suppressed ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
      <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">
        SONUÇ — {assay === "sensitive" ? "Hassas Assay" : "Standart Assay"} eşiği: {cutoff} μg/L
      </div>
      <p className={`text-2xl font-black italic tracking-tight ${suppressed ? 'text-emerald-700' : 'text-rose-700'}`}>
        {nadir === 0 ? "–" : suppressed ? "GH SÜPRESİYONU YETERLI" : "GH SÜPRESİYONU YETERSİZ"}
      </p>
      <p className={`text-sm font-bold mt-1 ${suppressed ? 'text-emerald-700' : 'text-rose-700'} opacity-80`}>
        {nadir === 0 ? "" : suppressed ? "Akromegali dışlanır" : "Akromegali ile uyumlu — IGF-1 ve görüntüleme gerekli"}
      </p>
    </div>
  );
}

export default function OgttPage() {
  const [ctx, setCtx]           = React.useState<Ctx>("dm");
  const [fasting, setFasting]   = React.useState("");
  const [oneH,    setOneH]      = React.useState("");
  const [twoH,    setTwoH]      = React.useState("");
  const [threeH,  setThreeH]    = React.useState("");
  const [assay,   setAssay]     = React.useState<"standard" | "sensitive">("sensitive");

  const f = parseLocaleNumber(fasting);
  const h1 = parseLocaleNumber(oneH);
  const h2 = parseLocaleNumber(twoH);
  const h3 = parseLocaleNumber(threeH);

  const Input = ({ label, value, set, placeholder }: { label: string; value: string; set: (v: string) => void; placeholder: string }) => (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
      <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)} placeholder={placeholder}
        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="ogtt" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦋</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">OGTT Yorumlama</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Oral Glukoz Tolerans Testi — Çok Amaçlı Yorumlama</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Klinik Bağlam</p>
          {CONTEXTS.map(c => (
            <button key={c.id} type="button" onClick={() => setCtx(c.id)}
              className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center gap-3
                ${ctx === c.id ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
              <span className="text-xl">{c.icon}</span>
              <span className={`text-sm font-bold ${ctx === c.id ? 'text-white' : 'text-blue-950'}`}>{c.label}</span>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          {ctx === "dm" && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Açlık Glukoz (mg/dL)" value={fasting} set={setFasting} placeholder="ör. 98" />
              <Input label="2. Saat Glukoz (mg/dL)" value={twoH} set={setTwoH} placeholder="ör. 155" />
            </div>
          )}
          {ctx === "gdm" && (
            <div className="grid grid-cols-2 gap-4">
              <Input label="Açlık (mg/dL)" value={fasting} set={setFasting} placeholder="ör. 88" />
              <Input label="1. Saat (mg/dL)" value={oneH} set={setOneH} placeholder="ör. 175" />
              <Input label="2. Saat (mg/dL)" value={twoH} set={setTwoH} placeholder="ör. 150" />
              <Input label="3. Saat (mg/dL) — CC için" value={threeH} set={setThreeH} placeholder="ör. 135" />
            </div>
          )}
          {ctx === "acro" && (
            <div className="space-y-4">
              <div className="flex gap-3">
                {(["sensitive", "standard"] as const).map(a => (
                  <label key={a} className={`flex-1 flex items-center justify-center p-3 rounded-xl border cursor-pointer transition-all
                    ${assay === a ? 'bg-blue-900 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 hover:border-blue-900/30'}`}>
                    <input type="radio" className="hidden" checked={assay === a} onChange={() => setAssay(a)} />
                    <div className="text-center">
                      <div className={`text-sm font-bold ${assay === a ? 'text-white' : 'text-blue-900/80'}`}>{a === "sensitive" ? "Hassas Assay" : "Standart Assay"}</div>
                      <div className={`text-[9px] font-bold uppercase tracking-widest ${assay === a ? 'text-blue-200/70' : 'text-slate-400'}`}>{a === "sensitive" ? "Eşik: 0.4 μg/L" : "Eşik: 1.0 μg/L"}</div>
                    </div>
                  </label>
                ))}
              </div>
              <Input label="GH Nadir Değeri (μg/L)" value={twoH} set={setTwoH} placeholder="ör. 0.3" />
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">75g glukoz yükü sonrası 60–120. dakika ölçümü</p>
            </div>
          )}
        </div>

        {ctx === "dm" && f > 0 && <DmResult fasting={f} twoHour={h2} />}
        {ctx === "gdm" && (f > 0 || h1 > 0 || h2 > 0) && <GdmResult fasting={f} oneHour={h1} twoHour={h2} threeHour={h3} />}
        {ctx === "acro" && <AcroResult nadir={h2} assay={assay} />}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={{ ctx, f, h1, h2, h3, assay }} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              T2DM: Semptom yoksa tanı için 2 ayrı ölçüm gereklidir. GDM: Kurumsal protokol ve hafta tercihini dikkate alın. Akromegali: IGF-1 ile birlikte değerlendirilmelidir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
