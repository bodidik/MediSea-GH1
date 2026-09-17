"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Mutlak eozinofil sayısı (AEC) = lökosit × eozinofil % / 100.
 *
 * Yüzde TEK BAŞINA yorumlanmaz: lökopenik hastada %8 normal, lökositozda %3
 * eozinofili olabilir. Bu yüzden araç yüzdeyi değil mutlak sayıyı bantlıyor.
 *
 * İki ayrı eşik ailesi var ve karıştırılmamalı:
 *   eozinofili şiddeti — 500 / 1500 / 5000 hücre/µL (hematolojik tanım)
 *   astımda tip 2 fenotip — 150 / 300 hücre/µL (GINA; biyolojik ajan seçimi)
 */
const LOKOSIT_ALT = 0.1;   // ×10³/µL
const LOKOSIT_UST = 500;
const YUZDE_UST = 100;
const AEC_UST = 100000;

const BANTLAR: Bant[] = [
  { aralik: "< 500", etiket: "Normal", alt: "Eozinofili yok.", renk: "emerald" },
  { aralik: "500–1499", etiket: "Hafif eozinofili", alt: "Allerjik hastalık, ilaç reaksiyonu, parazit başta olmak üzere nedeni araştırın.", renk: "amber" },
  { aralik: "1500–4999", etiket: "Orta eozinofili", alt: "Hipereozinofili sınırı (≥ 1500). ≥ 1 ay arayla iki ölçümde sürüyorsa hipereozinofili; organ hasarını değerlendirin.", renk: "orange" },
  { aralik: "≥ 5000", etiket: "Ağır eozinofili", alt: "Organ hasarı riski yüksek — kalp, akciğer, sinir sistemi tutulumu açısından acil değerlendirme.", renk: "rose" },
];

function bantBul(aec: number): Bant {
  if (aec < 500) return BANTLAR[0];
  if (aec < 1500) return BANTLAR[1];
  if (aec < 5000) return BANTLAR[2];
  return BANTLAR[3];
}

const girdiSinifi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg";

export default function EozinofilPage() {
  const [kip, setKip] = React.useState<"yuzde" | "mutlak">("yuzde");
  const [lokosit, setLokosit] = React.useState("");
  const [yuzde, setYuzde] = React.useState("");
  const [mutlak, setMutlak] = React.useState("");

  const lokN = parseLocaleNumber(lokosit);
  const yuzN = parseLocaleNumber(yuzde);
  const mutN = parseLocaleNumber(mutlak);

  const lokOk = sayiGirildiMi(lokosit) && lokN >= LOKOSIT_ALT && lokN <= LOKOSIT_UST;
  // Meşru sıfır: %0 eozinofil geçerli bir sonuç.
  const yuzOk = sayiGirildiMi(yuzde) && yuzN >= 0 && yuzN <= YUZDE_UST;
  const mutOk = sayiGirildiMi(mutlak) && mutN >= 0 && mutN <= AEC_UST;
  // 0,45 gibi küsuratlı küçük değer büyük olasılıkla ×10³/µL birimiyle girilmiş —
  // sessizce "0 hücre, normal" demek yerine hesaplamayı durdur.
  const birimSuphesi = mutOk && mutN < 100 && !Number.isInteger(mutN);

  let aec: number | null = null;
  const eksik: string[] = [];
  if (kip === "yuzde") {
    if (!lokOk) eksik.push(`lökosit (${String(LOKOSIT_ALT).replace(".", ",")}–${LOKOSIT_UST} ×10³/µL)`);
    if (!yuzOk) eksik.push("eozinofil yüzdesi (0–100)");
    if (lokOk && yuzOk) aec = Math.round(lokN * 1000 * (yuzN / 100));
  } else {
    if (!mutOk) eksik.push(`mutlak eozinofil (0–${AEC_UST} hücre/µL)`);
    else if (birimSuphesi) eksik.push(`${mutlak} küsuratlı — ×10³/µL ise 1000 ile çarpın`);
    else aec = Math.round(mutN);
  }
  const bant = aec === null ? null : bantBul(aec);
  const astimEtiket =
    aec === null ? null : aec >= 300 ? "≥ 300 — tip 2 inflamasyon olası; anti-IL-5/5R değerlendirmesinde kullanılan eşik" : aec >= 150 ? "150–299 — tip 2 inflamasyon olası (GINA ≥ 150)" : "< 150 — tip 2 fenotip desteklenmiyor (tek ölçüm; OKS altında düşük çıkabilir, tekrarlayın)";

  return (
    <OlcekKabugu
      slug="eozinofil-sayisi"
      ikon="🔬"
      baslik="Mutlak Eozinofil Sayısı"
      altBaslik="Lökosit × Eozinofil % · Eozinofili Şiddeti · Astım Fenotipi"
      paylasim={{ aec }}
      not={
        <>
          <p>
            Eozinofil sayısı gün içinde değişir (sabah düşük, akşam yüksek) ve sistemik ya da inhale kortikosteroid ile baskılanır; tek ölçüm
            dışlama için yetersizdir. Eozinofili şiddeti hematolojik sınıflamaya (500 / 1500 / 5000), astım eşikleri GINA önerisine (150 / 300) dayanır.
          </p>
          <p>Valent P ve ark., J Allergy Clin Immunol 2012 (hipereozinofili); GINA 2024 — ağır astım.</p>
        </>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
        <div role="radiogroup" aria-labelledby="eoz-kip" className="flex flex-col gap-2">
          <span id="eoz-kip" className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Girdi biçimi</span>
          <div className="flex gap-2">
            {([["yuzde", "Lökosit + yüzde"], ["mutlak", "Mutlak sayı"]] as const).map(([k, ad]) => (
              <label
                key={k}
                className={`flex-1 min-h-[44px] flex items-center justify-center rounded-xl border-2 text-[12px] font-black cursor-pointer text-center px-2
                  ${kip === k ? "border-blue-900 bg-blue-900 text-white" : "border-slate-200 bg-slate-50 text-slate-700"}`}
              >
                <input type="radio" name="eoz-kip" className="sr-only" checked={kip === k} onChange={() => setKip(k)} />
                {ad}
              </label>
            ))}
          </div>
        </div>
        {kip === "yuzde" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Lökosit (×10³/µL)</span>
              <input type="text" inputMode="decimal" value={lokosit} onChange={(e) => setLokosit(e.target.value)} placeholder="ör. 7,2" className={girdiSinifi} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Eozinofil (%)</span>
              <input type="text" inputMode="decimal" value={yuzde} onChange={(e) => setYuzde(e.target.value)} placeholder="ör. 6" className={girdiSinifi} />
            </label>
          </div>
        ) : (
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Mutlak eozinofil (hücre/µL)</span>
            <input type="text" inputMode="numeric" value={mutlak} onChange={(e) => setMutlak(e.target.value)} placeholder="ör. 450" className={`${girdiSinifi} sm:max-w-[16rem]`} />
            <span className="text-[11px] text-slate-600 pl-1">Laboratuvar ×10³/µL veriyorsa 1000 ile çarpın (0,45 → 450).</span>
          </label>
        )}
      </div>

      <SkorPaneli
        skor={aec}
        bantlar={BANTLAR}
        aktif={bant}
        skorBasligi="HÜCRE/µL"
        eksikMetni={`Eksik: ${eksik.join(" · ")}`}
        ek={
          aec !== null ? (
            <div className="text-[12px] text-slate-800 space-y-1">
              <p className="font-black">{aec} hücre/µL</p>
              <p><span className="font-black">Astımda: </span>{astimEtiket}</p>
            </div>
          ) : null
        }
      />
    </OlcekKabugu>
  );
}
