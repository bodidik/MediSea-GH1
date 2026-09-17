"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * Mentzer indeksi = MCV (fL) / eritrosit sayısı (× 10⁶/µL) (Mentzer, Lancet 1973).
 * Mikrositer anemide talasemi taşıyıcılığı ile demir eksikliği ayrımına İPUCU.
 *
 * MCV ≥ 80 fL'de indeks anlamsız — araç o durumda sayı basıyor ama bant VERMİYOR ve sebebini söylüyor.
 * Eşik tam 13'te: kaynaklar 13'ü "belirsiz" sayar; araç < 13 / = 13 / > 13 ayırıyor.
 */
const MCV_ALT = 40, MCV_UST = 130;
const RBC_ALT = 0.5, RBC_UST = 9;
const MIKROSITOZ = 80;

const BANTLAR: Bant[] = [
  { aralik: "< 13", etiket: "Talasemi taşıyıcılığı lehine", alt: "Yüksek eritrosit sayısı, orantısız mikrositoz — hemoglobin elektroforezi (HbA2) gönderin; demir eksikliği eşlik edebilir.", renk: "amber" },
  { aralik: "= 13", etiket: "Belirsiz", alt: "Ayrım yapılamıyor — ferritin ve hemoglobin elektroforezi.", renk: "slate" },
  { aralik: "> 13", etiket: "Demir eksikliği lehine", alt: "Ferritin ve transferrin satürasyonu ile doğrulayın.", renk: "orange" },
];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function MentzerPage() {
  const [mcv, setMcv] = React.useState("");
  const [rbc, setRbc] = React.useState("");

  const mcvN = parseLocaleNumber(mcv), rbcN = parseLocaleNumber(rbc);
  const mcvOk = sayiGirildiMi(mcv) && mcvN >= MCV_ALT && mcvN <= MCV_UST;
  const rbcOk = sayiGirildiMi(rbc) && rbcN >= RBC_ALT && rbcN <= RBC_UST;
  const eksik = [
    !mcvOk && `MCV (${MCV_ALT}–${MCV_UST} fL)`,
    !rbcOk && `eritrosit (${String(RBC_ALT).replace(".", ",")}–${RBC_UST} × 10⁶/µL)`,
  ].filter(Boolean) as string[];

  // Bant 1 haneye yuvarlanmış ekran değerinden.
  const indeks = mcvOk && rbcOk ? Math.round((mcvN / rbcN) * 10) / 10 : null;
  const mikrositer = mcvOk && mcvN < MIKROSITOZ;
  const bant = indeks === null || !mikrositer ? null : indeks < 13 ? BANTLAR[0] : indeks === 13 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="mentzer"
      ikon="🔴"
      baslik="Mentzer İndeksi"
      altBaslik="Mikrositer Anemi · Talasemi Taşıyıcılığı ve Demir Eksikliği Ayrımı"
      paylasim={{ mentzer: indeks }}
      not={
        <p>
          Bir tarama ipucudur, tanı koydurmaz: duyarlılığı ve özgüllüğü ~%80–90 düzeyindedir; iki durum birlikte olabilir ve demir eksikliği
          HbA2'yi düşürerek beta talasemi taşıyıcılığını maskeleyebilir. Laboratuvar eritrosit sayısını × 10¹²/L verirse sayı aynıdır.
          Mentzer WC, Lancet 1973.
        </p>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-5">
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">MCV (fL)</span>
          <input type="text" inputMode="decimal" value={mcv} onChange={(e) => setMcv(e.target.value)} placeholder="ör. 68" className={girdi} />
        </label>
        <label className="flex flex-col gap-2">
          <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-1">Eritrosit (× 10⁶/µL)</span>
          <input type="text" inputMode="decimal" value={rbc} onChange={(e) => setRbc(e.target.value)} placeholder="ör. 5,8" className={girdi} />
        </label>
      </div>

      {indeks !== null && !mikrositer && (
        <div role="alert" className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-[12px] font-bold text-amber-900">
          MCV {mcvN} fL — mikrositoz yok (≥ {MIKROSITOZ} fL). Mentzer indeksi {String(indeks).replace(".", ",")} ama yalnızca mikrositer anemide yorumlanır; bant verilmedi.
        </div>
      )}

      <SkorPaneli
        skor={bant ? indeks : null}
        skorBasligi="İNDEKS"
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={indeks !== null && !mikrositer ? "Mikrositoz yok — yorumlanmadı" : `Eksik: ${eksik.join(" · ")}`}
      />
    </OlcekKabugu>
  );
}
