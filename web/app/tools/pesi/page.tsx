"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";
import { parseLocaleNumber, sayiGirildiMi } from "@/app/tools/lib/calc-utils";

/**
 * PESI ve sPESI — akut pulmoner emboli 30 günlük mortalite (Aujesky ve ark., Am J Respir Crit Care Med 2005;
 * sadeleştirilmiş: Jiménez ve ark., Arch Intern Med 2010).
 *
 * PESI: yaş (yıl) + erkek 10 + kanser 30 + kalp yetmezliği 10 + kronik akciğer hastalığı 10 + nabız ≥ 110 20
 *       + sistolik < 100 30 + solunum ≥ 30 20 + ateş < 36 °C 20 + bilinç değişikliği 60 + SaO₂ < %90 20
 *   Sınıf I ≤ 65 · II 66–85 · III 86–105 · IV 106–125 · V > 125
 * sPESI: yaş > 80 · kanser · kronik kalp YA DA akciğer hastalığı (tek madde) · nabız ≥ 110 · sistolik < 100 · SaO₂ < %90 — her biri 1.
 *
 * İki skor aynı yanıtlardan türüyor; sPESI'nin "kronik kardiyopulmoner" maddesi KY ile akciğer hastalığının VEYA'sı.
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];

type Madde = { id: string; baslik: string; aciklama?: string; pesi: number; spesi: boolean };
const MADDELER: ReadonlyArray<Madde> = [
  { id: "erkek", baslik: "Erkek cinsiyet", pesi: 10, spesi: false },
  { id: "kanser", baslik: "Kanser", aciklama: "Aktif ya da son 1 yılda tedavi edilmiş.", pesi: 30, spesi: true },
  { id: "ky", baslik: "Kronik kalp yetmezliği", pesi: 10, spesi: false },
  { id: "akciger", baslik: "Kronik akciğer hastalığı", pesi: 10, spesi: false },
  { id: "nabiz", baslik: "Nabız ≥ 110/dk", pesi: 20, spesi: true },
  { id: "sistolik", baslik: "Sistolik kan basıncı < 100 mmHg", pesi: 30, spesi: true },
  { id: "solunum", baslik: "Solunum sayısı ≥ 30/dk", pesi: 20, spesi: false },
  { id: "ates", baslik: "Vücut sıcaklığı < 36 °C", pesi: 20, spesi: false },
  { id: "bilinc", baslik: "Bilinç değişikliği", aciklama: "Dezoryantasyon, letarji, stupor ya da koma.", pesi: 60, spesi: false },
  { id: "sat", baslik: "Arteriyel oksijen satürasyonu < %90", aciklama: "Oksijen desteğiyle ya da desteksiz.", pesi: 20, spesi: true },
];

const BANTLAR: Bant[] = [
  { aralik: "≤ 65", etiket: "Sınıf I", alt: "Çok düşük risk — 30 günlük mortalite %0–1,6.", renk: "emerald" },
  { aralik: "66–85", etiket: "Sınıf II", alt: "Düşük risk — 30 günlük mortalite %1,7–3,5.", renk: "emerald" },
  { aralik: "86–105", etiket: "Sınıf III", alt: "Orta risk — 30 günlük mortalite %3,2–7,1.", renk: "amber" },
  { aralik: "106–125", etiket: "Sınıf IV", alt: "Yüksek risk — 30 günlük mortalite %4,0–11,4.", renk: "orange" },
  { aralik: "> 125", etiket: "Sınıf V", alt: "Çok yüksek risk — 30 günlük mortalite %10,0–24,5.", renk: "rose" },
];

const girdi = "bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-blue-900 outline-none font-bold text-lg min-w-0 w-full";

export default function PesiPage() {
  const [yas, setYas] = React.useState("");
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));

  const y = parseLocaleNumber(yas);
  const yasOk = sayiGirildiMi(yas) && y >= 18 && y <= 120;
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const hazir = yasOk && yanitlanan === MADDELER.length;
  const var_ = (id: string) => sel[id] === 1;

  const pesi = hazir ? Math.round(y) + MADDELER.reduce((t, m) => t + (var_(m.id) ? m.pesi : 0), 0) : null;
  const spesi = hazir
    ? (y > 80 ? 1 : 0) + MADDELER.filter((m) => m.spesi && var_(m.id)).length + (var_("ky") || var_("akciger") ? 1 : 0)
    : null;
  const bant = pesi === null ? null : pesi <= 65 ? BANTLAR[0] : pesi <= 85 ? BANTLAR[1] : pesi <= 105 ? BANTLAR[2] : pesi <= 125 ? BANTLAR[3] : BANTLAR[4];

  const eksik = [!yasOk && "yaş (18–120)", yanitlanan < MADDELER.length && `${MADDELER.length - yanitlanan} madde`].filter(Boolean).join(" · ");

  return (
    <OlcekKabugu
      slug="pesi"
      ikon="🫁"
      baslik="PESI ve sPESI"
      altBaslik="Pulmoner Emboli Şiddet İndeksi · 30 Günlük Mortalite"
      paylasim={{ pesi, spesi }}
      not={
        <p>
          PESI sınıf I–II ya da sPESI 0, hemodinamik olarak stabil hastada erken taburculuk ya da ayaktan tedavi adayını gösterir (Hestia ölçütleri ve
          sosyal koşullar da değerlendirilir). ESC 2019 risk sınıflamasında klinik ağırlık basamağı olarak kullanılır; sağ ventrikül disfonksiyonu ve
          troponin ayrıca değerlendirilir. Aujesky D ve ark., Am J Respir Crit Care Med 2005; Jiménez D ve ark., Arch Intern Med 2010.
        </p>
      }
    >
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <label className="flex flex-col gap-2">
          <span className="text-[12px] font-black text-blue-900">Yaş (yıl)</span>
          <input type="text" inputMode="numeric" value={yas} onChange={(e) => setYas(e.target.value)} className={girdi} />
        </label>
      </div>
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={eh(m.pesi)} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli
        skor={pesi}
        bantlar={BANTLAR}
        aktif={bant}
        skorBasligi="PESI"
        eksikMetni={`Eksik: ${eksik}`}
        ek={
          spesi !== null ? (
            <div className="bg-white/70 rounded-xl p-3">
              <p className="text-[12px] font-black text-blue-900">sPESI {spesi} / 6 — {spesi === 0 ? "düşük risk (30 günlük mortalite ~%1)" : "yüksek risk (30 günlük mortalite ~%10,9)"}</p>
              <p className="text-[11px] font-bold text-slate-700">sPESI yaş &gt; 80 ve kronik kalp ya da akciğer hastalığını tek madde olarak sayar.</p>
            </div>
          ) : null
        }
      />
    </OlcekKabugu>
  );
}
