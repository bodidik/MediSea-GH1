"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * GOLD 2023 KOAH değerlendirmesi — spirometrik derece (GOLD 1–4) + ABE grubu.
 *
 *   Tanı      bronkodilatör sonrası FEV1/FVC < 0,70 (değilse derece ve grup BASILMAZ)
 *   Derece    FEV1 %beklenen ≥ 80 GOLD 1 · 50–79 GOLD 2 · 30–49 GOLD 3 · < 30 GOLD 4
 *   Grup E    son 1 yılda ≥ 2 orta alevlenme ya da ≥ 1 hastaneye yatışlı alevlenme
 *   Grup A/B  alevlenme ölçütü yoksa: CAT < 10 ve mMRC 0–1 → A; CAT ≥ 10 ya da mMRC ≥ 2 → B
 * CAT girildiyse semptom kararı CAT'ten verilir (GOLD CAT'i tercih eder); yalnız mMRC seçildiyse ondan.
 * İkisi uyumsuzsa ekran bunu söyler.
 */
const ALEVLENME: Secenek[] = [
  { label: "0–1 orta alevlenme, hastaneye yatış yok", pts: 0 },
  { label: "≥ 2 orta alevlenme ya da ≥ 1 hastaneye yatışlı alevlenme", pts: 0 },
];
const MMRC: Secenek[] = [
  { label: "0 — Yalnız ağır egzersizde nefes darlığı", pts: 0 },
  { label: "1 — Düz yolda acele ederken ya da hafif yokuşta", pts: 1 },
  { label: "2 — Yaşıtlarından yavaş yürüyor ya da kendi hızında durup soluklanıyor", pts: 2 },
  { label: "3 — ~100 metre ya da birkaç dakika yürüdükten sonra duruyor", pts: 3 },
  { label: "4 — Evden çıkamıyor ya da giyinirken nefes darlığı", pts: 4 },
];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0 w-full";

const TEDAVI = {
  A: "Bir bronkodilatör (kısa ya da uzun etkili); etkiliyse sürdürülür.",
  B: "LABA + LAMA (tek inhaler tercih edilir).",
  E: "LABA + LAMA; kan eozinofili ≥ 300/µL ise LABA + LAMA + İKS düşünülür. LABA + İKS önerilmez.",
} as const;

export default function GoldKoahPage() {
  const [oran, setOran] = React.useState("");
  const [fev1, setFev1] = React.useState("");
  const [cat, setCat] = React.useState("");
  const [mmrc, setMmrc] = React.useState<number | null>(null);
  const [alev, setAlev] = React.useState<number | null>(null);

  const n = parseLocaleNumber;
  // Oran 0,45 ya da %45 biçiminde girilebilir.
  const oranHam = n(oran);
  const oranDeger = sayiGirildiMi(oran) ? (oranHam > 1 ? oranHam / 100 : oranHam) : NaN;
  const oranOk = sayiGirildiMi(oran) && oranDeger > 0.1 && oranDeger <= 1;
  const fevOk = sayiGirildiMi(fev1) && n(fev1) >= 5 && n(fev1) <= 150;
  const catGirildi = sayiGirildiMi(cat);
  const catOk = catGirildi && Number.isInteger(n(cat)) && n(cat) >= 0 && n(cat) <= 40;
  const semptomVar = catOk || mmrc !== null;

  const eksik = [
    !oranOk && "FEV1/FVC (ör. 0,62 ya da 62)",
    !fevOk && "FEV1 % beklenen (5–150)",
    catGirildi && !catOk && "CAT 0–40 tam sayı",
    !semptomVar && "CAT ya da mMRC",
    alev === null && "alevlenme öyküsü",
  ].filter(Boolean) as string[];

  const taniYok = oranOk && oranDeger >= 0.7;
  const hazir = eksik.length === 0 && !taniYok;

  let derece: number | null = null, grup: "A" | "B" | "E" | null = null, uyumsuz = false;
  if (hazir) {
    const f = n(fev1);
    derece = f >= 80 ? 1 : f >= 50 ? 2 : f >= 30 ? 3 : 4;
    const catYuksek = catOk ? n(cat) >= 10 : null;
    const mmrcYuksek = mmrc !== null ? mmrc >= 2 : null;
    uyumsuz = catYuksek !== null && mmrcYuksek !== null && catYuksek !== mmrcYuksek;
    const yuksek = catYuksek ?? mmrcYuksek;
    grup = alev === 1 ? "E" : yuksek ? "B" : "A";
  }

  return (
    <OlcekKabugu
      slug="gold-koah"
      ikon="🫁"
      baslik="GOLD KOAH Sınıflaması"
      altBaslik="Spirometrik Derece (GOLD 1–4) ve ABE Grubu · GOLD 2023"
      paylasim={{ derece, grup }}
      not={
        <p>
          Spirometri bronkodilatör sonrasıdır. Sabit 0,70 oranı yaşlılarda aşırı, gençlerde eksik tanıya yol açabilir; alt normal sınır (LLN) ayrıca
          değerlendirilebilir. ABE grubu yalnız BAŞLANGIÇ tedavisini yönlendirir; izlemde tedavi baskın sorun (dispne ya da alevlenme) üzerinden
          ayarlanır. GOLD 2023 raporu.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-5">
        {([
          ["FEV1/FVC (bronkodilatör sonrası)", oran, setOran],
          ["FEV1 (% beklenen)", fev1, setFev1],
          ["CAT skoru (isteğe bağlı, 0–40)", cat, setCat],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2 min-w-0">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>
      <div className="space-y-3">
        <SecimMaddesi id="mmrc" baslik="mMRC dispne derecesi" aciklama="CAT girildiyse semptom kararı CAT'ten verilir; mMRC karşılaştırma için gösterilir." secenekler={MMRC} secili={mmrc} onSec={setMmrc} rozetGizle />
        <SecimMaddesi id="alev" baslik="Son 1 yıldaki alevlenmeler" secenekler={ALEVLENME} secili={alev} onSec={setAlev} rozetGizle />
      </div>

      {taniYok && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          FEV1/FVC ≥ 0,70 — spirometrik olarak KOAH doğrulanmadı; GOLD derecesi ve grubu hesaplanmaz. Semptomlu hastada PRISm, astım ya da başka
          tanılar düşünülmelidir.
        </div>
      )}

      <SonucDuyuru metin={derece && grup ? `GOLD ${derece}, grup ${grup}` : null} />
      {derece && grup ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-2 ${grup === "E" ? "border-rose-200 bg-rose-50 text-rose-900" : grup === "B" ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
          <div className="flex flex-wrap gap-8">
            <div><p className="text-[10px] font-black uppercase tracking-widest">Spirometrik derece</p><p className="text-4xl font-black">GOLD {derece}</p></div>
            <div><p className="text-[10px] font-black uppercase tracking-widest">Grup</p><p className="text-4xl font-black">{grup}</p></div>
          </div>
          <p className="text-[12px] font-bold">Başlangıç tedavisi: {TEDAVI[grup]}</p>
          {uyumsuz && <p className="text-[12px] font-black">CAT ile mMRC farklı semptom düzeyi gösteriyor — karar CAT'ten verildi.</p>}
        </div>
      ) : !taniYok ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      ) : null}
    </OlcekKabugu>
  );
}
