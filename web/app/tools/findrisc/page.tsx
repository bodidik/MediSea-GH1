"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const AGE_OPTS    = [["< 45 yaş", 0], ["45–54 yaş", 2], ["55–64 yaş", 3], ["≥ 65 yaş", 4]] as const;
const BMI_OPTS    = [["< 25 kg/m²", 0], ["25–30 kg/m²", 1], ["≥ 30 kg/m²", 3]] as const;
const WAIST_M     = [["< 94 cm", 0], ["94–102 cm", 3], ["> 102 cm", 4]] as const;
const WAIST_F     = [["< 80 cm", 0], ["80–88 cm", 3], ["> 88 cm", 4]] as const;
const ACTIVITY    = [["≥ 30 dak/gün fiziksel aktivite", 0], ["< 30 dak/gün fiziksel aktivite", 2]] as const;
const VEG_OPTS    = [["Her gün sebze/meyve tüketiyor", 0], ["Her gün tüketmiyor", 1]] as const;
const BPMED_OPTS  = [["Hipertansiyon ilacı kullanmıyor", 0], ["Hipertansiyon ilacı kullanıyor", 2]] as const;
const GLUHI_OPTS  = [["Yüksek kan şekeri saptanmadı", 0], ["Yüksek kan şekeri saptandı", 5]] as const;
const FAMHX_OPTS  = [["Aile öyküsü yok", 0], ["2. derece akrabada diyabet", 3], ["1. derece akrabada diyabet", 5]] as const;

export default function FindriscPage() {
  const [sex, setSex]       = React.useState<"m" | "f">("m");
  const [age, setAge]       = React.useState(0);
  const [bmi, setBmi]       = React.useState(0);
  const [waist, setWaist]   = React.useState(0);
  const [act, setAct]       = React.useState(0);
  const [veg, setVeg]       = React.useState(0);
  const [bp, setBp]         = React.useState(0);
  const [glu, setGlu]       = React.useState(0);
  const [fam, setFam]       = React.useState(0);

  const score = age + bmi + waist + act + veg + bp + glu + fam;

  const getRisk = () => {
    if (score <= 6)  return { label: "DÜŞÜK RİSK",       sub: "10 yıllık T2DM riski ~%1",    color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (score <= 11) return { label: "HAFIF YÜKSELMİŞ",  sub: "10 yıllık T2DM riski ~%4",    color: "text-lime-700",    bg: "bg-lime-50",    border: "border-lime-200" };
    if (score <= 14) return { label: "ORTA RİSK",         sub: "10 yıllık T2DM riski ~%17",   color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-200" };
    if (score <= 20) return { label: "YÜKSEK RİSK",       sub: "10 yıllık T2DM riski ~%33",   color: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-200" };
    return           { label: "ÇOK YÜKSEK RİSK",          sub: "10 yıllık T2DM riski ~%50",   color: "text-rose-700",   bg: "bg-rose-50",    border: "border-rose-200" };
  };
  const r = getRisk();
  const waistOpts = sex === "m" ? WAIST_M : WAIST_F;
  const params = { sex, age, bmi, waist, act, veg, bp, glu, fam };

  const RadioGroup = ({ label, opts, value, onChange }: { label: string; opts: readonly (readonly [string, number])[]; value: number; onChange: (v: number) => void }) => (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
      <span className="text-sm font-bold text-blue-900/80 block">{label}</span>
      <div className="grid gap-1.5">
        {opts.map(([l, v]) => (
          <label key={v + l} className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all
            ${value === v && l === opts.find(o => o[1] === value)?.[0] ? 'bg-blue-900 border-blue-900' : 'bg-white border-slate-100 hover:border-blue-900/30'}`}>
            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
              ${value === v ? 'border-amber-400 bg-amber-400' : 'border-slate-300'}`}>
              {value === v && <div className="w-1.5 h-1.5 rounded-full bg-blue-900" />}
            </div>
            <input type="radio" className="hidden" checked={value === v} onChange={() => onChange(v)} />
            <span className={`text-[12px] font-bold flex-1 ${value === v ? 'text-white' : 'text-blue-900/70'}`}>{l}</span>
            <span className={`text-[10px] font-black ${value === v ? 'text-amber-400' : 'text-slate-400'}`}>+{v}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="findrisc" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦋</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">FINDRISC</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Tip 2 Diyabet 10 Yıllık Risk Taraması</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-sm font-bold text-blue-900/80 block mb-2">Cinsiyet</span>
            <div className="flex gap-3">
              {(["m", "f"] as const).map(v => (
                <label key={v} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all
                  ${sex === v ? 'bg-blue-900 border-blue-900 text-white' : 'bg-white border-slate-100 hover:border-blue-900/30'}`}>
                  <input type="radio" className="hidden" checked={sex === v} onChange={() => { setSex(v); setWaist(0); }} />
                  <span className={`text-sm font-bold ${sex === v ? 'text-white' : 'text-blue-900/70'}`}>{v === "m" ? "Erkek" : "Kadın"}</span>
                </label>
              ))}
            </div>
          </div>
          <RadioGroup label="Yaş" opts={AGE_OPTS} value={age} onChange={setAge} />
          <RadioGroup label="BMI" opts={BMI_OPTS} value={bmi} onChange={setBmi} />
          <RadioGroup label={`Bel Çevresi (${sex === "m" ? "Erkek" : "Kadın"})`} opts={waistOpts} value={waist} onChange={setWaist} />
          <RadioGroup label="Fiziksel Aktivite" opts={ACTIVITY} value={act} onChange={setAct} />
          <RadioGroup label="Sebze / Meyve Tüketimi" opts={VEG_OPTS} value={veg} onChange={setVeg} />
          <RadioGroup label="Hipertansiyon İlacı" opts={BPMED_OPTS} value={bp} onChange={setBp} />
          <RadioGroup label="Geçmişte Yüksek Kan Şekeri" opts={GLUHI_OPTS} value={glu} onChange={setGlu} />
          <RadioGroup label="Aile Öyküsü" opts={FAMHX_OPTS} value={fam} onChange={setFam} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">FINDRISC</span>
            <div className="text-5xl font-black text-white">{score}</div>
            <span className="text-[10px] font-black text-blue-300 mt-1">/ 26</span>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed ${r.border} ${r.bg}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">RİSK KATEGORİSİ</span>
            <p className={`text-2xl font-black italic tracking-tight ${r.color}`}>{r.label}</p>
            <p className={`text-sm font-bold mt-1 ${r.color} opacity-80`}>{r.sub}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              FINDRISC (Finnish Diabetes Risk Score) non-invazif toplum taraması için geliştirilmiştir. Skor ≥12 olan hastalarda açlık kan şekeri veya OGTT ile doğrulama önerilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
