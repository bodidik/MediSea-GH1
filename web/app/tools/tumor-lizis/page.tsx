"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Cairo-Bishop tümör lizis sendromu tanımı (Cairo & Bishop, Br J Haematol 2004).
 *
 * LABORATUVAR TLS: aşağıdakilerden ≥ 2'si, sitotoksik tedaviden 3 gün önce – 7 gün sonra aralığında
 *   ürik asit ≥ 8 mg/dL · potasyum ≥ 6,0 mmol/L · fosfor ≥ 4,5 mg/dL (erişkin) · düzeltilmiş kalsiyum ≤ 7,0 mg/dL
 *   ya da başlangıca göre ilk üçünde %25 ARTIŞ, kalsiyumda %25 DÜŞÜŞ
 * KLİNİK TLS: laboratuvar TLS + şunlardan biri
 *   kreatinin ≥ 1,5 × üst sınır · aritmi ya da ani ölüm · nöbet
 *
 * Başlangıç değerleri İSTEĞE BAĞLI; girilmezse yalnız mutlak eşik uygulanır ve ekran bunu söyler —
 * "%25 değişim ölçülmedi" ile "%25 değişim yok" karıştırılmamalı.
 */
const EH: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 0 }];
const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0 w-full";
const y1 = (x: number) => x.toFixed(1).replace(".", ",");

type Analit = { id: string; ad: string; birim: string; esik: number; yon: "yuksek" | "dusuk"; alt: number; ust: number };
const ANALITLER: ReadonlyArray<Analit> = [
  { id: "urik", ad: "Ürik asit", birim: "mg/dL", esik: 8, yon: "yuksek", alt: 0, ust: 40 },
  { id: "potasyum", ad: "Potasyum", birim: "mmol/L", esik: 6, yon: "yuksek", alt: 1, ust: 10 },
  { id: "fosfor", ad: "Fosfor", birim: "mg/dL", esik: 4.5, yon: "yuksek", alt: 0, ust: 25 },
  { id: "kalsiyum", ad: "Düzeltilmiş kalsiyum", birim: "mg/dL", esik: 7, yon: "dusuk", alt: 2, ust: 20 },
];

export default function TumorLizisPage() {
  const [simdi, setSimdi] = React.useState<Record<string, string>>({});
  const [bazal, setBazal] = React.useState<Record<string, string>>({});
  const [kreatinin, setKreatinin] = React.useState("");
  const [ust, setUst] = React.useState("");
  const [aritmi, setAritmi] = React.useState<number | null>(null);
  const [nobet, setNobet] = React.useState<number | null>(null);

  const n = parseLocaleNumber;
  const gecerli = (s: string | undefined, a: Analit) => !!s && sayiGirildiMi(s) && n(s) >= a.alt && n(s) <= a.ust;

  const olculen = ANALITLER.filter((a) => gecerli(simdi[a.id], a));
  const eksikAnalit = ANALITLER.filter((a) => !gecerli(simdi[a.id], a));

  const sonuclar = olculen.map((a) => {
    const d = n(simdi[a.id]);
    const b = gecerli(bazal[a.id], a) ? n(bazal[a.id]) : null;
    const esikVar = a.yon === "yuksek" ? d >= a.esik : d <= a.esik;
    const degisim = b !== null && b > 0 ? ((d - b) / b) * 100 : null;
    const degisimVar = degisim !== null && (a.yon === "yuksek" ? degisim >= 25 : degisim <= -25);
    return { a, d, b, esikVar, degisim, degisimVar, karsilandi: esikVar || degisimVar };
  });
  const karsilanan = sonuclar.filter((s) => s.karsilandi).length;
  const bazalsiz = sonuclar.filter((s) => s.b === null && !s.esikVar).length;

  const krOk = sayiGirildiMi(kreatinin) && n(kreatinin) > 0 && n(kreatinin) <= 30;
  const ustOk = sayiGirildiMi(ust) && n(ust) >= 0.4 && n(ust) <= 3;
  const krOran = krOk && ustOk ? n(kreatinin) / n(ust) : null;
  const krVar = krOran !== null && krOran >= 1.5;

  const hazir = olculen.length === ANALITLER.length && aritmi !== null && nobet !== null;
  const labTls = hazir && karsilanan >= 2;
  const klinikBulgu = [krVar && `kreatinin ${krOran !== null ? y1(krOran) : ""} × üst sınır`, aritmi === 1 && "aritmi ya da ani ölüm", nobet === 1 && "nöbet"].filter(Boolean) as string[];
  const klinikTls = labTls && klinikBulgu.length > 0;

  const eksik = [
    eksikAnalit.length > 0 && eksikAnalit.map((a) => a.ad.toLocaleLowerCase("tr-TR")).join(", "),
    aritmi === null && "aritmi / ani ölüm",
    nobet === null && "nöbet",
  ].filter(Boolean) as string[];

  const sonuc = !hazir ? null : klinikTls ? { ad: "Klinik TLS", renk: "border-rose-200 bg-rose-50 text-rose-900" }
    : labTls ? { ad: "Laboratuvar TLS", renk: "border-orange-200 bg-orange-50 text-orange-900" }
    : { ad: "TLS tanımı karşılanmıyor", renk: "border-emerald-200 bg-emerald-50 text-emerald-900" };

  return (
    <OlcekKabugu
      slug="tumor-lizis"
      ikon="⚗️"
      baslik="Tümör Lizis Sendromu"
      altBaslik="Cairo-Bishop Tanımı · Laboratuvar ve Klinik TLS"
      paylasim={{ lab: labTls, klinik: klinikTls }}
      not={
        <p>
          Tanım, sitotoksik tedaviden 3 gün önce ile 7 gün sonrası arasındaki değerler için geçerlidir. Yüksek riskli hastada (yüksek tümör yükü,
          Burkitt lenfoma, akut lösemi, yüksek lökosit, böbrek yetmezliği) hidrasyon ve rasburikaz/allopurinol ile ÖNLEM tanıyı beklemeden alınır;
          rasburikaz G6PD eksikliğinde kontrendikedir ve örnek buzda taşınmazsa ürik asit yalancı düşük ölçülür. Kalsiyum düzeltilmiş değerdir.
          Cairo MS, Bishop MF, Br J Haematol 2004.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
        <p className="text-[12px] font-black text-blue-900">Laboratuvar ölçütleri — başlangıç değeri isteğe bağlıdır (%25 değişim için)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {ANALITLER.map((a) => (
            <div key={a.id} className="flex gap-3 min-w-0">
              <label className="flex flex-col gap-2 min-w-0 flex-1">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{a.ad} ({a.birim})</span>
                <input type="text" inputMode="decimal" value={simdi[a.id] ?? ""} onChange={(e) => setSimdi((o) => ({ ...o, [a.id]: e.target.value }))} className={girdi} />
              </label>
              <label className="flex flex-col gap-2 min-w-0 flex-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Başlangıç</span>
                <input type="text" inputMode="decimal" value={bazal[a.id] ?? ""} onChange={(e) => setBazal((o) => ({ ...o, [a.id]: e.target.value }))} className={girdi} />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-4">
        <p className="text-[12px] font-black text-blue-900">Klinik ölçütler</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {([
            ["Kreatinin (mg/dL)", kreatinin, setKreatinin],
            ["Kreatinin üst sınırı (mg/dL)", ust, setUst],
          ] as const).map(([ad, deger, set]) => (
            <label key={ad} className="flex flex-col gap-2 min-w-0">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
              <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-3">
        <SecimMaddesi id="aritmi" baslik="Aritmi ya da ani ölüm" secenekler={EH} secili={aritmi} onSec={setAritmi} rozetGizle />
        <SecimMaddesi id="nobet" baslik="Nöbet" secenekler={EH} secili={nobet} onSec={setNobet} rozetGizle />
      </div>

      <SonucDuyuru metin={sonuc ? `${sonuc.ad} — ${karsilanan} laboratuvar ölçütü` : null} />
      {sonuc ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-3 ${sonuc.renk}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">Cairo-Bishop</p>
          <p className="text-3xl font-black">{sonuc.ad}</p>
          <p className="text-[12px] font-bold">Laboratuvar ölçütü karşılanan: {karsilanan} / 4 (tanı için ≥ 2)</p>
          <ul className="space-y-1">
            {sonuclar.map((s) => (
              <li key={s.a.id} className="text-[12px] font-bold">
                <span aria-hidden="true">{s.karsilandi ? "✓" : "✗"} </span>
                {s.a.ad} {y1(s.d)} {s.a.birim} — {s.karsilandi ? (s.esikVar ? `eşiği karşılıyor (${s.a.yon === "yuksek" ? "≥" : "≤"} ${y1(s.a.esik)})` : `başlangıca göre %${y1(Math.abs(s.degisim ?? 0))} değişim`) : "karşılamıyor"}
              </li>
            ))}
          </ul>
          {klinikBulgu.length > 0 && <p className="text-[12px] font-bold">Klinik bulgu: {klinikBulgu.join(" · ")}{labTls ? "" : " — laboratuvar TLS olmadan klinik TLS tanımlanmaz"}</p>}
          {bazalsiz > 0 && <p className="text-[12px] font-bold">{bazalsiz} analitte başlangıç değeri girilmedi — %25 değişim ölçütü bu analitlerde DEĞERLENDİRİLMEDİ (yok sayılmadı).</p>}
          {!krOk || !ustOk ? <p className="text-[12px] font-bold">Kreatinin ya da üst sınırı girilmedi — böbrek ölçütü değerlendirilmedi.</p> : null}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
