"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

export default function BerlinARDSPage() {
  const [onset, setOnset]   = React.useState<boolean | null>(null);
  const [xray,  setXray]    = React.useState<boolean | null>(null);
  const [origin, setOrigin] = React.useState<boolean | null>(null);
  const [pf,    setPF]      = React.useState<string | null>(null);

  const allAnswered = onset !== null && xray !== null && origin !== null && pf !== null;
  const meetsCriteria = onset && xray && origin;

  type Severity = { label: string; mortality: string; color: string; peep: string };
  const severity: Severity | null = !allAnswered ? null :
    !meetsCriteria ? { label: "ARDS DEĞİL", mortality: "—", color: "slate", peep: "—" } :
    pf === "mild"   ? { label: "HAFİF ARDS",  mortality: "%27",  color: "amber",   peep: "PEEP ≥ 5 cmH₂O" } :
    pf === "mod"    ? { label: "ORTA ARDS",   mortality: "%32",  color: "orange",  peep: "PEEP ≥ 5 cmH₂O" } :
                      { label: "AĞIR ARDS",   mortality: "%45",  color: "rose",    peep: "PEEP ≥ 5 cmH₂O" };

  const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
    slate:  { bg: "bg-slate-50",   border: "border-slate-200",  text: "text-slate-700",  badge: "bg-slate-600 text-white" },
    amber:  { bg: "bg-amber-50",   border: "border-amber-200",  text: "text-amber-700",  badge: "bg-amber-600 text-white" },
    orange: { bg: "bg-orange-50",  border: "border-orange-200", text: "text-orange-700", badge: "bg-orange-600 text-white" },
    rose:   { bg: "bg-rose-50",    border: "border-rose-200",   text: "text-rose-700",   badge: "bg-rose-700 text-white" },
  };
  const c = severity ? COLOR[severity.color] : null;

  const BoolBtn = ({ val, cur, set, yes, no }: { val: boolean; cur: boolean | null; set: (v: boolean | null) => void; yes: string; no: string }) => (
    <div className="flex gap-2">
      {([true, false] as const).map(v => (
        <button key={String(v)} type="button" onClick={() => set(cur === v ? null : v)}
          className={`flex-1 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all
            ${cur === v ? (v ? "border-emerald-600 bg-emerald-600 text-white" : "border-rose-500 bg-rose-500 text-white") : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200"}`}>
          {v ? yes : no}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="berlin-ards" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🫁</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Berlin ARDS</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Akut Respiratuar Distres Sendromu Tanı & Şiddet Sınıflaması · 2012</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">1. Başlangıç Zamanı</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Bilinen klinik bozulma veya yeni / ağırlaşan solunum semptomlarından itibaren ≤ 7 gün</p>
            <BoolBtn val={true} cur={onset} set={setOnset} yes="Evet — ≤ 7 gün" no="Hayır — > 7 gün" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">2. Toraks Görüntülemesi</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">AC grafisi veya BT'de bilateral infiltratlar — plevral efüzyon, lob/akciğer kollapsı veya nodüller ile açıklanamayan</p>
            <BoolBtn val={true} cur={xray} set={setXray} yes="Bilateral infiltrat var" no="Yok / tek taraflı" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">3. Ödem Kökeni</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">Solunum yetmezliği kalp yetmezliği veya aşırı sıvı yüklenmesi ile tam olarak açıklanamıyor (EKO veya klinik değerlendirme ile)</p>
            <BoolBtn val={true} cur={origin} set={setOrigin} yes="ARDS ile uyumlu" no="Kardiyojenik ödem" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <p className="font-black text-blue-900 uppercase italic text-sm mb-0.5">4. Oksijenasyon (PaO₂/FiO₂)</p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3">PEEP veya CPAP ≥ 5 cmH₂O durumunda — entübe olmayan hastalarda CPAP ile CPAP ≥ 5</p>
            <div className="space-y-1.5">
              {[
                { v: "no_ards", label: "> 300 mmHg",            sub: "ARDS kriterini karşılamıyor" },
                { v: "mild",    label: "201–300 mmHg",           sub: "Hafif ARDS" },
                { v: "mod",     label: "101–200 mmHg",           sub: "Orta ARDS" },
                { v: "severe",  label: "≤ 100 mmHg",            sub: "Ağır ARDS" },
              ].map(opt => (
                <button key={opt.v} type="button"
                  onClick={() => setPF(p => p === opt.v ? null : opt.v)}
                  className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-[10px] font-bold transition-all
                    ${pf === opt.v ? "border-blue-900 bg-blue-900 text-white" : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                  <div>
                    <div className="font-black">{opt.label}</div>
                    <div className={`text-[8px] uppercase tracking-widest ${pf === opt.v ? "text-blue-300" : "text-slate-400"}`}>{opt.sub}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {allAnswered && severity && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0 text-center px-1">
                <span className="text-[7px] font-black text-blue-300 uppercase leading-tight">Berlin</span>
                <span className="text-[11px] font-black text-white leading-tight mt-1">{severity.label.split(" ")[0]}</span>
                <span className="text-[11px] font-black text-white leading-tight">{severity.label.split(" ")[1] ?? ""}</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{severity.label}</span>
                {severity.mortality !== "—" && (
                  <p className={`text-lg font-black italic mt-1 ${c.text}`}>Hastane Mortalitesi ≈ {severity.mortality}</p>
                )}
                {severity.peep !== "—" && (
                  <p className="text-[10px] font-bold text-slate-500 mt-0.5">{severity.peep} altında değerlendirildi</p>
                )}
                {severity.color === "slate" && (
                  <p className="text-sm font-bold text-slate-600 mt-1">Tanı kriterlerini karşılamıyor — alternatif tanıları değerlendirin</p>
                )}
              </div>
            </div>
            {meetsCriteria && (
              <div className="grid grid-cols-3 gap-2 text-center text-[9px]">
                {[
                  { l: "Hafif", r: "PaO₂/FiO₂ 201–300", m: "%27" },
                  { l: "Orta",  r: "PaO₂/FiO₂ 101–200", m: "%32" },
                  { l: "Ağır",  r: "PaO₂/FiO₂ ≤ 100",  m: "%45" },
                ].map(b => (
                  <div key={b.l} className={`rounded-xl p-2 font-black
                    ${b.l === severity.label.split(" ")[0] ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                    <div className="uppercase">{b.l}</div>
                    <div className="font-bold text-[8px] normal-case">{b.r}</div>
                    <div className="font-bold text-[8px]">{b.m} mortalite</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 4 kriteri yanıtlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={{ onset: onset ? 1 : 0, xray: xray ? 1 : 0, origin: origin ? 1 : 0, pf: pf === "mild" ? 1 : pf === "mod" ? 2 : pf === "severe" ? 3 : 0 }} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Berlin tanımı 2012'de AECC kriterlerinin yerini aldı. Hafif ARDS'da prone pozisyon tartışmalıdır; orta-ağır ARDS'da prone pozisyon mortaliteyi azaltır. ARDS Definition Task Force, JAMA 2012.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
