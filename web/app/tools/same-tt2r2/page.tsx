"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * SAMe-TT₂R₂ — atriyal fibrilasyonda varfarinle iyi INR kontrolü (TTR) olasılığı
 * (Apostolakis ve ark., Chest 2013). 0–8.
 */
const eh = (p: number): Secenek[] => [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: p }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; secenekler: Secenek[] }> = [
  { id: "kadin", baslik: "S — Kadın cinsiyet", secenekler: eh(1) },
  { id: "yas", baslik: "A — Yaş < 60", secenekler: eh(1) },
  {
    id: "oyku", baslik: "Me — Tıbbi öykü: aşağıdakilerden 2'den fazlası",
    aciklama: "Hipertansiyon · diyabet · koroner arter hastalığı/MI · periferik arter hastalığı · kalp yetmezliği · önceki inme · akciğer hastalığı · karaciğer ya da böbrek hastalığı",
    secenekler: eh(1),
  },
  { id: "etkilesim", baslik: "T — Etkileşen ilaç (ör. ritim kontrolü için amiodaron)", secenekler: eh(1) },
  { id: "sigara", baslik: "T — Sigara (son 2 yıl içinde)", secenekler: eh(2) },
  { id: "irk", baslik: "R — Beyaz ırk dışı", secenekler: eh(2) },
];

const BANTLAR: Bant[] = [
  { aralik: "0–2", etiket: "İyi TTR olası", alt: "Varfarinle iyi INR kontrolü (TTR) beklenir — VKA uygun bir seçenek.", renk: "emerald" },
  { aralik: "≥ 3", etiket: "Kötü TTR olası", alt: "Yetersiz INR kontrolü riski — doğrudan oral antikoagülan (DOAK) tercih edilmeli ya da VKA'da yoğun izlem.", renk: "rose" },
];

export default function SameTt2r2Page() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor <= 2 ? BANTLAR[0] : BANTLAR[1];

  return (
    <OlcekKabugu
      slug="same-tt2r2"
      ikon="💊"
      baslik="SAMe-TT₂R₂"
      altBaslik="Atriyal Fibrilasyonda Varfarin Uygunluğu · TTR Öngörüsü · 0–8"
      paylasim={{ same: skor }}
      not={
        <p>
          DOAK'ın kontrendike olmadığı çoğu hastada kılavuzlar zaten DOAK'ı tercih eder; bu skor özellikle VKA'nın düşünüldüğü ya da DOAK'a erişimin
          kısıtlı olduğu durumlarda yol gösterir. İrk maddesi özgün kohortun yapısını yansıtır ve Türkiye popülasyonunda doğrulanmamıştır.
          Apostolakis S ve ark., Chest 2013.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={8} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
