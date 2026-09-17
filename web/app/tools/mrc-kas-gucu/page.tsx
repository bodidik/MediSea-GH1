"use client";
import React from "react";
import OlcekKabugu from "@/app/tools/components/OlcekKabugu";
import SecimMaddesi, { type Secenek } from "@/app/tools/components/SecimMaddesi";
import SkorPaneli, { type Bant } from "@/app/tools/components/SkorPaneli";

/**
 * MRC Toplam Kas Gücü Skoru — Kleyweg ve ark., Muscle Nerve 1991; YBÜ kazanılmış
 * güçsüzlük eşiği De Jonghe ve ark., JAMA 2002.
 * 6 kas grubu × 2 taraf × 0–5 = 0–60.
 */
const MRC: Secenek[] = [
  { label: "Kasılma yok", pts: 0 },
  { label: "Kasılma var, hareket yok", pts: 1 },
  { label: "Yerçekimi ortadan kalkınca hareket", pts: 2 },
  { label: "Yerçekimine karşı", pts: 3 },
  { label: "Dirence karşı, azalmış", pts: 4 },
  { label: "Normal", pts: 5 },
];

const GRUPLAR = [
  { id: "omuz", ad: "Omuz abdüksiyonu" },
  { id: "dirsek", ad: "Dirsek fleksiyonu" },
  { id: "elbilegi", ad: "El bileği ekstansiyonu" },
  { id: "kalca", ad: "Kalça fleksiyonu" },
  { id: "diz", ad: "Diz ekstansiyonu" },
  { id: "ayakbilegi", ad: "Ayak bileği dorsifleksiyonu" },
] as const;

const TARAFLAR = [
  { id: "sag", ad: "Sağ" },
  { id: "sol", ad: "Sol" },
] as const;

const TUM = GRUPLAR.flatMap((g) => TARAFLAR.map((t) => ({ id: `${g.id}-${t.id}`, ad: `${g.ad} — ${t.ad}` })));

const BANTLAR: Bant[] = [
  { aralik: "48–60", etiket: "Belirgin güçsüzlük yok", alt: "YBÜ kazanılmış güçsüzlük ölçütünün üstünde.", renk: "emerald" },
  { aralik: "36–47", etiket: "YBÜ-kazanılmış güçsüzlük", alt: "MRC toplamı < 48 — kritik hastalık polinöropati/miyopatisi açısından değerlendirin.", renk: "orange" },
  { aralik: "< 36", etiket: "Ağır güçsüzlük", alt: "Ağır yaygın güçsüzlük — solunum kası tutulumu ve uzamış mekanik ventilasyon riski.", renk: "rose" },
];

export default function MrcKasGucuPage() {
  const [sel, setSel] = React.useState<Record<string, number | null>>(Object.fromEntries(TUM.map((m) => [m.id, null])));
  const yanitlanan = TUM.filter((m) => sel[m.id] !== null).length;
  const skor = yanitlanan === TUM.length ? TUM.reduce((t, m) => t + MRC[sel[m.id] as number].pts, 0) : null;
  const bant = skor === null ? null : skor >= 48 ? BANTLAR[0] : skor >= 36 ? BANTLAR[1] : BANTLAR[2];

  return (
    <OlcekKabugu
      slug="mrc-kas-gucu"
      ikon="💪"
      baslik="MRC Toplam Kas Gücü"
      altBaslik="MRC Sum Score · 12 Kas Grubu · 0–60"
      paylasim={{ mrc: skor }}
      not={
        <p>
          Hasta uyanık ve iş birliği yapabiliyor olmalıdır (ör. beş basit komuttan en az üçüne uyuyor); aksi halde skor geçersizdir. YBÜ-kazanılmış
          güçsüzlük için ≥ 24 saat arayla iki ölçümde &lt; 48 önerilir. Guillain-Barré'de EGRIS ve mEGOS hesaplarında da kullanılır.
          Kleyweg RP ve ark., Muscle Nerve 1991; De Jonghe B ve ark., JAMA 2002.
        </p>
      }
    >
      {GRUPLAR.map((g) => (
        <section key={g.id} aria-labelledby={`mrc-${g.id}`} className="space-y-2">
          <h2 id={`mrc-${g.id}`} className="px-1 text-sm font-black text-blue-900 uppercase tracking-widest">{g.ad}</h2>
          {TARAFLAR.map((t) => {
            const id = `${g.id}-${t.id}`;
            return <SecimMaddesi key={id} id={id} baslik={t.ad} secenekler={MRC} secili={sel[id]} onSec={(s) => setSel((o) => ({ ...o, [id]: s }))} />;
          })}
        </section>
      ))}
      <SkorPaneli skor={skor} payda={60} bantlar={BANTLAR} aktif={bant} eksikMetni={`${TUM.length - yanitlanan} kas grubu değerlendirilmedi`} />
    </OlcekKabugu>
  );
}
