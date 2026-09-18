"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { kumeDegistir } from "@/app/tools/components/PuanliKriterler";

/**
 * Graves orbitopatisi Klinik Aktivite Skoru (CAS) — Mourits ve ark., Br J Ophthalmol 1989; EUGOGO.
 *
 * İlk değerlendirmede 7 madde, ≥ 3/7 aktif. İzlemde (1–3 ay önceki muayeneyle karşılaştırılarak) 3 madde
 * daha eklenir ve ölçek 10 üzerinden, ≥ 4/10 aktif. Kip seçilmeden izlem maddeleri gösterilmiyor —
 * ilk muayenede "değişim" sorusu anlamsız.
 */
const ILK = [
  { id: "retroAgri", metin: "Spontan retrobulber ağrı" },
  { id: "hareketAgri", metin: "Göz hareketiyle ağrı" },
  { id: "kapakKizarik", metin: "Göz kapağında kızarıklık" },
  { id: "konjKizarik", metin: "Konjonktivada kızarıklık" },
  { id: "kapakSislik", metin: "Göz kapağında şişlik" },
  { id: "kemozis", metin: "Kemozis (konjonktiva ödemi)" },
  { id: "karunkul", metin: "Karünkül ya da plika şişliği" },
] as const;
const IZLEM = [
  { id: "proptozArtis", metin: "Proptozda ≥ 2 mm artış" },
  { id: "hareketAzalma", metin: "Herhangi bir yönde göz hareketinde ≥ 8° azalma" },
  { id: "gormeAzalma", metin: "Görme keskinliğinde ≥ 1 sıra azalma (Snellen)" },
] as const;

const KIP: Secenek[] = [{ label: "İlk değerlendirme (7 madde)", pts: 0 }, { label: "İzlem — 1–3 ay önceki muayeneyle (10 madde)", pts: 0 }];

export default function GravesCasPage() {
  const [kip, setKip] = React.useState<number | null>(null);
  const [secili, setSecili] = React.useState<ReadonlySet<string>>(new Set());
  const izlem = kip === 1;
  const maddeler = izlem ? [...ILK, ...IZLEM] : [...ILK];
  const skor = kip === null ? null : maddeler.filter((m) => secili.has(m.id)).length;
  const payda = izlem ? 10 : 7;
  const esik = izlem ? 4 : 3;
  const aktif = skor !== null && skor >= esik;

  const liste = (baslik: string, ms: ReadonlyArray<{ id: string; metin: string }>) => (
    <fieldset className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <legend className="px-2 text-[12px] font-black text-blue-900">{baslik}</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {ms.map((m) => (
          <label
            key={m.id}
            className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl border-2 cursor-pointer transition-all
              ${secili.has(m.id) ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}
          >
            <input type="checkbox" checked={secili.has(m.id)} onChange={() => setSecili((s) => kumeDegistir(s, m.id))} className="w-4 h-4 accent-blue-900 shrink-0" />
            <span className="text-[12px] font-bold text-blue-950 leading-snug">{m.metin}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <OlcekKabugu
      slug="graves-cas"
      ikon="👁️"
      baslik="Graves Orbitopatisi CAS"
      altBaslik="Klinik Aktivite Skoru · İlk ≥ 3/7 · İzlem ≥ 4/10"
      paylasim={{ cas: skor, kip }}
      not={
        <p>
          CAS inflamatuvar aktiviteyi ölçer, şiddeti değil — şiddet (hafif / orta-ağır / görmeyi tehdit eden) EUGOGO sınıflamasıyla ayrıca değerlendirilir.
          Aktif ve orta-ağır orbitopatide intravenöz glukokortikoid gibi immünsüpresif tedavi düşünülür; optik nöropati bulgusu acil göz konsültasyonu
          gerektirir. Sigara bırakma ve ötiroidinin korunması her evrede önerilir. Bartalena L ve ark. (EUGOGO), Eur J Endocrinol 2021.
        </p>
      }
    >
      <SecimMaddesi id="kip" baslik="Değerlendirme türü" secenekler={KIP} secili={kip} onSec={setKip} rozetGizle />
      {kip !== null && liste("İnflamasyon bulguları — her biri 1 puan", ILK)}
      {izlem && liste("İzlem maddeleri — önceki muayeneye göre değişim", IZLEM)}

      <SonucDuyuru metin={skor === null ? null : `CAS ${skor}/${payda} — ${aktif ? "aktif" : "inaktif"} orbitopati`} />
      {skor !== null ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${aktif ? "border-rose-200 bg-rose-50 text-rose-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
          <p className="text-4xl font-black">{skor} <span className="text-lg">/ {payda}</span></p>
          <p className="text-xl font-black">{aktif ? "Aktif orbitopati" : "İnaktif orbitopati"}</p>
          <p className="text-[12px] font-bold">Eşik ≥ {esik}/{payda} ({izlem ? "izlem" : "ilk değerlendirme"}).</p>
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Önce değerlendirme türünü seçin</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
