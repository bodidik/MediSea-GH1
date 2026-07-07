"use client";

import React, { useMemo, useState } from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

/**
 * PSI/PORT Skoru Gündüz Modu (Sakin Deniz)
 * Pneumonia Severity Index — Toplum Kökenli Pnömonide (CAP) 30 günlük mortalite tahmini
 * Fine ve ark. 1997 algoritması: önce "Adım 1" ile düşük riskli (Sınıf I) hastalar
 * puanlama yapılmadan ayrılır; Adım 1'i geçemeyenler için 20 değişkenli puanlama yapılır.
 * Kaynak: MDCalc — PSI/PORT Score: Pneumonia Severity Index for CAP.
 */

type Sex = "male" | "female";

const COMORBID: { key: string; label: string; pts: number }[] = [
  { key: "nursingHome", label: "Huzurevi sakini", pts: 10 },
  { key: "neoplasm", label: "Neoplastik hastalık öyküsü", pts: 30 },
  { key: "liver", label: "Karaciğer hastalığı öyküsü", pts: 20 },
  { key: "chf", label: "Konjestif kalp yetmezliği öyküsü", pts: 10 },
  { key: "cvd", label: "Serebrovasküler hastalık öyküsü", pts: 10 },
  { key: "renal", label: "Böbrek hastalığı öyküsü", pts: 10 },
];

const EXAM: { key: string; label: string; pts: number }[] = [
  { key: "alteredMental", label: "Bilinç değişikliği", pts: 20 },
  { key: "rr30", label: "Solunum sayısı ≥ 30/dk", pts: 20 },
  { key: "sbp90", label: "Sistolik KB < 90 mmHg", pts: 20 },
  { key: "temp", label: "Ateş < 35°C veya > 39.9°C", pts: 15 },
  { key: "pulse125", label: "Nabız ≥ 125/dk", pts: 10 },
];

const LABS: { key: string; label: string; pts: number }[] = [
  { key: "ph735", label: "Arter pH < 7.35", pts: 30 },
  { key: "bun30", label: "BUN ≥ 30 mg/dL", pts: 20 },
  { key: "sodium130", label: "Sodyum < 130 mmol/L", pts: 20 },
  { key: "glucose250", label: "Glukoz ≥ 250 mg/dL", pts: 10 },
  { key: "hct30", label: "Hematokrit < %30", pts: 10 },
  { key: "pao260", label: "PaO₂ < 60 mmHg", pts: 10 },
  { key: "pleural", label: "Plevral efüzyon (X-ray)", pts: 10 },
];

// Adım 1'i belirleyen kriterler (huzurevi hariç — o sadece Adım 2 puanına dahildir)
const STEP1_GATE_KEYS = ["neoplasm", "liver", "chf", "cvd", "renal", "alteredMental", "rr30", "sbp90", "temp", "pulse125"];

export default function PsiPortPage() {
  const [age, setAge] = useState<string>("65");
  const [sex, setSex] = useState<Sex>("male");
  const [sel, setSel] = useState<Record<string, boolean>>({});

  function toggle(k: string) {
    setSel((v) => ({ ...v, [k]: !v[k] }));
  }

  const ageNum = Math.max(0, Math.round(parseLocaleNumber(age)));

  const allCriteria = [...COMORBID, ...EXAM, ...LABS];
  const checkedPoints = allCriteria.reduce((sum, c) => sum + (sel[c.key] ? c.pts : 0), 0);

  const qualifiesClassI = useMemo(() => {
    if (ageNum >= 50) return false;
    return !STEP1_GATE_KEYS.some((k) => sel[k]);
  }, [ageNum, sel]);

  const agePoints = sex === "female" ? ageNum - 10 : ageNum;
  const totalScore = qualifiesClassI ? 0 : Math.round(agePoints + checkedPoints);

  const riskClass = useMemo(() => {
    if (qualifiesClassI) {
      return { label: "Sınıf I", mortality: "~%0.1", disposition: "Ayaktan tedavi", color: "text-emerald-700", bg: "bg-emerald-50" };
    }
    if (totalScore <= 70) return { label: "Sınıf II", mortality: "~%0.6", disposition: "Ayaktan tedavi", color: "text-emerald-700", bg: "bg-emerald-50" };
    if (totalScore <= 90) return { label: "Sınıf III", mortality: "~%0.9–2.8", disposition: "Kısa gözlem / ayaktan-yatan arası", color: "text-sky-700", bg: "bg-sky-50" };
    if (totalScore <= 130) return { label: "Sınıf IV", mortality: "~%8–9", disposition: "Hastane yatışı", color: "text-amber-700", bg: "bg-amber-50" };
    return { label: "Sınıf V", mortality: "~%27–31", disposition: "Hastane yatışı (yoğun bakım değerlendir)", color: "text-rose-700", bg: "bg-rose-50" };
  }, [qualifiesClassI, totalScore]);

  const shareParams: Record<string, number | string> = {
    age: ageNum,
    sex,
    ...Object.fromEntries(allCriteria.map((c) => [c.key, sel[c.key] ? 1 : 0])),
  };

  const Row = ({ label, pts, checked, onChange }: { label: string; pts: number; checked: boolean; onChange: () => void }) => (
    <label
      className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer
        ${checked ? "bg-blue-900 border-blue-900 text-white shadow-md" : "bg-slate-50 border-slate-100 hover:border-blue-900/30 text-blue-950"}
      `}
    >
      <span className="text-xs font-bold">{label}</span>
      <div className="flex items-center gap-3">
        <span className={`text-[10px] font-black ${checked ? "text-amber-400" : "text-slate-400"}`}>+{pts}</span>
        <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${checked ? "bg-amber-400 border-amber-400 text-blue-900" : "bg-white border-slate-200 text-transparent"}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
        </div>
      </div>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-2xl mx-auto space-y-6">

        <ToolTopNav toolSlug="psi-port" />

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            🫁
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">PSI / PORT Skoru</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Toplum Kökenli Pnömoni — 30 Günlük Mortalite Tahmini</p>
          </div>
        </div>

        {/* DEMOGRAFİ */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Yaş</span>
            <input
              type="text" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg transition-all"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Cinsiyet</span>
            <select
              value={sex} onChange={(e) => setSex(e.target.value as Sex)}
              className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus:border-blue-900 outline-none font-black text-lg appearance-none cursor-pointer"
            >
              <option value="male">Erkek</option>
              <option value="female">Kadın (yaş − 10 puan)</option>
            </select>
          </label>
        </div>

        {/* KOMORBİDİTE */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
          <span className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest pl-1 block mb-2">Komorbidite Öyküsü</span>
          {COMORBID.map((c) => (
            <Row key={c.key} label={c.label} pts={c.pts} checked={!!sel[c.key]} onChange={() => toggle(c.key)} />
          ))}
        </div>

        {/* FİZİK MUAYENE */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
          <span className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest pl-1 block mb-2">Fizik Muayene Bulguları</span>
          {EXAM.map((c) => (
            <Row key={c.key} label={c.label} pts={c.pts} checked={!!sel[c.key]} onChange={() => toggle(c.key)} />
          ))}
        </div>

        {/* LABORATUVAR & GÖRÜNTÜLEME */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-2">
          <span className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest pl-1 block mb-2">Laboratuvar & Görüntüleme</span>
          {LABS.map((c) => (
            <Row key={c.key} label={c.label} pts={c.pts} checked={!!sel[c.key]} onChange={() => toggle(c.key)} />
          ))}
        </div>

        {/* SONUÇ PANELİ */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
          <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-7xl font-black italic">PSI</div>
          <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">TOPLAM PUAN</span>
          <div className="text-7xl font-black text-white">{qualifiesClassI ? "–" : totalScore}</div>
          {qualifiesClassI && (
            <span className="text-[9px] font-bold text-blue-300/70 uppercase tracking-widest mt-3 max-w-xs">
              Adım 1 kriterleri karşılanmadı — puanlamaya gerek yok, doğrudan Sınıf I
            </span>
          )}
        </div>

        {/* YORUMLAMA PANELİ */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-3">
          <div className={`text-center p-4 rounded-xl font-black italic uppercase tracking-tight ${riskClass.bg} ${riskClass.color}`}>
            {riskClass.label} — 30 Günlük Mortalite {riskClass.mortality}
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
            {riskClass.disposition}
          </p>
          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest text-center leading-relaxed">
            ≤70 Sınıf II · 71–90 Sınıf III · 91–130 Sınıf IV · &gt;130 Sınıf V
          </p>
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-slate-900/5 p-6 rounded-[2rem] border border-slate-200 space-y-4">
          <ToolShare params={shareParams} />
          <p className="text-[9px] text-blue-900/60 font-bold uppercase tracking-[0.15em] text-center leading-relaxed italic">
            ⚠️ PSI/PORT, Fine ve ark. (1997) algoritmasına göre iki adımlıdır: Adım 1'de 50 yaş altı, komorbiditesi ve vital bulgu bozukluğu olmayan hastalar puanlama yapılmadan Sınıf I kabul edilir. 2019 ATS/IDSA kılavuzu, dispozisyon kararında CURB-65 yerine PSI kullanılmasını önerir; klinik yargının yerini tutmaz.
          </p>
        </div>

      </div>
    </div>
  );
}
