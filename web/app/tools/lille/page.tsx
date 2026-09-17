"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Lille skoru — ağır alkolik hepatitte 7. gün kortikosteroid yanıtı (Louvet ve ark., Hepatology 2007).
 *
 *   R = 3,19 − 0,101 × yaş + 0,147 × albümin₀ (g/L) + 0,0165 × (bilirubin₀ − bilirubin₇) (µmol/L)
 *       − 0,206 × böbrek yetmezliği (kreatinin > 1,3 mg/dL: 1) − 0,0065 × bilirubin₀ (µmol/L) − 0,0096 × PT (sn)
 *   Lille = e^(−R) / (1 + e^(−R))
 *
 * Kullanıcı Türkiye laboratuvar birimleriyle giriyor (g/dL, mg/dL); dönüşüm burada:
 * albümin × 10 → g/L, bilirubin × 17,1 → µmol/L. Formül özgün birimlerle çalışır.
 */
const YAS_ALT = 18, YAS_UST = 100;
const ALB_ALT = 0.5, ALB_UST = 7;
const BIL_UST = 80;
const PT_ALT = 5, PT_UST = 150;
const ESIK = 0.45;

const BOBREK: Secenek[] = [{ label: "Hayır (≤ 1,3 mg/dL)", pts: 0 }, { label: "Evet (> 1,3 mg/dL)", pts: 1 }];

const BANTLAR: Bant[] = [
  { aralik: "< 0,45", etiket: "Yanıtlı", alt: "Kortikosteroide yanıt var — tedaviyi 28 güne tamamlayın; 6 aylık sağkalım ~%85.", renk: "emerald" },
  { aralik: "≥ 0,45", etiket: "Yanıtsız", alt: "Kortikosteroide yanıt yok — steroidi kesmeyi değerlendirin; 6 aylık sağkalım ~%25. Seçilmiş hastada erken karaciğer nakli tartışılabilir.", renk: "rose" },
];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function LillePage() {
  const [yas, setYas] = React.useState("");
  const [alb, setAlb] = React.useState("");
  const [bil0, setBil0] = React.useState("");
  const [bil7, setBil7] = React.useState("");
  const [pt, setPt] = React.useState("");
  const [bobrek, setBobrek] = React.useState<number | null>(null);

  const n = (s: string) => parseLocaleNumber(s);
  const yasOk = sayiGirildiMi(yas) && n(yas) >= YAS_ALT && n(yas) <= YAS_UST;
  const albOk = sayiGirildiMi(alb) && n(alb) >= ALB_ALT && n(alb) <= ALB_UST;
  const bil0Ok = sayiGirildiMi(bil0) && n(bil0) >= 0 && n(bil0) <= BIL_UST;
  const bil7Ok = sayiGirildiMi(bil7) && n(bil7) >= 0 && n(bil7) <= BIL_UST;
  const ptOk = sayiGirildiMi(pt) && n(pt) >= PT_ALT && n(pt) <= PT_UST;

  const eksik = [
    !yasOk && `yaş (${YAS_ALT}–${YAS_UST})`,
    !albOk && "albümin 0. gün (g/dL)",
    !bil0Ok && "bilirubin 0. gün (mg/dL)",
    !bil7Ok && "bilirubin 7. gün (mg/dL)",
    !ptOk && `PT 0. gün (${PT_ALT}–${PT_UST} sn)`,
    bobrek === null && "böbrek yetmezliği",
  ].filter(Boolean) as string[];

  let lille: number | null = null;
  if (eksik.length === 0) {
    const albGL = n(alb) * 10;
    const b0 = n(bil0) * 17.1;
    const b7 = n(bil7) * 17.1;
    const R = 3.19 - 0.101 * n(yas) + 0.147 * albGL + 0.0165 * (b0 - b7) - 0.206 * BOBREK[bobrek!].pts - 0.0065 * b0 - 0.0096 * n(pt);
    // Ekranda 2 hane; eşik 2 haneli olduğu için karşılaştırma yuvarlanmış değerle tutarlı.
    lille = Math.round((Math.exp(-R) / (1 + Math.exp(-R))) * 100) / 100;
  }
  const bant = lille === null ? null : lille >= ESIK ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="lille"
      ikon="🍷"
      baslik="Lille Skoru"
      altBaslik="Alkolik Hepatitte 7. Gün Kortikosteroid Yanıtı · 0–1"
      paylasim={{ lille }}
      not={
        <p>
          Kortikosteroid başlanan ağır alkolik hepatitte (Maddrey ≥ 32 ya da MELD &gt; 20) tedavinin 7. gününde hesaplanır. Albümin, bilirubin ve PT
          tedavi başlangıcındaki (0. gün) değerlerdir; yalnızca bilirubin 7. günde de istenir. Bilirubin µmol/L ise 17,1'e bölerek girin.
          Louvet A ve ark., Hepatology 2007.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {([
          ["Yaş (yıl)", yas, setYas, "numeric"],
          ["Albümin — 0. gün (g/dL)", alb, setAlb, "decimal"],
          ["Bilirubin — 0. gün (mg/dL)", bil0, setBil0, "decimal"],
          ["Bilirubin — 7. gün (mg/dL)", bil7, setBil7, "decimal"],
          ["Protrombin zamanı — 0. gün (sn)", pt, setPt, "decimal"],
        ] as const).map(([ad, deger, set, mod]) => (
          <label key={ad} className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode={mod} value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>
      <SecimMaddesi id="bobrek" baslik="Böbrek yetmezliği — kreatinin > 1,3 mg/dL" secenekler={BOBREK} secili={bobrek} onSec={setBobrek} rozetGizle />
      <SkorPaneli skor={lille} skorBasligi="LILLE" bantlar={BANTLAR} aktif={bant} eksikMetni={`Eksik: ${eksik.join(" · ")}`} />
    </OlcekKabugu>
  );
}
