"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * 5 kez otur-kalk testi (5STS) — kollar göğüste, sandalyeden 5 kez en hızlı kalkış süresi.
 *   Yaşa göre üst sınır (bu sürenin üstü ortalamanın altında): 60–69 → 11,4 sn · 70–79 → 12,6 sn · 80–89 → 14,8 sn
 *     (Bohannon RW, Percept Mot Skills 2006;103:215–222, özet)
 *   KOAH'ta MCID 1,7 sn (Jones SE ve ark., Thorax 2013;68:1015–1020, özet)
 *   > 15 sn: düşük kas gücü (EWGSOP2, Cruz-Jentoft AJ ve ark., Age Ageing 2019)
 * Eşikle HAM değer karşılaştırılıyor.
 */
const YAS: Secenek[] = [
  { label: "60–69", pts: 0 },
  { label: "70–79", pts: 0 },
  { label: "80–89", pts: 0 },
  { label: "Diğer / belirtme", pts: 0 },
];
const NORM = [11.4, 12.6, 14.8] as const;
const MCID = 1.7;
const EWGSOP2 = 15;
const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0 w-full";
const v1 = (x: number) => x.toFixed(1).replace(".", ",");

export default function OturKalk5Page() {
  const [sure, setSure] = React.useState("");
  const [onceki, setOnceki] = React.useState("");
  const [yas, setYas] = React.useState<number | null>(null);
  const n = parseLocaleNumber;
  const sGir = sayiGirildiMi(sure);
  const sOk = sGir && n(sure) >= 3 && n(sure) <= 120;
  const oGir = sayiGirildiMi(onceki);
  const oOk = oGir && n(onceki) >= 3 && n(onceki) <= 120;
  const hatali = [sGir && !sOk && "test süresi 3–120 sn olmalı", oGir && !oOk && "önceki süre 3–120 sn olmalı"].filter(Boolean) as string[];

  const t = sOk ? n(sure) : null;
  const norm = yas !== null && yas < 3 ? NORM[yas] : null;
  const yavas = t !== null && norm !== null ? t > norm : null;
  const dusukGuc = t !== null ? t > EWGSOP2 : null;
  const fark = t !== null && oOk ? n(onceki) - t : null; // pozitif = hızlanma

  const ozet =
    t === null
      ? null
      : [
          norm !== null ? (yavas ? `yaş ortalamasının altında (> ${v1(norm)} sn)` : `yaşına göre beklenen sınırda (≤ ${v1(norm)} sn)`) : null,
          dusukGuc ? "EWGSOP2'ye göre düşük kas gücü (> 15 sn)" : null,
          fark !== null ? (Math.abs(fark) >= MCID ? (fark > 0 ? `anlamlı iyileşme (${v1(fark)} sn hızlanma)` : `anlamlı kötüleşme (${v1(-fark)} sn yavaşlama)`) : "önceki ölçüme göre değişim MCID'nin (1,7 sn) altında") : null,
        ].filter(Boolean).join(" · ");

  return (
    <OlcekKabugu
      slug="otur-kalk-5"
      ikon="🪑"
      baslik="5 Kez Otur-Kalk Testi"
      altBaslik="5STS · Alt Ekstremite Fonksiyonu · KOAH ve Yaşlıda"
      paylasim={{ sure: t }}
      not={
        <p>
          Kolçaksız, standart yükseklikte (~43–46 cm) sandalye; kollar göğüste çapraz, her kalkışta tam ayağa kalkılır, son oturuşta süre durdurulur.
          KOAH'ta güvenilir ve rehabilitasyona duyarlıdır (MCID 1,7 sn). Bohannon RW, Percept Mot Skills 2006;103:215–222; Jones SE ve ark., Thorax
          2013;68:1015–1020; Cruz-Jentoft AJ ve ark., Age Ageing 2019;48:16–31.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {([
          ["Test süresi (sn)", sure, setSure],
          ["Önceki ölçüm (sn) — isteğe bağlı", onceki, setOnceki],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2 min-w-0">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>
      <SecimMaddesi id="yas" baslik="Yaş grubu (referans değer için)" secenekler={YAS} secili={yas} onSec={setYas} rozetGizle />

      {hatali.length > 0 && (
        <p role="alert" className="text-[12px] font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">{hatali.join(" · ")}</p>
      )}

      <SonucDuyuru metin={t !== null && ozet ? `5STS ${v1(t)} sn — ${ozet}` : t !== null ? `5STS ${v1(t)} sn` : null} />
      {t !== null ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${yavas || dusukGuc ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">5 kez otur-kalk süresi</p>
          <p className="text-4xl font-black">{v1(t)} sn</p>
          {ozet ? <p className="text-[13px] font-bold">{ozet}</p> : <p className="text-[12px] font-bold">Referans karşılaştırması için yaş grubunu seçin.</p>}
        </div>
      ) : (
        !sGir && (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: test süresi</p>
          </div>
        )
      )}
    </OlcekKabugu>
  );
}
