"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

/** * Glasgow Koma Skalası (GKS) Gündüz Modu (Sakin Deniz)
 * Toplam = Göz Açma (E, 1-4) + Sözel Yanıt (V, 1-5) + Motor Yanıt (M, 1-6)
 */

type Option = { value: number; label: string };

const EYE: Option[] = [
  { value: 4, label: "Spontan" },
  { value: 3, label: "Sese yanıt" },
  { value: 2, label: "Ağrıya yanıt" },
  { value: 1, label: "Yanıt yok" },
];

const VERBAL: Option[] = [
  { value: 5, label: "Oryante" },
  { value: 4, label: "Konfüze konuşma" },
  { value: 3, label: "Uygunsuz kelimeler" },
  { value: 2, label: "Anlaşılmaz sesler" },
  { value: 1, label: "Yanıt yok" },
];

const MOTOR: Option[] = [
  { value: 6, label: "Emirlere uyuyor" },
  { value: 5, label: "Ağrıyı lokalize ediyor" },
  { value: 4, label: "Ağrıdan çekiliyor" },
  { value: 3, label: "Anormal fleksiyon (dekortike)" },
  { value: 2, label: "Ekstansiyon (deserebre)" },
  { value: 1, label: "Yanıt yok" },
];

function OptionRow({
  title, options, selected, onSelect,
}: {
  title: string;
  options: Option[];
  selected: number;
  onSelect: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest pl-1">{title}</span>
      <div className="grid gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onSelect(o.value)}
            className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-left transition-all
              ${selected === o.value
                ? 'bg-blue-900 border-blue-900 text-white shadow-md'
                : 'bg-slate-50 border-slate-100 hover:border-blue-900/30 text-blue-950'}
            `}
          >
            <span className="text-xs font-bold">{o.label}</span>
            <span className={`text-[10px] font-black ${selected === o.value ? 'text-amber-400' : 'text-slate-400'}`}>{o.value}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default function GcsPage() {
  const s = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const [eye, setEye] = React.useState<number>(Number(s?.get("e")) || 4);
  const [verbal, setVerbal] = React.useState<number>(Number(s?.get("v")) || 5);
  const [motor, setMotor] = React.useState<number>(Number(s?.get("m")) || 6);

  const total = eye + verbal + motor;

  const interpretation =
    total >= 13
      ? { label: "Hafif", color: "text-emerald-700", bg: "bg-emerald-50" }
      : total >= 9
      ? { label: "Orta", color: "text-amber-700", bg: "bg-amber-50" }
      : { label: "Ağır (Entübasyon Eşiği ≤8)", color: "text-rose-700", bg: "bg-rose-50" };

  const shareParams = { e: eye, v: verbal, m: motor };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <ToolTopNav toolSlug="gcs" />

        {/* BAŞLIK */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            🧠
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Glasgow Koma Skalası</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Bilinç Düzeyi Değerlendirmesi (E + V + M)</p>
          </div>
        </div>

        {/* KATEGORİLER */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
          <OptionRow title="Göz Açma (E)" options={EYE} selected={eye} onSelect={setEye} />
          <OptionRow title="Sözel Yanıt (V)" options={VERBAL} selected={verbal} onSelect={setVerbal} />
          <OptionRow title="Motor Yanıt (M)" options={MOTOR} selected={motor} onSelect={setMotor} />
        </div>

        {/* SONUÇ PANELİ */}
        <div className="bg-blue-900 rounded-[2.5rem] p-10 flex flex-col items-center justify-center shadow-xl border-t-8 border-amber-400 relative overflow-hidden text-center">
           <div className="absolute top-0 right-0 p-6 opacity-10 text-white text-7xl font-black italic">GKS</div>
           <span className="text-[10px] font-black text-blue-200 uppercase tracking-[0.4em] mb-2">TOPLAM SKOR</span>
           <div className="text-7xl font-black text-white">{total}</div>
           <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mt-2">E{eye} + V{verbal} + M{motor} / 15</span>
        </div>

        {/* YORUMLAMA PANELİ */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
           <div className={`text-center p-4 rounded-xl font-black italic uppercase tracking-tight ${interpretation.bg} ${interpretation.color}`}>
             {interpretation.label}
           </div>
        </div>

        {/* PAYLAŞIM VE UYARI */}
        <div className="bg-slate-900/5 p-6 rounded-[2rem] border border-slate-200 space-y-4">
          <ToolShare params={shareParams} />
          <p className="text-[9px] text-blue-900/60 font-bold uppercase tracking-[0.15em] text-center leading-relaxed italic">
            ⚠️ GKS ≤8 genellikle havayolu koruması (entübasyon) için bir eşik olarak kabul edilir. Sedasyon, entübasyon veya göz/motor engelleri varlığında skor sınırlı yorumlanmalıdır.
          </p>
        </div>

      </div>
    </div>
  );
}
