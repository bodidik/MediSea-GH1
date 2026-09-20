"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * STOP-Bang — obstrüktif uyku apnesi tarama anketi (Chung ve ark., Anesthesiology 2008; Chest 2016).
 * 8 evet/hayır maddesi, 0–8. 0–2 düşük · 3–4 orta · 5–8 yüksek risk.
 * Ek kural (Chung 2016): skor 3–4 iken STOP maddelerinden ≥ 2'si + (erkek ya da BMI > 35 ya da boyun > 40 cm) → yüksek risk.
 */
const eh: Secenek[] = [{ label: "Hayır", pts: 0 }, { label: "Evet", pts: 1 }];

const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama?: string; stop: boolean }> = [
  { id: "horlama", baslik: "S — Yüksek sesle horluyor mu?", aciklama: "Konuşmadan yüksek ya da kapalı kapının arkasından duyulacak kadar.", stop: true },
  { id: "yorgun", baslik: "T — Gündüz sık sık yorgun ya da uykulu mu?", stop: true },
  { id: "apne", baslik: "O — Uykuda solunumunun durduğu, boğulur gibi olduğu gözlendi mi?", stop: true },
  { id: "ht", baslik: "P — Hipertansiyonu var mı ya da tedavi alıyor mu?", stop: true },
  { id: "bmi", baslik: "B — BMI > 35 kg/m²", stop: false },
  { id: "yas", baslik: "A — Yaş > 50", stop: false },
  { id: "boyun", baslik: "N — Boyun çevresi > 40 cm", aciklama: "Kaynakta erkekte ≥ 43, kadında ≥ 41 cm de kullanılır.", stop: false },
  { id: "erkek", baslik: "G — Erkek cinsiyet", stop: false },
];

const BANTLAR: Bant[] = [
  { aralik: "0–2", etiket: "Düşük risk", alt: "Orta-ağır OUA olasılığı düşük.", renk: "emerald" },
  { aralik: "3–4", etiket: "Orta risk", alt: "Klinik kuşku sürerse polisomnografi ya da ev tipi uyku testi.", renk: "amber" },
  { aralik: "5–8", etiket: "Yüksek risk", alt: "Orta-ağır OUA olasılığı yüksek — uyku testi; perioperatif dönemde OUA önlemleri.", renk: "rose" },
];

export default function StopBangPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(MADDELER.map((m) => [m.id, null])));
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const var_ = (id: string) => sel[id] === 1;
  const skor = yanitlanan === MADDELER.length ? MADDELER.filter((m) => var_(m.id)).length : null;
  const stop = MADDELER.filter((m) => m.stop && var_(m.id)).length;
  const ekKural = skor !== null && skor >= 3 && skor <= 4 && stop >= 2 && (var_("erkek") || var_("bmi") || var_("boyun"));
  const bant = skor === null ? null : skor <= 2 ? BANTLAR[0] : skor <= 4 && !ekKural ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="stop-bang"
      ikon="😴"
      baslik="STOP-Bang"
      altBaslik="Obstrüktif Uyku Apnesi Taraması · 0–8"
      paylasim={{ stopBang: skor }}
      not={
        <p>
          Tarama aracıdır, tanı koymaz; tanı polisomnografi ya da ev tipi uyku testiyle (AHİ) konur. Duyarlılığı yüksek, özgüllüğü düşüktür — düşük skor
          orta-ağır OUA'yı büyük olasılıkla dışlar. Serum bikarbonat ≥ 28 mmol/L yüksek skorla birlikte özgüllüğü artırır. Chung F ve ark.,
          Anesthesiology 2008; Chest 2016.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi key={m.id} id={m.id} baslik={m.baslik} aciklama={m.aciklama} secenekler={eh} secili={sel[m.id]} onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))} />
        ))}
      </div>
      <SkorPaneli
        skor={skor}
        payda={8}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`}
        ek={ekKural ? <p className="text-[11px] font-bold text-slate-700">Skor 3–4 ama STOP maddelerinden {stop}'i + erkek / BMI &gt; 35 / boyun &gt; 40 cm — yüksek risk sayılır.</p> : null}
      />
    </OlcekKabugu>
  );
}
