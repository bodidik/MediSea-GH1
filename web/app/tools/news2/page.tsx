"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";

/** * NEWS2 Gündüz Modu (Sakin Deniz) Versiyonu
 * Konsept: Beyaz Zemin / Lacivert Vurgu / Güneş Sarısı Detay
 */

function scoreRR(rr: number) {
  if (rr <= 8) return 3;
  if (rr <= 11) return 1;
  if (rr <= 20) return 0;
  if (rr <= 24) return 2;
  return 3;
}

function scoreSpO2(sp: number, onO2: boolean) {
  let base = 0;
  if (sp <= 91) base = 3;
  else if (sp <= 93) base = 2;
  else if (sp <= 95) base = 1;
  else base = 0;
  return base + (onO2 ? 2 : 0);
}

function scoreTemp(t: number) {
  if (t <= 35.0) return 3;
  if (t <= 36.0) return 1;
  if (t <= 38.0) return 0;
  if (t <= 39.0) return 1;
  return 2;
}

function scoreSBP(s: number) {
  if (s <= 90) return 3;
  if (s <= 100) return 2;
  if (s <= 110) return 1;
  if (s <= 219) return 0;
  return 3;
}

function scorePulse(p: number) {
  if (p <= 40) return 3;
  if (p <= 50) return 1;
  if (p <= 90) return 0;
  if (p <= 110) return 1;
  if (p <= 130) return 2;
  return 3;
}

function scoreAVPU(avpu: string) {
  return avpu === "A" ? 0 : 3;
}

export default function NEWS2Page() {
  const s = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  const [rr, setRr] = React.useState<number>(parseFloat(s?.get("rr") || "18"));
  const [spo2, setSpo2] = React.useState<number>(parseFloat(s?.get("spo2") || "97"));
  const [onO2, setOnO2] = React.useState<boolean>(s?.get("o2") === "1");
  const [sbp, setSbp] = React.useState<number>(parseFloat(s?.get("sbp") || "120"));
  const [hr, setHr] = React.useState<number>(parseFloat(s?.get("hr") || "80"));
  const [temp, setTemp] = React.useState<number>(parseFloat(s?.get("temp") || "36.8"));
  const [avpu, setAvpu] = React.useState<string>(s?.get("avpu") || "A");

  const sc_rr = scoreRR(rr);
  const sc_sp = scoreSpO2(spo2, onO2);
  const sc_temp = scoreTemp(temp);
  const sc_sbp = scoreSBP(sbp);
  const sc_hr = scorePulse(hr);
  const sc_avpu = scoreAVPU(avpu);

  const total = sc_rr + sc_sp + sc_temp + sc_sbp + sc_hr + sc_avpu;

  let risk = { label: "Düşük", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200" };
  if (total >= 7) risk = { label: "YÜKSEK (Acil Müdahale)", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200" };
  else if (total >= 5 || [sc_rr, sc_sp, sc_temp, sc_sbp, sc_hr, sc_avpu].some(v => v === 3)) 
    risk = { label: "Orta (Acil Değerlendirme)", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" };

  const params = { rr, spo2, o2: onO2 ? 1 : "", sbp, hr, temp, avpu };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            🚨
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">NEWS2</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ulusal Erken Uyarı Skoru (Royal College of Physicians)</p>
          </div>
        </div>

        {/* PARAMETRELER */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest pl-1">Solunum Sayısı (dk)</span>
              <input type="number" value={rr} onChange={e=>setRr(parseFloat(e.target.value||"0"))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold" />
            </label>
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest pl-1">SpO₂ (%)</span>
              <div className="flex gap-2">
                <input type="number" value={spo2} onChange={e=>setSpo2(parseFloat(e.target.value||"0"))} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold" />
                <button onClick={()=>setOnO2(!onO2)} className={`px-4 rounded-xl text-[10px] font-black transition-all border-2 ${onO2 ? 'bg-amber-400 border-amber-400 text-blue-900' : 'bg-white border-slate-200 text-slate-400'}`}>
                  EK O₂
                </button>
              </div>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest pl-1">Sistolik KB (mmHg)</span>
              <input type="number" value={sbp} onChange={e=>setSbp(parseFloat(e.target.value||"0"))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest pl-1">Nabız (dk)</span>
              <input type="number" value={hr} onChange={e=>setHr(parseFloat(e.target.value||"0"))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest pl-1">Sıcaklık (°C)</span>
              <input type="number" step="0.1" value={temp} onChange={e=>setTemp(parseFloat(e.target.value||"0"))} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold" />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest pl-1">Bilinç (AVPU)</span>
              <select value={avpu} onChange={e=>setAvpu(e.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold appearance-none">
                <option value="A">Alert (Uyanık)</option>
                <option value="V">Voice (Sese Tepki)</option>
                <option value="P">Pain (Ağrıya Tepki)</option>
                <option value="U">Unresponsive (Cevapsız)</option>
              </select>
            </label>
          </div>
        </div>

        {/* SONUÇ PANELİ */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-8 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">TOPLAM</span>
            <div className="text-6xl font-black text-white">{total}</div>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-8 flex flex-col justify-center border-2 ${risk.border} ${risk.bg} shadow-sm transition-all duration-500`}>
            <span className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2 block">KLİNİK RİSK DURUMU</span>
            <p className={`text-2xl font-black italic tracking-tight ${risk.color}`}>
              {risk.label}
            </p>
          </div>
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6 text-center">
          <ToolShare params={params}/>
          <p className="text-[9px] text-blue-900/60 font-bold uppercase tracking-[0.2em] leading-relaxed italic">
            ⚠️ Bu araç RCP NEWS2 kılavuzuna dayanmaktadır. 3 puanlık tekil parametre skorları veya toplam 5+ puan durumunda acil klinik değerlendirme (Medical Emergency Team) gerekebilir.
          </p>
        </div>

      </div>
    </div>
  );
}