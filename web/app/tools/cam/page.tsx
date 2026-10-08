"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * CAM — Confusion Assessment Method, tanı algoritması (Inouye ve ark., Ann Intern
 * Med 1990). Deliryum = 1 VE 2 VE (3 YA DA 4). Puan değil algoritma; panelde
 * bulunan özellik sayısı gösteriliyor, bant algoritmadan geliyor.
 */
const yv = (): Secenek[] => [{ label: "Yok", pts: 0 }, { label: "Var", pts: 1 }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama: string; secenekler: Secenek[] }> = [
  { id: "akut", baslik: "1. Akut başlangıç ve dalgalı seyir", aciklama: "Bazale göre mental durumda akut değişiklik var mı; gün içinde dalgalanıyor mu?", secenekler: yv() },
  { id: "dikkat", baslik: "2. Dikkatsizlik", aciklama: "Dikkatini odaklamakta güçlük — kolay dağılıyor, söyleneni izleyemiyor.", secenekler: yv() },
  { id: "dusunce", baslik: "3. Dağınık düşünce", aciklama: "Konuşma dağınık ya da tutarsız; konudan konuya atlıyor, mantıksız fikir akışı.", secenekler: yv() },
  { id: "bilinc", baslik: "4. Bilinç düzeyinde değişiklik", aciklama: "Uyanık dışında herhangi bir durum: aşırı uyanık, uykulu, stupor ya da koma.", secenekler: yv() },
];

const BANTLAR: Bant[] = [
  { aralik: "algoritma −", etiket: "Deliryum yok", alt: "CAM algoritması karşılanmadı — klinik şüphe sürüyorsa yeniden değerlendirin.", renk: "emerald" },
  { aralik: "1 + 2 + (3 ya da 4)", etiket: "Deliryum", alt: "CAM pozitif — altta yatan nedeni (enfeksiyon, ilaç, metabolik, retansiyon…) araştırın.", renk: "rose" },
];

export default function CamPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const v = (id: string) => sel[id] === 1;
  const tamam = yanitlanan === MADDELER.length;
  const skor = tamam ? MADDELER.filter((m) => v(m.id)).length : null;
  const bant = !tamam ? null : v("akut") && v("dikkat") && (v("dusunce") || v("bilinc")) ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="cam"
      ikon="🌀"
      baslik="CAM"
      altBaslik="Confusion Assessment Method · Deliryum Tanı Algoritması"
      paylasim={{ cam: skor }}
      not={
        <p>
          Değerlendirme yapılandırılmış bilişsel görüşmeye (ör. dikkat testi) dayanmalıdır. Entübe ya da konuşamayan hastada CAM-ICU kullanılır.
          Inouye SK ve ark., Ann Intern Med 1990;113:941–948.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={m.secenekler} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} rozetGizle />
        ))}
      </div>
      <SkorPaneli skor={skor} payda={4} skorBasligi="ÖZELLİK" bantlar={BANTLAR} aktif={bant} eksikMetni={`${MADDELER.length - yanitlanan} özellik yanıtlanmadı`} />
    </OlcekKabugu>
  );
}
