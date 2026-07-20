"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

// NIAID/FAAN 2006 - herhangi bir kriter karşılanırsa anafilaksi
const CRITERIA = [
  {
    id: "c1",
    num: "1",
    title: "Cilt + En Az 1 Sistem",
    desc: "Akut başlangıçlı hastalık (dakika–saat): cilt/mukoza tutulumu (ürtiker, kaşıntı-kızarıklık, dudak-dil-uvula ödemi) VE aşağıdakilerden ≥ 1:",
    items: [
      "Solunum güçlüğü (dispne, wheezing, stridor, hipoksemi)",
      "Hipotansiyon veya hedef organ disfonksiyonu (senkop, kollaps, inkontinans)",
    ],
  },
  {
    id: "c2",
    num: "2",
    title: "Bilinen Alerjen Sonrası ≥ 2 Sistem",
    desc: "Bilinen/muhtemel alerjene maruziyetin ardından dakikalar–saatler içinde ≥ 2 aşağıdakinden:",
    items: [
      "Cilt/mukoza tutulumu",
      "Solunum güçlüğü",
      "Hipotansiyon/hedef organ disfonksiyonu",
      "Persistan gastrointestinal semptomlar (karın ağrısı, kusma)",
    ],
  },
  {
    id: "c3",
    num: "3",
    title: "Bilinen Alerjenle Hipotansiyon",
    desc: "Bilinen alerjen maruziyetinden sonra dakikalar–saatler içinde hipotansiyon:",
    items: [
      "Bebek/çocuk: yaşa göre düşük sistolik KB veya sistolik KB'de > %30 düşüş",
      "Yetişkin: sistolik KB < 90 mmHg veya başlangıçtan > %30 düşüş",
    ],
  },
];

export default function AnaphylaxisPage() {
  const [sel, setSel] = React.useState<Record<string, boolean | null>>({ c1: null, c2: null, c3: null });
  const allAnswered = Object.values(sel).every(v => v !== null);
  const isAnaphylaxis = Object.values(sel).some(v => v === true);

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="anaphylaxis" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🚨</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">Anafilaksi Tanısı</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">NIAID/FAAN Klinik Tanı Kriterleri · 2006</p>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3">
          <p className="text-[10px] font-bold text-rose-800">🚨 Anafilaksi klinik tanıdır. Herhangi bir kriter karşılanıyorsa → epinefrin uyluk dış yanına IM (0.01 mg/kg, maks. 0.5 mg) + acil ünitesi değerlendirmesi.</p>
        </div>

        <div className="space-y-3">
          {CRITERIA.map(cr => (
            <div key={cr.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black shrink-0">{cr.num}</div>
                <p className="font-black text-blue-900 uppercase italic text-sm">{cr.title}</p>
              </div>
              <p className="text-[10px] text-slate-600 font-bold mb-2 leading-snug">{cr.desc}</p>
              <ul className="space-y-1 mb-4">
                {cr.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-slate-600">
                    <span className="text-amber-500 shrink-0 mt-0.5">·</span>{item}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2">
                {([true, false] as const).map(v => (
                  <button key={String(v)} type="button"
                    onClick={() => setSel(s => ({ ...s, [cr.id]: s[cr.id] === v ? null : v }))}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all
                      ${sel[cr.id] === v
                        ? v ? "border-rose-500 bg-rose-500 text-white" : "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200"}`}>
                    {v ? "Kriter Karşılandı" : "Karşılanmadı"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {allAnswered ? (
          isAnaphylaxis ? (
            <div className="p-6 rounded-[2rem] border-2 border-dashed border-rose-400 bg-rose-50 space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-2xl bg-rose-600 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                  <span className="text-2xl">🚨</span>
                  <span className="text-[9px] font-black text-white uppercase">ANAFİLAKSİ</span>
                </div>
                <div>
                  <span className="text-[9px] font-black px-3 py-1 rounded-full bg-rose-700 text-white">ANAFİLAKSİ TANILANDIRILDI</span>
                  <div className="mt-2 space-y-1">
                    {["Epinefrin IM — uyluk dış yüzü, 0.01 mg/kg (maks. 0.5 mg)", "Supin pozisyon, bacaklar elevasyona", "O₂ %100, IV erişim", "Antihistaminik + steroid (epinefrinin yerine geçmez)", "En az 4–6 saat gözlem"].map(t => (
                      <div key={t} className="flex items-start gap-2 text-[9px] text-rose-900 font-bold">
                        <span className="shrink-0 text-rose-500">→</span>{t}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-[2rem] border-2 border-dashed border-emerald-200 bg-emerald-50 flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-emerald-700 flex flex-col items-center justify-center shadow-lg shrink-0">
                <span className="text-2xl">✅</span>
                <span className="text-[8px] font-black text-white uppercase mt-1">Düşük</span>
              </div>
              <div>
                <span className="text-[9px] font-black px-3 py-1 rounded-full bg-emerald-700 text-white">Kriter Karşılanmadı</span>
                <p className="text-sm font-bold text-emerald-700 mt-1">Mevcut bulgular anafilaksi tanı kriterlerini karşılamıyor. Alternatif tanıları değerlendirin.</p>
              </div>
            </div>
          )
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 3 kriteri değerlendirin</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
          <div className="flex justify-center border-b border-slate-100 pb-4 mb-4">
            <ToolShare params={Object.fromEntries(Object.entries(sel).map(([k, v]) => [k, v ? 1 : 0]))} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              Epinefrin geciktirilmesi en önemli ölüm nedenidir. Antihistaminikler ve steroidler anafilaksi tedavisinin temelini oluşturmaz. Sampson et al., J Allergy Clin Immunol 2006.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
