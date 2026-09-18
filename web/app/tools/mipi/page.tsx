"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import BinlikUyari from "@/app/tools/components/BinlikUyari";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * MIPI — mantle hücreli lenfoma uluslararası prognostik indeksi (Hoster ve ark., Blood 2008).
 *
 *   Formül:  0,03535 × yaş + 0,6978 × (ECOG > 1) + 1,367 × log10(LDH / üst sınır) + 0,9393 × log10(lökosit, /µL)
 *            düşük < 5,7 · orta 5,7 – < 6,2 · yüksek ≥ 6,2
 *   Basitleştirilmiş (s-MIPI): yaş · ECOG · LDH oranı · lökosit (× 10⁹/L) puanları, 0–11
 *            düşük 0–3 · orta 4–5 · yüksek 6–11
 *
 * Lökosit formülde /µL (= 10⁶/L) biriminde; kullanıcı × 10⁹/L giriyor, araç 1000 ile çarpıyor.
 * Formüldeki birim karışıklığı tüm skoru aşağı iter (log10(7) ile log10(7000) arasında 3 birim) — bu yüzden
 * dönüşüm tek yerde, sabitle yapılıyor.
 */
const ECOG: Secenek[] = [{ label: "ECOG 0–1", pts: 0 }, { label: "ECOG 2–4", pts: 0 }];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

function sPuan(yas: number, ecog: boolean, ldhOran: number, wbc: number) {
  const y = yas < 50 ? 0 : yas < 60 ? 1 : yas < 70 ? 2 : 3;
  const e = ecog ? 2 : 0;
  const l = ldhOran < 0.67 ? 0 : ldhOran < 1 ? 1 : ldhOran < 1.5 ? 2 : 3;
  const w = wbc < 6.7 ? 0 : wbc < 10 ? 1 : wbc < 15 ? 2 : 3;
  return { y, e, l, w, toplam: y + e + l + w };
}

export default function MipiPage() {
  const [yas, setYas] = React.useState("");
  const [ldh, setLdh] = React.useState("");
  const [uln, setUln] = React.useState("");
  const [wbc, setWbc] = React.useState("");
  const [ecog, setEcog] = React.useState<number | null>(null);

  const n = (s: string) => parseLocaleNumber(s);
  const yasOk = sayiGirildiMi(yas) && n(yas) >= 18 && n(yas) <= 110;
  const ldhOk = sayiGirildiMi(ldh) && n(ldh) > 0 && n(ldh) <= 20000;
  const ulnOk = sayiGirildiMi(uln) && n(uln) >= 100 && n(uln) <= 1000;
  const wbcOk = sayiGirildiMi(wbc) && n(wbc) > 0 && n(wbc) <= 1000;
  const eksik = [
    !yasOk && "yaş (18–110)",
    !ldhOk && "LDH (U/L)",
    !ulnOk && "LDH üst sınırı (100–1000 U/L)",
    !wbcOk && "lökosit (× 10⁹/L)",
    ecog === null && "ECOG",
  ].filter(Boolean) as string[];
  const hazir = eksik.length === 0;

  const oran = hazir ? n(ldh) / n(uln) : null;
  const mipi = hazir ? Math.round((0.03535 * n(yas) + 0.6978 * (ecog === 1 ? 1 : 0) + 1.367 * Math.log10(oran!) + 0.9393 * Math.log10(n(wbc) * 1000)) * 100) / 100 : null;
  const s = hazir ? sPuan(n(yas), ecog === 1, oran!, n(wbc)) : null;

  const grup = (v: number, a: number, b: number) => (v < a ? "Düşük risk" : v < b ? "Orta risk" : "Yüksek risk");
  const mipiGrup = mipi !== null ? grup(mipi, 5.7, 6.2) : null;
  const sGrup = s ? (s.toplam <= 3 ? "Düşük risk" : s.toplam <= 5 ? "Orta risk" : "Yüksek risk") : null;
  const RENK: Record<string, string> = { "Düşük risk": "text-emerald-800", "Orta risk": "text-amber-800", "Yüksek risk": "text-rose-800" };
  const tr = (x: number, h = 2) => x.toFixed(h).replace(".", ",");

  return (
    <OlcekKabugu
      slug="mipi"
      ikon="🔬"
      baslik="MIPI"
      altBaslik="Mantle Hücreli Lenfoma Prognostik İndeksi · Formül ve Basitleştirilmiş"
      paylasim={{ mipi, smipi: s?.toplam ?? null }}
      not={
        <p>
          Tanı anındaki değerlerle, ileri evre mantle hücreli lenfomada hesaplanır. Ki-67 ≥ %30 eklenerek MIPI-c elde edilir; TP53 mutasyonu/delesyonu ve
          blastoid morfoloji skordan bağımsız olarak kötü prognoz belirtir. Özgün kohortta medyan sağkalım düşük riskte ulaşılmadı, orta riskte ~51 ay,
          yüksek riskte ~29 ay idi. Hoster E ve ark., Blood 2008.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {([
          ["Yaş (yıl)", yas, setYas],
          ["Lökosit (× 10⁹/L)", wbc, setWbc],
          ["LDH (U/L)", ldh, setLdh],
          ["LDH üst sınırı (U/L)", uln, setUln],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>
      <BinlikUyari girdiler={[{ ad: "LDH", ham: ldh }]} />
      <SecimMaddesi id="ecog" baslik="Performans durumu" secenekler={ECOG} secili={ecog} onSec={setEcog} rozetGizle />

      <SonucDuyuru metin={mipi !== null && mipiGrup ? `MIPI ${tr(mipi)} — ${mipiGrup}` : null} />
      {mipi !== null && s && mipiGrup && sGrup ? (
        <div className="p-6 rounded-[2rem] border-2 border-dashed border-slate-200 bg-white space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-2xl border-2 border-blue-900 bg-blue-50 p-4">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">MIPI (formül)</p>
              <p className="text-3xl font-black text-blue-900">{tr(mipi)}</p>
              <p className={`text-[14px] font-black ${RENK[mipiGrup]}`}>{mipiGrup}</p>
              <p className="text-[11px] text-slate-600">düşük &lt; 5,7 · orta 5,7–6,19 · yüksek ≥ 6,2</p>
            </div>
            <div className="rounded-2xl border-2 border-slate-200 bg-white p-4">
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">s-MIPI (puan)</p>
              <p className="text-3xl font-black text-blue-900">{s.toplam}</p>
              <p className={`text-[14px] font-black ${RENK[sGrup]}`}>{sGrup}</p>
              <p className="text-[11px] text-slate-600">yaş {s.y} · ECOG {s.e} · LDH {s.l} · lökosit {s.w}</p>
            </div>
          </div>
          {mipiGrup !== sGrup && <p className="text-[12px] font-bold text-amber-900">Formül ve basitleştirilmiş skor farklı grup veriyor — sınırdaki hastada formül değeri esas alınır.</p>}
          <p className="text-[12px] font-bold text-slate-700">LDH / üst sınır = {tr(oran!)}</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
