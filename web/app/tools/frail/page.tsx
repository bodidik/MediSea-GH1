"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";

const ITEMS = [
  {
    id: "fatigue",
    letter: "F",
    title: "Fatigue — Yorgunluk",
    q: "Geçen ay çoğu zaman veya her zaman yorgunluk/tükenme hissettiniz mi?",
    detail: "EPESE anket sorusuna dayalı: 'Yapmak istediğiniz her şeyi yapmak için gereken enerjiye sahip hissettiniz mi?' — Hayır yanıtı puan verir",
  },
  {
    id: "resistance",
    letter: "R",
    title: "Resistance — Direnç",
    q: "Tek başınıza, dinlenmeden ve yardımsız 1 kat merdiven çıkmakta güçlük yaşıyor musunuz?",
    detail: "Nöromüsküler güç ve dayanıklılığı değerlendirir",
  },
  {
    id: "ambulation",
    letter: "A",
    title: "Ambulation — Yürüme",
    q: "Tek başınıza, yardımsız bir blok (yaklaşık 100 m) yürümekte güçlük yaşıyor musunuz?",
    detail: "Mobilite kapasitesini değerlendirir",
  },
  {
    id: "illness",
    letter: "I",
    title: "Illness — Hastalık Yükü",
    q: "Doktorunuzun 'Hipertansiyon, diyabet, kanser, KOAH, kalp hastalığı, inme, astım, artrit, böbrek hastalığı, depresyon' gibi 5 veya daha fazla hastalığınız var mı?",
    detail: "Kronik hastalık sayısı ≥ 5 ise puan verir",
  },
  {
    id: "loss",
    letter: "L",
    title: "Loss of Weight — Kilo Kaybı",
    q: "Son 1 yılda istenmeden vücut ağırlığınızın %5'inden fazlasını (veya > 4.5 kg) kaybettiniz mi?",
    detail: "İstemsiz kilo kaybı kırılganlık bileşeni olarak tanımlanmıştır",
  },
];

export default function FrailPage() {
  const [sel, setSel] = React.useState<Record<string, boolean | null>>(
    Object.fromEntries(ITEMS.map(i => [i.id, null]))
  );

  const toggle = (id: string, val: boolean) =>
    setSel(s => ({ ...s, [id]: s[id] === val ? null : val }));

  const answered = ITEMS.filter(i => sel[i.id] !== null).length;
  const total = answered === 5
    ? ITEMS.reduce((s, i) => s + (sel[i.id] === true ? 1 : 0), 0)
    : null;

  const getBand = (v: number) =>
    v === 0 ? { label: "SAĞLIKLI",       sub: "Kırılganlık bulgusu yok",            color: "emerald" } :
    v <= 2  ? { label: "PRE-KIRILGAN",   sub: "Kırılganlık riski mevcut — önlem al", color: "amber" } :
              { label: "KIRILGAN",        sub: "Kapsamlı geriatrik değerlendirme",    color: "rose" };

  const band = total !== null ? getBand(total) : null;
  const COLOR = {
    emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", badge: "bg-emerald-700 text-white" },
    amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   badge: "bg-amber-600 text-white" },
    rose:    { bg: "bg-rose-50",    border: "border-rose-200",    text: "text-rose-700",    badge: "bg-rose-700 text-white" },
  };
  const c = band ? COLOR[band.color as keyof typeof COLOR] : null;

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="frail" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🌿</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">FRAIL Skalası</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Geriatrik Kırılganlık Tarama Aracı · 5 Madde</p>
          </div>
        </div>

        <div className="flex gap-2 justify-center">
          {ITEMS.map(i => (
            <div key={i.id} className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all
              ${sel[i.id] === true ? "bg-rose-600 text-white" : sel[i.id] === false ? "bg-emerald-600 text-white" : "bg-white border border-slate-200 text-slate-400"}`}>
              {i.letter}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          {ITEMS.map(item => (
            <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-xl bg-blue-900 text-white flex items-center justify-center text-sm font-black shrink-0">
                  {item.letter}
                </div>
                <div>
                  <p className="font-black text-blue-900 text-sm uppercase italic">{item.title}</p>
                  <p className="text-[9px] text-slate-400 font-bold">{item.detail}</p>
                </div>
              </div>
              <p className="text-[11px] font-bold text-blue-950 mb-3 leading-snug">{item.q}</p>
              <div className="flex gap-2">
                {([true, false] as const).map(val => (
                  <button key={String(val)} type="button" onClick={() => toggle(item.id, val)}
                    className={`flex-1 py-2.5 rounded-xl border-2 text-[10px] font-black uppercase tracking-widest transition-all
                      ${sel[item.id] === val
                        ? val ? "border-rose-500 bg-rose-500 text-white" : "border-emerald-600 bg-emerald-600 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-500 hover:border-blue-200"}`}>
                    {val ? "Evet (+1)" : "Hayır (0)"}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {total !== null && band && c ? (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${c.border} ${c.bg} space-y-3`}>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-blue-900 flex flex-col items-center justify-center shadow-lg border-t-4 border-amber-400 shrink-0">
                <span className="text-[8px] font-black text-blue-300 uppercase">SKOR</span>
                <span className="text-4xl font-black text-white leading-none">{total}</span>
                <span className="text-[8px] text-blue-300">/ 5</span>
              </div>
              <div>
                <span className={`text-[9px] font-black px-3 py-1 rounded-full ${c.badge}`}>{band.label}</span>
                <p className={`text-sm font-bold mt-1 ${c.text}`}>{band.sub}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-[9px]">
              {[
                { l: "Sağlıklı", r: "0 pt", col: "emerald" },
                { l: "Pre-Kırılgan", r: "1–2 pt", col: "amber" },
                { l: "Kırılgan", r: "3–5 pt", col: "rose" },
              ].map(b => (
                <div key={b.l} className={`rounded-xl p-2 font-black uppercase
                  ${b.l === band.label.split(" ")[0] || band.label === b.l ? "bg-blue-900 text-white" : "bg-white/60 text-slate-500"}`}>
                  <div>{b.l}</div><div className="font-bold normal-case">{b.r}</div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-[2rem] p-6 text-center opacity-40">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tüm 5 soruyu yanıtlayın</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={Object.fromEntries(ITEMS.map(i => [i.id, sel[i.id] === true ? 1 : 0]))} />
          </div>
          <div className="flex items-start gap-3 opacity-60">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-[9px] text-blue-900 font-bold uppercase tracking-[0.15em] leading-relaxed italic">
              FRAIL skalası hızlı tarama içindir. Kırılgan/Pre-kırılgan saptanan hastalara kapsamlı geriatrik değerlendirme (CGA) planlanmalıdır. Morley et al., JAMDA 2012.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
