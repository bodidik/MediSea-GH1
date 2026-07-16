"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const HIGH_RISK_CRITERIA = [
  { id: "bmi_under16", label: "BMI < 16 kg/m²" },
  { id: "loss_over15", label: "Son 3–6 ayda istemsiz %15'ten fazla kilo kaybı" },
  { id: "no_intake_10", label: "10 günden fazla minimal/sıfır gıda alımı" },
  { id: "low_electrolyte", label: "Başlamadan önce düşük potasyum, fosfat veya magnezyum" },
];

const MODERATE_RISK_CRITERIA = [
  { id: "bmi_under18", label: "BMI < 18.5 kg/m²" },
  { id: "loss_over10", label: "Son 3–6 ayda istemsiz %10'dan fazla kilo kaybı" },
  { id: "no_intake_5", label: "5 günden fazla minimal/sıfır gıda alımı" },
  { id: "alcohol", label: "Alkol kötüye kullanımı veya insülin, kemoterapi, antasit, diüretik kullanımı" },
];

const SPECIAL = [
  { id: "chronic_illness", label: "Malabsorbsiyon: İBH, kısa bağırsak sendromu, kistik fibrozis, kronik pankreatit" },
  { id: "anorexia", label: "Anoreksiya nervoza tanısı" },
  { id: "chemo_recent", label: "Kemoterapi/radyoterapi sonrası yetersiz alım" },
  { id: "post_surgery", label: "GİS ameliyatı ve yetersiz nütrisyon" },
];

export default function RefeedingRiskPage() {
  const [high, setHigh]     = React.useState<Set<string>>(new Set());
  const [mod, setMod]       = React.useState<Set<string>>(new Set());
  const [spec, setSpec]     = React.useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, setter: React.Dispatch<React.SetStateAction<Set<string>>>, id: string) => {
    setter(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };

  const highCount = high.size;
  const modCount  = mod.size;
  const specCount = spec.size;

  const getRisk = () => {
    if (highCount >= 1 || specCount >= 1) return {
      label: "YÜKSEK RİSK",
      sub: "Refeeding sendromu riski yüksek",
      recs: ["Başlangıçta hedefin max. %50'si ile besle (≈10 kcal/kg/gün)", "İlk 2 hafta günlük elektrolit (K, Mg, Fosfat) takibi", "Thiamin 200–300 mg/gün IV başla", "Tiamin, B6, B12 ve multivitamin IV ver", "Sıvı dengesini dikkatle yönet"],
      color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200",
    };
    if (modCount >= 2) return {
      label: "ORTA RİSK",
      sub: "Refeeding sendromu olabilir",
      recs: ["Başlangıçta hedefin %50'si ile besle", "Thiamin ve multivitamin ver", "Elektrolitleri (K, Mg, PO4) 3 günde bir izle", "Yavaş artırarak 5–7 günde hedefe ulaş"],
      color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200",
    };
    if (modCount === 1) return {
      label: "DÜŞÜK RİSK",
      sub: "Dikkatli yaklaşım önerilir",
      recs: ["Normal nütrisyon desteğine başla", "Elektrolitleri başlangıçta kontrol et", "Klinik olarak izle"],
      color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200",
    };
    return null;
  };
  const risk = getRisk();
  const params = { high: highCount, mod: modCount, spec: specCount };

  const CheckGroup = ({ title, items, checked, set }: {
    title: string; items: { id: string; label: string }[];
    checked: Set<string>; set: React.Dispatch<React.SetStateAction<Set<string>>>;
  }) => (
    <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
      <p className="text-[10px] font-black text-blue-900/50 uppercase tracking-widest mb-4">{title}</p>
      <div className="space-y-3">
        {items.map(item => (
          <label key={item.id} className="flex items-start gap-3 cursor-pointer">
            <div onClick={() => toggle(checked, set, item.id)}
              className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
                ${checked.has(item.id) ? 'bg-blue-900 border-blue-900' : 'border-slate-300 bg-white hover:border-blue-900/40'}`}>
              {checked.has(item.id) && <svg viewBox="0 0 10 8" className="w-3 h-3 fill-white"><path d="M1 4l3 3 5-6"/></svg>}
            </div>
            <span className="text-sm font-bold text-blue-900 leading-snug" onClick={() => toggle(checked, set, item.id)}>{item.label}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="refeeding-risk" />
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🍏</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Refeeding Risk</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Refeeding Sendromu Riski — NICE Kriterleri</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-[11px] font-bold text-blue-900">NICE kılavuzuna göre: <strong>≥1 yüksek riskli kriter</strong> VEYA <strong>≥2 orta riskli kriter</strong> varlığında yüksek risk kabul edilir.</p>
        </div>

        <CheckGroup title="Yüksek Riskli Kriterler (herhangi biri yeterli)" items={HIGH_RISK_CRITERIA} checked={high} set={setHigh} />
        <CheckGroup title="Orta Riskli Kriterler (≥2 tanesi yüksek risk)" items={MODERATE_RISK_CRITERIA} checked={mod} set={setMod} />
        <CheckGroup title="Özel Durumlar (yüksek risk olarak kabul edilir)" items={SPECIAL} checked={spec} set={setSpec} />

        {risk && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${risk.border} ${risk.bg}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">REFEEDİNG SENDROMU RİSKİ</div>
            <p className={`text-2xl font-black italic tracking-tight ${risk.color}`}>{risk.label}</p>
            <p className={`text-sm font-bold mt-1 ${risk.color} opacity-80`}>{risk.sub}</p>
            <div className="mt-4 space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-blue-900/40">ÖNERİLER</p>
              {risk.recs.map((r, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <span className={`text-xs font-black ${risk.color} opacity-60 flex-shrink-0 mt-0.5`}>•</span>
                  <p className={`text-[11px] font-bold ${risk.color} opacity-80 leading-snug`}>{r}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!risk && (high.size > 0 || mod.size > 0 || spec.size > 0) && (
          <div className="p-6 rounded-[2rem] border-2 border-dashed border-emerald-200 bg-emerald-50">
            <p className="text-xl font-black italic tracking-tight text-emerald-700">DÜŞÜK RİSK</p>
            <p className="text-sm font-bold mt-1 text-emerald-700 opacity-80">Normal nütrisyon protokolü uygulanabilir. Rutin elektrolit takibi yeterli.</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Refeeding sendromu, yetersiz beslenen hastalarda nütrisyon desteği başlatılırken gelişen ve hipofosfatemi, hipokalemi, hipomagnezemi, tiamin eksikliği ile karakterize tehlikeli bir metabolik komplikasyondur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
