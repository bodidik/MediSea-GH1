"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

const CATEGORIES = [
  {
    id: "composition",
    title: "Kompozisyon",
    opts: [
      { label: "Kistik veya neredeyse tamamen kistik", v: 0 },
      { label: "Süngerimsi (spongiform)", v: 0 },
      { label: "Mikst (kistik + solid)", v: 1 },
      { label: "Solid veya neredeyse tamamen solid", v: 2 },
    ],
  },
  {
    id: "echogenicity",
    title: "Ekojenite",
    note: "Solid komponente göre değerlendirilir",
    opts: [
      { label: "Anekoik", v: 0 },
      { label: "Hiperekoik veya izoekoik", v: 1 },
      { label: "Hipoekoik", v: 2 },
      { label: "Çok hipoekoik (çevre kaslardan daha az)", v: 3 },
    ],
  },
  {
    id: "shape",
    title: "Şekil",
    opts: [
      { label: "Enine uzun (genişlik > yükseklik)", v: 0 },
      { label: "Dikine uzun (yükseklik > genişlik)", v: 3 },
    ],
  },
  {
    id: "margin",
    title: "Sınır",
    opts: [
      { label: "Düzgün", v: 0 },
      { label: "Belirsiz", v: 0 },
      { label: "Lobüle veya düzensiz", v: 2 },
      { label: "Ekstratiroid uzanım", v: 3 },
    ],
  },
  {
    id: "foci",
    title: "Ekojen Odaklar",
    note: "Birden fazla seçilebilir — en yüksek puan alınır",
    multi: true,
    opts: [
      { label: "Yok veya büyük kuyruklu yıldız artefaktı", v: 0 },
      { label: "Makrokalsifikasyon", v: 1 },
      { label: "Periferik (jant) kalsifikasyon", v: 2 },
      { label: "Punktat ekojen odaklar", v: 3 },
    ],
  },
] as const;

type CatId = typeof CATEGORIES[number]["id"];

function getTiRads(pts: number): { level: string; label: string; color: string; bg: string; border: string; desc: string } {
  if (pts === 0) return { level: "TR1", label: "BENİGN", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", desc: "Biyopsi veya takip gerekmez" };
  if (pts === 2) return { level: "TR2", label: "ŞÜPHESİZ", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200", desc: "Biyopsi veya takip gerekmez" };
  if (pts === 3) return { level: "TR3", label: "HAFİF ŞÜPHELİ", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", desc: "Boyuta göre İİAB veya takip" };
  if (pts <= 6)  return { level: "TR4", label: "ORTA DERECE ŞÜPHELİ", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", desc: "Boyuta göre İİAB veya takip" };
  return { level: "TR5", label: "YÜKSEK ŞÜPHELİ", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", desc: "Boyuta göre İİAB veya takip" };
}

function getFnaGuidance(level: string, sizeCm: number): { fna: string; follow: string; action: "fna" | "follow" | "none" } {
  if (level === "TR1" || level === "TR2") return { fna: "—", follow: "—", action: "none" };
  if (level === "TR3") {
    if (sizeCm >= 2.5) return { fna: "≥ 2.5 cm — İİAB önerilir", follow: "≥ 1.5 cm — Takip", action: "fna" };
    if (sizeCm >= 1.5) return { fna: "≥ 2.5 cm — İİAB önerilir", follow: "≥ 1.5 cm — Takip", action: "follow" };
    return { fna: "≥ 2.5 cm — İİAB", follow: "≥ 1.5 cm — Takip", action: "none" };
  }
  if (level === "TR4") {
    if (sizeCm >= 1.5) return { fna: "≥ 1.5 cm — İİAB önerilir", follow: "≥ 1.0 cm — Takip", action: "fna" };
    if (sizeCm >= 1.0) return { fna: "≥ 1.5 cm — İİAB önerilir", follow: "≥ 1.0 cm — Takip", action: "follow" };
    return { fna: "≥ 1.5 cm — İİAB", follow: "≥ 1.0 cm — Takip", action: "none" };
  }
  // TR5
  if (sizeCm >= 1.0) return { fna: "≥ 1.0 cm — İİAB önerilir", follow: "≥ 0.5 cm — Takip", action: "fna" };
  if (sizeCm >= 0.5) return { fna: "≥ 1.0 cm — İİAB önerilir", follow: "≥ 0.5 cm — Takip", action: "follow" };
  return { fna: "≥ 1.0 cm — İİAB", follow: "≥ 0.5 cm — Takip", action: "none" };
}

export default function TiradsPage() {
  const [answers, setAnswers]   = React.useState<Record<CatId, number | number[]>>({} as Record<CatId, number | number[]>);
  const [size, setSize]         = React.useState("");

  const setAnswer = (catId: CatId, optV: number, multi: boolean) => {
    if (!multi) {
      setAnswers(prev => ({ ...prev, [catId]: optV }));
    } else {
      setAnswers(prev => {
        const cur = (prev[catId] as number[] | undefined) ?? [];
        const next = cur.includes(optV) ? cur.filter(x => x !== optV) : [...cur, optV];
        return { ...prev, [catId]: next };
      });
    }
  };

  const catScore = (cat: typeof CATEGORIES[number]): number | null => {
    const ans = answers[cat.id];
    if (ans === undefined) return null;
    if (cat.multi) {
      const arr = ans as number[];
      return arr.length === 0 ? null : Math.max(...arr);
    }
    return ans as number;
  };

  const scores = CATEGORIES.map(c => catScore(c));
  const allAnswered = scores.every(s => s !== null);
  const total = allAnswered ? scores.reduce((a, b) => a! + b!, 0)! : null;

  const tr = total !== null ? getTiRads(total) : null;
  const sizeCm = parseLocaleNumber(size);
  const fna = tr && sizeCm > 0 ? getFnaGuidance(tr.level, sizeCm) : null;
  const params = { scores, size: sizeCm };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="tirads" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦋</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">ACR TI-RADS</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Tiroid Görüntüleme Raporlama ve Veri Sistemi — 2017</p>
          </div>
        </div>

        {/* Puan özeti şeridi */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kategori Puanları</span>
            {total !== null && (
              <span className="text-2xl font-black text-blue-900">Toplam: {total} puan</span>
            )}
          </div>
          <div className="grid grid-cols-5 gap-1">
            {CATEGORIES.map((cat, i) => {
              const s = scores[i];
              return (
                <div key={cat.id} className={`rounded-xl p-2 text-center transition-all ${s !== null ? 'bg-blue-900' : 'bg-slate-100'}`}>
                  <div className={`text-[8px] font-black uppercase tracking-widest mb-1 leading-tight ${s !== null ? 'text-blue-200/70' : 'text-slate-400'}`}>{cat.title}</div>
                  <div className={`text-xl font-black ${s !== null ? 'text-white' : 'text-slate-300'}`}>{s !== null ? s : '–'}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Kategoriler */}
        {CATEGORIES.map((cat) => (
          <div key={cat.id} className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
            <div className="flex items-start justify-between mb-1">
              <p className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest">{cat.title}</p>
              {cat.multi && <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Çoklu seçim</span>}
            </div>
            {cat.note && <p className="text-[10px] font-bold text-slate-400 mb-3">{cat.note}</p>}
            <div className="space-y-2 mt-3">
              {cat.opts.map(opt => {
                const isSelected = cat.multi
                  ? ((answers[cat.id] as number[] | undefined) ?? []).includes(opt.v)
                  : answers[cat.id] === opt.v;
                return (
                  <button key={opt.label} type="button" onClick={() => setAnswer(cat.id, opt.v, !!cat.multi)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between gap-3
                      ${isSelected ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
                    <span className={`text-sm font-bold leading-snug ${isSelected ? 'text-white' : 'text-blue-950'}`}>{opt.label}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest shrink-0 rounded-lg px-2 py-1
                      ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
                      +{opt.v}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Nodül boyutu */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Nodül Boyutu</p>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">En büyük çap (cm)</span>
            <div className="relative">
              <input type="text" inputMode="decimal" value={size} onChange={e => setSize(e.target.value)} placeholder="ör. 1.8"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">cm</span>
            </div>
          </label>
        </div>

        {/* TI-RADS sonuç */}
        {tr && total !== null && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${tr.border} ${tr.bg}`}>
            <div className="flex items-center gap-4 mb-4">
              <div className={`rounded-2xl px-5 py-3 ${tr.color.replace('text-', 'bg-').replace('700', '600').replace('600', '500')} bg-opacity-20 border ${tr.border}`}>
                <span className={`text-3xl font-black ${tr.color}`}>{tr.level}</span>
              </div>
              <div>
                <p className={`text-xl font-black italic tracking-tight ${tr.color}`}>{tr.label}</p>
                <p className={`text-sm font-bold ${tr.color} opacity-70`}>{total} puan</p>
              </div>
            </div>

            {/* TI-RADS skala */}
            <div className="grid grid-cols-5 gap-1 mb-4">
              {[
                { l: "TR1", r: "0 pt", c: "bg-emerald-100 text-emerald-700" },
                { l: "TR2", r: "2 pt", c: "bg-sky-100 text-sky-700" },
                { l: "TR3", r: "3 pt", c: "bg-amber-100 text-amber-700" },
                { l: "TR4", r: "4–6 pt", c: "bg-orange-100 text-orange-700" },
                { l: "TR5", r: "≥7 pt", c: "bg-rose-100 text-rose-700" },
              ].map(x => (
                <div key={x.l} className={`rounded-xl p-2 text-center text-[8px] font-black uppercase tracking-widest ${x.c} ${tr.level === x.l ? 'ring-2 ring-current' : ''}`}>
                  <div>{x.l}</div>
                  <div className="font-bold normal-case tracking-normal mt-0.5">{x.r}</div>
                </div>
              ))}
            </div>

            {/* İİAB önerisi */}
            {fna ? (
              <div className={`rounded-2xl p-4 border
                ${fna.action === "fna" ? 'bg-rose-100 border-rose-200' :
                  fna.action === "follow" ? 'bg-amber-100 border-amber-200' :
                  'bg-emerald-100 border-emerald-200'}`}>
                <p className="text-[9px] font-black uppercase tracking-widest text-blue-900/40 mb-2">İİAB / TAKİP KARARI</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-rose-700 uppercase tracking-widest w-16">İİAB:</span>
                    <span className="text-sm font-bold text-blue-900">{fna.fna}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest w-16">Takip:</span>
                    <span className="text-sm font-bold text-blue-900">{fna.follow}</span>
                  </div>
                  <div className="pt-1">
                    <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest
                      ${fna.action === "fna" ? 'bg-rose-600 text-white' :
                        fna.action === "follow" ? 'bg-amber-500 text-white' :
                        'bg-emerald-600 text-white'}`}>
                      {fna.action === "fna" ? "→ İİAB ÖNERİLİR" :
                       fna.action === "follow" ? "→ TAKİP ÖNERİLİR" :
                       "→ BU BOYUTTA MÜDAHALE GEREKMİYOR"}
                    </span>
                  </div>
                </div>
              </div>
            ) : tr.level !== "TR1" && tr.level !== "TR2" ? (
              <p className="text-[11px] font-bold text-blue-900/50 italic">Nodül boyutunu girerek İİAB/takip önerisi görün.</p>
            ) : (
              <p className="text-[11px] font-bold text-emerald-700">{tr.desc}</p>
            )}
          </div>
        )}

        {/* ACR TI-RADS referans tablosu */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">ACR TI-RADS 2017 — Referans</p>
          <div className="overflow-x-auto">
            <table className="w-full text-[10px]">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-2 pr-3 font-black text-slate-400 uppercase tracking-widest">Düzey</th>
                  <th className="text-left py-2 pr-3 font-black text-slate-400 uppercase tracking-widest">Puan</th>
                  <th className="text-left py-2 pr-3 font-black text-slate-400 uppercase tracking-widest">İİAB eşiği</th>
                  <th className="text-left py-2 font-black text-slate-400 uppercase tracking-widest">Takip eşiği</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[
                  { l: "TR1", p: "0", color: "text-emerald-700", fna: "—", f: "—" },
                  { l: "TR2", p: "2", color: "text-sky-700", fna: "—", f: "—" },
                  { l: "TR3", p: "3", color: "text-amber-700", fna: "≥ 2.5 cm", f: "≥ 1.5 cm" },
                  { l: "TR4", p: "4–6", color: "text-orange-700", fna: "≥ 1.5 cm", f: "≥ 1.0 cm" },
                  { l: "TR5", p: "≥ 7", color: "text-rose-700", fna: "≥ 1.0 cm", f: "≥ 0.5 cm" },
                ].map(r => (
                  <tr key={r.l}>
                    <td className={`py-2 pr-3 font-black ${r.color}`}>{r.l}</td>
                    <td className="py-2 pr-3 font-bold text-blue-900">{r.p}</td>
                    <td className="py-2 pr-3 font-bold text-blue-900">{r.fna}</td>
                    <td className="py-2 font-bold text-blue-900">{r.f}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              ACR TI-RADS 2017 kılavuzuna dayanmaktadır. Spongiform nodüller ve tamamen kistik nodüller benign kabul edilir. Klinik risk faktörleri (boyun ışınlaması, aile öyküsü, şüpheli LAP) değerlendirmeyi etkiler.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
