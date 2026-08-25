"use client";
import React from "react";
import ToolShare from "@/app/tools/components/ToolShare";
import ToolTopNav from "@/app/tools/components/ToolTopNav";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

const DOSE_OPTS = [
  { id: "standard", label: "Standart Doz", desc: "250 μg ACTH (cosyntropin) IV/IM", cutoff: 18, note: "Klasik protokol. Primer ve uzun süreli sekonder adrenal yetmezliği saptamada güvenilir." },
  { id: "low", label: "Düşük Doz", desc: "1 μg ACTH IV", cutoff: 18, note: "Yakın zamanlı hipofiz hasarı veya parsiyel adrenal yetmezliği için daha duyarlı. Ancak standartizasyonu güç." },
] as const;

export default function ActhStimPage() {
  const [doseIdx, setDoseIdx]   = React.useState(0);
  const [baseline, setBaseline] = React.useState("");
  const [peak30,   setPeak30]   = React.useState("");
  const [peak60,   setPeak60]   = React.useState("");

  const proto = DOSE_OPTS[doseIdx];
  const b  = parseLocaleNumber(baseline);
  const p30 = parseLocaleNumber(peak30);
  const p60 = parseLocaleNumber(peak60);
  /**
   * MEŞRU SIFIR ELENİYORDU — kardeş araç `gh-test` ile aynı kusur.
   *
   * Kapı `peak === 0` dalını açıkça dışlıyordu. Oysa pik kortizol 0, ACTH'ye
   * HİÇ yanıt olmaması demek: bu testin üretebileceği EN AĞIR bulgu (ağır
   * primer adrenal yetmezlik). Tarayıcıda ölçüldü — pik 14 için "YETERSİZ
   * ADRENAL YANIT" basılırken, bazal 2 + pik 0 olan hastada hiçbir şey
   * basılmıyordu.
   *
   * Bazal değer için de aynısı geçerliydi: `delta` hesabı `b > 0` istiyordu,
   * yani bazali sıfır olan hastada artış farkı hiç gösterilmiyordu.
   *
   * ÇÖP GİRDİDEN AYIRMA: `parseLocaleNumber("abc")` de 0 döndürüyor, yani
   * ayrım DEĞERE bakılarak yapılamaz. `sayiGirildiMi` ham dizeye bakıyor —
   * boş alanı ve "abc"yi eler, yazılmış "0"ı geçirir.
   *
   * `Math.max` da yalnızca GEÇERLİ girilmiş değerler üzerinden alınıyor;
   * aksi hâlde bir alana yazılan çöp 0'a çevrilip ötekiyle yarışıyordu.
   */
  const SINIR = (n: number) => n >= 0 && n <= 200;   // makullük sınırı (μg/dL)
  const p30Girildi = sayiGirildiMi(peak30) && SINIR(p30);
  const p60Girildi = sayiGirildiMi(peak60) && SINIR(p60);
  const bGirildi   = sayiGirildiMi(baseline) && SINIR(b);

  const pikDegerler = [p30Girildi ? p30 : null, p60Girildi ? p60 : null]
    .filter((x): x is number => x !== null);
  const pikGirildi = pikDegerler.length > 0;
  const peak = pikGirildi ? Math.max(...pikDegerler) : 0;

  const hasResult = pikGirildi;
  const adequate  = peak >= proto.cutoff;
  const delta = pikGirildi && bGirildi ? Math.round((peak - b) * 10) / 10 : null;

  const getInterp = () => {
    if (!hasResult) return null;
    if (adequate) return {
      label: "YETERLİ ADRENAL YANIT",
      sub: `Pik kortizol ≥ ${proto.cutoff} μg/dL — Primer adrenal yetmezlik dışlanır`,
      color: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200",
    };
    if (bGirildi && b >= proto.cutoff) return {
      label: "BAZAL YETERLİ — PİK DÜŞÜK",
      sub: "Kronik adrenal yetmezlik dışlanır, ancak akut stres kapasitesi değerlendirilmelidir",
      color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200",
    };
    return {
      label: "YETERSİZ ADRENAL YANIT",
      sub: `Pik kortizol < ${proto.cutoff} μg/dL — Adrenal yetmezlik ile uyumlu`,
      color: "text-rose-700", bg: "bg-rose-50", border: "border-rose-200",
    };
  };
  const interp = getInterp();

  /**
   * SESSİZ BOŞLUK YERİNE SEBEP. Pik alanları çöp ya da aralık dışıysa yorum
   * kartı hiç çizilmiyordu ve kullanıcı neyin beklendiğini göremiyordu.
   *
   * Ölçüt "kullanıcı bir şey girmiş mi": bomboş formda susuluyor. Pik
   * ZORUNLU (30. ya da 60. dakikadan en az biri), bazal opsiyonel — bazal
   * yoksa yalnızca Δ hesaplanamıyor, yorum yine çıkıyor.
   */
  const girdiVar = [baseline, peak30, peak60].some((x) => x.trim() !== "");
  const pikYazildi = [peak30, peak60].some((x) => x.trim() !== "");
  const bazalBozuk = baseline.trim() !== "" && !bGirildi;
  const params = { dose: doseIdx, b, p30, p60 };

  return (
    <div className="min-h-screen bg-slate-50 text-blue-950 py-8 px-4 font-sans">
      <div className="max-w-3xl mx-auto space-y-6">
        <ToolTopNav toolSlug="acth-stim" />

        <div className="flex items-center gap-4 border-b-2 border-blue-900/10 pb-6">
          <div aria-hidden="true" className="w-14 h-14 bg-white shadow-sm border border-slate-200 rounded-2xl flex items-center justify-center text-3xl">🦋</div>
          <div>
            <div className="flex items-center gap-2">
              <span aria-hidden="true" className="text-amber-500 text-xs">☀️</span>
              <h1 className="text-2xl font-black tracking-tight text-blue-900 uppercase italic leading-none">ACTH Stimülasyon Testi</h1>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-1">Adrenal Yetmezlik — Kortizol Yanıt Yorumlama</p>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protokol</p>
          {DOSE_OPTS.map((d, i) => (
            <button aria-pressed={doseIdx === i} key={d.id} type="button" onClick={() => setDoseIdx(i)}
              className={`w-full text-left p-4 rounded-2xl border transition-all
                ${doseIdx === i ? 'bg-blue-900 border-blue-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-blue-900/30'}`}>
              <div className={`text-sm font-bold ${doseIdx === i ? 'text-white' : 'text-blue-950'}`}>{d.label}</div>
              <div className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${doseIdx === i ? 'text-blue-200' : 'text-slate-400'}`}>{d.desc}</div>
            </button>
          ))}
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Serum Kortizol Değerleri (μg/dL)</p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "Bazal (0. dk)", val: baseline, set: setBaseline, ph: "ör. 8" },
              { label: "30. Dakika", val: peak30, set: setPeak30, ph: "ör. 22" },
              { label: "60. Dakika", val: peak60, set: setPeak60, ph: "ör. 24" },
            ].map(({ label, val, set, ph }) => (
              <label key={label} className="flex flex-col gap-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">{label}</span>
                <input type="text" inputMode="decimal" value={val} onChange={e => set(e.target.value)} placeholder={ph}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg transition-all" />
              </label>
            ))}
          </div>
          {pikGirildi && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-blue-900 rounded-2xl p-4 text-center">
                <div className="text-[9px] font-black text-blue-200 uppercase tracking-widest mb-1">PİK KORTİZOL</div>
                <div className="text-3xl font-black text-white">{peak}</div>
                <div className="text-[9px] font-bold text-amber-400">μg/dL</div>
              </div>
              <div className="bg-slate-100 rounded-2xl p-4 text-center">
                <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">DELTA (Δ)</div>
                <div className="text-3xl font-black text-blue-900">{delta ?? "–"}</div>
                <div className="text-[9px] font-bold text-slate-400">μg/dL artış</div>
              </div>
            </div>
          )}
        </div>

        {girdiVar && !interp && (
          <div role="alert" className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Yorumlanamıyor</p>
            <p className="text-[11px] font-bold text-slate-600">
              {pikYazildi
                ? "Pik kortizol alanı makul bir değer bekliyor: 0–200 μg/dL. Sıfır geçerlidir — ACTH'ye hiç yanıt olmaması gerçek bir bulgudur."
                : "30. ya da 60. dakika kortizol değerinden en az biri gerekli (0–200 μg/dL)."}
            </p>
          </div>
        )}
        {girdiVar && interp && bazalBozuk && (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="text-[11px] font-bold text-slate-600">
              Bazal kortizol makul aralığın dışında (0–200 μg/dL); yorum pik değerden
              yapıldı ama artış farkı (Δ) hesaplanamadı.
            </p>
          </div>
        )}

        {interp && (
          <div className={`p-6 rounded-[2rem] border-2 border-dashed ${interp.border} ${interp.bg}`}>
            <div className="text-[10px] font-black text-blue-900/80 uppercase tracking-widest mb-2">YORUM — Eşik {proto.cutoff} μg/dL</div>
            <p className={`text-xl font-black italic tracking-tight ${interp.color}`}>{interp.label}</p>
            <p className={`text-sm font-bold mt-1 ${interp.color}`}>{interp.sub}</p>
          </div>
        )}

        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-center border-b border-slate-100 pb-4"><ToolShare params={params} /></div>
          <div className="flex items-start gap-3">
            <span className="text-amber-500 text-lg" aria-hidden="true">⚠️</span>
            <p className="text-[11px] text-slate-700 leading-relaxed">
              {proto.note} Sabah (08:00–10:00) yapılması önerilir. Pik kortizol ≥18–20 μg/dL yeterli yanıtı gösterir. Bazı kılavuzlar 18, bazıları 20 μg/dL eşiğini kullanır.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
