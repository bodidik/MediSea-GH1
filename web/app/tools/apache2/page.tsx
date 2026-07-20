"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

// APACHE II — 12 fizolojik + yaş + kronik hastalık
const PHYSIO: { id: string; label: string; unit: string; opts: { label: string; pts: number }[] }[] = [
  {
    id: "temp", label: "Vücut Sıcaklığı", unit: "°C",
    opts: [
      { label: "≥ 41", pts: 4 }, { label: "39–40.9", pts: 3 }, { label: "38.5–38.9", pts: 1 },
      { label: "36–38.4", pts: 0 }, { label: "34–35.9", pts: 1 }, { label: "32–33.9", pts: 2 },
      { label: "30–31.9", pts: 3 }, { label: "≤ 29.9", pts: 4 },
    ],
  },
  {
    id: "map", label: "Ortalama Arteryel Basınç", unit: "mmHg",
    opts: [
      { label: "≥ 160", pts: 4 }, { label: "130–159", pts: 3 }, { label: "110–129", pts: 2 },
      { label: "70–109", pts: 0 }, { label: "50–69", pts: 2 }, { label: "≤ 49", pts: 4 },
    ],
  },
  {
    id: "hr", label: "Kalp Hızı", unit: "/dak",
    opts: [
      { label: "≥ 180", pts: 4 }, { label: "140–179", pts: 3 }, { label: "110–139", pts: 2 },
      { label: "70–109", pts: 0 }, { label: "55–69", pts: 2 }, { label: "40–54", pts: 3 },
      { label: "≤ 39", pts: 4 },
    ],
  },
  {
    id: "rr", label: "Solunum Hızı", unit: "/dak",
    opts: [
      { label: "≥ 50", pts: 4 }, { label: "35–49", pts: 3 }, { label: "25–34", pts: 1 },
      { label: "12–24", pts: 0 }, { label: "10–11", pts: 1 }, { label: "6–9", pts: 2 },
      { label: "≤ 5", pts: 4 },
    ],
  },
  {
    id: "fio2", label: "Oksijenasyon (FiO2 < 0.5: A-a farkı / ≥ 0.5: PaO2)", unit: "mmHg",
    opts: [
      { label: "PaO2 > 70 veya A-aDO2 < 200", pts: 0 },
      { label: "A-aDO2 200–349", pts: 2 },
      { label: "A-aDO2 350–499", pts: 3 },
      { label: "A-aDO2 ≥ 500 veya PaO2 55–60", pts: 4 },
      { label: "PaO2 < 55", pts: 4 },
    ],
  },
  {
    id: "ph", label: "Arteriyel pH",
    unit: "",
    opts: [
      { label: "≥ 7.70", pts: 4 }, { label: "7.60–7.69", pts: 3 }, { label: "7.50–7.59", pts: 1 },
      { label: "7.33–7.49", pts: 0 }, { label: "7.25–7.32", pts: 2 }, { label: "7.15–7.24", pts: 3 },
      { label: "< 7.15", pts: 4 },
    ],
  },
  {
    id: "na", label: "Serum Sodyum", unit: "mEq/L",
    opts: [
      { label: "≥ 180", pts: 4 }, { label: "160–179", pts: 3 }, { label: "155–159", pts: 2 },
      { label: "150–154", pts: 1 }, { label: "130–149", pts: 0 }, { label: "120–129", pts: 2 },
      { label: "111–119", pts: 3 }, { label: "≤ 110", pts: 4 },
    ],
  },
  {
    id: "k", label: "Serum Potasyum", unit: "mEq/L",
    opts: [
      { label: "≥ 7", pts: 4 }, { label: "6–6.9", pts: 3 }, { label: "5.5–5.9", pts: 1 },
      { label: "3.5–5.4", pts: 0 }, { label: "3–3.4", pts: 1 }, { label: "2.5–2.9", pts: 2 },
      { label: "< 2.5", pts: 4 },
    ],
  },
  {
    id: "cr", label: "Kreatinin (Akut böbrek yetmezliği varsa ×2)", unit: "mg/dL",
    opts: [
      { label: "≥ 3.5", pts: 4 }, { label: "2–3.4", pts: 3 }, { label: "1.5–1.9", pts: 2 },
      { label: "0.6–1.4", pts: 0 }, { label: "< 0.6", pts: 2 },
    ],
  },
  {
    id: "hct", label: "Hematokrit", unit: "%",
    opts: [
      { label: "≥ 60", pts: 4 }, { label: "50–59.9", pts: 2 }, { label: "46–49.9", pts: 1 },
      { label: "30–45.9", pts: 0 }, { label: "20–29.9", pts: 2 }, { label: "< 20", pts: 4 },
    ],
  },
  {
    id: "wbc", label: "Lökosit", unit: "×10³/mm³",
    opts: [
      { label: "≥ 40", pts: 4 }, { label: "20–39.9", pts: 2 }, { label: "15–19.9", pts: 1 },
      { label: "3–14.9", pts: 0 }, { label: "1–2.9", pts: 2 }, { label: "< 1", pts: 4 },
    ],
  },
  {
    id: "gcs", label: "GKS Puanı (15 – GKS değeri)", unit: "puan",
    opts: [
      { label: "GKS 15 (0 puan)", pts: 0 }, { label: "GKS 13–14 (1–2 puan)", pts: 2 },
      { label: "GKS 10–12 (3–5 puan)", pts: 5 }, { label: "GKS 7–9 (6–8 puan)", pts: 8 },
      { label: "GKS 3–6 (9–12 puan)", pts: 12 },
    ],
  },
];

const AGE_OPTS = [
  { label: "< 44", pts: 0 }, { label: "45–54", pts: 2 }, { label: "55–64", pts: 3 },
  { label: "65–74", pts: 5 }, { label: "≥ 75", pts: 6 },
];

const CHRONIC_OPTS = [
  { label: "Yok veya elektif cerrahi", pts: 0 },
  { label: "Acil cerrahi veya non-cerrahi (kronik organ yetmezliği yok)", pts: 2 },
  { label: "Kronik organ yetmezliği veya immün yetmezlik (elekt. cerrahi)", pts: 2 },
  { label: "Kronik organ yetmezliği veya immün yetmezlik (acil cerrahi/non-op)", pts: 5 },
];

const getMortality = (score: number): string => {
  if (score <= 4) return "< %4";
  if (score <= 9) return "%8";
  if (score <= 14) return "%15";
  if (score <= 19) return "%25";
  if (score <= 24) return "%40";
  if (score <= 29) return "%55";
  if (score <= 34) return "%73";
  return "> %85";
};

const getBand = (v: number) =>
  v <= 9  ? { label: "DÜŞÜK RİSK",  color: "emerald" } :
  v <= 19 ? { label: "ORTA RİSK",   color: "amber" } :
  v <= 29 ? { label: "YÜKSEK RİSK", color: "orange" } :
             { label: "ÇOK YÜKSEK", color: "rose" };

const COLOR: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
  orange:  { bg: "bg-orange-50",  border: "border-orange-200",  text: "text-orange-700",  badge: "bg-orange-600 text-white" },
  rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
};

export default function APACHE2Page() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(PHYSIO.map(p => [p.id, null]))
  );
  const [age, setAge] = React.useState<number | null>(null);
  const [chronic, setChronic] = React.useState<number | null>(null);

  const physioAnswered = Object.values(sel).filter(v => v !== null).length;
  const complete = physioAnswered === PHYSIO.length && age !== null && chronic !== null;

  const total = complete
    ? Object.values(sel).reduce<number>((s, v) => s + (v ?? 0), 0) + (age ?? 0) + (chronic ?? 0)
    : null;

  const band = total !== null ? getBand(total) : null;
  const c = band ? COLOR[band.color] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="apache2" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🏥</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">APACHE II</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Akut Fizyoloji ve Kronik Sağlık Değerlendirmesi · YBÜ Mortalite</p>
          </div>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{physioAnswered}/{PHYSIO.length} fizyolojik</span>
          <div className="flex flex-wrap gap-0.5">
            {PHYSIO.map(p => (
              <div key={p.id} className={`w-3 h-2 rounded-sm ${sel[p.id] !== null ? "bg-blue-900" : "bg-slate-200"}`} />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {PHYSIO.map(param => (
            <div key={param.id} className="bg-white rounded-2xl border border-slate-200 p-3 shadow-sm">
              <p className="font-black text-blue-900 uppercase italic text-[11px] mb-2">{param.label}{param.unit ? ` (${param.unit})` : ""}</p>
              <div className="flex flex-wrap gap-1">
                {param.opts.map(opt => (
                  <button key={`${opt.pts}-${opt.label}`} type="button"
                    onClick={() => setSel(s => ({ ...s, [param.id]: s[param.id] === opt.pts ? null : opt.pts }))}
                    className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border-2 text-[9px] font-bold transition-all
                      ${sel[param.id] === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                    <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[8px] font-black shrink-0
                      ${sel[param.id] === opt.pts ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="font-black text-blue-900 uppercase italic text-sm mb-3">Yaş</p>
          <div className="flex flex-wrap gap-1.5">
            {AGE_OPTS.map(opt => (
              <button key={opt.pts} type="button"
                onClick={() => setAge(age === opt.pts ? null : opt.pts)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-[10px] font-bold transition-all
                  ${age === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black
                  ${age === opt.pts ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <p className="font-black text-blue-900 uppercase italic text-sm mb-3">Kronik Hastalık Puanı</p>
          <div className="space-y-1.5">
            {CHRONIC_OPTS.map(opt => (
              <button key={opt.pts + opt.label} type="button"
                onClick={() => setChronic(chronic === opt.pts && chronic + opt.label === chronic + opt.label ? null : opt.pts)}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-[10px] font-bold transition-all
                  ${chronic === opt.pts ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200"}`}>
                <span className={`w-5 h-5 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0
                  ${chronic === opt.pts ? "bg-amber-400 text-blue-900" : "bg-white border border-slate-200 text-slate-400"}`}>{opt.pts}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {total !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-4`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[7px] font-black text-blue-300 uppercase">APACHE II</span>
                <span className="text-3xl font-black text-white leading-none">{total}</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-xl font-black italic mt-1 ${c.text}`}>Tahmini Mortalite: {getMortality(total)}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm parametreleri tamamlayın ({physioAnswered + (age !== null ? 1 : 0) + (chronic !== null ? 1 : 0)}/14)</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={{ ...sel as Record<string, number>, age: age ?? 0, chronic: chronic ?? 0 }} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              APACHE II mortalite tahmininde kalibrasyon zayıflayabilir. İlk 24 saatte alınan en kötü değerler kullanılır. Knaus et al., Crit Care Med 1985.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
