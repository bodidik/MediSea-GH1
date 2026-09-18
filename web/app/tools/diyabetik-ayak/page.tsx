"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { kumeDegistir } from "@/app/tools/components/PuanliKriterler";

/**
 * IWGDF/IDSA diyabetik ayak enfeksiyonu sınıflaması (Senneville ve ark., 2023).
 *   1 Enfeksiyon yok: aşağıdaki lokal bulgulardan < 2
 *   2 Hafif: ≥ 2 lokal bulgu; yalnızca deri ve deri altı; eritem yara kenarından > 0,5 ve ≤ 2 cm
 *   3 Orta: eritem > 2 cm YA DA deri altından derin doku tutulumu (apse, osteomiyelit, septik artrit, fasiit); SIRS yok
 *   4 Ağır: yukarıdakilerden biri + ≥ 2 SIRS bulgusu
 *   (O): osteomiyelit varsa sınıfa eklenir (3(O) ya da 4(O)); osteomiyelit tek başına en az 3(O) yapar.
 *
 * Lokal bulguların başka bir inflamatuvar nedenle (travma, gut, Charcot, kırık, tromboz, venöz staz) açıklanmaması gerekir.
 */
const LOKAL = [
  { id: "sislik", metin: "Lokal şişlik ya da endürasyon" },
  { id: "eritem", metin: "Yara çevresinde > 0,5 cm eritem" },
  { id: "hassasiyet", metin: "Lokal hassasiyet ya da ağrı" },
  { id: "sicaklik", metin: "Lokal ısı artışı" },
  { id: "pu", metin: "Pürülan akıntı" },
] as const;
const SIRS = [
  { id: "ates", metin: "Ateş > 38 °C ya da < 36 °C" },
  { id: "nabiz", metin: "Nabız > 90/dk" },
  { id: "solunum", metin: "Solunum > 20/dk ya da PaCO₂ < 32 mmHg" },
  { id: "lokosit", metin: "Lökosit > 12 000 ya da < 4 000/mm³ ya da > %10 çomak" },
] as const;

const YAYGINLIK: Secenek[] = [
  { label: "Yalnızca deri ve deri altı, eritem ≤ 2 cm", pts: 0 },
  { label: "Eritem > 2 cm ya da deri altından derin doku tutulumu (apse, fasiit, septik artrit, tendon)", pts: 0 },
];
const OSTEOMIYELIT: Secenek[] = [{ label: "Yok / dışlandı", pts: 0 }, { label: "Var (görüntüleme, kemik biyopsisi ya da probe-to-bone ile)", pts: 0 }];

export default function DiyabetikAyakPage() {
  const [lokal, setLokal] = React.useState<ReadonlySet<string>>(new Set());
  const [sirs, setSirs] = React.useState<ReadonlySet<string>>(new Set());
  const [yaygin, setYaygin] = React.useState<number | null>(null);
  const [osteo, setOsteo] = React.useState<number | null>(null);

  const lokalSayi = lokal.size;
  const sirsSayi = sirs.size;
  const enfekte = lokalSayi >= 2;
  const osteoVar = osteo === 1;
  const hazir = osteo !== null && (enfekte || osteoVar ? yaygin !== null || osteoVar : true);

  let sinif: number | null = null;
  if (hazir) {
    if (!enfekte && !osteoVar) sinif = 1;
    else if (sirsSayi >= 2) sinif = 4;
    else if (yaygin === 1 || osteoVar) sinif = 3;
    else sinif = 2;
  }
  const ad = sinif === null ? null : `${sinif}${osteoVar && sinif >= 3 ? "(O)" : ""}`;
  const TANIM: Record<number, { t: string; a: string; r: string }> = {
    1: { t: "Enfeksiyon yok", a: "Antibiyotik gerekmez — yara bakımı, basıyı kaldırma, dolaşım değerlendirmesi.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" },
    2: { t: "Hafif enfeksiyon", a: "Genellikle ayaktan oral antibiyotik (gram pozitif kokları kapsayan), 1–2 hafta.", r: "border-amber-200 bg-amber-50 text-amber-900" },
    3: { t: "Orta enfeksiyon", a: "Derin doku tutulumu — çoğu hastada yatış, cerrahi debridman değerlendirmesi, kültüre göre antibiyotik.", r: "border-orange-200 bg-orange-50 text-orange-900" },
    4: { t: "Ağır enfeksiyon", a: "Sistemik enfeksiyon — yatış, parenteral geniş spektrumlu antibiyotik, acil cerrahi değerlendirme.", r: "border-rose-200 bg-rose-50 text-rose-900" },
  };

  const liste = (baslik: string, ms: ReadonlyArray<{ id: string; metin: string }>, set: ReadonlySet<string>, degis: (id: string) => void, sayac: string) => (
    <fieldset className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
      <legend className="px-2 text-[12px] font-black text-blue-900">{baslik} · {sayac}</legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
        {ms.map((m) => (
          <label key={m.id} className={`flex items-center gap-3 min-h-[44px] px-3 py-2 rounded-xl border-2 cursor-pointer transition-all ${set.has(m.id) ? "border-blue-900 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-200"}`}>
            <input type="checkbox" checked={set.has(m.id)} onChange={() => degis(m.id)} className="w-4 h-4 accent-blue-900 shrink-0" />
            <span className="text-[12px] font-bold text-blue-950 leading-snug">{m.metin}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );

  return (
    <OlcekKabugu
      slug="diyabetik-ayak"
      ikon="🦶"
      baslik="Diyabetik Ayak Enfeksiyonu"
      altBaslik="IWGDF/IDSA Sınıflaması · 1–4 ve Osteomiyelit (O)"
      paylasim={{ sinif: ad }}
      not={
        <p>
          Enfeksiyon tanısı kliniktir; yarada kültür yalnızca enfekte görünen yaradan, debridman sonrası doku örneğiyle alınır. Periferik arter hastalığı
          (ayak bileği-kol indeksi, parmak basıncı) her hastada değerlendirilmelidir. Nöropatik hastada lokal bulgular silik olabilir. Senneville É ve ark.,
          IWGDF/IDSA diyabetik ayak enfeksiyonu kılavuzu 2023.
        </p>
      }
    >
      {liste("Lokal enfeksiyon bulguları — ≥ 2 enfeksiyon", LOKAL, lokal, (id) => setLokal((s) => kumeDegistir(s, id)), `${lokalSayi}/5`)}
      {(enfekte || osteoVar) && <SecimMaddesi id="yaygin" baslik="Enfeksiyonun yaygınlığı" secenekler={YAYGINLIK} secili={yaygin} onSec={setYaygin} rozetGizle />}
      {liste("Sistemik bulgular (SIRS) — ≥ 2 ağır enfeksiyon", SIRS, sirs, (id) => setSirs((s) => kumeDegistir(s, id)), `${sirsSayi}/4`)}
      <SecimMaddesi id="osteo" baslik="Osteomiyelit" secenekler={OSTEOMIYELIT} secili={osteo} onSec={setOsteo} rozetGizle />

      <SonucDuyuru metin={sinif !== null ? `IWGDF/IDSA ${ad} — ${TANIM[sinif].t}` : null} />
      {sinif !== null && ad ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${TANIM[sinif].r}`}>
          <p className="text-4xl font-black">{ad}</p>
          <p className="text-lg font-black">{TANIM[sinif].t}{osteoVar ? " + osteomiyelit" : ""}</p>
          <p className="text-[12px] font-bold">{TANIM[sinif].a}</p>
          {!enfekte && osteoVar && <p className="text-[12px] font-bold">Lokal bulgu olmasa da osteomiyelit sınıfı en az 3(O) yapar.</p>}
          {enfekte && sirsSayi < 2 && sirsSayi > 0 && <p className="text-[12px] font-bold">{sirsSayi} SIRS bulgusu var — ağır sınıf için ≥ 2 gerekir; yakın izlem.</p>}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">
            {osteo === null ? "Osteomiyelit sorusunu yanıtlayın" : "Enfeksiyonun yaygınlığını seçin"}
          </p>
        </div>
      )}
    </OlcekKabugu>
  );
}
