"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

const MODES = [
  { id: "tbw",  label: "TBW & Sıvı Bölmeleri", icon: "💧" },
  { id: "hypo", label: "Hiponatremi Düzeltme", icon: "📉" },
  { id: "hyper", label: "Hipernatremi Düzeltme", icon: "📈" },
] as const;
type Mode = typeof MODES[number]["id"];

const INFUSATES = [
  { label: "D5W (Dekstroz %5)", na: 0 },
  { label: "0.225% NaCl (¼ SF)", na: 38.5 },
  { label: "0.45% NaCl (½ SF)", na: 77 },
  { label: "0.9% NaCl (İzotonik)", na: 154 },
  { label: "Ringer Laktat", na: 130 },
  { label: "%3 NaCl (Hipertonik)", na: 513 },
] as const;

function calcTBW(sex: string, age: number, height: number, weight: number) {
  if (!age || !height || !weight) return null;
  // Watson formula
  if (sex === "male") return 2.447 - 0.09516 * age + 0.1074 * height + 0.3362 * weight;
  return -2.097 + 0.1069 * height + 0.2466 * weight;
}

export default function SodiumPage() {
  const [mode, setMode] = React.useState<Mode>("tbw");

  // Common inputs
  const [sex, setSex]       = React.useState("male");
  const [age, setAge]       = React.useState("");
  const [height, setHeight] = React.useState("");
  const [weight, setWeight] = React.useState("");
  const [na, setNa]         = React.useState("");

  // Hypo-specific
  const [targetNa, setTargetNa] = React.useState("");
  const [infuseIdx, setInfuseIdx] = React.useState(2);
  const [rateMode, setRateMode] = React.useState<"acute" | "chronic">("chronic");

  // Hyper-specific
  const [hyperTarget, setHyperTarget] = React.useState("140");
  const [fwFluid, setFwFluid]         = React.useState(0); // index of infusate for free water

  const ageN    = parseLocaleNumber(age);
  const heightN = parseLocaleNumber(height);
  const weightN = parseLocaleNumber(weight);
  const naN     = parseLocaleNumber(na);
  const targetN = parseLocaleNumber(targetNa);
  const hyperTargetN = parseLocaleNumber(hyperTarget);

  const tbw = calcTBW(sex, ageN, heightN, weightN);
  const icf  = tbw ? tbw * 0.67 : null;
  const ecf  = tbw ? tbw * 0.33 : null;
  const plasma = ecf ? ecf * 0.25 : null;

  // Adrogue-Madias
  const infusateNa = INFUSATES[infuseIdx].na;
  const adroguePerL = tbw && naN > 0
    ? (infusateNa - naN) / (tbw + 1)
    : null;

  const maxRate = rateMode === "chronic" ? 8 : 12; // mEq/L/day (conservative: 8 for chronic)
  const deltaNeeded = naN > 0 && targetN > 0 ? targetN - naN : null;
  const litersNeeded = adroguePerL && adroguePerL !== 0 && deltaNeeded
    ? deltaNeeded / adroguePerL
    : null;
  const hoursNeeded = deltaNeeded && litersNeeded
    ? Math.abs(deltaNeeded) / maxRate * 24
    : null;
  const mlPerHour = litersNeeded && hoursNeeded
    ? (Math.abs(litersNeeded) * 1000) / hoursNeeded
    : null;

  // Free water deficit (hypernatremia)
  const fwd = tbw && naN > 0 && hyperTargetN > 0
    ? tbw * (naN / hyperTargetN - 1)
    : null;
  const hyperMaxRate = 10; // mEq/L/day
  const hyperDelta = naN > 0 && hyperTargetN > 0 ? naN - hyperTargetN : null;
  const hyperHours = hyperDelta ? Math.abs(hyperDelta) / hyperMaxRate * 24 : null;
  const hyperMlPerHour = fwd && hyperHours ? (Math.abs(fwd) * 1000) / hyperHours : null;

  const InputField = ({ label, value, set, ph, unit }: { label: string; value: string; set: (v: string) => void; ph: string; unit?: string }) => (
    <label className="flex flex-col gap-2">
      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
      <div className="relative">
        <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)} placeholder={ph}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
        {unit && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">{unit}</span>}
      </div>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="sodium" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🧂</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Sodyum Yönetimi</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">TBW · Hiponatremi · Hipernatremi Düzeltme Hesaplama</p>
          </div>
        </div>

        {/* Mod seçimi */}
        <div className="grid grid-cols-3 gap-2">
          {MODES.map(m => (
            <button key={m.id} type="button" onClick={() => setMode(m.id)}
              className={`p-3 rounded-2xl border transition-all text-center
                ${mode === m.id ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-white border-slate-200 hover:border-blue-900/30'}`}>
              <div className="text-xl mb-1">{m.icon}</div>
              <div className={`text-[9px] font-black uppercase tracking-widest leading-tight ${mode === m.id ? 'text-white' : 'text-blue-950'}`}>{m.label}</div>
            </button>
          ))}
        </div>

        {/* Hasta bilgileri — her mod için ortak */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Hasta Bilgileri</p>
          <div className="flex gap-3">
            {[{ v: "male", l: "Erkek" }, { v: "female", l: "Kadın" }].map(s => (
              <button key={s.v} type="button" onClick={() => setSex(s.v)}
                className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all
                  ${sex === s.v ? 'bg-blue-900 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 text-blue-900 hover:border-blue-900/30'}`}>
                {s.l}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <InputField label="Yaş" value={age} set={setAge} ph="ör. 65" unit="yıl" />
            <InputField label="Boy" value={height} set={setHeight} ph="ör. 170" unit="cm" />
            <InputField label="Ağırlık" value={weight} set={setWeight} ph="ör. 70" unit="kg" />
          </div>
          <InputField label="Serum Na⁺" value={na} set={setNa} ph="ör. 120" unit="mEq/L" />
        </div>

        {/* TBW modu */}
        {mode === "tbw" && tbw && (
          <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sıvı Bölmeleri (Watson Formülü)</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Vücut Suyu (TBW)", val: tbw, pct: 60, desc: "Toplam vücut sıvısı", color: "bg-blue-900 text-white" },
                { label: "Hücre içi sıvı (ICF)", val: icf!, pct: 40, desc: "TBW × 0.67", color: "bg-blue-700 text-white" },
                { label: "Hücre dışı sıvı (ECF)", val: ecf!, pct: 20, desc: "TBW × 0.33", color: "bg-sky-600 text-white" },
                { label: "Plazma hacmi", val: plasma!, pct: 5, desc: "ECF × 0.25", color: "bg-sky-400 text-white" },
              ].map(({ label, val, pct, desc, color }) => (
                <div key={label} className={`rounded-2xl p-4 ${color}`}>
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-1">{label}</div>
                  <div className="text-2xl font-black">{val.toFixed(1)} L</div>
                  <div className="text-[9px] font-bold opacity-70 mt-1">~{pct}% BW · {desc}</div>
                </div>
              ))}
            </div>
            {naN > 0 && (
              <div className="border-t border-slate-100 pt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Osmolalite Tahmini</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Hesaplanan Osm</div>
                    <div className="text-xl font-black text-blue-900">{(2 * naN).toFixed(0)} mOsm/kg</div>
                    <div className="text-[9px] font-bold text-slate-400 mt-1">2 × Na (glukoz/BUN hariç)</div>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Na Durumu</div>
                    <div className={`text-xl font-black ${naN < 135 ? 'text-rose-700' : naN > 145 ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {naN < 135 ? 'HİPONATREMİ' : naN > 145 ? 'HİPERNATREMİ' : 'NORMONATREMI'}
                    </div>
                    <div className="text-[9px] font-bold text-slate-400 mt-1">N: 135–145 mEq/L</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Hiponatremi modu */}
        {mode === "hypo" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-[10px] font-black text-amber-800/60 uppercase tracking-widest mb-1">DİKKAT</p>
              <p className="text-[11px] font-bold text-amber-900">Kronik hiponatremide düzeltme hızı <strong>≤8–10 mEq/L/gün</strong> (ODS riski). Akut/semptomatik vakalarda ilk 1–2 saat için daha hızlı düzeltme yapılabilir.</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Düzeltme Parametreleri</p>
              <InputField label="Hedef Na⁺" value={targetNa} set={setTargetNa} ph="ör. 130" unit="mEq/L" />

              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-2">Düzeltme Tipi</p>
                <div className="flex gap-3">
                  {[
                    { v: "chronic" as const, l: "Kronik (≤8 mEq/L/gün)" },
                    { v: "acute" as const, l: "Akut / semptomatik (≤12 mEq/gün)" },
                  ].map(o => (
                    <button key={o.v} type="button" onClick={() => setRateMode(o.v)}
                      className={`flex-1 py-3 px-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all
                        ${rateMode === o.v ? 'bg-blue-900 border-blue-900 text-white' : 'bg-slate-50 border-slate-200 text-blue-900 hover:border-blue-900/30'}`}>
                      {o.l}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-2">Kullanılacak Sıvı</p>
                <div className="space-y-2">
                  {INFUSATES.map((inf, i) => (
                    <button key={inf.label} type="button" onClick={() => setInfuseIdx(i)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between
                        ${infuseIdx === i ? 'bg-blue-900 border-blue-900' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
                      <span className={`text-sm font-bold ${infuseIdx === i ? 'text-white' : 'text-blue-950'}`}>{inf.label}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${infuseIdx === i ? 'text-blue-200/70' : 'text-slate-400'}`}>{inf.na} mEq/L</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {adroguePerL !== null && tbw && naN > 0 && (
              <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adrogue-Madias Formülü Sonuçları</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-900 rounded-2xl p-4 text-center">
                    <div className="text-[9px] font-black text-blue-200/70 uppercase tracking-widest mb-1">1 L sıvı → Na değişimi</div>
                    <div className="text-3xl font-black text-white">{adroguePerL > 0 ? '+' : ''}{adroguePerL.toFixed(2)}</div>
                    <div className="text-[9px] font-bold text-amber-400">mEq/L</div>
                  </div>
                  <div className="bg-slate-100 rounded-2xl p-4 text-center">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">TBW</div>
                    <div className="text-3xl font-black text-blue-900">{tbw.toFixed(1)}</div>
                    <div className="text-[9px] font-bold text-slate-400">Litre</div>
                  </div>
                </div>

                {deltaNeeded !== null && litersNeeded !== null && mlPerHour !== null && (
                  <div className="border-t border-slate-100 pt-3 space-y-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-slate-50 rounded-2xl p-4 text-center">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Hedef Delta</div>
                        <div className="text-2xl font-black text-blue-900">{deltaNeeded > 0 ? '+' : ''}{deltaNeeded.toFixed(0)}</div>
                        <div className="text-[9px] font-bold text-slate-400">mEq/L</div>
                      </div>
                      <div className="bg-slate-50 rounded-2xl p-4 text-center">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Gerekli Hacim</div>
                        <div className="text-2xl font-black text-blue-900">{Math.abs(litersNeeded).toFixed(1)}</div>
                        <div className="text-[9px] font-bold text-slate-400">Litre</div>
                      </div>
                      <div className="bg-emerald-900 rounded-2xl p-4 text-center">
                        <div className="text-[9px] font-black text-emerald-200/70 uppercase tracking-widest mb-1">Hız (≤{maxRate} mEq/gün)</div>
                        <div className="text-2xl font-black text-white">{mlPerHour.toFixed(0)}</div>
                        <div className="text-[9px] font-bold text-amber-400">mL/saat</div>
                      </div>
                    </div>
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center">
                      <span className="text-[10px] font-black text-amber-800">Yaklaşık süre: {hoursNeeded?.toFixed(0)} saat ({((hoursNeeded ?? 0) / 24).toFixed(1)} gün)</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Hipernatremi modu */}
        {mode === "hyper" && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-[10px] font-black text-amber-800/60 uppercase tracking-widest mb-1">DİKKAT</p>
              <p className="text-[11px] font-bold text-amber-900">Hipernatremide düzeltme hızı <strong>≤10 mEq/L/gün</strong> (beyin ödemi riski). Akut vakalar (&lt;24 saat) daha hızlı düzeltilebilir.</p>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
              <InputField label="Hedef Na⁺" value={hyperTarget} set={setHyperTarget} ph="140" unit="mEq/L" />
              <div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-2">Serbest Su Kaynağı</p>
                <div className="space-y-2">
                  {INFUSATES.filter(inf => inf.na < 154).map((inf, i) => (
                    <button key={inf.label} type="button" onClick={() => setFwFluid(INFUSATES.indexOf(inf))}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between
                        ${fwFluid === INFUSATES.indexOf(inf) ? 'bg-blue-900 border-blue-900' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
                      <span className={`text-sm font-bold ${fwFluid === INFUSATES.indexOf(inf) ? 'text-white' : 'text-blue-950'}`}>{inf.label}</span>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${fwFluid === INFUSATES.indexOf(inf) ? 'text-blue-200/70' : 'text-slate-400'}`}>{inf.na} mEq/L</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {fwd !== null && tbw && naN > 0 && hyperTargetN > 0 && (
              <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Serbest Su Açığı Hesabı</p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-900 rounded-2xl p-4 text-center">
                    <div className="text-[9px] font-black text-blue-200/70 uppercase tracking-widest mb-1">Serbest Su Açığı</div>
                    <div className="text-3xl font-black text-white">{Math.abs(fwd).toFixed(1)}</div>
                    <div className="text-[9px] font-bold text-amber-400">Litre</div>
                  </div>
                  <div className="bg-slate-100 rounded-2xl p-4 text-center">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">TBW</div>
                    <div className="text-3xl font-black text-blue-900">{tbw.toFixed(1)}</div>
                    <div className="text-[9px] font-bold text-slate-400">Litre</div>
                  </div>
                  {hyperMlPerHour && (
                    <div className="bg-emerald-900 rounded-2xl p-4 text-center">
                      <div className="text-[9px] font-black text-emerald-200/70 uppercase tracking-widest mb-1">İnfüzyon Hızı</div>
                      <div className="text-3xl font-black text-white">{hyperMlPerHour.toFixed(0)}</div>
                      <div className="text-[9px] font-bold text-amber-400">mL/saat</div>
                    </div>
                  )}
                </div>

                {/* Seçilen sıvı ile Na değişimi / L */}
                {(() => {
                  const selInfNa = INFUSATES[fwFluid].na;
                  const adrogueHyper = tbw ? (selInfNa - naN) / (tbw + 1) : null;
                  return adrogueHyper !== null ? (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                      <div className="bg-slate-50 rounded-2xl p-4 text-center">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">1L sıvı → Na değişimi</div>
                        <div className="text-2xl font-black text-blue-900">{adrogueHyper.toFixed(2)} mEq/L</div>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
                        <div className="text-[9px] font-black text-amber-700/60 uppercase tracking-widest mb-1">Max süre (10 mEq/gün)</div>
                        <div className="text-2xl font-black text-amber-800">{hyperHours?.toFixed(0)} saat</div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={{ mode, sex, age: ageN, height: heightN, weight: weightN, na: naN }} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Bu hesaplamalar tahmin niteliğindedir. Klinik tablo, idrar Na/osmolalitesi, altta yatan neden ve komorbiditelere göre tedavi planı bireyselleştirilmelidir. Hedef Na aşımına karşı sık seri ölçüm zorunludur.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
