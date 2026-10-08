"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Sürücü basınç (ΔP) ve plato basıncı — mekanik ventilasyonda akciğer koruyucu hedefler.
 *   ΔP = P_plato − PEEP        (Amato MB ve ark., N Engl J Med 2015;372:747–755) — hedef ≤ 15 cmH₂O
 *   C_RS = V_t / ΔP            (mL/cmH₂O)
 *   P_plato hedefi ≤ 28–30 cmH₂O; > 35 cmH₂O en yüksek barotravma riski
 *   Oto-PEEP ölçüldüyse dış PEEP üst sınırı = 0,8 × oto-PEEP (KOAH'ta tetikleme yükünü azaltmak için)
 * Eşikle HAM değer karşılaştırılıyor.
 */
const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0 w-full";
const v1 = (x: number) => (Number.isInteger(x) ? String(x) : x.toFixed(1).replace(".", ","));

export default function SurucuBasincPage() {
  const [plato, setPlato] = React.useState("");
  const [peep, setPeep] = React.useState("");
  const [vt, setVt] = React.useState("");
  const [oto, setOto] = React.useState("");
  const n = parseLocaleNumber;
  const plOk = sayiGirildiMi(plato) && n(plato) >= 5 && n(plato) <= 60;
  const peOk = sayiGirildiMi(peep) && n(peep) >= 0 && n(peep) <= 25;
  const vtVar = sayiGirildiMi(vt);
  const vtOk = vtVar && n(vt) >= 100 && n(vt) <= 1500;
  const otoVar = sayiGirildiMi(oto);
  const otoOk = otoVar && n(oto) >= 0 && n(oto) <= 30;
  const eksik = [!plOk && "plato basıncı (5–60 cmH₂O)", !peOk && "PEEP (0–25 cmH₂O)"].filter(Boolean) as string[];
  const hatali = [vtVar && !vtOk && "tidal hacim 100–1500 mL olmalı", otoVar && !otoOk && "oto-PEEP 0–30 cmH₂O olmalı"].filter(Boolean) as string[];

  const dp = eksik.length === 0 ? n(plato) - n(peep) : null;
  const gecersiz = dp !== null && dp <= 0;
  const crs = dp !== null && !gecersiz && vtOk ? n(vt) / dp : null;
  const plDurum = !plOk ? null : n(plato) > 35 ? "rose" : n(plato) > 30 ? "amber" : "emerald";
  const dpYuksek = dp !== null && dp > 15;

  return (
    <OlcekKabugu
      slug="surucu-basinc"
      ikon="⚙️"
      baslik="Sürücü Basınç"
      altBaslik="Mekanik Ventilasyon · ΔP · Plato · Kompliyans · Oto-PEEP"
      paylasim={{ dp: dp !== null && !gecersiz ? dp : null }}
      not={
        <p>
          Plato basıncı inspiratuar duraklatmayla (≥ 0,5 sn), hasta pasifken ölçülür; spontan solunum çabası değeri düşük gösterir. Oto-PEEP varsa ΔP'yi
          toplam PEEP (dış PEEP + oto-PEEP) ile hesaplamak gerçek alveoler gerilimi daha iyi yansıtır. ΔP ile mortalite ilişkisi ARDS'de gösterildi; KOAH'ta
          hedefler akciğer koruyucu ventilasyon ilkelerinden uyarlanır. Amato MB ve ark., N Engl J Med 2015;372:747–755.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {([
          ["Plato basıncı (cmH₂O)", plato, setPlato],
          ["PEEP (cmH₂O)", peep, setPeep],
          ["Tidal hacim (mL) — isteğe bağlı", vt, setVt],
          ["Ölçülen oto-PEEP (cmH₂O) — isteğe bağlı", oto, setOto],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2 min-w-0">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>

      {hatali.length > 0 && (
        <p role="alert" className="text-[12px] font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          {hatali.join(" · ")}
        </p>
      )}

      <SonucDuyuru metin={dp !== null && !gecersiz ? `Sürücü basınç ${v1(dp)} cmH₂O — ${dpYuksek ? "15 cmH₂O üstünde" : "hedefte"}` : null} />
      {dp !== null && gecersiz ? (
        <p role="alert" className="text-[12px] font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          Plato basıncı PEEP'ten yüksek olmalı — değerleri kontrol edin.
        </p>
      ) : dp !== null ? (
        <div className="space-y-3">
          <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${dpYuksek ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
            <p className="text-[10px] font-black uppercase tracking-widest">Sürücü basınç (ΔP = P_plato − PEEP)</p>
            <p className="text-4xl font-black">{v1(dp)} cmH₂O</p>
            <p className="text-[13px] font-bold">{dpYuksek ? "Hedefin (≤ 15 cmH₂O) üstünde — tidal hacmi azaltmayı değerlendirin." : "Hedefte (≤ 15 cmH₂O)."}</p>
            {crs !== null && <p className="text-[12px] font-bold">Statik kompliyans: {v1(crs)} mL/cmH₂O</p>}
          </div>
          {plDurum && (
            <div
              className={`p-4 rounded-2xl border text-[12px] font-bold ${
                plDurum === "rose" ? "border-rose-200 bg-rose-50 text-rose-900" : plDurum === "amber" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"
              }`}
            >
              Plato {v1(n(plato))} cmH₂O —{" "}
              {plDurum === "rose" ? "35 cmH₂O üstü: en yüksek barotravma riski." : plDurum === "amber" ? "hedefin (≤ 28–30 cmH₂O) üstünde." : "hedefte (≤ 28–30 cmH₂O)."}
            </div>
          )}
          {otoOk && (
            <div className="p-4 rounded-2xl border border-blue-200 bg-blue-50 text-blue-950 text-[12px] font-bold">
              Oto-PEEP {v1(n(oto))} cmH₂O → dış PEEP üst sınırı ≈ {v1(0.8 * n(oto))} cmH₂O (oto-PEEP'in %80'i)
              {n(peep) > 0.8 * n(oto) ? " — mevcut PEEP bu sınırın üstünde." : "."}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
