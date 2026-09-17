"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * NAFLD Fibrozis Skoru (Angulo ve ark., Hepatology 2007).
 *   NFS = −1,675 + 0,037 × yaş + 0,094 × BKİ + 1,13 × (bozulmuş açlık glukozu/diyabet)
 *         + 0,99 × AST/ALT − 0,013 × trombosit (× 10⁹/L) − 0,66 × albümin (g/dL)
 * < −1,455 ileri fibroz olası değil · > 0,676 ileri fibroz olası.
 * BKİ doğrudan girilmiyor, kilo ve boydan hesaplanıyor — elle BKİ yazmak birim karışıklığına açık.
 */
const YAS_ALT = 18, YAS_UST = 110;
const ENZIM_UST = 10000;
const PLT_ALT = 1, PLT_UST = 2000;
const ALB_ALT = 0.5, ALB_UST = 7;
const BKI_ALT = 12, BKI_UST = 80;

const DM: Secenek[] = [{ label: "Yok", pts: 0 }, { label: "Bozulmuş açlık glukozu ya da diyabet", pts: 1 }];

const BANTLAR: Bant[] = [
  { aralik: "< −1,455", etiket: "İleri fibroz olası değil", alt: "F3–F4 fibroz yüksek negatif öngörü değeriyle dışlanır.", renk: "emerald" },
  { aralik: "−1,455 – 0,676", etiket: "Belirsiz", alt: "Elastografi (FibroScan) ya da ELF ile ikinci basamak değerlendirme.", renk: "amber" },
  { aralik: "> 0,676", etiket: "İleri fibroz olası", alt: "İleri fibroz riski yüksek — hepatoloji değerlendirmesi.", renk: "rose" },
];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function NafldFibrozisPage() {
  const [yas, setYas] = React.useState("");
  const [kilo, setKilo] = React.useState("");
  const [boy, setBoy] = React.useState("");
  const [ast, setAst] = React.useState("");
  const [alt, setAlt] = React.useState("");
  const [plt, setPlt] = React.useState("");
  const [alb, setAlb] = React.useState("");
  const [dm, setDm] = React.useState<number | null>(null);

  const n = (s: string) => parseLocaleNumber(s);
  const yasOk = sayiGirildiMi(yas) && n(yas) >= YAS_ALT && n(yas) <= YAS_UST;
  const kiloOk = sayiGirildiMi(kilo) && n(kilo) >= 20 && n(kilo) <= 300;
  const boyOk = sayiGirildiMi(boy) && n(boy) >= 120 && n(boy) <= 250;
  const bki = kiloOk && boyOk ? n(kilo) / (n(boy) / 100) ** 2 : null;
  const bkiOk = bki !== null && bki >= BKI_ALT && bki <= BKI_UST;
  const astOk = sayiGirildiMi(ast) && n(ast) > 0 && n(ast) <= ENZIM_UST;
  const altOk = sayiGirildiMi(alt) && n(alt) > 0 && n(alt) <= ENZIM_UST;
  const pltOk = sayiGirildiMi(plt) && n(plt) >= PLT_ALT && n(plt) <= PLT_UST;
  const albOk = sayiGirildiMi(alb) && n(alb) >= ALB_ALT && n(alb) <= ALB_UST;

  const eksik = [
    !yasOk && `yaş (${YAS_ALT}–${YAS_UST})`,
    !kiloOk && "ağırlık (20–300 kg)",
    !boyOk && "boy (120–250 cm)",
    kiloOk && boyOk && !bkiOk && `BKİ ${BKI_ALT}–${BKI_UST} dışında`,
    !astOk && "AST",
    !altOk && "ALT",
    !pltOk && "trombosit",
    !albOk && `albümin (${String(ALB_ALT).replace(".", ",")}–${ALB_UST} g/dL)`,
    dm === null && "glukoz durumu",
  ].filter(Boolean) as string[];

  const ham =
    eksik.length === 0
      ? -1.675 + 0.037 * n(yas) + 0.094 * bki! + 1.13 * DM[dm!].pts + 0.99 * (n(ast) / n(alt)) - 0.013 * n(plt) - 0.66 * n(alb)
      : null;
  // Eşikler 3 haneli olduğundan ekranda 3 hane ve karşılaştırma o değerle.
  const nfs = ham !== null ? Math.round(ham * 1000) / 1000 : null;
  const bant = nfs === null ? null : nfs < -1.455 ? BANTLAR[0] : nfs <= 0.676 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="nafld-fibrozis"
      ikon="🫘"
      baslik="NAFLD Fibrozis Skoru"
      altBaslik="Yağlı Karaciğer Hastalığında İleri Fibroz · NFS"
      paylasim={{ nfs }}
      not={
        <p>
          Obezitede ve diyabette yanlış pozitif, 35 yaş altında yanlış negatif sonuç verebilir; 65 yaş üstünde alt eşiğin 0,12'ye çıkarılması önerilmiştir.
          Güncel kılavuzlar birinci basamakta FIB-4'ü tercih eder. Angulo P ve ark., Hepatology 2007.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        {([
          ["Yaş (yıl)", yas, setYas, "numeric"],
          ["Ağırlık (kg)", kilo, setKilo, "decimal"],
          ["Boy (cm)", boy, setBoy, "decimal"],
          ["AST (U/L)", ast, setAst, "numeric"],
          ["ALT (U/L)", alt, setAlt, "numeric"],
          ["Trombosit (× 10⁹/L)", plt, setPlt, "numeric"],
          ["Albümin (g/dL)", alb, setAlb, "decimal"],
        ] as const).map(([ad, deger, set, mod]) => (
          <label key={ad} className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">{ad}</span>
            <input type="text" inputMode={mod} value={deger} onChange={(e) => set(e.target.value)} className={girdi} />
          </label>
        ))}
        {bki !== null && <p className="sm:col-span-2 text-[12px] font-bold text-slate-700 pl-1">BKİ {bki.toFixed(1).replace(".", ",")} kg/m²</p>}
      </div>
      <SecimMaddesi id="dm" baslik="Bozulmuş açlık glukozu (100–125 mg/dL) ya da diyabet" secenekler={DM} secili={dm} onSec={setDm} rozetGizle />

      <SkorPaneli
        skor={nfs}
        skorBasligi="NFS"
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`Eksik: ${eksik.join(" · ")}`}
      />
    </OlcekKabugu>
  );
}
