"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * 4AT — serviste hızlı deliryum taraması (Bellelli ve ark., Age Ageing 2014).
 * Özel eğitim gerektirmez, ~2 dakika. Yoğun bakımda CAM-ICU kullanılır.
 */
const MADDELER: ReadonlyArray<{ id: string; baslik: string; aciklama: string; secenekler: Secenek[] }> = [
  {
    id: "uyaniklik",
    baslik: "1. Uyanıklık",
    aciklama:
      "Belirgin uykulu (uyandırmak zor ve/veya değerlendirme sırasında açıkça uykulu) ya da ajite/hiperaktif hasta. Uykuluysa adını söyleyip omzuna hafifçe dokunarak uyandırmayı deneyin.",
    secenekler: [
      { label: "Normal (tamamen uyanık, ajite değil)", pts: 0 },
      { label: "Hafif uykulu, uyandırıldıktan sonra 10 sn içinde normale dönüyor", pts: 0 },
      { label: "Açıkça anormal", pts: 4 },
    ],
  },
  {
    id: "amt4",
    baslik: "2. AMT4 — Kısaltılmış Zihinsel Test",
    aciklama: "Yaş · doğum tarihi · bulunduğu yer (hastanenin ya da binanın adı) · içinde bulunulan yıl.",
    secenekler: [
      { label: "Hata yok", pts: 0 },
      { label: "1 hata", pts: 1 },
      { label: "2 ya da daha fazla hata / test edilemiyor", pts: 2 },
    ],
  },
  {
    id: "dikkat",
    baslik: "3. Dikkat — Ayları geriye doğru sayma",
    aciklama: "\"Yılın aylarını Aralık'tan başlayarak geriye doğru sayar mısınız?\" Anlamasına yardım için \"Aralık'tan önceki ay hangisi?\" diye bir kez yönlendirilebilir.",
    secenekler: [
      { label: "7 ay ya da daha fazlasını doğru sayıyor", pts: 0 },
      { label: "Başlıyor ama 7'den az ay sayıyor / başlamayı reddediyor", pts: 1 },
      { label: "Test edilemiyor (hasta, uykulu, dikkatsiz — başlayamıyor)", pts: 2 },
    ],
  },
  {
    id: "degisiklik",
    baslik: "4. Akut değişiklik ya da dalgalanan seyir",
    aciklama:
      "Son 2 hafta içinde uyanıklıkta, bilişte ya da başka zihinsel işlevlerde (paranoya, halüsinasyon vb.) belirgin değişiklik ya da dalgalanma var mı, ve son 24 saatte hâlâ sürüyor mu? Bilgi yakınlardan, bakım verenden, kayıtlardan alınabilir.",
    secenekler: [
      { label: "Hayır", pts: 0 },
      { label: "Evet", pts: 4 },
    ],
  },
];

const BANTLAR: Bant[] = [
  { aralik: "0", etiket: "Olası değil", alt: "Deliryum ya da ağır bilişsel bozukluk olası değil (4. madde bilgisi eksikse deliryum yine de olabilir).", renk: "emerald" },
  { aralik: "1–3", etiket: "Bilişsel bozukluk?", alt: "Olası bilişsel bozukluk — ayrıntılı bilişsel değerlendirme ve öykü gerekir.", renk: "amber" },
  { aralik: "≥ 4", etiket: "Olası deliryum", alt: "Olası deliryum ± bilişsel bozukluk — deliryum açısından klinik değerlendirme ve tetikleyici araştırması.", renk: "rose" },
];

export default function DortAtPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(
    Object.fromEntries(MADDELER.map((m) => [m.id, null]))
  );
  const yanitlanan = MADDELER.filter((m) => sel[m.id] !== null).length;
  const skor =
    yanitlanan === MADDELER.length
      ? MADDELER.reduce((t, m) => t + m.secenekler[sel[m.id] as number].pts, 0)
      : null;
  const bant = skor === null ? null : skor === 0 ? BANTLAR[0] : skor <= 3 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="4at"
      ikon="🌀"
      baslik="4AT"
      altBaslik="Serviste Hızlı Deliryum Taraması · 0–12"
      paylasim={Object.fromEntries(MADDELER.map((m) => [m.id, sel[m.id]]))}
      not={
        <p>
          4AT bir tarama aracıdır; tanı klinik değerlendirmeyle konur. Yoğun bakımda entübe ya da konuşamayan hastada CAM-ICU kullanın.
          Madde 1–3 yalnızca değerlendirme anını, madde 4 son 2 haftayı yansıtır. Bellelli G ve ark., Age Ageing 2014; www.the4AT.com.
        </p>
      }
    >
      <div className="space-y-3">
        {MADDELER.map((m) => (
          <SecimMaddesi
            key={m.id}
            id={m.id}
            baslik={m.baslik}
            aciklama={m.aciklama}
            secenekler={m.secenekler}
            secili={sel[m.id]}
            onSec={(s) => setSel((o) => ({ ...o, [m.id]: s }))}
          />
        ))}
      </div>
      <SkorPaneli
        skor={skor}
        payda={12}
        bantlar={BANTLAR}
        aktif={bant}
        eksikMetni={`${MADDELER.length - yanitlanan} madde yanıtlanmadı`}
      />
    </OlcekKabugu>
  );
}
