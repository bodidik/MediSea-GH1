"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SonucDuyuru from "@/app/tools/components/SonucDuyuru";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * DKA ve HHS tanı ve şiddet sınıflaması — erişkin hiperglisemik krizler uzlaşı raporu (Umpierrez ve ark., Diabetes Care 2024).
 *
 *   DKA:  glukoz ≥ 200 mg/dL (ya da bilinen diyabet) + keton (β-OHB ≥ 3,0 mmol/L ya da idrar ≥ 2+) + asidoz (pH < 7,3 ve/veya HCO₃ < 18)
 *   HHS:  glukoz ≥ 600 mg/dL + efektif osmolalite > 300 mOsm/kg + belirgin ketonemi YOK (β-OHB < 3,0) + asidoz YOK (pH ≥ 7,3, HCO₃ ≥ 15)
 *   DKA şiddeti (en ağır ölçüt belirler): hafif pH 7,25–7,30 / HCO₃ 15–18 · orta pH 7,00–7,24 / HCO₃ 10–<15 · ağır pH < 7,00 / HCO₃ < 10
 *   Efektif osmolalite = 2 × Na + glukoz/18
 *
 * HHS tanımı asidoz ve ketonemi YOKLUĞUNU istediği için "DKA + HHS" aynı anda karşılanamaz. Karma (hiperozmolar) kriz
 * ayrı tanımlanıyor: DKA ölçütleri + glukoz ≥ 600 mg/dL + efektif osmolalite > 300 — bir dönem bu dal ölü koddu
 * (DKA ve HHS birlikte aranıyordu) ve pH 7,2 + glukoz 700 + osmolalite 329 olan hasta yalnızca "DKA" görünüyordu.
 * Keton bilgisi yoksa "DKA değil" demiyor, keton gerektiğini söylüyor.
 */
const KETON: Secenek[] = [
  { label: "β-OHB ≥ 3,0 mmol/L ya da idrar ketonu ≥ 2+", pts: 0 },
  { label: "β-OHB < 3,0 mmol/L ve idrar ketonu < 2+", pts: 0 },
  { label: "Bilinmiyor", pts: 0 },
];
const DIYABET: Secenek[] = [{ label: "Bilinen diyabet var", pts: 0 }, { label: "Bilinen diyabet yok", pts: 0 }];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function DkaHhsPage() {
  const [glukoz, setGlukoz] = React.useState("");
  const [ph, setPh] = React.useState("");
  const [hco3, setHco3] = React.useState("");
  const [na, setNa] = React.useState("");
  const [keton, setKeton] = React.useState<number | null>(null);
  const [diyabet, setDiyabet] = React.useState<number | null>(null);

  const n = (s: string) => parseLocaleNumber(s);
  const gOk = sayiGirildiMi(glukoz) && n(glukoz) >= 10 && n(glukoz) <= 3000;
  const phOk = sayiGirildiMi(ph) && n(ph) >= 6.5 && n(ph) <= 7.8;
  const hOk = sayiGirildiMi(hco3) && n(hco3) >= 0 && n(hco3) <= 60;
  const naOk = sayiGirildiMi(na) && n(na) >= 100 && n(na) <= 200;

  const eksik = [
    !gOk && "glukoz (10–3000 mg/dL)",
    !phOk && "pH (6,5–7,8)",
    !hOk && "HCO₃ (0–60 mmol/L)",
    !naOk && "Na (100–200 mmol/L)",
    keton === null && "keton",
    diyabet === null && "diyabet öyküsü",
  ].filter(Boolean) as string[];
  const hazir = eksik.length === 0;

  const efOsm = gOk && naOk ? Math.round(2 * n(na) + n(glukoz) / 18) : null;
  const asidoz = hazir ? n(ph) < 7.3 || n(hco3) < 18 : null;
  const hiperglisemiDka = hazir ? n(glukoz) >= 200 || diyabet === 0 : null;
  const ketozVar = keton === 0;
  const ketonBilinmiyor = keton === 2;

  const dka = hazir ? (hiperglisemiDka && asidoz ? (ketozVar ? "evet" : ketonBilinmiyor ? "keton" : "hayir") : "hayir") : null;
  const hhs = hazir ? n(glukoz) >= 600 && efOsm! > 300 && n(ph) >= 7.3 && n(hco3) >= 15 && keton === 1 : null;
  const hhsKetonBekliyor = hazir && n(glukoz) >= 600 && efOsm! > 300 && n(ph) >= 7.3 && n(hco3) >= 15 && ketonBilinmiyor;

  const karma = dka === "evet" && n(glukoz) >= 600 && efOsm! > 300;
  let siddet: string | null = null;
  if (dka === "evet") {
    const p = n(ph), h = n(hco3);
    const phDerece = p < 7.0 ? 3 : p < 7.25 ? 2 : p < 7.3 ? 1 : 0;
    const hDerece = h < 10 ? 3 : h < 15 ? 2 : h < 18 ? 1 : 0;
    siddet = ["", "Hafif", "Orta", "Ağır"][Math.max(phDerece, hDerece)];
  }

  const tr = (x: number) => String(x).replace(".", ",");
  const baslik =
    !hazir ? null
      : karma ? `Karma kriz: DKA (${siddet!.toLocaleLowerCase("tr-TR")}) + hiperozmolarite`
      : dka === "evet" ? `DKA — ${siddet!.toLocaleLowerCase("tr-TR")}`
      : hhs ? "HHS"
      : dka === "keton" || hhsKetonBekliyor ? "Keton ölçümü gerekli"
      : "DKA ve HHS ölçütleri karşılanmıyor";

  return (
    <OlcekKabugu
      slug="dka-hhs"
      ikon="🍬"
      baslik="DKA ve HHS Sınıflaması"
      altBaslik="Hiperglisemik Krizlerde Tanı ve Şiddet · 2024 Uzlaşı Ölçütleri"
      paylasim={{ efOsm }}
      not={
        <p>
          Öglisemik DKA (SGLT2 inhibitörü, gebelik, açlık) glukoz &lt; 200 mg/dL ile görülebilir — bilinen diyabeti olan hastada glukoz eşiği aranmaz.
          Kapiller ya da serum β-hidroksibütirat idrar ketonundan üstündür. Anyon açığı (Na − Cl − HCO₃) &gt; 10–12 destekleyicidir; tedavide
          sıvı, insülin ve potasyum için DKA İnfüzyon aracını kullanın. Umpierrez GE ve ark., Diabetes Care 2024.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {([
          ["Glukoz (mg/dL)", glukoz, setGlukoz],
          ["pH (venöz ya da arteriyel)", ph, setPh],
          ["HCO₃ (mmol/L)", hco3, setHco3],
          ["Sodyum (mmol/L)", na, setNa],
        ] as const).map(([ad, deger, set]) => (
          <label key={ad} className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode="decimal" value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
      </div>
      <SecimMaddesi id="keton" baslik="Keton" secenekler={KETON} secili={keton} onSec={setKeton} rozetGizle />
      <SecimMaddesi id="diyabet" baslik="Diyabet öyküsü" aciklama="Bilinen diyabette DKA için glukoz eşiği aranmaz (öglisemik DKA)." secenekler={DIYABET} secili={diyabet} onSec={setDiyabet} rozetGizle />

      <SonucDuyuru metin={baslik} />
      {hazir && baslik ? (
        <div className={`p-6 rounded-[2rem] border-2 border-dashed space-y-3 ${dka === "evet" || hhs ? "border-rose-200 bg-rose-50 text-rose-900" : dka === "keton" || hhsKetonBekliyor ? "border-amber-200 bg-amber-50 text-amber-900" : "border-slate-200 bg-slate-50 text-slate-800"}`}>
          <p className="text-xl font-black">{baslik}</p>
          <ul className="text-[12px] font-bold space-y-1">
            <li>DKA: {dka === "evet" ? `karşılanıyor (${siddet!.toLocaleLowerCase("tr-TR")} — pH ${tr(n(ph))}, HCO₃ ${tr(n(hco3))})` : dka === "keton" ? "hiperglisemi ve asidoz var — keton ölçülmeden karar verilemez" : `karşılanmıyor${!asidoz ? " (asidoz yok)" : !hiperglisemiDka ? " (glukoz < 200 ve bilinen diyabet yok)" : " (keton eşiğin altında)"}`}</li>
            <li>HHS: {hhs ? "karşılanıyor" : hhsKetonBekliyor ? "glukoz ve osmolalite uygun — ketonemi dışlanmalı" : "karşılanmıyor"} · efektif osmolalite {efOsm} mOsm/kg (&gt; 300 gerekli)</li>
          </ul>
          {karma && <p className="text-[12px] font-bold">Karma kriz: ketoasidoz + glukoz ≥ 600 ve efektif osmolalite &gt; 300 — sıvı açığı genellikle büyüktür; osmolalite düşüşü ve Na izlemi yakından yapılmalı.</p>}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2rem] p-6 text-center">
          <p className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Eksik: {eksik.join(" · ")}</p>
        </div>
      )}
    </OlcekKabugu>
  );
}
