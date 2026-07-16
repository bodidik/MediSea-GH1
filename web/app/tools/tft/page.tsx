"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber } from "@/app/tools/lib/calc-utils";

type Pattern = {
  label: string;
  detail: string;
  color: string;
  bg: string;
  border: string;
  examples: string;
};

function interpret(tsh: number, ft4: number, ft3: number): Pattern | null {
  if (tsh === 0 && ft4 === 0) return null;

  const tshLow  = tsh > 0 && tsh < 0.4;
  const tshNorm = tsh >= 0.4 && tsh <= 4.0;
  const tshHigh = tsh > 4.0;
  const ft4Low  = ft4 > 0 && ft4 < 0.8;
  const ft4Norm = ft4 >= 0.8 && ft4 <= 1.8;
  const ft4High = ft4 > 1.8;
  const ft3High = ft3 > 0 && ft3 > 4.2;

  if (tshLow && ft4High)  return { label: "PRİMER HİPERTİROİDİZM", detail: "TSH baskılı, FT4 yüksek", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", examples: "Graves hastalığı, toksik nodül, toksik multinodüler guatr" };
  if (tshLow && ft4Norm && !ft3High) return { label: "SUBKLİNİK HİPERTİROİDİZM", detail: "TSH baskılı, FT4 normal", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", examples: "Erken Graves, aşırı tiroid hormonu tedavisi, otonom nodül" };
  if (tshLow && ft4Norm && ft3High) return { label: "T3 TOKSİKOZU", detail: "TSH baskılı, FT4 normal, FT3 yüksek", color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200", examples: "Toksik nodüle erken dönem, otonom hipertiroidi" };
  if (tshHigh && ft4Low)  return { label: "PRİMER HİPOTİROİDİZM", detail: "TSH yüksek, FT4 düşük", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", examples: "Hashimoto tiroiditi, tiroidektomi sonrası, RAİ sonrası" };
  if (tshHigh && ft4Norm) return { label: "SUBKLİNİK HİPOTİROİDİZM", detail: "TSH yüksek, FT4 normal", color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-200", examples: "Hafif Hashimoto, iyot yetersizliği, ilaç etkisi" };
  if (tshNorm && ft4Norm) return { label: "ÖTİROİD", detail: "TSH ve FT4 normal sınırlarda", color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", examples: "Normal tiroid fonksiyonu" };
  if ((tshLow || tshNorm) && ft4Low) return { label: "SANTRAL HİPOTİROİDİZM", detail: "FT4 düşük, TSH düşük veya normal (baskılanmamış)", color: "text-violet-700", bg: "bg-violet-50", border: "border-violet-200", examples: "Hipofiz yetmezliği, kranyal radyasyon, hipotalamik hastalık" };
  if (tshHigh && ft4High) return { label: "TSH SALGILIYAN ADENOM / DİRENÇ", detail: "TSH yüksek, FT4 yüksek — uygunsuz TSH salınımı", color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", examples: "TSHoma, tiroid hormon direnci sendromu" };
  return { label: "TANIMSIZ PATERN", detail: "Değerleri kontrol edin veya biyotindirfaz/assay girişimini değerlendirin", color: "text-slate-600", bg: "bg-slate-50", border: "border-slate-200", examples: "Heterofil antikor, makro-TSH, assay interferansı" };
}

export default function TftPage() {
  const [tsh, setTsh] = React.useState("");
  const [ft4, setFt4] = React.useState("");
  const [ft3, setFt3] = React.useState("");

  const tshN = parseLocaleNumber(tsh);
  const ft4N = parseLocaleNumber(ft4);
  const ft3N = parseLocaleNumber(ft3);
  const result = interpret(tshN, ft4N, ft3N);
  const params = { tsh: tshN, ft4: ft4N, ft3: ft3N };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="tft" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦋</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Tiroid Fonksiyon Testi</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">TFT — TSH / FT4 / FT3 Patern Tanıma</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "TSH (mIU/L)", value: tsh, set: setTsh, ph: "ör. 5.2", ref: "N: 0.4–4.0" },
              { label: "Serbest T4 (ng/dL)", value: ft4, set: setFt4, ph: "ör. 0.9", ref: "N: 0.8–1.8" },
              { label: "Serbest T3 (pg/mL)", value: ft3, set: setFt3, ph: "ör. 3.1", ref: "N: 2.3–4.2" },
            ].map(({ label, value, set, ph, ref }) => (
              <label key={label} className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
                <input type="text" inputMode="decimal" value={value} onChange={e => set(e.target.value)} placeholder={ph}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
                <span className="text-[9px] font-bold text-slate-400 pl-1">{ref}</span>
              </label>
            ))}
          </div>

          {/* Görsel patern */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { label: "TSH", val: tshN, low: 0.4, high: 4.0, unit: "mIU/L" },
              { label: "FT4", val: ft4N, low: 0.8, high: 1.8, unit: "ng/dL" },
              { label: "FT3", val: ft3N, low: 2.3, high: 4.2, unit: "pg/mL" },
            ].map(({ label, val, low, high, unit }) => {
              const status = val === 0 ? "unknown" : val < low ? "low" : val > high ? "high" : "normal";
              const colors = { low: "bg-blue-500 text-white", high: "bg-rose-500 text-white", normal: "bg-emerald-500 text-white", unknown: "bg-slate-200 text-slate-400" };
              const icons  = { low: "↓", high: "↑", normal: "N", unknown: "–" };
              return (
                <div key={label} className={`rounded-2xl p-4 text-center ${colors[status]}`}>
                  <div className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-1">{label}</div>
                  <div className="text-2xl font-black">{icons[status]}</div>
                  <div className="text-[10px] font-bold mt-1 opacity-80">{val > 0 ? `${val} ${unit}` : "—"}</div>
                </div>
              );
            })}
          </div>
        </div>

        {result && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${result.border} ${result.bg}`}>
            <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest mb-2">PATERN TANI</div>
            <p className={`text-2xl font-black italic tracking-tight ${result.color}`}>{result.label}</p>
            <p className={`text-sm font-bold mt-1 ${result.color} opacity-70`}>{result.detail}</p>
            <div className="mt-3 pt-3 border-t border-current/10">
              <span className="text-[9px] font-black uppercase tracking-widest text-blue-900/40 block mb-1">ÖRNEK NEDENLER</span>
              <p className={`text-[11px] font-bold ${result.color} opacity-70`}>{result.examples}</p>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Referans aralıkları laboratuvara göre farklılık gösterebilir. Gebelik, biyotin takviyesi, heterofil antikorlar yanlış sonuçlara yol açabilir. FT3 rutin taramada gerekmez; öncelikle TSH, ardından FT4 değerlendirilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
