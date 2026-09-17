"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Retikülosit üretim indeksi (RPI).
 *   Düzeltilmiş retikülosit (%) = retikülosit % × Hct / 45
 *   RPI = düzeltilmiş retikülosit / olgunlaşma düzeltmesi
 * Olgunlaşma düzeltmesi (gün): Hct ≥ 40 → 1,0 · 30–39 → 1,5 · 20–29 → 2,0 · < 20 → 2,5
 *
 * Aralıkların arası (ör. Hct 39,5) bir alttaki basamağa DÜŞMÜYOR: sınır "≥ 40", "≥ 30", "≥ 20".
 */
const NORMAL_HCT = 45;
const RET_UST = 50;
const HCT_ALT = 5;
const HCT_UST = 70;

function olgunlasma(hct: number): number {
  if (hct >= 40) return 1.0;
  if (hct >= 30) return 1.5;
  if (hct >= 20) return 2.0;
  return 2.5;
}

const BANTLAR: Bant[] = [
  { aralik: "< 2", etiket: "Hipoproliferatif", alt: "Kemik iliği yanıtı yetersiz — demir/B12/folat eksikliği, böbrek yetmezliği, kemik iliği yetmezliği ya da infiltrasyon.", renk: "amber" },
  { aralik: "≥ 2", etiket: "Yeterli yanıt", alt: "Kemik iliği yanıtı uygun — hemoliz ya da akut kan kaybı (ya da replasman tedavisine yanıt) düşünün.", renk: "emerald" },
];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";
const tr = (n: number, h = 2) => (Math.round(n * 10 ** h) / 10 ** h).toString().replace(".", ",");

export default function RetikulositIndeksiPage() {
  const [ret, setRet] = React.useState("");
  const [hct, setHct] = React.useState("");

  const retN = parseLocaleNumber(ret), hctN = parseLocaleNumber(hct);
  // Meşru sıfır: retikülosit %0 (aplastik kriz) geçerli bir sonuç.
  const retOk = sayiGirildiMi(ret) && retN >= 0 && retN <= RET_UST;
  const hctOk = sayiGirildiMi(hct) && hctN >= HCT_ALT && hctN <= HCT_UST;

  const eksik = [
    !retOk && `retikülosit (0–${RET_UST} %)`,
    !hctOk && `hematokrit (${HCT_ALT}–${HCT_UST} %)`,
  ].filter(Boolean) as string[];

  const duzeltilmis = retOk && hctOk ? (retN * hctN) / NORMAL_HCT : null;
  const faktor = hctOk ? olgunlasma(hctN) : null;
  const rpiHam = duzeltilmis !== null && faktor !== null ? duzeltilmis / faktor : null;
  // Bant iki haneye yuvarlanmış EKRAN değerinden: ekranda "2" yazıp "hipoproliferatif" demesin.
  const rpi = rpiHam !== null ? Math.round(rpiHam * 100) / 100 : null;
  const bant = rpi === null ? null : rpi < 2 ? BANTLAR[0] : BANTLAR[1];

  return (
    <OlcekKabugu
      slug="retikulosit-indeksi"
      ikon="🩸"
      baslik="Retikülosit Üretim İndeksi"
      altBaslik="Anemide Kemik İliği Yanıtı · Hematokrit ve Olgunlaşma Düzeltmeli"
      paylasim={{ rpi }}
      not={
        <p>
          Yalnızca anemik hastada yorumlanır; normal hematokritte RPI ≈ 1'dir. Bazı kaynaklar yeterli yanıt eşiğini 3 olarak alır. Retikülosit sayısı
          otomatik analizörde mutlak değer olarak da verilir (normal ~25–75 × 10⁹/L; anemide &gt; 100 × 10⁹/L yeterli yanıt lehine).
          Hillman RS, Finch CA, Red Cell Manual.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Retikülosit (%)</span>
          <input type="text" inputMode="decimal" value={ret} onChange={(e) => setRet(e.target.value)} placeholder="ör. 4" className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Hematokrit (%)</span>
          <input type="text" inputMode="decimal" value={hct} onChange={(e) => setHct(e.target.value)} placeholder="ör. 27" className={girdi} />
        </label>
      </div>

      <SkorPaneli
        skor={rpi}
        skorBasligi="RPI"
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`Eksik: ${eksik.join(" · ")}`}
        ek={
          rpi !== null && duzeltilmis !== null && faktor !== null ? (
            <p className="text-[11px] font-bold text-slate-700">
              Düzeltilmiş retikülosit {tr(retN)} × {tr(hctN)} / {NORMAL_HCT} = %{tr(duzeltilmis)} · olgunlaşma düzeltmesi {tr(faktor, 1)} gün · RPI {tr(rpi)}
            </p>
          ) : null
        }
      />
    </OlcekKabugu>
  );
}
