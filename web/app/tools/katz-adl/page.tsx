"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Katz Günlük Yaşam Aktiviteleri İndeksi — Katz ve ark., JAMA 1963; 0–6 puanlı
 * sürüm (Shelkey & Wallace). Her madde bağımsız 1, bağımlı 0.
 */
const ib = (): Secenek[] => [{ label: "Bağımlı", pts: 0 }, { label: "Bağımsız", pts: 1 }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama: string; secenekler: Secenek[] }> = [
  { id: "banyo", baslik: "Banyo", aciklama: "Bağımsız: tek başına yıkanır ya da yalnız tek bir bölge (sırt, genital bölge) için yardım alır.", secenekler: ib() },
  { id: "giyinme", baslik: "Giyinme", aciklama: "Bağımsız: giysileri dolaptan alıp giyer; yalnız ayakkabı bağlamada yardım alabilir.", secenekler: ib() },
  { id: "tuvalet", baslik: "Tuvalet kullanımı", aciklama: "Bağımsız: tuvalete gider, temizlenir, giysisini düzeltir.", secenekler: ib() },
  { id: "transfer", baslik: "Transfer", aciklama: "Bağımsız: yataktan ya da sandalyeden yardımsız kalkar (mekanik destek kabul edilir).", secenekler: ib() },
  { id: "kontinans", baslik: "Kontinans", aciklama: "Bağımsız: idrar ve dışkılama tamamen kontrol altında.", secenekler: ib() },
  { id: "beslenme", baslik: "Beslenme", aciklama: "Bağımsız: yemeği tabaktan ağzına kendisi götürür (yemeğin hazırlanması dahil değil).", secenekler: ib() },
];

const BANTLAR: Bant[] = [
  { aralik: "6", etiket: "Tam bağımsız", alt: "Temel günlük yaşam aktivitelerinin tümünü bağımsız yapıyor.", renk: "emerald" },
  { aralik: "3–5", etiket: "Orta bağımlı", alt: "Bazı temel aktivitelerde yardım gerekiyor — bakım planı ve destek ihtiyacını değerlendirin.", renk: "amber" },
  { aralik: "0–2", etiket: "Ağır bağımlı", alt: "Temel aktivitelerin çoğunda bağımlı — kapsamlı bakım desteği gerekir.", renk: "rose" },
];

export default function KatzPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === MADDELER.length ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor === 6 ? BANTLAR[0] : skor >= 3 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="katz-adl"
      ikon="🛁"
      baslik="Katz GYA İndeksi"
      altBaslik="Temel Günlük Yaşam Aktiviteleri · 6 Madde · 0–6"
      paylasim={{ katz: skor }}
      not={
        <p>
          Hastanın gerçekte yaptığı değerlendirilir, yapabileceği değil. Araçlı günlük yaşam aktiviteleri için Lawton-Brody ölçeğini kullanın.
          Katz S ve ark., JAMA 1963; Shelkey M, Wallace M, Try This 1998.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={6} bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
