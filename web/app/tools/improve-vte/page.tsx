"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * IMPROVE-VTE — akut dahili hastalıkla yatan hastada venöz tromboembolizm riski (Spyropoulos ve ark., Chest 2011).
 * 7 madde, 0–12. D-dimer > 2 × üst sınır eklenirse IMPROVEDD (+2).
 * D-dimer maddesi isteğe bağlı; seçilmezse klasik IMPROVE hesaplanır ve bunu ekran söyler.
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "onceVte", baslik: "Önceki VTE", secenekler: eh(3) },
  { id: "trombofili", baslik: "Bilinen trombofili", aciklama: "Kalıtsal ya da edinsel (ör. antifosfolipid sendromu, faktör V Leiden).", secenekler: eh(2) },
  { id: "paralizi", baslik: "Alt ekstremitede güncel paralizi ya da parezi", secenekler: eh(2) },
  { id: "kanser", baslik: "Aktif kanser", aciklama: "Son 6 ayda tanı ya da süren tedavi.", secenekler: eh(2) },
  { id: "immobil", baslik: "Başvurudan önce ya da yatışta ≥ 7 gün immobilizasyon", secenekler: eh(1) },
  { id: "ybu", baslik: "Yoğun bakım ya da koroner bakım ünitesinde yatış", secenekler: eh(1) },
  { id: "yas", baslik: "Yaş > 60", secenekler: eh(1) },
];
const DDIMER: Secenek[] = [
  { label: "Ölçülmedi (klasik IMPROVE)", pts: 0 },
  { label: "≤ 2 × üst sınır", pts: 0 },
  { label: "> 2 × üst sınır (IMPROVEDD)", pts: 2 },
];

const BANTLAR: Bant[] = [
  { aralik: "0–1", etiket: "Düşük risk", alt: "Farmakolojik tromboprofilaksi genellikle gerekmez; erken mobilizasyon.", renk: "emerald" },
  { aralik: "2–3", etiket: "Orta risk", alt: "Kanama riski düşükse farmakolojik profilaksi düşünülür.", renk: "amber" },
  { aralik: "≥ 4", etiket: "Yüksek risk", alt: "Kanama riski izin veriyorsa farmakolojik tromboprofilaksi önerilir.", renk: "rose" },
];

export default function ImproveVtePage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const [dd, setDd] = React.useState<number | null>(null);
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const temel = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const skor = temel !== null && dd !== null ? temel + DDIMER[dd].pts : null;
  const bant = skor === null ? null : skor <= 1 ? BANTLAR[0] : skor <= 3 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="improve-vte"
      ikon="🦵"
      baslik="IMPROVE-VTE"
      altBaslik="Dahili Yatan Hastada VTE Riski · İsteğe Bağlı D-dimer (IMPROVEDD)"
      paylasim={{ improve: skor, dd }}
      not={
        <p>
          Tromboprofilaksi kararı kanama riskiyle birlikte verilir (IMPROVE kanama skoru ya da klinik değerlendirme); aktif kanama ve trombosit
          &lt; 50 × 10⁹/L gibi durumlarda mekanik yöntemler tercih edilir. Padua skoru aynı amaçla kullanılan alternatiftir. Spyropoulos AC ve ark.,
          Chest 2011; Gibson CM ve ark. (IMPROVEDD), TH Open 2017.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
        <SecimMaddesi id="ddimer" baslik="D-dimer (isteğe bağlı)" secenekler={DDIMER} secili={dd} onSec={setDd} />
      </div>
      <SkorPaneli
        skor={skor}
        payda={dd === 2 ? 14 : 12}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan + (dd === null ? 1 : 0)} madde yanıtlanmadı`}
        ek={skor !== null ? <p className="text-[11px] font-bold text-slate-700">{dd === 0 ? "Klasik IMPROVE (D-dimer yok)" : `IMPROVEDD — D-dimer ${dd === 2 ? "+2" : "0"}`}</p> : null}
      />
    </OlcekKabugu>
  );
}
