"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Duke Koşu Bandı Skoru (Mark ve ark., N Engl J Med 1991).
 *   Skor = egzersiz süresi (dk, Bruce) − 5 × en büyük ST sapması (mm) − 4 × angina indeksi
 * Angina indeksi: 0 yok · 1 egzersizi sınırlamayan · 2 egzersizi durduran.
 */
const SURE_UST = 30;
const ST_UST = 10;

const ANGINA: Secenek[] = [
  { label: "Angina yok", pts: 0 },
  { label: "Egzersizi sınırlamayan angina", pts: 1 },
  { label: "Egzersizi durduran angina", pts: 2 },
];

const BANTLAR: Bant[] = [
  { aralik: "≥ +5", etiket: "Düşük risk", alt: "4 yıllık sağkalım ~%99 (yıllık mortalite ~%0,25).", renk: "emerald" },
  { aralik: "−10 – +4", etiket: "Orta risk", alt: "4 yıllık sağkalım ~%95 (yıllık mortalite ~%1,25) — ek görüntüleme ile risk sınıflaması.", renk: "amber" },
  { aralik: "≤ −11", etiket: "Yüksek risk", alt: "4 yıllık sağkalım ~%79 (yıllık mortalite ~%5) — koroner anjiyografi değerlendirmesi.", renk: "rose" },
];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function DukeKosuBandiPage() {
  const [sure, setSure] = React.useState("");
  const [st, setSt] = React.useState("");
  const [angina, setAngina] = React.useState<number | null>(null);

  const sureN = parseLocaleNumber(sure), stN = parseLocaleNumber(st);
  const sureOk = sayiGirildiMi(sure) && sureN > 0 && sureN <= SURE_UST;
  // Meşru sıfır: ST sapması olmayan test.
  const stOk = sayiGirildiMi(st) && stN >= 0 && stN <= ST_UST;

  const eksik = [
    !sureOk && `egzersiz süresi (0–${SURE_UST} dk)`,
    !stOk && `ST sapması (0–${ST_UST} mm)`,
    angina === null && "angina indeksi",
  ].filter(Boolean) as string[];

  const skor = eksik.length === 0 ? Math.round((sureN - 5 * stN - 4 * ANGINA[angina!].pts) * 10) / 10 : null;
  const bant = skor === null ? null : skor >= 5 ? BANTLAR[0] : skor >= -10 ? BANTLAR[1] : BANTLAR[2];
  const tr = (n: number) => String(n).replace(".", ",");

  return (
    <OlcekKabugu
      slug="duke-kosu-bandi"
      ikon="🏃"
      baslik="Duke Koşu Bandı Skoru"
      altBaslik="Egzersiz EKG Testinde Prognoz · Bruce Protokolü"
      paylasim={{ duke: skor }}
      not={
        <p>
          Bruce protokolüyle yapılan testlerde geçerlidir. Bazal EKG'de ST anormalliği, sol dal bloğu, pace ritmi, WPW, sol ventrikül hipertrofisi ya da
          digoksin kullanımı varsa ST yanıtı yorumlanamaz. ST sapması, egzersiz sırasında ya da toparlanmada herhangi bir derivasyondaki (aVR hariç) en büyük net ST çökmesi ya da
          yükselmesidir. Mark DB ve ark., N Engl J Med 1991.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Egzersiz süresi (dakika, Bruce)</span>
          <input type="text" inputMode="decimal" value={sure} onChange={(e) => setSure(e.target.value)} placeholder="ör. 9" className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">En büyük ST sapması (mm)</span>
          <input type="text" inputMode="decimal" value={st} onChange={(e) => setSt(e.target.value)} placeholder="ör. 1,5" className={girdi} />
        </label>
      </div>
      <SecimMaddesi id="angina" baslik="Angina indeksi" secenekler={ANGINA} secili={angina} onSec={setAngina} />

      <SkorPaneli
        skor={skor}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`Eksik: ${eksik.join(" · ")}`}
        ek={skor !== null ? <p className="text-[11px] font-bold text-slate-700">{tr(sureN)} − 5 × {tr(stN)} − 4 × {ANGINA[angina!].pts} = {tr(skor)}</p> : null}
      />
    </OlcekKabugu>
  );
}
