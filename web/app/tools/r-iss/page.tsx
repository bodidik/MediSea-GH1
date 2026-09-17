"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Multipl miyelom evrelemesi — ISS (Greipp ve ark., JCO 2005) ve R-ISS (Palumbo ve ark., JCO 2015).
 *
 *   ISS I    β2M < 3,5 mg/L ve albümin ≥ 3,5 g/dL
 *   ISS III  β2M ≥ 5,5 mg/L
 *   ISS II   ne I ne III
 *   R-ISS I   ISS I + standart riskli FISH + normal LDH
 *   R-ISS III ISS III + (yüksek riskli FISH ya da yüksek LDH)
 *   R-ISS II  ne I ne III
 *
 * FISH BİLİNMİYORSA sonuç çoğu zaman yine bellidir: ISS II → her durumda R-ISS II; LDH yüksekse
 * ISS I → II, ISS III → III. Belirsiz kalan tek durum "FISH bilinmiyor + LDH normal" iken ISS I ya da III —
 * araç orada evre uydurmuyor, hangi bilginin eksik olduğunu yazıyor.
 */
const B2M_UST = 100;
const ALB_ALT = 0.5, ALB_UST = 7;

const LDH: Secenek[] = [{ label: "Normal", pts: 0 }, { label: "Normalin üst sınırının üstünde", pts: 1 }];
const FISH: Secenek[] = [
  { label: "Standart risk", pts: 0 },
  { label: "Yüksek risk: del(17p), t(4;14) ya da t(14;16)", pts: 1 },
  { label: "Bilinmiyor / sonuç bekleniyor", pts: 2 },
];

const BANTLAR: Bant[] = [
  { aralik: "R-ISS I", etiket: "R-ISS I", alt: "5 yıllık genel sağkalım ~%82 · progresyonsuz ~%55 (özgün seri).", renk: "emerald" },
  { aralik: "R-ISS II", etiket: "R-ISS II", alt: "5 yıllık genel sağkalım ~%62 · progresyonsuz ~%36.", renk: "amber" },
  { aralik: "R-ISS III", etiket: "R-ISS III", alt: "5 yıllık genel sağkalım ~%40 · progresyonsuz ~%24.", renk: "rose" },
];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function RIssPage() {
  const [b2m, setB2m] = React.useState("");
  const [alb, setAlb] = React.useState("");
  const [ldh, setLdh] = React.useState<number | null>(null);
  const [fish, setFish] = React.useState<number | null>(null);

  const b2mN = parseLocaleNumber(b2m), albN = parseLocaleNumber(alb);
  const b2mOk = sayiGirildiMi(b2m) && b2mN > 0 && b2mN <= B2M_UST;
  const albOk = sayiGirildiMi(alb) && albN >= ALB_ALT && albN <= ALB_UST;

  const iss = b2mOk && albOk ? (b2mN >= 5.5 ? 3 : b2mN < 3.5 && albN >= 3.5 ? 1 : 2) : null;

  let riss: number | null = null;
  let belirsiz = "";
  if (iss !== null && ldh !== null && fish !== null) {
    const ldhYuksek = ldh === 1;
    const fishYuksek = fish === 1;
    const fishBilinmiyor = fish === 2;
    if (iss === 2) riss = 2;
    else if (iss === 1) {
      if (ldhYuksek || fishYuksek) riss = 2;
      else if (fishBilinmiyor) belirsiz = "ISS I ve LDH normal — FISH standart riskse R-ISS I, yüksek riskse II. FISH sonucu gerekli.";
      else riss = 1;
    } else {
      if (ldhYuksek || fishYuksek) riss = 3;
      else if (fishBilinmiyor) belirsiz = "ISS III ve LDH normal — FISH yüksek riskse R-ISS III, standart riskse II. FISH sonucu gerekli.";
      else riss = 2;
    }
  }

  const eksik = [
    !b2mOk && `β2-mikroglobulin (0–${B2M_UST} mg/L)`,
    !albOk && `albümin (${String(ALB_ALT).replace(".", ",")}–${ALB_UST} g/dL)`,
    ldh === null && "LDH",
    fish === null && "FISH",
  ].filter(Boolean) as string[];

  return (
    <OlcekKabugu
      slug="r-iss"
      ikon="🦴"
      baslik="R-ISS"
      altBaslik="Multipl Miyelom · Revize Uluslararası Evreleme Sistemi"
      paylasim={{ iss, riss }}
      not={
        <p>
          β2-mikroglobulin mg/L'dir (nmol/L verildiyse ~0,085 ile çarpın). Böbrek yetmezliği β2M'yi yükseltir; evreleme yine de aynı eşiklerle yapılır.
          R2-ISS (2022) 1q kazanımını da ekleyerek R-ISS II grubunu ayrıştırır. Sağkalım oranları IMWG kohortuna (yeni ajanlar öncesi/erken dönem) aittir.
          Palumbo A ve ark., J Clin Oncol 2015.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">β2-mikroglobulin (mg/L)</span>
          <input type="text" inputMode="decimal" value={b2m} onChange={(e) => setB2m(e.target.value)} className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Albümin (g/dL)</span>
          <input type="text" inputMode="decimal" value={alb} onChange={(e) => setAlb(e.target.value)} className={girdi} />
        </label>
      </div>
      {iss !== null && (
        <p className="px-1 text-[13px] font-black text-blue-900" aria-live="polite">
          ISS evre {["I", "II", "III"][iss - 1]}
        </p>
      )}
      <SecimMaddesi id="ldh" baslik="Serum LDH" secenekler={LDH} secili={ldh} onSec={setLdh} rozetGizle />
      <SecimMaddesi id="fish" baslik="Kemik iliği FISH (CD138+ plazma hücreleri)" secenekler={FISH} secili={fish} onSec={setFish} rozetGizle />

      {belirsiz && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">{belirsiz}</div>
      )}
      <SkorPaneli
        skor={riss}
        payda={3}
        skorBasligi="R-ISS"
        bantlar={BANTLAR}
        aktif={riss === null ? null : BANTLAR[riss - 1]}
        eksikMetni={belirsiz ? "FISH sonucu olmadan evre belirlenemiyor" : `Eksik: ${eksik.join(" · ")}`}
        ek={riss !== null && iss !== null ? <p className="text-[11px] font-bold text-slate-700">ISS {["I", "II", "III"][iss - 1]} · LDH {ldh === 1 ? "yüksek" : "normal"} · FISH {["standart", "yüksek riskli", "bilinmiyor"][fish!]}</p> : null}
      />
    </OlcekKabugu>
  );
}
