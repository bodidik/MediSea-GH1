"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * Groningen Kırılganlık Göstergesi (GFI) — Steverink ve ark. 2001; Schuurmans ve ark., J Gerontol 2004.
 * 15 madde, 8 alan, 0–15.
 *
 * "Bazen" şıkkının puanı alana göre değişir: bilişte 0, psikososyal maddelerde 1.
 * Fiziksel uygunluk 0–10 arası öz değerlendirme; 0–6 → 1 puan.
 */
type Madde = { id: string; baslik: string; aciklama?: string; secenekler: Secenek[] };

const YARDIMSIZ: Secenek[] = [{ label: "Evet, yardımsız yapabiliyor", pts: 0 }, { label: "Hayır", pts: 1 }];
const EVET1: Secenek[] = [{ label: "Evet", pts: 1 }, { label: "Hayır", pts: 0 }];
const BAZEN1: Secenek[] = [{ label: "Evet", pts: 1 }, { label: "Bazen", pts: 1 }, { label: "Hayır", pts: 0 }];

const MADDELER: ReadonlyArray<Madde & { alan: string }> = [
  { alan: "Mobilite", id: "alisveris", baslik: "1. Alışverişe yardımsız gidebiliyor mu?", secenekler: YARDIMSIZ },
  { alan: "Mobilite", id: "disari", baslik: "2. Dışarıda (evin çevresinde ya da komşuya) yardımsız dolaşabiliyor mu?", secenekler: YARDIMSIZ },
  { alan: "Mobilite", id: "giyinme", baslik: "3. Yardımsız giyinip soyunabiliyor mu?", secenekler: YARDIMSIZ },
  { alan: "Mobilite", id: "tuvalet", baslik: "4. Tuvalete yardımsız gidebiliyor mu?", secenekler: YARDIMSIZ },
  {
    alan: "Fiziksel uygunluk", id: "uygunluk",
    baslik: "5. Fiziksel uygunluğunuza 0 ile 10 arasında kaç puan verirsiniz?",
    aciklama: "0 çok kötü, 10 çok iyi.",
    secenekler: [{ label: "0–6", pts: 1 }, { label: "7–10", pts: 0 }],
  },
  { alan: "Görme", id: "gorme", baslik: "6. İyi görememe nedeniyle günlük yaşamda sorun yaşıyor mu?", secenekler: EVET1 },
  { alan: "İşitme", id: "isitme", baslik: "7. İyi duyamama nedeniyle günlük yaşamda sorun yaşıyor mu?", secenekler: EVET1 },
  {
    alan: "Beslenme", id: "kilo", baslik: "8. Son 6 ayda istemeden çok kilo kaybetti mi?",
    aciklama: "6 ayda 6 kg ya da 1 ayda 3 kg.", secenekler: EVET1,
  },
  { alan: "Komorbidite", id: "ilac", baslik: "9. Dört ya da daha fazla farklı ilaç kullanıyor mu?", secenekler: EVET1 },
  {
    alan: "Biliş", id: "bellek", baslik: "10. Belleğiyle ilgili yakınması var mı?",
    secenekler: [{ label: "Evet", pts: 1 }, { label: "Bazen", pts: 0 }, { label: "Hayır", pts: 0 }],
  },
  { alan: "Psikososyal", id: "bosluk", baslik: "11. Çevresinde bir boşluk hissediyor mu?", secenekler: BAZEN1 },
  { alan: "Psikososyal", id: "ozlem", baslik: "12. Etrafında insanların olmamasını özlüyor mu?", secenekler: BAZEN1 },
  { alan: "Psikososyal", id: "terk", baslik: "13. Kendini terk edilmiş hissediyor mu?", secenekler: BAZEN1 },
  { alan: "Psikososyal", id: "cokkun", baslik: "14. Son zamanlarda kendini üzgün ya da çökkün hissetti mi?", secenekler: BAZEN1 },
  { alan: "Psikososyal", id: "kaygi", baslik: "15. Son zamanlarda kendini sinirli ya da kaygılı hissetti mi?", secenekler: BAZEN1 },
];

const BANTLAR: Bant[] = [
  { aralik: "0–3", etiket: "Kırılgan değil", alt: "GFI eşiğinin altında.", renk: "emerald" },
  { aralik: "≥ 4", etiket: "Kırılgan", alt: "Orta–ağır kırılganlık — kapsamlı geriatrik değerlendirme önerilir.", renk: "rose" },
];

export default function GroningenPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor =
    yanitlanan === MADDELER.length
      ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0)
      : null;
  const bant = skor === null ? null : skor >= 4 ? BANTLAR[1] : BANTLAR[0];

  return (
    <OlcekKabugu
      slug="groningen-kirilganlik"
      ikon="🌷"
      baslik="Groningen Kırılganlık Göstergesi"
      altBaslik="GFI · 8 Alan · 15 Madde · 0–15"
      paylasim={{ gfi: skor }}
      not={
        <p>
          GFI fiziksel, bilişsel, sosyal ve psikolojik alanları kapsayan, kendi bildirimine dayalı bir tarama ölçeğidir; Avrupa'da birinci basamakta ve
          hastanede yaygın kullanılır. Eşik ≥ 4. Steverink N ve ark., Gerontologist 2001; Schuurmans H ve ark., J Gerontol A 2004.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi
            key={m.id}
            id={m.id}
            baslik={m.baslik}
            aciklama={m.aciklama ? `${m.alan} · ${m.aciklama}` : m.alan}
            secenekler={m.secenekler}
            secili={sel[m.id]}
            onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))}
          />
        ))}
      </div>
      <SkorPaneli
        skor={skor}
        payda={15}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
