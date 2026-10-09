"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * DXA yorumu — DSÖ sınıflaması (Kanis JA ve ark., J Bone Miner Res 1994;9:1137–1141) ve
 * TEMD Osteoporoz ve Metabolik Kemik Hastalıkları Tanı ve Tedavi Kılavuzu 2025, s. 22 (KMY Ölçüm ve Değerlendirme önerileri).
 *   T skoru: yalnız postmenopozal kadın ve ≥ 50 yaş erkek — ≥ −1,0 normal · −1,0 ile −2,5 arası osteopeni · ≤ −2,5 osteoporoz
 *            · ≤ −2,5 + frajilite kırığı ciddi (yerleşmiş) osteoporoz
 *   Z skoru: premenopozal kadın, < 50 yaş erkek, çocuk — ≤ −2,0 "kronolojik yaşa göre beklenenden düşük kemik kütlesi"
 * Tanı femur boynu, total kalça, L1–L4 (en az iki vertebra) ya da önkolun EN DÜŞÜK değerine göre konur. Eşikle HAM değer karşılaştırılıyor.
 */
const GRUP: Secenek[] = [
  { label: "Postmenopozal kadın", pts: 0 },
  { label: "≥ 50 yaş erkek", pts: 0 },
  { label: "Premenopozal kadın", pts: 0 },
  { label: "< 50 yaş erkek", pts: 0 },
  { label: "Çocuk / ergen", pts: 0 },
];
const KIRIK: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 0 }];
const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0 w-full";
// Eşik sınırında yuvarlama yanıltmasın (−1,01 "−1,0" görünüp osteopeni demesin): en fazla iki ondalık, sondaki sıfırlar atılır.
const v1 = (x: number) => { const s = String(Number(x.toFixed(2))).replace(".", ",").replace("-", "−"); return s.includes(",") ? s : s + ",0"; };

export default function DxaSkoruPage() {
  const [grup, setGrup] = React.useState<number | null>(null);
  const [skor, setSkor] = React.useState("");
  const [kirik, setKirik] = React.useState<number | null>(null);
  const tSkoru = grup !== null && grup <= 1;
  const ad = grup === null ? "T ya da Z skoru" : tSkoru ? "T skoru" : "Z skoru";

  const girildi = sayiGirildiMi(skor);
  const s = parseLocaleNumber(skor);
  const gecerli = girildi && s >= -8 && s <= 6;
  const deger = gecerli ? s : null;

  type Sonuc = { t: string; a: string; r: string };
  let sonuc: Sonuc | null = null;
  if (deger !== null && grup !== null) {
    if (tSkoru) {
      if (deger <= -2.5) {
        sonuc = kirik === 1
          ? { t: "Ciddi (yerleşmiş) osteoporoz", a: "T ≤ −2,5 ve frajilite kırığı.", r: "border-rose-200 bg-rose-50 text-rose-900" }
          : { t: "Osteoporoz", a: "T ≤ −2,5. Frajilite kırığı varsa ciddi (yerleşmiş) osteoporoz.", r: "border-rose-200 bg-rose-50 text-rose-900" };
      } else if (deger < -1) {
        sonuc = { t: "Osteopeni (düşük kemik kütlesi)", a: "T skoru −1,0 ile −2,5 arasında. Tedavi kararı kırık riskiyle verilir (FRAX, klinik risk faktörleri).", r: "border-amber-200 bg-amber-50 text-amber-900" };
      } else {
        sonuc = { t: "Normal", a: "T ≥ −1,0.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" };
      }
      if (kirik === 1 && deger > -2.5) sonuc = { ...sonuc, a: sonuc.a + " Frajilite kırığı (özellikle kalça ya da vertebra) KMY'den bağımsız olarak klinik osteoporoz ve yüksek risk demektir." };
    } else {
      sonuc = deger <= -2
        ? { t: "Kronolojik yaşa göre beklenenden düşük kemik kütlesi", a: "Z ≤ −2,0. Bu grupta osteopeni/osteoporoz terimi kullanılmaz; sekonder nedenler araştırılmalıdır.", r: "border-amber-200 bg-amber-50 text-amber-900" }
        : { t: "Kronolojik yaşa göre normal kemik kütlesi", a: "Z > −2,0.", r: "border-emerald-200 bg-emerald-50 text-emerald-900" };
      if (kirik === 1) sonuc = { ...sonuc, a: sonuc.a + " Frajilite kırığı varlığında düşük Z skoru ile birlikte osteoporoz tanısı düşünülür." };
    }
  }

  const eksik = [grup === null && "hasta grubu", !girildi && ad].filter(Boolean) as string[];

  return (
    <OlcekKabugu
      slug="dxa-skoru"
      ikon="🦴"
      baslik="DXA T ve Z Skoru Yorumu"
      altBaslik="DSÖ Tanı Sınıflaması · TEMD 2025 · Osteopeni / Osteoporoz"
      paylasim={{ skor: deger }}
      not={
        <p>
          Femur boynu, total kalça, L1–L4 (tek vertebra değil, en az iki) ve önkoldan EN DÜŞÜK değer kullanılır; Ward alanı, trokanter ve topuk tanıda
          kullanılmaz. İzlemde T skorları değil KMY (g/cm²) karşılaştırılır. Kanis JA ve ark., J Bone Miner Res 1994;9:1137–1141; TEMD Osteoporoz ve
          Metabolik Kemik Hastalıkları Tanı ve Tedavi Kılavuzu 2025.
        </p>
      }
    >
      <SecimMaddesi id="grup" baslik="Hasta grubu" aciklama="Hangi skorun kullanılacağını belirler." secenekler={GRUP} secili={grup} onSec={setGrup} rozetGizle />
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm">
        <label className="flex flex-col gap-2 min-w-0">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad} — en düşük bölge (ör. −2,7)</span>
          <input type="text" inputMode="decimal" value={skor} onChange={(e) => setSkor(e.target.value)} className={girdi} />
        </label>
      </div>
      <SecimMaddesi id="kirik" baslik="Frajilite kırığı öyküsü (düşük enerjili)" secenekler={KIRIK} secili={kirik} onSec={setKirik} rozetGizle />

      {girildi && !gecerli && (
        <p role="alert" className="text-[12px] font-bold text-rose-800 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">Skor −8 ile +6 arasında olmalı.</p>
      )}

      <SonucDuyuru metin={sonuc && deger !== null ? `${ad} ${v1(deger)} — ${sonuc.t}` : null} />
      {sonuc && deger !== null ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${sonuc.r}`}>
          <p className="text-[10px] font-black uppercase tracking-widest">{ad} {v1(deger)}</p>
          <p className="text-2xl font-black">{sonuc.t}</p>
          <p className="text-[12px] font-bold">{sonuc.a}</p>
        </div>
      ) : (
        eksik.length > 0 && (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
            <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
          </div>
        )
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
        {[["Normal", "T ≥ −1,0"], ["Osteopeni", "−1,0 > T > −2,5"], ["Osteoporoz", "T ≤ −2,5"], ["Z skoru", "≤ −2,0 düşük"]].map(([a, b]) => (
          <div key={a} className="rounded-xl p-2 font-black bg-white border border-slate-200 text-slate-700">
            <p>{a}</p>
            <p className="font-bold">{b}</p>
          </div>
        ))}
      </div>
    </OlcekKabugu>
  );
}
