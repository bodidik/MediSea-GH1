"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Five Factor Score — 2009 revizyonu (Guillevin ve ark., Medicine 2011).
 * Poliarteritis nodoza, MPA, GPA ve EGPA'da tanı anındaki 5 yıllık mortalite öngörüsü. 0–5.
 *
 * "KBB tutulumunun YOKLUĞU" maddesi yalnızca GPA ve EGPA'da puanlanır — bu hastalıklarda KBB
 * tutulumu daha iyi prognozla ilişkili. PAN ve MPA seçildiğinde madde gizleniyor ve puana girmiyor;
 * aksi hâlde KBB tutulumu doğası gereği olmayan her MPA hastası sahte 1 puan alırdı.
 */
const HASTALIK: Secenek[] = [
  { label: "Poliarteritis nodoza (PAN)", pts: 0 },
  { label: "Mikroskobik polianjiit (MPA)", pts: 0 },
  { label: "Granülomatöz polianjiit (GPA)", pts: 0 },
  { label: "Eozinofilik granülomatöz polianjiit (EGPA)", pts: 0 },
];
const eh: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 1 }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string }> = [
  { id: "yas", baslik: "Yaş > 65" },
  { id: "kalp", baslik: "Kalp yetmezliği", aciklama: "Vaskülite bağlı kardiyak tutulum (kardiyomiyopati) — klinik ya da görüntülemeyle." },
  { id: "gis", baslik: "Ciddi gastrointestinal tutulum", aciklama: "Perforasyon, kanama, pankreatit ya da cerrahi gerektiren tutulum." },
  { id: "bobrek", baslik: "Böbrek yetmezliği", aciklama: "Stabilize en yüksek kreatinin ≥ 150 µmol/L (≥ 1,7 mg/dL)." },
];

/** 5 yıllık mortalite — Guillevin 2011. */
const BANTLAR: Bant[] = [
  { aralik: "0", etiket: "FFS 0", alt: "5 yıllık mortalite ~%9.", renk: "emerald" },
  { aralik: "1", etiket: "FFS 1", alt: "5 yıllık mortalite ~%21.", renk: "amber" },
  { aralik: "≥ 2", etiket: "FFS ≥ 2", alt: "5 yıllık mortalite ~%40 — kötü prognoz; indüksiyonda glukokortikoide ek immünsüpresif tedavi.", renk: "rose" },
];

export default function Ffs2009Page() {
  const [hastalik, setHastalik] = React.useState<number | null>(null);
  const [sel, setSel] = React.useState<Record<string, number | null>>({ ...Object.fromEntries(MADDELER.map((m) => [m.id, null])), kbb: null });

  const kbbPuanlanir = hastalik === 2 || hastalik === 3;
  const gerekli = [...MADDELER.map((m) => m.id), ...(kbbPuanlanir ? ["kbb"] : [])];
  const eksik = (hastalik === null ? 1 : 0) + gerekli.filter((id) => sel[id] === null).length;
  const skor = eksik === 0 ? gerekli.reduce((t, id) => t + eh[sel[id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor === 0 ? BANTLAR[0] : skor === 1 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="ffs-2009"
      ikon="🩸"
      baslik="Five Factor Score (2009)"
      altBaslik="Sistemik Nekrotizan Vaskülitlerde 5 Yıllık Mortalite · 0–5"
      paylasim={{ ffs: skor }}
      not={
        <p>
          Tanı anındaki bulgularla hesaplanır; izlemde yeniden hesaplama için doğrulanmamıştır. Özgün 1996 FFS'ten farkı: yaş ve KBB maddesinin eklenmesi,
          proteinüri ve SSS tutulumunun çıkarılması. ANCA vaskülitlerinde tedavi seçimi güncel kılavuzlarda organ tehdidine göre yapılır; FFS prognoz
          bilgisidir. Guillevin L ve ark., Medicine (Baltimore) 2011.
        </p>
      }
    >
      <SecimMaddesi id="hastalik" baslik="Vaskülit tipi" secenekler={HASTALIK} secili={hastalik} onSec={setHastalik} rozetGizle />
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={eh} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
        {kbbPuanlanir && (
          <SecimMaddesi
            id="kbb"
            baslik="KBB (kulak-burun-boğaz) tutulumu YOK"
            aciklama="Yalnızca GPA ve EGPA'da puanlanır: KBB tutulumunun olmaması 1 puan."
            secenekler={eh}
            secili={sel.kbb}
            onSec={(s) => setSel((o) => ({ ...o, kbb: s }))}
          />
        )}
      </div>
      <SkorPaneli
        skor={skor}
        payda={kbbPuanlanir ? 5 : 4}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={hastalik === null ? "Önce vaskülit tipini seçin" : `${eksik} madde yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
