"use client";

import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { sozluk } from "@/lib/dil";
import { useDil } from "@/app/components/DilBaglami";
import metin from "./metin.dil.json";

const M = sozluk(metin);
type Metin = ReturnType<typeof M>;

type Item = { key: keyof State; label: string; pts: number };

type State = {
  cHF: boolean; htn: boolean; age75: boolean; dm: boolean;
  strokeTIA: boolean; vascular: boolean; age65to74: boolean; female: boolean;
};

/* Metin `metin.dil.json`da (TR + EN); puanlar burada, TEK kopya. */
const itemsOf = (t: Metin): Item[] => [
  { key: "cHF", label: t.cHF, pts: 1 },
  { key: "htn", label: t.htn, pts: 1 },
  { key: "age75", label: t.age75, pts: 2 },
  { key: "dm", label: t.dm, pts: 1 },
  { key: "strokeTIA", label: t.strokeTIA, pts: 2 },
  { key: "vascular", label: t.vascular, pts: 1 },
  { key: "age65to74", label: t.age65to74, pts: 1 },
  { key: "female", label: t.female, pts: 1 },
];

function readBool(param: string | null) { return param === "1" || param === "true"; }

export default function ChadsVascPage() {
  const t = M(useDil());
  const ITEMS = itemsOf(t);
  const search = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;

  /**
   * İKİ YAŞ BANDI BİRBİRİNİ DIŞLAR — tanım gereği, ve araç bunu bilmiyordu.
   *
   * CHA₂DS₂-VASc'ta yaş TEK bir basamaktır: ≥75 iki puan, 65–74 bir puan,
   * <65 sıfır. Bir hasta ikisinde birden olamaz. Araç ikisini ayrı onay
   * kutusu yaptığı için ikisi de işaretlenebiliyordu.
   *
   * Tarayıcıda ölçüldü — sekiz kutunun sekizi de işaretlendiğinde ekran
   * **"TOPLAM 10"** basıyordu; oysa yayımlanmış azami **9**. GKS'deki
   * "297 / 15" ve MELD'deki eksi skorla aynı şekil: ekran, kendi ölçeğinin
   * dışında bir sayı gösteriyor.
   *
   * Klinik etkisi dar ama gerçek: 65–74 yaş kutusu işaretli bir hastada
   * doğum günü geçip ≥75 kutusu da işaretlenirse skor 1 puan şişiyor. Eşik
   * 2'de olduğu için sınırdaki bir hastayı (örn. yalnız kadın cinsiyet + 65–74
   * = 2) bandın içinde tutmaya devam eder, ama sayı yanlıştır ve paylaşılan
   * adres de yanlış taşınır.
   *
   * Çare `gcs`/`child-pugh` ile aynı yönde: geçersiz BİLEŞİM en baştan
   * kurulamıyor. Hem tıklamada hem ADRESTEN tohumlamada uygulanıyor —
   * `?age75=1&age6574=1` de artık iki bandı birden açmıyor.
   */
  const yasTekle = (s: State): State =>
    s.age75 && s.age65to74 ? { ...s, age65to74: false } : s;

  const [state, setState] = React.useState<State>(() =>
    yasTekle({
      cHF: readBool(search?.get("chf") || null),
      htn: readBool(search?.get("htn") || null),
      age75: readBool(search?.get("age75") || null),
      dm: readBool(search?.get("dm") || null),
      strokeTIA: readBool(search?.get("stroke") || null),
      vascular: readBool(search?.get("vasc") || null),
      age65to74: readBool(search?.get("age6574") || null),
      female: readBool(search?.get("female") || null),
    })
  );

  const toggle = (k: keyof State) =>
    setState((s) => {
      const yeni = { ...s, [k]: !s[k] };
      /* Yeni açılan yaş bandı ötekini kapatır; kapatma serbest. */
      if (k === "age75" && yeni.age75) yeni.age65to74 = false;
      if (k === "age65to74" && yeni.age65to74) yeni.age75 = false;
      return yeni;
    });
  const score = ITEMS.reduce((sum, it) => sum + (state[it.key] ? it.pts : 0), 0);

  let comment = "—";
  let statusColor = "text-slate-500";
  let statusBg = "bg-slate-100";

  if (score === 0 && !state.female) {
    comment = t.dusukErkek;
    statusColor = "text-emerald-700";
    statusBg = "bg-emerald-50";
  } else if (score === 1 && state.female) {
    comment = t.dusukKadin;
    statusColor = "text-blue-700";
    statusBg = "bg-blue-50";
  } else if (score >= 2 || (score === 1 && !state.female)) {
    comment = t.ortaYuksek;
    statusColor = "text-rose-700";
    statusBg = "bg-rose-50";
  }

  return (
    // SAKİN DENİZ: bg-slate-50 (Açık Mavi/Gri) | text-blue-950 (Lacivert)
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">

        <ToolTopNav toolSlug="chads-vasc" />

        {/* BAŞLIK VE GÜNEŞ DETAYI */}
        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">
            <span className="drop-shadow-sm">❤️</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
               <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
               <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic">CHA₂DS₂-VASc</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">{t.altBaslik}</p>
          </div>
        </div>

        {/* PARAMETRELER: BEYAZ KARTLAR & LACİVERT SEÇİMLER */}
        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <div className="grid gap-2">
            {ITEMS.map((it) => (
              <label 
                key={it.key} 
                className={`focus-within:ring-2 focus-within:ring-blue-700 focus-within:ring-offset-2 flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
                  ${state[it.key] ? 'bg-blue-900 border-blue-900 text-white shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all
                    ${state[it.key] ? 'bg-amber-400 border-amber-400 text-blue-900' : 'bg-white border-slate-200 text-transparent'}
                  `}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                  </div>
                  <span className={`text-sm font-bold ${state[it.key] ? 'text-white' : 'text-blue-900/80 group-hover:text-blue-900'}`}>
                    {it.label}
                  </span>
                </div>
                <input type="checkbox" className="sr-only" checked={state[it.key]} onChange={() => toggle(it.key)} />
                <span className={`text-[10px] font-black tracking-widest ${state[it.key] ? 'text-amber-400' : 'text-slate-400'}`}>
                  +{it.pts}{it.pts === 1 ? t.puanTekil : t.puanCogul}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* SKOR VE AKADEMİK YORUM */}
        <SonucDuyuru metin={comment === "—" ? null : comment} />

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 bg-blue-900 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-xl border-t-4 border-amber-400">
            <span className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">{t.toplam}</span>
            <div className="text-5xl font-black text-white">{score}</div>
          </div>
          <div className={`md:col-span-3 rounded-[2rem] p-6 flex flex-col justify-center border-2 border-dashed border-blue-900/10 ${statusBg}`}>
            <span className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest mb-2 block">{t.yonlendirme}</span>
            <p className={`text-base font-black leading-relaxed italic ${statusColor}`}>
              {comment}
            </p>
          </div>
        </div>

        {/* ALT PANEL: PAYLAŞIM VE İSTİHBARAT */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4">
            <ToolShare params={{} as any} />
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {t.uyari}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}