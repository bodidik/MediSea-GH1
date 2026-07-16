"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS_1 = [
  { key: "mi",       label: "Miyokard Enfarktüsü",           sub: "EKG veya enzim kanıtı" },
  { key: "chf",      label: "Konjestif Kalp Yetmezliği",     sub: "" },
  { key: "pvd",      label: "Periferik Vasküler Hastalık",   sub: "Klodikasyon, bypass, amputasyon" },
  { key: "cvd",      label: "Serebrovasküler Hastalık",      sub: "İnme veya TİA öyküsü, rezidüsüz" },
  { key: "demans",   label: "Demans",                        sub: "" },
  { key: "copd",     label: "Kronik Pulmoner Hastalık",      sub: "KAH, KOAH, amfizem dahil" },
  { key: "ctd",      label: "Bağ Doku Hastalığı",            sub: "RA, SLE, polimiyozit vb." },
  { key: "pud",      label: "Peptik Ülser Hastalığı",        sub: "Tedavi gerektirmiş ülser" },
  { key: "mildliver",label: "Hafif Karaciğer Hastalığı",    sub: "Kronik hepatit, siroz (komplikasyonsuz)" },
  { key: "dm",       label: "Diabetes Mellitus",             sub: "İnsülin veya oral ajan, komplikasyonsuz" },
];

const ITEMS_2 = [
  { key: "hemi",     label: "Hemiplej / Parapleji",          sub: "+2 puan" },
  { key: "ckd",      label: "Orta–Ağır Böbrek Hastalığı",   sub: "+2 puan · Kr >3 mg/dL veya diyaliz" },
  { key: "dmcomp",   label: "DM — End-Organ Hasarı",         sub: "+2 puan · Retinopati, nöropati, nefropati" },
  { key: "tumor",    label: "Solid Tümör",                   sub: "+2 puan · Lokal (son 5 yıl)" },
  { key: "leukemia", label: "Lösemi",                        sub: "+2 puan" },
  { key: "lymphoma", label: "Lenfoma",                       sub: "+2 puan" },
];

const ITEMS_3 = [
  { key: "sevliver", label: "Orta–Ağır Karaciğer Hastalığı", sub: "+3 puan · Portal hipertansiyon, kanama öyküsü" },
];

const ITEMS_6 = [
  { key: "mets",     label: "Metastatik Solid Tümör",        sub: "+6 puan" },
  { key: "aids",     label: "AIDS",                          sub: "+6 puan · HIV pozitiflik değil, AIDS tanısı" },
];

const AGE_OPTS = [["<50", 0], ["50–59", 1], ["60–69", 2], ["70–79", 3], ["≥80", 4]] as const;

function CheckItem({ label, sub, pts, checked, onChange }: { label: string; sub: string; pts: number; checked: boolean; onChange: () => void }) {
  return (
    <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
      ${checked ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
      <div className="flex items-center gap-4">
        <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0
          ${checked ? 'bg-amber-400 border-amber-400 text-blue-900' : 'bg-white border-slate-200 text-transparent'}`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        </div>
        <div>
          <span className={`text-sm font-bold block ${checked ? 'text-white' : 'text-blue-900/70 group-hover:text-blue-900'}`}>{label}</span>
          {sub && <span className={`text-[9px] font-bold uppercase tracking-widest ${checked ? 'text-blue-200/60' : 'text-slate-400'}`}>{sub}</span>}
        </div>
      </div>
      <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      <span className={`text-[10px] font-black tracking-widest shrink-0 ml-2 ${checked ? 'text-amber-400' : 'text-slate-400'}`}>+{pts}</span>
    </label>
  );
}

function Section({ title }: { title: string }) {
  return <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-2 mb-1">{title}</p>;
}

export default function CharlsonPage() {
  const [sel, setSel] = React.useState<Record<string, boolean>>({});
  const [agePts, setAgePts] = React.useState(0);

  const toggle = (k: string) => setSel(p => ({...p, [k]: !p[k]}));

  const score = agePts
    + ITEMS_1.reduce((s, it) => s + (sel[it.key] ? 1 : 0), 0)
    + ITEMS_2.reduce((s, it) => s + (sel[it.key] ? 2 : 0), 0)
    + ITEMS_3.reduce((s, it) => s + (sel[it.key] ? 3 : 0), 0)
    + ITEMS_6.reduce((s, it) => s + (sel[it.key] ? 6 : 0), 0);

  const mortality10yr = Math.round(0.983 ** Math.exp(0.9 * score) * 1000) / 10;
  const params: Record<string, number> = { age: agePts };
  [...ITEMS_1, ...ITEMS_2, ...ITEMS_3, ...ITEMS_6].forEach(it => { if (sel[it.key]) params[it.key] = 1; });

  const getRisk = () => {
    if (score <= 1) return { label: "DÜŞÜK", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
    if (score <= 2) return { label: "ORTA", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };
    if (score <= 5) return { label: "YÜKSEK", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" };
    return { label: "ÇOK YÜKSEK", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  };
  const r = getRisk();

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="charlson" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">📋</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Charlson Komorbidite</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">CCI — 10 Yıllık Mortalite Tahmini</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <Section title="Yaş" />
          <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 mb-2">
            <span className="text-sm font-bold text-blue-900/80">Yaş Grubu</span>
            <select value={agePts} onChange={e => setAgePts(Number(e.target.value))}
              className="text-sm font-bold border border-slate-200 rounded-xl px-3 py-2 bg-white outline-none text-blue-950">
              {AGE_OPTS.map(([l, v]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <span className="text-[10px] font-black text-amber-500 w-10 text-right">+{agePts}</span>
          </div>

          <Section title="1 Puan" />
          <div className="grid gap-2">
            {ITEMS_1.map(it => <CheckItem key={it.key} {...it} pts={1} checked={!!sel[it.key]} onChange={() => toggle(it.key)} />)}
          </div>
          <Section title="2 Puan" />
          <div className="grid gap-2">
            {ITEMS_2.map(it => <CheckItem key={it.key} label={it.label} sub={it.sub} pts={2} checked={!!sel[it.key]} onChange={() => toggle(it.key)} />)}
          </div>
          <Section title="3 Puan" />
          <div className="grid gap-2">
            {ITEMS_3.map(it => <CheckItem key={it.key} label={it.label} sub={it.sub} pts={3} checked={!!sel[it.key]} onChange={() => toggle(it.key)} />)}
          </div>
          <Section title="6 Puan" />
          <div className="grid gap-2">
            {ITEMS_6.map(it => <CheckItem key={it.key} label={it.label} sub={it.sub} pts={6} checked={!!sel[it.key]} onChange={() => toggle(it.key)} />)}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">CCI</span>
            <div className="text-5xl font-black text-white">{score}</div>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed ${r.border} ${r.bg}`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-1 block">RİSK</span>
            <p className={`text-2xl font-black italic tracking-tight ${r.color}`}>{r.label}</p>
            <p className={`text-sm font-bold mt-1 ${r.color} opacity-80`}>Tahmini 10 yıllık sağkalım ≈ %{mortality10yr}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={params} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              CCI operatif/cerrahi risk, kemoterapi uygunluğu ve klinik araştırma katmanlaması için kullanılır. Birden fazla diyabet maddesi seçilirse yalnızca yüksek puanlı olanı sayılır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
