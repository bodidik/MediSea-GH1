"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const WPI_AREAS = [
  "Çene sol", "Çene sağ",
  "Boyun",
  "Omuz sol", "Omuz sağ",
  "Üst kol sol", "Üst kol sağ",
  "Alt kol sol", "Alt kol sağ",
  "Göğüs",
  "Karın",
  "Üst sırt",
  "Alt sırt",
  "Kalça sol", "Kalça sağ",
  "Uyluk sol", "Uyluk sağ",
  "Baldır sol", "Baldır sağ",
];

const SS_ITEMS = [
  { id: "fatigue", label: "Yorgunluk" },
  { id: "sleep", label: "Uyanmamış hissiyle uyanma" },
  { id: "cognitive", label: "Bilişsel semptomlar (konsantrasyon güçlüğü)" },
];

const SS_EXTRA = [
  "Baş ağrısı",
  "Alt karın ağrısı/krampi",
  "Depresyon",
];

const SEVERITY = [
  { v: 0, label: "Yok" },
  { v: 1, label: "Hafif" },
  { v: 2, label: "Orta" },
  { v: 3, label: "Şiddetli" },
];

export default function FibromiyaljiPage() {
  const [wpi, setWpi]   = React.useState<Set<string>>(new Set());
  const [sev, setSev]   = React.useState<Record<string, number>>({});
  const [extra, setExtra] = React.useState<Set<string>>(new Set());

  const toggleWpi = (a: string) => setWpi(prev => { const s = new Set(prev); s.has(a) ? s.delete(a) : s.add(a); return s; });
  const toggleExtra = (a: string) => setExtra(prev => { const s = new Set(prev); s.has(a) ? s.delete(a) : s.add(a); return s; });
  const setSevVal = (id: string, v: number) => setSev(prev => ({ ...prev, [id]: v }));

  const wpiScore = wpi.size;
  const ssBase   = SS_ITEMS.reduce((sum, i) => sum + (sev[i.id] ?? 0), 0);
  const ssExtra  = extra.size <= 3 ? extra.size : 3;
  const ssScore  = ssBase + ssExtra;

  const diagnosed = (
    (wpiScore >= 7 && ssScore >= 5) ||
    (wpiScore >= 4 && wpiScore <= 6 && ssScore >= 9) ||
    (wpiScore >= 0 && wpiScore <= 3 && ssScore >= 11)
  ) && Object.keys(sev).length === SS_ITEMS.length;

  const hadDuration = true; // assumed — user should confirm

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="fibromiyalji" />
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦴</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Fibromiyalji 2016</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">ACR 2016 Tanı Kriterleri — WPI + Semptom Şiddet Skalası</p>
          </div>
        </div>

        {/* WPI */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">WPI — Yaygın Ağrı İndeksi</p>
            <span className="text-2xl font-black text-blue-900">{wpiScore}<span className="text-sm text-slate-400">/19</span></span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 mb-4">Son 1 haftada ağrı hissetttiğiniz bölgeleri seçin</p>
          <div className="flex flex-wrap gap-2">
            {WPI_AREAS.map(area => (
              <button key={area} type="button" onClick={() => toggleWpi(area)}
                className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wide transition-all
                  ${wpi.has(area) ? 'bg-blue-900 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-900/30'}`}>
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* SS Scale */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SS — Semptom Şiddet Skalası</p>
            <span className="text-2xl font-black text-blue-900">{ssScore}<span className="text-sm text-slate-400">/12</span></span>
          </div>
          {SS_ITEMS.map(item => (
            <div key={item.id}>
              <p className="text-sm font-bold text-blue-900 mb-2">{item.label}</p>
              <div className="flex gap-2 flex-wrap">
                {SEVERITY.map(s => (
                  <button key={s.v} type="button" onClick={() => setSevVal(item.id, s.v)}
                    className={`px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                      ${sev[item.id] === s.v
                        ? s.v === 0 ? 'bg-emerald-600 border-emerald-600 text-white'
                          : s.v === 1 ? 'bg-amber-500 border-amber-500 text-white'
                          : s.v === 2 ? 'bg-orange-500 border-orange-500 text-white'
                          : 'bg-rose-600 border-rose-600 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-900/30'}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="pt-3 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Genel Bedensel Semptomlar (son 6 ay)</p>
            <div className="flex flex-wrap gap-2">
              {SS_EXTRA.map(s => (
                <button key={s} type="button" onClick={() => toggleExtra(s)}
                  className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wide transition-all
                    ${extra.has(s) ? 'bg-blue-900 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-900/30'}`}>
                  {s}
                </button>
              ))}
            </div>
            <p className="text-[9px] font-bold text-slate-400 mt-2">Her semptom varlığı +1 puan ekler (max 3 puan)</p>
          </div>
        </div>

        {/* Özet */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">WPI</div>
              <div className="text-3xl font-black text-blue-900">{wpiScore}</div>
            </div>
            <div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">SS Skoru</div>
              <div className="text-3xl font-black text-blue-900">{ssScore}</div>
            </div>
            <div>
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Toplam</div>
              <div className="text-3xl font-black text-blue-900">{wpiScore + ssScore}</div>
            </div>
          </div>
        </div>

        {Object.keys(sev).length === SS_ITEMS.length && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${diagnosed ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">ACR 2016 KRİTERLERİ</div>
            <p className={`text-2xl font-black italic tracking-tight ${diagnosed ? 'text-rose-700' : 'text-emerald-700'}`}>
              {diagnosed ? "FİBROMİYALJİ TANISI KARŞILANIYOR" : "TANI KRİTERLERİ KARŞILANMIYOR"}
            </p>
            <p className={`text-sm font-bold mt-1 opacity-80 ${diagnosed ? 'text-rose-700' : 'text-emerald-700'}`}>
              {diagnosed
                ? "WPI ≥ 7 + SS ≥ 5, veya WPI 4–6 + SS ≥ 9, veya WPI ≤ 3 + SS ≥ 11 — semptomlar ≥ 3 ay sürüyor olmalı"
                : "Mevcut değerlere göre fibromiyalji tanı eşiği karşılanmıyor"}
            </p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Fibromiyalji, başka bir hastalığın varlığını dışlamaz; eşzamanlı inflamatuvar artrit de olabilir. Klinik değerlendirme ve anamnezin yerini alamaz.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
