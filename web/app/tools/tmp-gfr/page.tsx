"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Fosfat renal eşiği — TmP/GFR (Walton & Bijvoet 1975; Kenny & Glen 1973 formülü).
 *
 *   FEPO₄ (%) = (idrar P × serum Cr) / (serum P × idrar Cr) × 100
 *   TRP = 1 − FEPO₄/100
 *   TmP/GFR = TRP × serum P                              TRP ≤ 0,86 ise
 *   TmP/GFR = 0,3 × TRP / (1 − 0,8 × TRP) × serum P      TRP > 0,86 ise
 * Birim serum P ile aynı (mg/dL). Erişkin referansı ~2,5–4,2 mg/dL (0,80–1,35 mmol/L).
 *
 * Hipofosfatemide renal kayıp ayrımı: TmP/GFR düşük (ya da FEPO₄ > %5) → renal fosfat kaybı
 * (FGF23 fazlalığı, hiperparatiroidi, Fanconi); normal/yüksek → dağılım ya da GİS kaybı.
 * Normofosfatemide "renal kayıp" yorumu yapılmıyor.
 */
const P_ALT = 0.2, P_UST = 20;
const CR_ALT = 0.1, CR_UST = 30;
const U_UST = 1000;
const REF_ALT = 2.5, REF_UST = 4.2;
const HIPOFOSFATEMI = 2.5;

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function TmpGfrPage() {
  const [sp, setSp] = React.useState("");
  const [scr, setScr] = React.useState("");
  const [up, setUp] = React.useState("");
  const [ucr, setUcr] = React.useState("");

  const n = (s: string) => parseLocaleNumber(s);
  const spOk = sayiGirildiMi(sp) && n(sp) >= P_ALT && n(sp) <= P_UST;
  const scrOk = sayiGirildiMi(scr) && n(scr) >= CR_ALT && n(scr) <= CR_UST;
  const upOk = sayiGirildiMi(up) && n(up) >= 0 && n(up) <= U_UST;
  const ucrOk = sayiGirildiMi(ucr) && n(ucr) > 0 && n(ucr) <= U_UST;
  const eksik = [
    !spOk && `serum fosfat (${String(P_ALT).replace(".", ",")}–${P_UST} mg/dL)`,
    !scrOk && "serum kreatinin (mg/dL)",
    !upOk && "idrar fosfat (mg/dL)",
    !ucrOk && "idrar kreatinin (mg/dL)",
  ].filter(Boolean) as string[];

  let fe: number | null = null, trp: number | null = null, tmp: number | null = null;
  let gecersiz = false;
  if (eksik.length === 0) {
    fe = ((n(up) * n(scr)) / (n(sp) * n(ucr))) * 100;
    trp = 1 - fe / 100;
    if (trp < 0) gecersiz = true;
    else tmp = trp <= 0.86 ? trp * n(sp) : ((0.3 * trp) / (1 - 0.8 * trp)) * n(sp);
  }
  const tmpY = tmp !== null ? Math.round(tmp * 100) / 100 : null;
  const feY = fe !== null ? Math.round(fe * 10) / 10 : null;
  const hipo = spOk && n(sp) < HIPOFOSFATEMI;

  let yorum = "";
  let ton = "border-slate-200 bg-white text-slate-800";
  if (tmpY !== null) {
    if (tmpY < REF_ALT) {
      yorum = hipo
        ? "Düşük TmP/GFR + hipofosfatemi → renal fosfat kaybı (FGF23 fazlalığı: TIO, XLH; primer hiperparatiroidi; Fanconi sendromu; ilaçlar — ör. ferrik karboksimaltoz, tenofovir)."
        : "TmP/GFR referansın altında — serum fosfatı normal olduğu için renal kayıp yorumu dikkatle yapılmalı.";
      ton = "border-rose-200 bg-rose-50 text-rose-900";
    } else if (tmpY > REF_UST) {
      yorum = "TmP/GFR referansın üstünde — hipoparatiroidi, akromegali, tümöral kalsinoz (FGF23 eksikliği) ya da böbrek yetmezliği düşünülebilir.";
      ton = "border-amber-200 bg-amber-50 text-amber-900";
    } else {
      yorum = hipo
        ? "TmP/GFR normal + hipofosfatemi → renal kayıp değil: hücre içine kayma (refeeding, respiratuvar alkaloz, insülin), azalmış emilim ya da GİS kaybı."
        : "TmP/GFR referans aralığında.";
      ton = "border-emerald-200 bg-emerald-50 text-emerald-900";
    }
  }
  const tr = (x: number) => String(x).replace(".", ",");

  return (
    <OlcekKabugu
      slug="tmp-gfr"
      ikon="🦴"
      baslik="TmP/GFR ve FEPO₄"
      altBaslik="Fosfatın Renal Eşiği · Hipofosfatemide Renal Kayıp Ayrımı"
      paylasim={{ tmp: tmpY, fe: feY }}
      not={
        <p>
          Açlıkta alınan ikinci sabah idrarı ve eş zamanlı serum örneğiyle hesaplanır. Referans aralık yaşa göre değişir (çocuklarda daha yüksektir); burada
          erişkin aralığı kullanıldı. Kreatinin ve fosfat aynı birimde (mg/dL) girilmelidir. Fosfat mmol/L ise 3,1 ile çarparak mg/dL'ye çevirin. Walton RJ, Bijvoet OL, Lancet 1975.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {([
          ["Serum fosfat (mg/dL)", sp, setSp],
          ["Serum kreatinin (mg/dL)", scr, setScr],
          ["İdrar fosfat (mg/dL)", up, setUp],
          ["İdrar kreatinin (mg/dL)", ucr, setUcr],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>

      {gecersiz && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          FEPO₄ %100'ün üstünde çıktı ({feY !== null ? tr(feY) : "—"}) — fizyolojik olarak olanaksız; birimleri ve örnek eşleşmesini kontrol edin.
        </div>
      )}
      <SonucDuyuru metin={tmpY !== null ? `TmP/GFR ${tr(tmpY)} mg/dL · FEPO₄ %${tr(feY!)}` : null} />
      {tmpY !== null && feY !== null && trp !== null ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-3 ${ton}`}>
          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">TmP/GFR</p>
              <p className="text-4xl font-black">{tr(tmpY)} <span className="text-lg">mg/dL</span></p>
              <p className="text-[11px] font-bold">referans {tr(REF_ALT)}–{tr(REF_UST)}</p>
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest">FEPO₄</p>
              <p className="text-4xl font-black">%{tr(feY)}</p>
              <p className="text-[11px] font-bold">TRP {tr(Math.round(trp * 1000) / 1000)}{trp > 0.86 ? " (> 0,86 düzeltmesi uygulandı)" : ""}</p>
            </div>
          </div>
          <p className="text-[13px] font-black">{yorum}</p>
        </div>
      ) : !gecersiz ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      ) : null}
    </OlcekKabugu>
  );
}
