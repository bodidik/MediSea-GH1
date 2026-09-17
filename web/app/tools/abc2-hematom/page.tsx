"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * ABC/2 — intraserebral hematom hacmi (Kothari ve ark., Stroke 1996).
 *   A = en geniş kanama kesitindeki en uzun çap (cm)
 *   B = A'ya dik en uzun çap (cm)
 *   C = kanama görülen kesit sayısı × kesit kalınlığı (cm), kesitler ağırlıklı sayılır
 * Hacim (mL) = A × B × C / 2
 *
 * C'yi araç KESİTLERDEN hesaplıyor: kullanıcıdan hazır bir "C" istemek, ağırlıklandırmanın
 * atlanmasına ve hacmin sistematik olarak büyümesine yol açardı.
 */
const CM_UST = 20;
const MM_UST = 20;
const KESIT_UST = 100;

const BANTLAR: Bant[] = [
  { aralik: "< 30 mL", etiket: "Küçük hematom", alt: "Görece iyi prognoz — GKS ≥ 9 ile birlikte 30 günlük mortalite ~%19 (Broderick 1993).", renk: "emerald" },
  { aralik: "30–59 mL", etiket: "Orta hematom", alt: "Artmış mortalite ve kötü fonksiyonel sonuç riski; genişleme açısından erken kontrol görüntüleme.", renk: "amber" },
  { aralik: "≥ 60 mL", etiket: "Büyük hematom", alt: "Kötü prognoz — GKS ≤ 8 ile birlikte 30 günlük mortalite ~%91 (Broderick 1993).", renk: "rose" },
];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0";

export default function Abc2Page() {
  const [a, setA] = React.useState("");
  const [b, setB] = React.useState("");
  const [tam, setTam] = React.useState("");
  const [yarim, setYarim] = React.useState("0");
  const [kalinlik, setKalinlik] = React.useState("");

  const aN = parseLocaleNumber(a), bN = parseLocaleNumber(b);
  const tamN = parseLocaleNumber(tam), yarimN = parseLocaleNumber(yarim), kalN = parseLocaleNumber(kalinlik);

  const aOk = sayiGirildiMi(a) && aN > 0 && aN <= CM_UST;
  const bOk = sayiGirildiMi(b) && bN > 0 && bN <= CM_UST;
  const tamOk = sayiGirildiMi(tam) && Number.isInteger(tamN) && tamN >= 0 && tamN <= KESIT_UST;
  const yarimOk = sayiGirildiMi(yarim) && Number.isInteger(yarimN) && yarimN >= 0 && yarimN <= KESIT_UST;
  const kalOk = sayiGirildiMi(kalinlik) && kalN > 0 && kalN <= MM_UST;
  const kesitVar = tamOk && yarimOk && tamN + yarimN > 0;

  const eksik = [
    !aOk && `A (0–${CM_UST} cm)`,
    !bOk && `B (0–${CM_UST} cm)`,
    !tamOk && "tam sayılan kesit (tam sayı)",
    !yarimOk && "yarım sayılan kesit (tam sayı)",
    tamOk && yarimOk && tamN + yarimN === 0 && "en az bir kesit",
    !kalOk && `kesit kalınlığı (0–${MM_UST} mm)`,
  ].filter(Boolean) as string[];

  const c = kesitVar && kalOk ? (tamN + 0.5 * yarimN) * (kalN / 10) : null;
  const hacim = aOk && bOk && c !== null ? Math.round(((aN * bN * c) / 2) * 10) / 10 : null;
  const bant = hacim === null ? null : hacim < 30 ? BANTLAR[0] : hacim < 60 ? BANTLAR[1] : BANTLAR[2];
  const tr = (n: number) => String(Math.round(n * 100) / 100).replace(".", ",");

  return (
    <OlcekKabugu
      slug="abc2-hematom"
      ikon="📐"
      baslik="ABC/2 Hematom Hacmi"
      altBaslik="İntraserebral Kanama · BT'den Hacim Tahmini · mL"
      paylasim={{ hacim }}
      not={
        <>
          <p>
            ABC/2 elipsoid varsayar; antikoagülanla ilişkili, düzensiz ya da çok loblu hematomlarda hacmi olduğundan büyük tahmin eder
            (bu durumda ABC/3 önerilmiştir). İntraventriküler kanama hacme katılmaz.
          </p>
          <p>Kothari RU ve ark., Stroke 1996; Broderick JP ve ark., Stroke 1993.</p>
        </>
      }
    >
      <div className="bg-white rounded-[2rem] border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">A — en uzun çap (cm)</span>
            <input type="text" inputMode="decimal" value={a} onChange={(e) => setA(e.target.value)} className={girdi} />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">B — A'ya dik çap (cm)</span>
            <input type="text" inputMode="decimal" value={b} onChange={(e) => setB(e.target.value)} className={girdi} />
          </label>
        </div>
        <div className="space-y-2">
          <p className="text-[12px] font-black text-blue-900">C — kesitler</p>
          <p className="text-[11px] text-slate-600 leading-snug">
            En geniş kanama kesitine göre: alanı ≥ %75 olan kesit <strong>1</strong>, %25–75 olan <strong>0,5</strong> sayılır, &lt; %25 olan sayılmaz.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">≥ %75 kesit sayısı</span>
              <input type="text" inputMode="numeric" value={tam} onChange={(e) => setTam(e.target.value)} className={girdi} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">%25–75 kesit sayısı</span>
              <input type="text" inputMode="numeric" value={yarim} onChange={(e) => setYarim(e.target.value)} className={girdi} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Kesit kalınlığı (mm)</span>
              <input type="text" inputMode="decimal" value={kalinlik} onChange={(e) => setKalinlik(e.target.value)} className={girdi} />
            </label>
          </div>
        </div>
      </div>

      <SkorPaneli
        skor={hacim}
        skorBasligi="mL"
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`Eksik: ${eksik.join(" · ")}`}
        ek={hacim !== null && c !== null ? <p className="text-[11px] font-bold text-slate-700">{tr(aN)} × {tr(bN)} × {tr(c)} / 2 = {tr(hacim)} mL</p> : null}
      />
    </OlcekKabugu>
  );
}
